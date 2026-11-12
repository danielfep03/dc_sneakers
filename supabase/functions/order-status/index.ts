// Edge Function: order-status
// Permite al Checkout verificar el estado de una orden tras el retorno del cliente desde Addi.
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  let orderId = ''
  if (req.method === 'GET') {
    const url = new URL(req.url)
    orderId = (url.searchParams.get('orderId') || '').trim()
  } else if (req.method === 'POST') {
    try {
      const body = await req.json()
      orderId = typeof body?.orderId === 'string' ? body.orderId.trim() : ''
    } catch {
      return json({ code: 'invalid_json' }, 400)
    }
  } else {
    return json({ code: 'method_not_allowed' }, 405)
  }

  if (!orderId) {
    return json({ code: 'missing_order_id' }, 400)
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } }
  )

  const { data: order, error } = await supabase
    .from('orders')
    .select('id, customer_name, total, current_status, payment_status, payment_method, created_at, updated_at')
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

  return json({
    order: {
      ...order,
      latest_payment_status: latestPayment?.status || order.payment_status
    }
  }, 200)
})
