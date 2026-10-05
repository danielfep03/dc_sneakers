// Genera supabase/seed.sql a partir de src/data/sneakers.js
// Uso: node supabase/scripts/generate-seed.mjs > supabase/seed.sql
import { SNEAKERS_DATA } from '../../src/data/sneakers.js'

const q = (s) => `'${String(s).replace(/'/g, "''")}'`
const slugify = (s) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const CATEGORIES = {
  basketball: ['Basketball', 'Alto rendimiento y amortiguación para la cancha o el streetwear.'],
  casual: ['Casual & Retro', 'Siluetas esenciales para el uso diario y estilo urbano.'],
  running: ['Running', 'Comodidad ligera y siluetas retro runners de los 2000s.'],
  voleibol: ['Voleibol', 'Soporte y salto explosivo para la cancha de voleibol.']
}

const BRANDS = {
  nike: ['Nike', 'Innovación y rendimiento en cada pisada.'],
  adidas: ['Adidas', 'El balance perfecto entre el deporte y la moda urbana.'],
  'new-balance': ['New Balance', 'Comodidad clásica y estética retro runner impecable.'],
  jordan: ['Jordan', 'La silueta legendaria que cambió la historia del baloncesto.'],
  asics: ['Asics', 'Tecnología japonesa para el máximo rendimiento deportivo.']
}

// La UI inventaba el "precio original" de las ofertas de los 4 primeros productos
// (price * (1 + descuento)). Ahora es real: price = precio original, sale_price = precio de venta.
const DISCOUNTS = [25, 30, 20, 35]

// Stock determinista: la UI simulaba una talla agotada (índice 2) en cada producto.
const stockFor = (idx) => (idx === 2 ? 0 : 3 + ((idx * 2) % 4))

const out = []
out.push('-- ==============================================================================')
out.push('-- DC SNEAKERS: SEED (generado con supabase/scripts/generate-seed.mjs)')
out.push('-- Idempotente: se puede ejecutar varias veces. No pisa el stock existente.')
out.push('-- ==============================================================================')
out.push('')
out.push('-- Limpieza del seed de ejemplo anterior (3 productos y categorías no usadas)')
out.push("DELETE FROM public.products WHERE slug IN ('nike-air-force-1-low-triple-white','air-jordan-1-retro-high-chicago','adidas-campus-00s-core-black');")
out.push("DELETE FROM public.categories WHERE id IN ('lifestyle','skate');")
out.push('')

out.push('INSERT INTO public.brands (id, name, slug, description) VALUES')
out.push(Object.entries(BRANDS).map(([id, [n, d]]) => `  (${q(id)}, ${q(n)}, ${q(id)}, ${q(d)})`).join(',\n'))
out.push('ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;')
out.push('')

out.push('INSERT INTO public.categories (id, name, slug, description) VALUES')
out.push(Object.entries(CATEGORIES).map(([id, [n, d]]) => `  (${q(id)}, ${q(n)}, ${q(id)}, ${q(d)})`).join(',\n'))
out.push('ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;')
out.push('')

SNEAKERS_DATA.forEach((p, i) => {
  const slug = slugify(p.name)
  const brandId = slugify(p.brand)
  const categoryId = p.category.toLowerCase()
  if (!BRANDS[brandId]) throw new Error(`Marca sin definir: ${p.brand}`)
  if (!CATEGORIES[categoryId]) throw new Error(`Categoría sin definir: ${p.category}`)

  let price = p.price
  let salePrice = 'NULL'
  if (i < DISCOUNTS.length) {
    price = Math.round(p.price * (1 + DISCOUNTS[i] / 100))
    salePrice = p.price
  }

  out.push(`-- ${p.name}`)
  out.push('INSERT INTO public.products (legacy_id, slug, name, brand_id, category_id, description, price, sale_price, is_new, is_active)')
  out.push(`VALUES (${p.id}, ${q(slug)}, ${q(p.name)}, ${q(brandId)}, ${q(categoryId)}, ${q(p.description)}, ${price}, ${salePrice}, ${i < 4}, true)`)
  out.push('ON CONFLICT (slug) DO UPDATE SET legacy_id = EXCLUDED.legacy_id, name = EXCLUDED.name, brand_id = EXCLUDED.brand_id,')
  out.push('  category_id = EXCLUDED.category_id, description = EXCLUDED.description, price = EXCLUDED.price,')
  out.push('  sale_price = EXCLUDED.sale_price, is_new = EXCLUDED.is_new, updated_at = now();')
  out.push('')

  p.colors.forEach((c, ci) => {
    const sku = `${slug}-${slugify(c.name)}`.toUpperCase().slice(0, 60)
    out.push('INSERT INTO public.product_variants (product_id, color_name, color_hex, version_name, sku, images, is_default)')
    out.push(`SELECT id, ${q(c.name)}, ${q(c.hex)}, 'Original', ${q(sku)}, ARRAY[${q(p.image)}], ${ci === 0} FROM public.products WHERE slug = ${q(slug)}`)
    out.push('ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, color_hex = EXCLUDED.color_hex,')
    out.push('  images = EXCLUDED.images, is_default = EXCLUDED.is_default;')
    out.push('')
    out.push('INSERT INTO public.variant_sizes (variant_id, size_eur, stock)')
    out.push('SELECT v.id, s.size, s.stock FROM public.product_variants v,')
    out.push(`  (VALUES ${p.sizes.map((s, si) => `(${s}::numeric, ${stockFor(si)})`).join(', ')}) AS s(size, stock)`)
    out.push(`WHERE v.sku = ${q(sku)}`)
    out.push('ON CONFLICT (variant_id, size_eur) DO NOTHING;')
    out.push('')
  })
})

console.log(out.join('\n'))
