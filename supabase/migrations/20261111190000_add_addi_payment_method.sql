-- ==============================================================================
-- DC SNEAKERS: Integración de Addi (BNPL)
-- 1. Amplía constraints de orders.payment_method y payments.status para soportar Addi.
-- 2. Actualiza create_order_tx para admitir 'addi' y 'bold', y retornar el detalle
--    de ítems validados en BD para el payload de /v1/online-applications.
-- 3. Crea restore_order_stock_if_cancelled para revertir stock de forma atómica
--    e idempotente cuando una solicitud en Addi es rejected, declined o abandoned.
-- ==============================================================================

-- 1. Actualizar constraints en orders y payments
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_method_check
    CHECK (payment_method IN ('transfer', 'cash-on-delivery', 'bold-demo', 'bold', 'addi', 'online-gateway'));

ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE public.payments ADD CONSTRAINT payments_status_check
    CHECK (status IN ('pending', 'approved', 'rejected', 'declined', 'abandoned', 'refunded', 'voided'));

-- 2. Actualizar create_order_tx para soportar 'addi' y retornar ítems validados
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
    v_sku text;
    v_image text;
    v_category text;
    v_variant_label text;
    v_updated integer;
    v_items_out jsonb := '[]'::jsonb;
BEGIN
    IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'empty_cart' USING ERRCODE = 'P0001';
    END IF;

    IF p_payment_method NOT IN ('transfer', 'cash-on-delivery', 'bold-demo', 'bold', 'addi') THEN
        RAISE EXCEPTION 'invalid_payment_method' USING ERRCODE = 'P0001';
    END IF;

    v_order_id := 'ORD-' || nextval('public.order_number_seq');

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

        SELECT p.name,
               v.color_name,
               v.version_name,
               COALESCE(v.sku, v.id::text),
               COALESCE(v.images[1], ''),
               COALESCE(p.category_id, 'footwear'),
               COALESCE(v.sale_price_override, v.price_override, p.sale_price, p.price)
          INTO v_product_name, v_color_name, v_version_name, v_sku, v_image, v_category, v_price
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

        v_items_out := v_items_out || jsonb_build_array(
            jsonb_build_object(
                'sku', v_sku,
                'name', v_product_name || ' (' || v_variant_label || ' - Talla ' || v_size || ')',
                'quantity', v_qty,
                'unitPrice', v_price,
                'pictureUrl', v_image,
                'category', v_category
            )
        );
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
        'createdAt', v_created_at,
        'items', v_items_out
    );
END;
$$;

REVOKE ALL ON FUNCTION public.create_order_tx(jsonb, jsonb, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_order_tx(jsonb, jsonb, text) TO service_role;

-- 3. Función idempotente para restaurar stock cuando una orden falla o se abandona
CREATE OR REPLACE FUNCTION public.restore_order_stock_if_cancelled(
    p_order_id text,
    p_payment_status text DEFAULT 'failed'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_current_status text;
    v_row record;
BEGIN
    SELECT current_status
      INTO v_current_status
      FROM public.orders
     WHERE id = p_order_id
       FOR UPDATE;

    IF NOT FOUND OR v_current_status = 'cancelled' THEN
        RETURN false;
    END IF;

    UPDATE public.orders
       SET current_status = 'cancelled',
           payment_status = p_payment_status,
           updated_at = timezone('utc'::text, now())
     WHERE id = p_order_id;

    INSERT INTO public.order_status_history (order_id, status, note)
    VALUES (p_order_id, 'cancelled', 'Orden cancelada y stock restaurado automáticamente');

    FOR v_row IN
        SELECT variant_id, size, quantity
          FROM public.order_items
         WHERE order_id = p_order_id
           AND variant_id IS NOT NULL
    LOOP
        UPDATE public.variant_sizes
           SET stock = stock + v_row.quantity,
               updated_at = timezone('utc'::text, now())
         WHERE variant_id = v_row.variant_id
           AND size_eur = v_row.size;
    END LOOP;

    RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.restore_order_stock_if_cancelled(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.restore_order_stock_if_cancelled(text, text) TO service_role;
