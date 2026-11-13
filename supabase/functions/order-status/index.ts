// Edge Function: order-status
// Permite al Checkout verificar el estado real de una orden tras el retorno desde Addi o Bold.
// Resuelve correctamente la precedencia entre el estado en BD y el estado reportado en la URL de retorno.
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
}

function json (body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

function normalizeGatewayStatus (raw: unknown): 'approved' | 'rejected' | 'abandoned' | 'pending' | '' {
  const s = typeof raw === 'string' ? raw.toLowerCase().trim() : ''
  if (!s) return ''
  if (['approved', 'paid', 'successful', 'succeeded', 'confirmed', 'completed'].includes(s)) {
    return 'approved'
  }
  if (s === 'abandoned') {
    return 'abandoned'
  }
  if (['rejected', 'failed', 'voided', 'declined', 'cancelled', 'canceled', 'error', 'expired', 'refunded'].includes(s)) {
    return 'rejected'
  }
  if (['pending', 'processing', 'in_process', 'created', 'active'].includes(s)) {
    return 'pending'
  }
  return ''
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  let orderId = ''
  let rawUrlStatus = ''
  let provider = ''

  if (req.method === 'GET') {
    const url = new URL(req.url)
    orderId = (url.searchParams.get('orderId') || '').trim()
    rawUrlStatus = (url.searchParams.get('urlStatus') || url.searchParams.get('status') || '').trim()
    provider = (url.searchParams.get('provider') || '').trim()
  } else if (req.method === 'POST') {
    try {
      const body = await req.json()
      orderId = typeof body?.orderId === 'string' ? body.orderId.trim() : ''
      rawUrlStatus = typeof body?.urlStatus === 'string' ? body.urlStatus.trim() : ''
      provider = typeof body?.provider === 'string' ? body.provider.trim() : ''
    } catch {
      return json({ code: 'invalid_json' }, 400)
    }
  } else {
    return json({ code: 'method_not_allowed' }, 405)
  }

  if (!orderId) {
    return json({ code: 'missing_order_id' }, 400)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabase = createClient(
    supabaseUrl,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } }
  )

  const { data: order, error } = await supabase
    .from('orders')
    .select('id, customer_name, customer_phone, total, current_status, payment_status, payment_method, created_at, updated_at')
    .eq('id', orderId)
    .maybeSingle()

  if (error || !order) {
    return json({ code: 'order_not_found' }, 404)
  }

  const { data: latestPayment } = await supabase
    .from('payments')
    .select('status, transaction_reference, created_at')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const dbPaymentNorm = normalizeGatewayStatus(latestPayment?.status)
  const dbOrderNorm = normalizeGatewayStatus(order.payment_status)
  const urlNorm = normalizeGatewayStatus(rawUrlStatus)

  // Precedencia:
  // 1. Si en BD ya hay un estado terminal ('approved', 'rejected', 'abandoned'), usar ese estado.
  // 2. Si en BD sigue 'pending', pero la URL de retorno de la pasarela trae 'rejected' o 'abandoned',
  //    usar el estado de la URL, restaurar stock y notificar por Kapso.
  // 3. Si la URL trae 'approved' y es Addi, solo si BD ya confirmó o si urlNorm es 'approved'.
  let finalStatus: 'approved' | 'rejected' | 'abandoned' | 'pending' = 'pending'

  if (dbPaymentNorm && dbPaymentNorm !== 'pending') {
    finalStatus = dbPaymentNorm
  } else if (dbOrderNorm && dbOrderNorm !== 'pending') {
    finalStatus = dbOrderNorm
  } else if (urlNorm === 'rejected' || urlNorm === 'abandoned') {
    finalStatus = urlNorm

    // Si aún estaba pending en BD y la pasarela redirigió con rechazo/abandono, liberar stock y notificar
    if (order.payment_status === 'pending') {
      const gatewayProvider = provider || (order.payment_method === 'addi' ? 'addi' : 'bold')
      await supabase.rpc('restore_order_stock_if_cancelled', {
        p_order_id: orderId,
        p_payment_status: 'failed'
      })

      order.payment_status = 'failed'
      order.current_status = 'cancelled'

      await supabase
        .from('payments')
        .insert([
          {
            order_id: orderId,
            provider: gatewayProvider,
            transaction_reference: null,
            amount: order.total,
            status: urlNorm,
            raw_payload: { source: 'return_url', urlStatus: rawUrlStatus }
          }
        ])

      await fetch(`${supabaseUrl}/functions/v1/kapso-whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'notify_gateway_failure',
          orderId,
          provider: gatewayProvider,
          status: urlNorm
        })
      }).catch(() => {})
    }
  } else if (urlNorm === 'approved') {
    finalStatus = 'approved'
  }

  return json({
    order: {
      ...order,
      latest_payment_status: finalStatus,
      final_status: finalStatus
    }
  }, 200)
})
