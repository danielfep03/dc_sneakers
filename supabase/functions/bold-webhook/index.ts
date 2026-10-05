// Edge Function: bold-webhook
// Recibe eventos de actualización de transacciones enviadas por la API de Bold.
// Valida la firma HMAC/SHA256 enviada por Bold y actualiza los estados de la orden en Supabase.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { crypto } from 'https://deno.land/std@0.224.0/crypto/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-bold-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

function json (body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

// Calcula la firma SHA256 HMAC para verificar origen de Bold
async function computeHmacSha256 (secretKey: string, message: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secretKey)
  const msgData = encoder.encode(message)

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', key, msgData)
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
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

  const boldWebhookSecret = Deno.env.get('BOLD_WEBHOOK_SECRET')
  const signatureHeader = req.headers.get('x-bold-signature')

  // Si hay llave secreta de webhook configurada, validar firma
  if (boldWebhookSecret && signatureHeader) {
    const computedSig = await computeHmacSha256(boldWebhookSecret, JSON.stringify(payload))
    if (computedSig !== signatureHeader) {
      console.warn('Firma de Webhook Bold inválida')
      return json({ code: 'unauthorized_signature' }, 401)
    }
  }

  const orderId = payload?.data?.reference || payload?.orderId
  const status = (payload?.data?.status || payload?.status || '').toUpperCase()
  const txRef = payload?.data?.id || payload?.transactionId

  if (!orderId) {
    return json({ code: 'missing_order_reference' }, 400)
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } }
  )

  let paymentStatus = 'pending'
  let currentStatus = 'pending'

  if (status === 'APPROVED' || status === 'PAID') {
    paymentStatus = 'paid'
    currentStatus = 'confirmed'
  } else if (status === 'REJECTED' || status === 'FAILED') {
    paymentStatus = 'failed'
  } else if (status === 'VOIDED' || status === 'REFUNDED') {
    paymentStatus = 'refunded'
    currentStatus = 'cancelled'
  }

  // 1. Actualizar orden
  const { error: orderError } = await supabase
    .from('orders')
    .update({
      payment_status: paymentStatus,
      current_status: currentStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId)

  if (orderError) {
    console.error('Error actualizando orden desde Webhook Bold:', orderError)
    return json({ code: 'db_update_error' }, 500)
  }

  // 2. Registrar/actualizar pago
  await supabase
    .from('payments')
    .insert([
      {
        order_id: orderId,
        provider: 'bold',
        transaction_reference: txRef || null,
        amount: payload?.data?.amount || 0,
        status: status.toLowerCase(),
        raw_payload: payload
      }
    ])

  return json({ code: 'webhook_processed', orderId, status: paymentStatus }, 200)
})
