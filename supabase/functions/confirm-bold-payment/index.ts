// Edge Function: confirm-bold-payment
// Permite confirmar y actualizar una orden cuando el cliente retorna de Bold Checkout (sin requerir webhooks).
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ code: 'method_not_allowed' }, 405)

  let payload: any
  try {
    payload = await req.json()
  } catch {
    return json({ code: 'invalid_json' }, 400)
  }

  const orderId = payload?.orderId
  const status = (payload?.boldStatus || 'approved').toLowerCase()
  const txId = payload?.txId || null

  if (!orderId) {
    return json({ code: 'missing_order_id' }, 400)
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } }
  )

  const isApproved = status === 'approved' || status === 'paid' || status === 'successful'

  // 1. Actualizar orden
  const { data: updatedOrder, error: orderError } = await supabase
    .from('orders')
    .update({
      payment_status: isApproved ? 'paid' : 'failed',
      current_status: isApproved ? 'confirmed' : 'pending',
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId)
    .select('id, customer_name, customer_phone, total, current_status, payment_status')
    .single()

  if (orderError) {
    console.error('Error actualizando orden:', orderError)
    return json({ code: 'order_not_found_or_update_failed' }, 404)
  }

  // 2. Registrar en tabla payments
  await supabase
    .from('payments')
    .insert([
      {
        order_id: orderId,
        provider: 'bold',
        transaction_reference: txId,
        amount: updatedOrder.total,
        status: isApproved ? 'approved' : 'rejected',
        raw_payload: payload
      }
    ])

  return json({
    code: 'order_confirmed',
    order: updatedOrder
  }, 200)
})
