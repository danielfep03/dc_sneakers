/**
 * productService.js
 * Capa de abstracción de datos para productos.
 * Ningún componente o store importa products.json directamente.
 * Simula latencia de red (300-500ms) para probar estados de carga (skeletons).
 * Cuando se conecte Supabase, solo se reescribe el interior de estas funciones.
 */

import productsData from '../data/products.json'

const SIMULATED_DELAY_MS = 350

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Obtiene lista paginada y filtrada de productos.
 * Contrato requerido: { items, total, hasMore }
 */
export async function getProducts ({
  filters = {},
  sort = 'newest',
  page = 1,
  pageSize = 12
} = {}) {
  await delay(SIMULATED_DELAY_MS)

  let result = [...productsData]

  // 1. Filtro por marcas (array)
  if (filters.brands && filters.brands.length > 0) {
    result = result.filter((p) => filters.brands.includes(p.brandId))
  }

  // 2. Filtro por categorías (array)
  if (filters.categories && filters.categories.length > 0) {
    result = result.filter((p) => filters.categories.includes(p.categoryId))
  }

  // 3. Filtro por tallas (array de números)
  if (filters.sizes && filters.sizes.length > 0) {
    result = result.filter((p) =>
      p.sizes.some((s) => filters.sizes.includes(s.size) && s.stock > 0)
    )
  }

  // 4. Filtro por rango de precio
  if (filters.priceRange) {
    const { min, max } = filters.priceRange
    if (typeof min === 'number') {
      result = result.filter((p) => (p.salePrice || p.price) >= min)
    }
    if (typeof max === 'number') {
      result = result.filter((p) => (p.salePrice || p.price) <= max)
    }
  }

  // 5. Filtro solo ofertas
  if (filters.onlyOffers) {
    result = result.filter((p) => p.salePrice !== null && p.salePrice < p.price)
  }

  // 6. Ordenamiento
  if (sort === 'price-asc') {
    result.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price))
  } else if (sort === 'price-desc') {
    result.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price))
  } else {
    // 'newest' por defecto
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  // 7. Paginación para infinite scroll
  const total = result.length
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const items = result.slice(startIndex, endIndex)
  const hasMore = endIndex < total

  return { items, total, hasMore }
}

/**
 * Obtiene un producto por su slug.
 */
export async function getProductBySlug (slug) {
  await delay(SIMULATED_DELAY_MS)
  const product = productsData.find((p) => p.slug === slug)
  if (!product) {
    throw new Error(`Producto con slug "${slug}" no encontrado`)
  }
  return product
}

/**
 * Obtiene los productos con precio de oferta.
 */
export async function getOffers () {
  await delay(SIMULATED_DELAY_MS)
  return productsData.filter((p) => p.salePrice !== null && p.salePrice < p.price)
}

/**
 * Obtiene los últimos productos añadidos.
 */
export async function getNewProducts (limit = 8) {
  await delay(SIMULATED_DELAY_MS)
  const sorted = [...productsData].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )
  return sorted.slice(0, limit)
}
