-- ==============================================================================
-- DC SNEAKERS: E-COMMERCE DATABASE SCHEMA & RLS POLICIES
-- Migración inicial para Supabase
-- Incluye: Marcas, Categorías, Productos, Variantes (Colores, Versiones, Fotos),
--          Tallas e Inventario por variante, Órdenes, Ítems, Historial de Estados y Pagos.
-- ==============================================================================

-- 1. Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA: BRANDS (Marcas)
CREATE TABLE IF NOT EXISTS public.brands (
    id TEXT PRIMARY KEY, -- ej: 'nike', 'adidas', 'jordan'
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. TABLA: CATEGORIES (Categorías)
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY, -- ej: 'lifestyle', 'basketball', 'running', 'skate'
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. TABLA: PRODUCTS (Productos principales)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    brand_id TEXT REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE SET NULL,
    category_id TEXT REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    sale_price NUMERIC(12, 2) CHECK (sale_price IS NULL OR sale_price < price),
    is_new BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. TABLA: PRODUCT_VARIANTS (Variantes por color, versión/edición y fotos)
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    color_name TEXT NOT NULL, -- ej: "Triple White", "Chicago Red / Black"
    color_hex TEXT,           -- ej: "#FFFFFF", "#B22222"
    version_name TEXT NOT NULL DEFAULT 'Original', -- ej: "High OG", "Retro Low", "Special Edition"
    sku TEXT UNIQUE,
    images TEXT[] NOT NULL DEFAULT '{}',
    price_override NUMERIC(12, 2) CHECK (price_override IS NULL OR price_override >= 0),
    sale_price_override NUMERIC(12, 2) CHECK (sale_price_override IS NULL OR sale_price_override >= 0),
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. TABLA: VARIANT_SIZES (Tallas y stock de cada variante)
CREATE TABLE IF NOT EXISTS public.variant_sizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    size_eur NUMERIC(4, 1) NOT NULL, -- ej: 38, 39, 40, 41.5
    size_us NUMERIC(4, 1),           -- ej: 7.5, 8, 8.5
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_variant_size UNIQUE (variant_id, size_eur)
);

-- 7. TABLA: ORDERS (Órdenes de compra)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY, -- ej: "ORD-9481" o UUID
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    shipping_address TEXT NOT NULL,
    shipping_city TEXT NOT NULL,
    shipping_notes TEXT,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    shipping_cost NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
    total NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total >= 0),
    current_status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (current_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    payment_method TEXT NOT NULL DEFAULT 'transfer' 
        CHECK (payment_method IN ('transfer', 'cash-on-delivery', 'bold-demo', 'online-gateway')),
    payment_status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. TABLA: ORDER_ITEMS (Detalles de los productos en la orden)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    variant_name TEXT, -- Ej: "Triple White · Original"
    size NUMERIC(4, 1) NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    total_price NUMERIC(12, 2) NOT NULL CHECK (total_price >= 0)
);

-- 9. TABLA: ORDER_STATUS_HISTORY (Historial cronológico de cambios de estado)
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    note TEXT,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. TABLA: PAYMENTS (Registro de pagos e intentos de cobro)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    provider TEXT NOT NULL, -- 'transfer', 'bold', 'wompi', 'cash-on-delivery', etc.
    transaction_reference TEXT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'refunded', 'voided')),
    raw_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- ÍNDICES PARA RENDIMIENTO EN CONSULTAS
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_sizes_variant ON public.variant_sizes(variant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(current_status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_history_order ON public.order_status_history(order_id);

-- ------------------------------------------------------------------------------
-- TRIGGER: Registrar automáticamente primer estado al crear orden
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_order_history()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.order_status_history (order_id, status, note)
    VALUES (NEW.id, NEW.current_status, 'Orden creada exitosamente');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_new_order_history ON public.orders;
CREATE TRIGGER trigger_new_order_history
    AFTER INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_order_history();

-- ------------------------------------------------------------------------------
-- SEGURIDAD POR FILAS (ROW LEVEL SECURITY - RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variant_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública para catálogo (anon y authenticated)
CREATE POLICY "Permitir lectura publica de marcas"
    ON public.brands FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Permitir lectura publica de categorias"
    ON public.categories FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Permitir lectura publica de productos activos"
    ON public.products FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

CREATE POLICY "Permitir lectura publica de variantes"
    ON public.product_variants FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Permitir lectura publica de tallas"
    ON public.variant_sizes FOR SELECT
    TO anon, authenticated
    USING (true);

-- Políticas para órdenes (creación abierta para clientes en checkout)
CREATE POLICY "Permitir crear ordenes a visitantes y clientes"
    ON public.orders FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Permitir consultar orden por ID"
    ON public.orders FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Permitir crear items de orden"
    ON public.order_items FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Permitir consultar items de orden"
    ON public.order_items FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Permitir crear pagos"
    ON public.payments FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Permitir consultar historial de estados"
    ON public.order_status_history FOR SELECT
    TO anon, authenticated
    USING (true);
