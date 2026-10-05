/**
 * productService.js
 * Capa de datos de productos sobre Supabase.
 *
 * Adaptador: transforma las filas relacionales (products → product_variants →
 * variant_sizes) a la forma que consume la UI:
 *   {
 *     id,            // slug (estable y legible en la URL)
 *     legacyId,      // id numérico antiguo (compatibilidad con /producto/2)
 *     name, brand, brandId, category (slug en minúscula), categoryId,
 *     price,         // precio de venta efectivo
 *     originalPrice, // precio antes del descuento (null si no hay oferta)
 *     image, images, description, isNew, createdAt,
 *     sizes: [38, 39, ...],                         // unión de tallas de todas las variantes
 *     colors: [{ name, hex, variantId, image, images, sizes: [{ size, stock }] }]
 *   }
 * Cada color es una variante (product_variants) con sus propias fotos y stock.
 */

import { supabase } from '@/lib/supabaseClient'

const PRODUCT_SELECT = `
  id, legacy_id, slug, name, description, price, sale_price, is_new, created_at,
  brands ( id, name ),
  categories ( id, name ),
  product_variants (
    id, color_name, color_hex, version_name, images, is_default,
    variant_sizes ( size_eur, stock )
  )
`

const CACHE_TTL_MS = 60 * 1000
let cache = { at: 0, promise: null }

export function mapProduct (row) {
  const variants = [...(row.product_variants || [])].sort(
    (a, b) => Number(b.is_default) - Number(a.is_default)
  )

  const colors = variants.map((v) => ({
    name: v.color_name,
    hex: v.color_hex,
    variantId: v.id,
    image: v.images?.[0] ?? null,
    images: v.images ?? [],
    sizes: [...(v.variant_sizes || [])]
      .map((s) => ({ size: Number(s.size_eur), stock: s.stock }))
      .sort((a, b) => a.size - b.size)
  }))

  const sizes = [...new Set(colors.flatMap((c) => c.sizes.map((s) => s.size)))].sort(
    (a, b) => a - b
  )

  const hasSale = row.sale_price !== null && row.sale_price !== undefined
  const price = Number(hasSale ? row.sale_price : row.price)
  const originalPrice = hasSale ? Number(row.price) : null
  const images = colors[0]?.images ?? []

  return {
    id: row.slug,
    legacyId: row.legacy_id,
    name: row.name,
    brand: row.brands?.name ?? '',
    brandId: row.brands?.id ?? null,
    category: row.categories?.id ?? '',
    categoryId: row.categories?.id ?? null,
    description: row.description ?? '',
    price,
    originalPrice,
    discountPercent: originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0,
    image: images[0] ?? null,
    images,
    isNew: row.is_new,
    createdAt: row.created_at,
    sizes,
    colors
  }
}

/**
 * Todos los productos activos. Cacheado 60s en memoria para no repetir la
 * consulta al navegar entre Home, Catálogo y Producto.
 */
export function getAllProducts ({ force = false } = {}) {
  const fresh = cache.promise && Date.now() - cache.at < CACHE_TTL_MS
  if (fresh && !force) return cache.promise

  const promise = supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .order('legacy_id', { ascending: true, nullsFirst: false })
    .then(({ data, error }) => {
      if (error) throw error
      return (data || []).map(mapProduct)
    })

  cache = { at: Date.now(), promise }
  // Si falla, no cachear el error.
  promise.catch(() => {
    if (cache.promise === promise) cache = { at: 0, promise: null }
  })
  return promise
}

/**
 * Obtiene un producto por slug o por id numérico antiguo (/producto/2).
 * Devuelve null si no existe.
 */
export async function getProductBySlug (slugOrLegacyId) {
  const key = String(slugOrLegacyId ?? '')
  const products = await getAllProducts()
  const isLegacy = /^\d+$/.test(key)
  return (
    products.find((p) => (isLegacy ? p.legacyId === Number(key) : p.id === key)) || null
  )
}

/** Productos con precio de oferta real (sale_price definido). */
export async function getOffers () {
  const products = await getAllProducts()
  return products.filter((p) => p.originalPrice !== null)
}

/** Últimos productos añadidos. */
export async function getNewProducts (limit = 8) {
  const products = await getAllProducts()
  return [...products]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt) || (b.legacyId ?? 0) - (a.legacyId ?? 0))
    .slice(0, limit)
}

/**
 * Lista filtrada/ordenada/paginada. Contrato: { items, total, hasMore }.
 * (Mantenido por compatibilidad con el catálogo legacy.)
 */
export async function getProducts ({
  filters = {},
  sort = 'newest',
  page = 1,
  pageSize = 12
} = {}) {
  let result = [...(await getAllProducts())]

  if (filters.brands?.length) result = result.filter((p) => filters.brands.includes(p.brandId))
  if (filters.categories?.length) result = result.filter((p) => filters.categories.includes(p.categoryId))
  if (filters.sizes?.length) {
    result = result.filter((p) =>
      p.colors.some((c) => c.sizes.some((s) => filters.sizes.includes(s.size) && s.stock > 0))
    )
  }
  if (filters.onlyOffers) result = result.filter((p) => p.originalPrice !== null)
  if (typeof filters.priceRange?.min === 'number') result = result.filter((p) => p.price >= filters.priceRange.min)
  if (typeof filters.priceRange?.max === 'number') result = result.filter((p) => p.price <= filters.priceRange.max)

  if (sort === 'price-asc') result.sort((a, b) => a.price - b.price)
  else if (sort === 'price-desc') result.sort((a, b) => b.price - a.price)
  else result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt) || (b.legacyId ?? 0) - (a.legacyId ?? 0))

  const total = result.length
  const start = (page - 1) * pageSize
  return { items: result.slice(start, start + pageSize), total, hasMore: start + pageSize < total }
}

/**
 * Selección por defecto para "compra rápida": primer color que tenga alguna
 * talla con stock, y la primera talla disponible de ese color.
 * Devuelve null si el producto está agotado.
 */
export function pickDefaultSelection (product) {
  for (const color of product?.colors ?? []) {
    const available = color.sizes.find((s) => s.stock > 0)
    if (available) return { color, size: available.size }
  }
  return null
}
