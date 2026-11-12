// Edge Function: addi-webhook
// Recibe el reporte asíncrono de resultado de Addi (Callback URL).
// Reglas de docs/addi.md (Sección 4):
// 1. Autenticación básica (Basic Auth) con credenciales del portal de aliados.
// 2. Estados posibles: approved, rejected, declined, abandoned.
// 3. Si es rejected, declined o abandoned, se cancela la orden y se restaura el stock.
// 4. Debe responder con HTTP 200 y retornar EXACTAMENTE el mismo cuerpo (body) en formato JSON recibido.
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

function verifyBasicAuth (authHeader: string | null, expectedUser: string, expectedPass: string): boolean {
  if (!authHeader || !authHeader.startsWith('Basic ')) return false
  try {
    const base64Credentials = authHeader.slice(6).trim()
    const decoded = atob(base64Credentials)
    const colonIndex = decoded.indexOf(':')
    if (colonIndex === -1) return false
    const user = decoded.slice(0, colonIndex)
    const pass = decoded.slice(colonIndex + 1)
    return user === expectedUser && pass === expectedPass
  } catch {
    return false
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ code: 'method_not_allowed' }, 405)

  // 1. Verificar Basic Auth si las credenciales están configuradas en los secretos
  const webhookUser = Deno.env.get('ADDI_WEBHOOK_USER')?.trim()
  const webhookPass = Deno.env.get('ADDI_WEBHOOK_PASSWORD')?.trim()

  if (webhookUser && webhookPass) {
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization')
    if (!verifyBasicAuth(authHeader, webhookUser, webhookPass)) {
      console.warn('Intento no autorizado en addi-webhook: credenciales Basic Auth inválidas')
      return json({ code: 'unauthorized' }, 401)
    }
  }

  // 2. Leer el body crudo para poder devolver exactamente el mismo JSON en el response 200
  let rawBody = ''
  let payload: any
  try {
    rawBody = await req.text()
    payload = JSON.parse(rawBody)
  } catch {
    return json({ code: 'invalid_json' }, 400)
  }

  const orderId = typeof payload?.orderId === 'string' ? payload.orderId.trim() : ''
  const applicationId = typeof payload?.applicationId === 'string' ? payload.applicationId.trim() : null
  const rawStatus = typeof payload?.status === 'string' ? payload.status.toLowerCase().trim() : ''
  const approvedAmount = Number(payload?.approvedAmount ?? 0)

  if (!orderId || !rawStatus) {
    return json({ code: 'missing_fields' }, 400)
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } }
  )

  if (rawStatus === 'approved') {
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        current_status: 'confirmed',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (orderError) {
      console.error('Error actualizando orden aprobada desde Addi Webhook:', orderError)
      return json({ code: 'db_update_error' }, 500)
    }

    await supabase
      .from('order_status_history')
      .insert([
        {
          order_id: orderId,
          status: 'confirmed',
          note: `Crédito aprobado en Addi (applicationId: ${applicationId || 'N/A'})`
        }
      ])
  } else if (rawStatus === 'rejected' || rawStatus === 'declined' || rawStatus === 'abandoned') {
    // Restaurar stock de forma atómica e idempotente y marcar orden como cancelada/fallida
    const { error: restoreErr } = await supabase.rpc('restore_order_stock_if_cancelled', {
      p_order_id: orderId,
      p_payment_status: 'failed'
    })

    if (restoreErr) {
      console.error('Error restaurando stock desde Addi Webhook:', restoreErr)
      return json({ code: 'db_restore_error' }, 500)
    }
  }

  // Registrar el resultado en la tabla payments
  const validPaymentStatuses = ['pending', 'approved', 'rejected', 'declined', 'abandoned', 'refunded', 'voided']
  const normalizedPaymentStatus = validPaymentStatuses.includes(rawStatus) ? rawStatus : 'rejected'

  await supabase
    .from('payments')
    .insert([
      {
        order_id: orderId,
        provider: 'addi',
        transaction_reference: applicationId,
        amount: Number.isFinite(approvedAmount) && approvedAmount >= 0 ? approvedAmount : 0,
        status: normalizedPaymentStatus,
        raw_payload: payload
      }
    ])

  // Requisito obligatorio de Addi (docs/addi.md Sección 4):
  // Responder con status HTTP 200 y retornar exactamente el mismo body JSON recibido.
  return new Response(rawBody, {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  })
})
