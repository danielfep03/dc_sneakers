-- ==============================================================================
-- DC SNEAKERS: creación atómica de órdenes + endurecimiento de RLS
--
-- 1. Cierra el acceso público a datos de clientes (orders, order_items,
--    order_status_history, payments). Antes cualquiera con la publishable key
--    podía leer nombre, teléfono y dirección de todos los pedidos.
-- 2. Las órdenes ahora se crean SOLO desde la Edge Function `create-order`
--    (service_role), que llama a `create_order_tx`.
-- 3. `create_order_tx` recalcula precios desde la BD, descuenta stock de forma
--    atómica y genera un ID único con secuencia (sin colisiones ORD-XXXX).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Cerrar acceso público a órdenes
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Permitir crear ordenes a visitantes y clientes" ON public.orders;
DROP POLICY IF EXISTS "Permitir consultar orden por ID" ON public.orders;
DROP POLICY IF EXISTS "Permitir crear items de orden" ON public.order_items;
DROP POLICY IF EXISTS "Permitir consultar items de orden" ON public.order_items;
DROP POLICY IF EXISTS "Permitir crear pagos" ON public.payments;
DROP POLICY IF EXISTS "Permitir consultar historial de estados" ON public.order_status_history;

-- Con RLS activo y sin políticas, anon/authenticated no pueden leer ni escribir.
-- Se revoca además el privilegio a nivel de tabla (defensa en profundidad).
REVOKE ALL ON public.orders FROM anon, authenticated;
REVOKE ALL ON public.order_items FROM anon, authenticated;
REVOKE ALL ON public.order_status_history FROM anon, authenticated;
REVOKE ALL ON public.payments FROM anon, authenticated;

-- El catálogo es de solo lectura para el público.
REVOKE INSERT, UPDATE, DELETE ON public.brands FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.categories FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.products FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.product_variants FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.variant_sizes FROM anon, authenticated;

-- ------------------------------------------------------------------------------
-- 2. Compatibilidad con URLs antiguas (/producto/2)
-- ------------------------------------------------------------------------------
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS legacy_id INTEGER UNIQUE;

-- ------------------------------------------------------------------------------
-- 3. Secuencia para IDs de orden (ORD-1001, ORD-1002, ...)
-- ------------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START WITH 1001;

-- ------------------------------------------------------------------------------
-- 4. Creación atómica de la orden
--    SECURITY INVOKER: se ejecuta con los privilegios de quien llama. Solo
--    service_role puede ejecutarla (EXECUTE revocado a los demás roles), así que
--    no es un endpoint público ni salta RLS para anon/authenticated.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_order_tx(
    p_contact jsonb,
    p_items jsonb,
    p_payment_method text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_order_id text;
    v_subtotal numeric := 0;
    v_created_at timestamptz := timezone('utc'::text, now());
    v_item jsonb;
    v_variant_id uuid;
    v_size numeric;
    v_qty integer;
    v_price numeric;
    v_product_name text;
    v_color_name text;
    v_version_name text;
    v_variant_label text;
    v_updated integer;
BEGIN
    IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'empty_cart' USING ERRCODE = 'P0001';
    END IF;

    IF p_payment_method NOT IN ('transfer', 'cash-on-delivery', 'bold-demo') THEN
        RAISE EXCEPTION 'invalid_payment_method' USING ERRCODE = 'P0001';
    END IF;

    v_order_id := 'ORD-' || nextval('public.order_number_seq');

    -- Encabezado (totales en 0; se actualizan al final). El trigger
    -- trigger_new_order_history registra el estado inicial 'pending'.
    INSERT INTO public.orders (
        id, customer_name, customer_phone, customer_email,
        shipping_address, shipping_city, shipping_notes,
        subtotal, shipping_cost, total,
        current_status, payment_method, payment_status, created_at
    ) VALUES (
        v_order_id,
        btrim(p_contact->>'name'),
        btrim(p_contact->>'phone'),
        NULLIF(btrim(COALESCE(p_contact->>'email', '')), ''),
        btrim(p_contact->>'address'),
        btrim(p_contact->>'city'),
        NULLIF(btrim(COALESCE(p_contact->>'notes', '')), ''),
        0, 0, 0,
        'pending', p_payment_method, 'pending', v_created_at
    );

    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_variant_id := (v_item->>'variantId')::uuid;
        v_size := (v_item->>'size')::numeric;
        v_qty := (v_item->>'quantity')::integer;

        IF v_qty IS NULL OR v_qty < 1 OR v_qty > 10 THEN
            RAISE EXCEPTION 'invalid_quantity' USING ERRCODE = 'P0001';
        END IF;

        -- Descuento atómico: solo ocurre si hay stock suficiente.
        UPDATE public.variant_sizes
           SET stock = stock - v_qty,
               updated_at = timezone('utc'::text, now())
         WHERE variant_id = v_variant_id
           AND size_eur = v_size
           AND stock >= v_qty;
        GET DIAGNOSTICS v_updated = ROW_COUNT;

        IF v_updated = 0 THEN
            RAISE EXCEPTION 'out_of_stock:%:%', v_variant_id, v_size USING ERRCODE = 'P0001';
        END IF;

        -- Precio SIEMPRE desde la BD (el cliente no puede manipularlo).
        SELECT p.name,
               v.color_name,
               v.version_name,
               COALESCE(v.sale_price_override, v.price_override, p.sale_price, p.price)
          INTO v_product_name, v_color_name, v_version_name, v_price
          FROM public.product_variants v
          JOIN public.products p ON p.id = v.product_id
         WHERE v.id = v_variant_id
           AND p.is_active = true;

        IF v_price IS NULL THEN
            RAISE EXCEPTION 'variant_not_found:%', v_variant_id USING ERRCODE = 'P0001';
        END IF;

        v_variant_label := v_color_name;
        IF v_version_name IS NOT NULL AND v_version_name <> 'Original' THEN
            v_variant_label := v_color_name || ' · ' || v_version_name;
        END IF;

        INSERT INTO public.order_items (
            order_id, variant_id, product_name, variant_name,
            size, unit_price, quantity, total_price
        ) VALUES (
            v_order_id, v_variant_id, v_product_name, v_variant_label,
            v_size, v_price, v_qty, v_price * v_qty
        );

        v_subtotal := v_subtotal + (v_price * v_qty);
    END LOOP;

    UPDATE public.orders
       SET subtotal = v_subtotal,
           total = v_subtotal + shipping_cost,
           updated_at = timezone('utc'::text, now())
     WHERE id = v_order_id;

    INSERT INTO public.payments (order_id, provider, amount, status)
    VALUES (v_order_id, p_payment_method, v_subtotal, 'pending');

    RETURN jsonb_build_object(
        'orderId', v_order_id,
        'total', v_subtotal,
        'createdAt', v_created_at
    );
END;
$$;

-- Postgres concede EXECUTE a PUBLIC por defecto: se revoca explícitamente.
REVOKE ALL ON FUNCTION public.create_order_tx(jsonb, jsonb, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_order_tx(jsonb, jsonb, text) TO service_role;
