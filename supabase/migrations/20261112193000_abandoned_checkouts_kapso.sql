-- ==============================================================================
-- DC SNEAKERS: Recuperación de Checkout Abandonado y Fallos de Pasarela con Kapso
-- 1. Crea la tabla public.abandoned_checkouts con RLS estricto (solo service_role).
-- 2. Habilita pg_cron y pg_net para verificar cada minuto los checkouts que llevan
--    >= 5 minutos inactivos sin completar compra y enviar asesoría por WhatsApp.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.abandoned_checkouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    shipping_city TEXT,
    shipping_address TEXT,
    payment_method TEXT DEFAULT 'cash-on-delivery',
    cart_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    cart_total NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (cart_total >= 0),
    order_id TEXT REFERENCES public.orders(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'converted', 'notified', 'dismissed')),
    failure_reason TEXT,
    kapso_response JSONB,
    notified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_abandoned_checkouts_status_updated
    ON public.abandoned_checkouts (status, updated_at);

CREATE INDEX IF NOT EXISTS idx_abandoned_checkouts_phone
    ON public.abandoned_checkouts (customer_phone, notified_at DESC);

CREATE INDEX IF NOT EXISTS idx_abandoned_checkouts_order_id
    ON public.abandoned_checkouts (order_id);

-- RLS estricto: ningún cliente público puede leer ni modificar borradores ajenos
ALTER TABLE public.abandoned_checkouts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.abandoned_checkouts FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.abandoned_checkouts TO service_role;

-- Habilitar pg_net y pg_cron para disparar la revisión automática cada minuto
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'process-abandoned-checkouts') THEN
        PERFORM cron.unschedule('process-abandoned-checkouts');
    END IF;
END
$$;

SELECT cron.schedule(
    'process-abandoned-checkouts',
    '* * * * *',
    $$
    SELECT net.http_post(
        url := 'https://evcbuwsllubgzojocswd.supabase.co/functions/v1/kapso-whatsapp',
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := '{"action": "process_abandoned"}'::jsonb
    );
    $$
);
