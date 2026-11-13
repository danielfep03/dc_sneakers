// Edge Function: confirm-bold-payment
// Verifica y actualiza de forma segura una orden cuando el cliente retorna de Bold Checkout.
// Nunca asume 'approved' por defecto si el parámetro de estado no viene o es rechazado.
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
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
  if (req.method !== 'POST') return json({ code: 'method_not_allowed' }, 405)

  let payload: any
  try {
    payload = await req.json()
  } catch {
    return json({ code: 'invalid_json' }, 400)
  }

  const orderId = typeof payload?.orderId === 'string' ? payload.orderId.trim() : ''
  const rawUrlStatus = typeof payload?.boldStatus === 'string' ? payload.boldStatus.toLowerCase().trim() : ''
  const txId = typeof payload?.txId === 'string' && payload.txId.trim() ? payload.txId.trim() : null

  if (!orderId) {
    return json({ code: 'missing_order_id' }, 400)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabase = createClient(
    supabaseUrl,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } }
  )

  // 1. Consultar estado actual de la orden en la base de datos
  const { data: existingOrder, error: fetchError } = await supabase
    .from('orders')
    .select('id, customer_name, customer_phone, total, current_status, payment_status, payment_method')
    .eq('id', orderId)
    .maybeSingle()

  if (fetchError || !existingOrder) {
    console.error('Orden no encontrada en confirm-bold-payment:', fetchError)
    return json({ code: 'order_not_found' }, 404)
  }

  // Consultar el último registro de pago por si bold-webhook ya procesó el resultado
  const { data: latestPayment } = await supabase
    .from('payments')
    .select('status, transaction_reference, created_at')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const dbOrderNorm = normalizeGatewayStatus(existingOrder.payment_status)
  const dbPaymentNorm = normalizeGatewayStatus(latestPayment?.status)
  const urlNorm = normalizeGatewayStatus(rawUrlStatus)

  // Determinar estado definitivo con prioridad:
  // 1. Si la URL reporta explícitamente un rechazo o aprobación, o si la BD ya tiene un estado terminal
  let finalStatus: 'approved' | 'rejected' | 'abandoned' | 'pending' = 'pending'

  if (urlNorm === 'rejected' || urlNorm === 'abandoned') {
    finalStatus = urlNorm
  } else if (dbPaymentNorm === 'rejected' || dbOrderNorm === 'rejected') {
    finalStatus = 'rejected'
  } else if (dbPaymentNorm === 'approved' || dbOrderNorm === 'approved') {
    finalStatus = 'approved'
  } else if (urlNorm === 'approved') {
    finalStatus = 'approved'
  } else {
    finalStatus = 'pending'
  }

  let updatedOrder = { ...existingOrder }

  // 2. Aplicar cambios si el estado es terminal (approved o rejected/abandoned)
  if (finalStatus === 'approved' && existingOrder.payment_status !== 'paid') {
    const { data: savedOrder, error: updateErr } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        current_status: 'confirmed',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select('id, customer_name, customer_phone, total, current_status, payment_status, payment_method')
      .single()

    if (!updateErr && savedOrder) {
      updatedOrder = savedOrder
    }

    await supabase
      .from('payments')
      .insert([
        {
          order_id: orderId,
          provider: 'bold',
          transaction_reference: txId,
          amount: existingOrder.total,
          status: 'approved',
          raw_payload: payload
        }
      ])

    await fetch(`${supabaseUrl}/functions/v1/kapso-whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'mark_converted',
        orderId,
        phone: existingOrder.customer_phone
      })
    }).catch(() => {})
  } else if ((finalStatus === 'rejected' || finalStatus === 'abandoned') && existingOrder.payment_status !== 'failed') {
    // Restaurar stock de forma atómica e idempotente y marcar la orden como fallida/cancelada
    await supabase.rpc('restore_order_stock_if_cancelled', {
      p_order_id: orderId,
      p_payment_status: 'failed'
    })

    const { data: savedOrder } = await supabase
      .from('orders')
      .select('id, customer_name, customer_phone, total, current_status, payment_status, payment_method')
      .eq('id', orderId)
      .maybeSingle()

    if (savedOrder) {
      updatedOrder = savedOrder
    } else {
      updatedOrder.payment_status = 'failed'
      updatedOrder.current_status = 'cancelled'
    }

    await supabase
      .from('payments')
      .insert([
        {
          order_id: orderId,
          provider: 'bold',
          transaction_reference: txId,
          amount: existingOrder.total,
          status: 'rejected',
          raw_payload: payload
        }
      ])

    await fetch(`${supabaseUrl}/functions/v1/kapso-whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'notify_gateway_failure',
        orderId,
        provider: 'bold',
        status: rawUrlStatus || 'rejected'
      })
    }).catch((err) => console.warn('Aviso al invocar kapso-whatsapp desde confirm-bold-payment:', err))
  }

  return json({
    code: 'order_verified',
    finalStatus,
    order: {
      ...updatedOrder,
      latest_payment_status: finalStatus,
      final_status: finalStatus
    }
  }, 200)
})
