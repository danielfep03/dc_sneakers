-- ==============================================================================
-- DC SNEAKERS: SEED (generado con supabase/scripts/generate-seed.mjs)
-- Idempotente: se puede ejecutar varias veces. No pisa el stock existente.
-- ==============================================================================

-- Limpieza del seed de ejemplo anterior (3 productos y categorías no usadas)
DELETE FROM public.products WHERE slug IN ('nike-air-force-1-low-triple-white','air-jordan-1-retro-high-chicago','adidas-campus-00s-core-black');
DELETE FROM public.categories WHERE id IN ('lifestyle','skate');

INSERT INTO public.brands (id, name, slug, description) VALUES
  ('nike', 'Nike', 'nike', 'Innovación y rendimiento en cada pisada.'),
  ('adidas', 'Adidas', 'adidas', 'El balance perfecto entre el deporte y la moda urbana.'),
  ('new-balance', 'New Balance', 'new-balance', 'Comodidad clásica y estética retro runner impecable.'),
  ('jordan', 'Jordan', 'jordan', 'La silueta legendaria que cambió la historia del baloncesto.'),
  ('asics', 'Asics', 'asics', 'Tecnología japonesa para el máximo rendimiento deportivo.')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.categories (id, name, slug, description) VALUES
  ('basketball', 'Basketball', 'basketball', 'Alto rendimiento y amortiguación para la cancha o el streetwear.'),
  ('casual', 'Casual & Retro', 'casual', 'Siluetas esenciales para el uso diario y estilo urbano.'),
  ('running', 'Running', 'running', 'Comodidad ligera y siluetas retro runners de los 2000s.'),
  ('voleibol', 'Voleibol', 'voleibol', 'Soporte y salto explosivo para la cancha de voleibol.')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- LeBron XXI Basketball Pro
INSERT INTO public.products (legacy_id, slug, name, brand_id, category_id, description, price, sale_price, is_new, is_active)
VALUES (1, 'lebron-xxi-basketball-pro', 'LeBron XXI Basketball Pro', 'nike', 'basketball', 'Diseñadas para máximo rendimiento en la cancha de baloncesto. Sistema de amortiguación Zoom Air con respuesta explosiva y soporte lateral de alta tracción para cambios de ritmo.', 612375, 489900, true, true)
ON CONFLICT (slug) DO UPDATE SET legacy_id = EXCLUDED.legacy_id, name = EXCLUDED.name, brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id, description = EXCLUDED.description, price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price, is_new = EXCLUDED.is_new, updated_at = now();

INSERT INTO public.product_variants (product_id, color_name, color_hex, version_name, sku, images, is_default)
SELECT id, 'Rojo Fuego', '#ff3b30', 'Original', 'LEBRON-XXI-BASKETBALL-PRO-ROJO-FUEGO', ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80'], true FROM public.products WHERE slug = 'lebron-xxi-basketball-pro'
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, color_hex = EXCLUDED.color_hex,
  images = EXCLUDED.images, is_default = EXCLUDED.is_default;

INSERT INTO public.variant_sizes (variant_id, size_eur, stock)
SELECT v.id, s.size, s.stock FROM public.product_variants v,
  (VALUES (38::numeric, 3), (39::numeric, 5), (40::numeric, 0), (41::numeric, 5), (42::numeric, 3), (43::numeric, 5), (44::numeric, 3)) AS s(size, stock)
WHERE v.sku = 'LEBRON-XXI-BASKETBALL-PRO-ROJO-FUEGO'
ON CONFLICT (variant_id, size_eur) DO NOTHING;

INSERT INTO public.product_variants (product_id, color_name, color_hex, version_name, sku, images, is_default)
SELECT id, 'Negro Mate', '#1c1c1e', 'Original', 'LEBRON-XXI-BASKETBALL-PRO-NEGRO-MATE', ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80'], false FROM public.products WHERE slug = 'lebron-xxi-basketball-pro'
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, color_hex = EXCLUDED.color_hex,
  images = EXCLUDED.images, is_default = EXCLUDED.is_default;

INSERT INTO public.variant_sizes (variant_id, size_eur, stock)
SELECT v.id, s.size, s.stock FROM public.product_variants v,
  (VALUES (38::numeric, 3), (39::numeric, 5), (40::numeric, 0), (41::numeric, 5), (42::numeric, 3), (43::numeric, 5), (44::numeric, 3)) AS s(size, stock)
WHERE v.sku = 'LEBRON-XXI-BASKETBALL-PRO-NEGRO-MATE'
ON CONFLICT (variant_id, size_eur) DO NOTHING;

INSERT INTO public.product_variants (product_id, color_name, color_hex, version_name, sku, images, is_default)
SELECT id, 'Azul Eléctrico', '#007aff', 'Original', 'LEBRON-XXI-BASKETBALL-PRO-AZUL-ELECTRICO', ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80'], false FROM public.products WHERE slug = 'lebron-xxi-basketball-pro'
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, color_hex = EXCLUDED.color_hex,
  images = EXCLUDED.images, is_default = EXCLUDED.is_default;

INSERT INTO public.variant_sizes (variant_id, size_eur, stock)
SELECT v.id, s.size, s.stock FROM public.product_variants v,
  (VALUES (38::numeric, 3), (39::numeric, 5), (40::numeric, 0), (41::numeric, 5), (42::numeric, 3), (43::numeric, 5), (44::numeric, 3)) AS s(size, stock)
WHERE v.sku = 'LEBRON-XXI-BASKETBALL-PRO-AZUL-ELECTRICO'
ON CONFLICT (variant_id, size_eur) DO NOTHING;

-- Air Force 1 Pastel Bloom
INSERT INTO public.products (legacy_id, slug, name, brand_id, category_id, description, price, sale_price, is_new, is_active)
VALUES (2, 'air-force-1-pastel-bloom', 'Air Force 1 Pastel Bloom', 'nike', 'casual', 'El fulgor sigue vivo en las Nike Air Force 1, un clásico que aporta un toque fresco a sus detalles más conocidos: revestimientos con costuras resistentes y acabados limpios.', 506870, 389900, true, true)
ON CONFLICT (slug) DO UPDATE SET legacy_id = EXCLUDED.legacy_id, name = EXCLUDED.name, brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id, description = EXCLUDED.description, price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price, is_new = EXCLUDED.is_new, updated_at = now();

INSERT INTO public.product_variants (product_id, color_name, color_hex, version_name, sku, images, is_default)
SELECT id, 'Lavanda', '#d9b8f1', 'Original', 'AIR-FORCE-1-PASTEL-BLOOM-LAVANDA', ARRAY['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80'], true FROM public.products WHERE slug = 'air-force-1-pastel-bloom'
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, color_hex = EXCLUDED.color_hex,
  images = EXCLUDED.images, is_default = EXCLUDED.is_default;

INSERT INTO public.variant_sizes (variant_id, size_eur, stock)
SELECT v.id, s.size, s.stock FROM public.product_variants v,
  (VALUES (36::numeric, 3), (37::numeric, 5), (38::numeric, 0), (39::numeric, 5), (40::numeric, 3), (41::numeric, 5)) AS s(size, stock)
WHERE v.sku = 'AIR-FORCE-1-PASTEL-BLOOM-LAVANDA'
ON CONFLICT (variant_id, size_eur) DO NOTHING;

INSERT INTO public.product_variants (product_id, color_name, color_hex, version_name, sku, images, is_default)
SELECT id, 'Blanco Puro', '#ffffff', 'Original', 'AIR-FORCE-1-PASTEL-BLOOM-BLANCO-PURO', ARRAY['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80'], false FROM public.products WHERE slug = 'air-force-1-pastel-bloom'
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, color_hex = EXCLUDED.color_hex,
  images = EXCLUDED.images, is_default = EXCLUDED.is_default;

INSERT INTO public.variant_sizes (variant_id, size_eur, stock)
SELECT v.id, s.size, s.stock FROM public.product_variants v,
  (VALUES (36::numeric, 3), (37::numeric, 5), (38::numeric, 0), (39::numeric, 5), (40::numeric, 3), (41::numeric, 5)) AS s(size, stock)
WHERE v.sku = 'AIR-FORCE-1-PASTEL-BLOOM-BLANCO-PURO'
ON CONFLICT (variant_id, size_eur) DO NOTHING;

INSERT INTO public.product_variants (product_id, color_name, color_hex, version_name, sku, images, is_default)
SELECT id, 'Rosa Pastel', '#ffb3ba', 'Original', 'AIR-FORCE-1-PASTEL-BLOOM-ROSA-PASTEL', ARRAY['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80'], false FROM public.products WHERE slug = 'air-force-1-pastel-bloom'
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, color_hex = EXCLUDED.color_hex,
  images = EXCLUDED.images, is_default = EXCLUDED.is_default;

INSERT INTO public.variant_sizes (variant_id, size_eur, stock)
SELECT v.id, s.size, s.stock FROM public.product_variants v,
  (VALUES (36::numeric, 3), (37::numeric, 5), (38::numeric, 0), (39::numeric, 5), (40::numeric, 3), (41::numeric, 5)) AS s(size, stock)
WHERE v.sku = 'AIR-FORCE-1-PASTEL-BLOOM-ROSA-PASTEL'
ON CONFLICT (variant_id, size_eur) DO NOTHING;

-- Metarise Voleibol Elite
INSERT INTO public.products (legacy_id, slug, name, brand_id, category_id, description, price, sale_price, is_new, is_active)
VALUES (3, 'metarise-voleibol-elite', 'Metarise Voleibol Elite', 'asics', 'voleibol', 'Silueta especializada para voleibol de alto nivel. Tecnología RISETRUSS para potencia de salto vertical superior y amortiguación FlyteFoam para aterrizajes suaves.', 551880, 459900, true, true)
ON CONFLICT (slug) DO UPDATE SET legacy_id = EXCLUDED.legacy_id, name = EXCLUDED.name, brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id, description = EXCLUDED.description, price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price, is_new = EXCLUDED.is_new, updated_at = now();

INSERT INTO public.product_variants (product_id, color_name, color_hex, version_name, sku, images, is_default)
SELECT id, 'Gris Oscuro', '#3a3a3c', 'Original', 'METARISE-VOLEIBOL-ELITE-GRIS-OSCURO', ARRAY['https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80'], true FROM public.products WHERE slug = 'metarise-voleibol-elite'
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, color_hex = EXCLUDED.color_hex,
  images = EXCLUDED.images, is_default = EXCLUDED.is_default;

INSERT INTO public.variant_sizes (variant_id, size_eur, stock)
SELECT v.id, s.size, s.stock FROM public.product_variants v,
  (VALUES (38::numeric, 3), (40::numeric, 5), (41::numeric, 0), (42::numeric, 5), (43::numeric, 3), (44::numeric, 5)) AS s(size, stock)
WHERE v.sku = 'METARISE-VOLEIBOL-ELITE-GRIS-OSCURO'
ON CONFLICT (variant_id, size_eur) DO NOTHING;

INSERT INTO public.product_variants (product_id, color_name, color_hex, version_name, sku, images, is_default)
SELECT id, 'Blanco Off', '#f2f2f7', 'Original', 'METARISE-VOLEIBOL-ELITE-BLANCO-OFF', ARRAY['https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80'], false FROM public.products WHERE slug = 'metarise-voleibol-elite'
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, color_hex = EXCLUDED.color_hex,
  images = EXCLUDED.images, is_default = EXCLUDED.is_default;

INSERT INTO public.variant_sizes (variant_id, size_eur, stock)
SELECT v.id, s.size, s.stock FROM public.product_variants v,
  (VALUES (38::numeric, 3), (40::numeric, 5), (41::numeric, 0), (42::numeric, 5), (43::numeric, 3), (44::numeric, 5)) AS s(size, stock)
WHERE v.sku = 'METARISE-VOLEIBOL-ELITE-BLANCO-OFF'
ON CONFLICT (variant_id, size_eur) DO NOTHING;

INSERT INTO public.product_variants (product_id, color_name, color_hex, version_name, sku, images, is_default)
SELECT id, 'Azul Deportivo', '#0052cc', 'Original', 'METARISE-VOLEIBOL-ELITE-AZUL-DEPORTIVO', ARRAY['https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80'], false FROM public.products WHERE slug = 'metarise-voleibol-elite'
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, color_hex = EXCLUDED.color_hex,
  images = EXCLUDED.images, is_default = EXCLUDED.is_default;

INSERT INTO public.variant_sizes (variant_id, size_eur, stock)
SELECT v.id, s.size, s.stock FROM public.product_variants v,
  (VALUES (38::numeric, 3), (40::numeric, 5), (41::numeric, 0), (42::numeric, 5), (43::numeric, 3), (44::numeric, 5)) AS s(size, stock)
WHERE v.sku = 'METARISE-VOLEIBOL-ELITE-AZUL-DEPORTIVO'
ON CONFLICT (variant_id, size_eur) DO NOTHING;

-- Retro Jordan 1 High Chicago
INSERT INTO public.products (legacy_id, slug, name, brand_id, category_id, description, price, sale_price, is_new, is_active)
VALUES (4, 'retro-jordan-1-high-chicago', 'Retro Jordan 1 High Chicago', 'jordan', 'basketball', 'La silueta legendaria Air Jordan 1 en su combinación clásica de baloncesto. Materiales de cuero premium, amortiguación Air encapsulada y estilo místico dentro y fuera de la cancha.', 809865, 599900, true, true)
ON CONFLICT (slug) DO UPDATE SET legacy_id = EXCLUDED.legacy_id, name = EXCLUDED.name, brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id, description = EXCLUDED.description, price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price, is_new = EXCLUDED.is_new, updated_at = now();

INSERT INTO public.product_variants (product_id, color_name, color_hex, version_name, sku, images, is_default)
SELECT id, 'Negro y Rojo', '#ff3b30', 'Original', 'RETRO-JORDAN-1-HIGH-CHICAGO-NEGRO-Y-ROJO', ARRAY['https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=600&q=80'], true FROM public.products WHERE slug = 'retro-jordan-1-high-chicago'
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, color_hex = EXCLUDED.color_hex,
  images = EXCLUDED.images, is_default = EXCLUDED.is_default;

INSERT INTO public.variant_sizes (variant_id, size_eur, stock)
SELECT v.id, s.size, s.stock FROM public.product_variants v,
  (VALUES (40::numeric, 3), (41::numeric, 5), (42::numeric, 0), (43::numeric, 5), (44::numeric, 3), (45::numeric, 5)) AS s(size, stock)
WHERE v.sku = 'RETRO-JORDAN-1-HIGH-CHICAGO-NEGRO-Y-ROJO'
ON CONFLICT (variant_id, size_eur) DO NOTHING;

INSERT INTO public.product_variants (product_id, color_name, color_hex, version_name, sku, images, is_default)
SELECT id, 'Blanco Clásico', '#ffffff', 'Original', 'RETRO-JORDAN-1-HIGH-CHICAGO-BLANCO-CLASICO', ARRAY['https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=600&q=80'], false FROM public.products WHERE slug = 'retro-jordan-1-high-chicago'
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, color_hex = EXCLUDED.color_hex,
  images = EXCLUDED.images, is_default = EXCLUDED.is_default;

INSERT INTO public.variant_sizes (variant_id, size_eur, stock)
SELECT v.id, s.size, s.stock FROM public.product_variants v,
  (VALUES (40::numeric, 3), (41::numeric, 5), (42::numeric, 0), (43::numeric, 5), (44::numeric, 3), (45::numeric, 5)) AS s(size, stock)
WHERE v.sku = 'RETRO-JORDAN-1-HIGH-CHICAGO-BLANCO-CLASICO'
ON CONFLICT (variant_id, size_eur) DO NOTHING;

INSERT INTO public.product_variants (product_id, color_name, color_hex, version_name, sku, images, is_default)
SELECT id, 'Gris Carbón', '#2c2c2e', 'Original', 'RETRO-JORDAN-1-HIGH-CHICAGO-GRIS-CARBON', ARRAY['https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=600&q=80'], false FROM public.products WHERE slug = 'retro-jordan-1-high-chicago'
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, color_hex = EXCLUDED.color_hex,
  images = EXCLUDED.images, is_default = EXCLUDED.is_default;

INSERT INTO public.variant_sizes (variant_id, size_eur, stock)
SELECT v.id, s.size, s.stock FROM public.product_variants v,
  (VALUES (40::numeric, 3), (41::numeric, 5), (42::numeric, 0), (43::numeric, 5), (44::numeric, 3), (45::numeric, 5)) AS s(size, stock)
WHERE v.sku = 'RETRO-JORDAN-1-HIGH-CHICAGO-GRIS-CARBON'
ON CONFLICT (variant_id, size_eur) DO NOTHING;

-- Campus 00s Core Black
INSERT INTO public.products (legacy_id, slug, name, brand_id, category_id, description, price, sale_price, is_new, is_active)
VALUES (5, 'campus-00s-core-black', 'Campus 00s Core Black', 'adidas', 'casual', 'Inspiradas en la era del skate de los 2000s con cordones anchos, empeine de gamuza prémium y suela vulcanizada de gran tracción.', 349900, NULL, false, true)
ON CONFLICT (slug) DO UPDATE SET legacy_id = EXCLUDED.legacy_id, name = EXCLUDED.name, brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id, description = EXCLUDED.description, price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price, is_new = EXCLUDED.is_new, updated_at = now();

INSERT INTO public.product_variants (product_id, color_name, color_hex, version_name, sku, images, is_default)
SELECT id, 'Negro', '#1c1c1e', 'Original', 'CAMPUS-00S-CORE-BLACK-NEGRO', ARRAY['https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&w=600&q=80'], true FROM public.products WHERE slug = 'campus-00s-core-black'
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, color_hex = EXCLUDED.color_hex,
  images = EXCLUDED.images, is_default = EXCLUDED.is_default;

INSERT INTO public.variant_sizes (variant_id, size_eur, stock)
SELECT v.id, s.size, s.stock FROM public.product_variants v,
  (VALUES (37::numeric, 3), (38::numeric, 5), (39::numeric, 0), (40::numeric, 5), (41::numeric, 3), (42::numeric, 5)) AS s(size, stock)
WHERE v.sku = 'CAMPUS-00S-CORE-BLACK-NEGRO'
ON CONFLICT (variant_id, size_eur) DO NOTHING;

INSERT INTO public.product_variants (product_id, color_name, color_hex, version_name, sku, images, is_default)
SELECT id, 'Blanco', '#ffffff', 'Original', 'CAMPUS-00S-CORE-BLACK-BLANCO', ARRAY['https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&w=600&q=80'], false FROM public.products WHERE slug = 'campus-00s-core-black'
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, color_hex = EXCLUDED.color_hex,
  images = EXCLUDED.images, is_default = EXCLUDED.is_default;

INSERT INTO public.variant_sizes (variant_id, size_eur, stock)
SELECT v.id, s.size, s.stock FROM public.product_variants v,
  (VALUES (37::numeric, 3), (38::numeric, 5), (39::numeric, 0), (40::numeric, 5), (41::numeric, 3), (42::numeric, 5)) AS s(size, stock)
WHERE v.sku = 'CAMPUS-00S-CORE-BLACK-BLANCO'
ON CONFLICT (variant_id, size_eur) DO NOTHING;

-- Wave Lightning Z7 Voleibol
INSERT INTO public.products (legacy_id, slug, name, brand_id, category_id, description, price, sale_price, is_new, is_active)
VALUES (6, 'wave-lightning-z7-voleibol', 'Wave Lightning Z7 Voleibol', 'asics', 'voleibol', 'Diseñadas para velocidad y agilidad extrema en cancha cubierta de voleibol. Estructura ligera con tecnología de absorción para desplazamientos laterales.', 439900, NULL, false, true)
ON CONFLICT (slug) DO UPDATE SET legacy_id = EXCLUDED.legacy_id, name = EXCLUDED.name, brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id, description = EXCLUDED.description, price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price, is_new = EXCLUDED.is_new, updated_at = now();

INSERT INTO public.product_variants (product_id, color_name, color_hex, version_name, sku, images, is_default)
SELECT id, 'Blanco', '#ffffff', 'Original', 'WAVE-LIGHTNING-Z7-VOLEIBOL-BLANCO', ARRAY['https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=600&q=80'], true FROM public.products WHERE slug = 'wave-lightning-z7-voleibol'
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, color_hex = EXCLUDED.color_hex,
  images = EXCLUDED.images, is_default = EXCLUDED.is_default;

INSERT INTO public.variant_sizes (variant_id, size_eur, stock)
SELECT v.id, s.size, s.stock FROM public.product_variants v,
  (VALUES (39::numeric, 3), (40::numeric, 5), (41::numeric, 0), (42::numeric, 5), (43::numeric, 3), (44::numeric, 5)) AS s(size, stock)
WHERE v.sku = 'WAVE-LIGHTNING-Z7-VOLEIBOL-BLANCO'
ON CONFLICT (variant_id, size_eur) DO NOTHING;

INSERT INTO public.product_variants (product_id, color_name, color_hex, version_name, sku, images, is_default)
SELECT id, 'Azul Marino', '#1e3a8a', 'Original', 'WAVE-LIGHTNING-Z7-VOLEIBOL-AZUL-MARINO', ARRAY['https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=600&q=80'], false FROM public.products WHERE slug = 'wave-lightning-z7-voleibol'
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, color_hex = EXCLUDED.color_hex,
  images = EXCLUDED.images, is_default = EXCLUDED.is_default;

INSERT INTO public.variant_sizes (variant_id, size_eur, stock)
SELECT v.id, s.size, s.stock FROM public.product_variants v,
  (VALUES (39::numeric, 3), (40::numeric, 5), (41::numeric, 0), (42::numeric, 5), (43::numeric, 3), (44::numeric, 5)) AS s(size, stock)
WHERE v.sku = 'WAVE-LIGHTNING-Z7-VOLEIBOL-AZUL-MARINO'
ON CONFLICT (variant_id, size_eur) DO NOTHING;

-- New Balance 550 White Green
INSERT INTO public.products (legacy_id, slug, name, brand_id, category_id, description, price, sale_price, is_new, is_active)
VALUES (7, 'new-balance-550-white-green', 'New Balance 550 White Green', 'new-balance', 'casual', 'Tributo a los profesionales del baloncesto de 1989. Silueta aerodinámica y robusta con toques verde bosque en cuero prémium.', 399900, NULL, false, true)
ON CONFLICT (slug) DO UPDATE SET legacy_id = EXCLUDED.legacy_id, name = EXCLUDED.name, brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id, description = EXCLUDED.description, price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price, is_new = EXCLUDED.is_new, updated_at = now();

INSERT INTO public.product_variants (product_id, color_name, color_hex, version_name, sku, images, is_default)
SELECT id, 'Blanco y Verde', '#1b4332', 'Original', 'NEW-BALANCE-550-WHITE-GREEN-BLANCO-Y-VERDE', ARRAY['https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=600&q=80'], true FROM public.products WHERE slug = 'new-balance-550-white-green'
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, color_hex = EXCLUDED.color_hex,
  images = EXCLUDED.images, is_default = EXCLUDED.is_default;

INSERT INTO public.variant_sizes (variant_id, size_eur, stock)
SELECT v.id, s.size, s.stock FROM public.product_variants v,
  (VALUES (38::numeric, 3), (39::numeric, 5), (40::numeric, 0), (41::numeric, 5), (42::numeric, 3)) AS s(size, stock)
WHERE v.sku = 'NEW-BALANCE-550-WHITE-GREEN-BLANCO-Y-VERDE'
ON CONFLICT (variant_id, size_eur) DO NOTHING;

-- Nike Air Max Plus TN Triple Black
INSERT INTO public.products (legacy_id, slug, name, brand_id, category_id, description, price, sale_price, is_new, is_active)
VALUES (8, 'nike-air-max-plus-tn-triple-black', 'Nike Air Max Plus TN Triple Black', 'nike', 'running', 'El clásico de las calles con sus líneas onduladas inspiradas en palmeras y tecnología Tuned Air para máxima absorción de impacto.', 469900, NULL, false, true)
ON CONFLICT (slug) DO UPDATE SET legacy_id = EXCLUDED.legacy_id, name = EXCLUDED.name, brand_id = EXCLUDED.brand_id,
  category_id = EXCLUDED.category_id, description = EXCLUDED.description, price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price, is_new = EXCLUDED.is_new, updated_at = now();

INSERT INTO public.product_variants (product_id, color_name, color_hex, version_name, sku, images, is_default)
SELECT id, 'Triple Negro', '#000000', 'Original', 'NIKE-AIR-MAX-PLUS-TN-TRIPLE-BLACK-TRIPLE-NEGRO', ARRAY['https://images.unsplash.com/photo-1514989940743-4ba41d087928?auto=format&fit=crop&w=600&q=80'], true FROM public.products WHERE slug = 'nike-air-max-plus-tn-triple-black'
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, color_hex = EXCLUDED.color_hex,
  images = EXCLUDED.images, is_default = EXCLUDED.is_default;

INSERT INTO public.variant_sizes (variant_id, size_eur, stock)
SELECT v.id, s.size, s.stock FROM public.product_variants v,
  (VALUES (39::numeric, 3), (40::numeric, 5), (41::numeric, 0), (42::numeric, 5)) AS s(size, stock)
WHERE v.sku = 'NIKE-AIR-MAX-PLUS-TN-TRIPLE-BLACK-TRIPLE-NEGRO'
ON CONFLICT (variant_id, size_eur) DO NOTHING;

