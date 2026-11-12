// Edge Function: addi-cancel
// Endpoint dedicado para reversar compras previamente aprobadas con Addi (docs/addi.md Sección 5).
// Reglas:
// - Requiere autenticación con JWT de Addi OAuth.
// - Total vs Parcial: si el monto coincide con el valor original, es cancelación total; si es menor, parcial.
// - Límite estricto: Solo se permite realizar una (1) solicitud de cancelación por transacción.
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

async function getAddiAccessToken (
  preferProd: boolean,
  clientId: string,
  clientSecret: string
): Promise<{ accessToken: string; isProd: boolean }> {
  const attempts = preferProd
    ? [
        { authUrl: 'https://auth.addi.com/oauth/token', audience: 'https://api.addi.com', isProd: true },
        { authUrl: 'https://auth.addi-staging.com/oauth/token', audience: 'https://api.addi.com', isProd: false },
        { authUrl: 'https://auth.addi-staging.com/oauth/token', audience: 'https://api.staging.addi.com', isProd: false }
      ]
    : [
        { authUrl: 'https://auth.addi-staging.com/oauth/token', audience: 'https://api.addi.com', isProd: false },
        { authUrl: 'https://auth.addi-staging.com/oauth/token', audience: 'https://api.staging.addi.com', isProd: false },
        { authUrl: 'https://auth.addi.com/oauth/token', audience: 'https://api.addi.com', isProd: true }
      ]

  let lastError = ''

  for (const attempt of attempts) {
    const res = await fetch(attempt.authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        audience: attempt.audience,
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret
      })
    })

    if (res.ok) {
      const data = await res.json()
      if (data?.access_token) {
        return { accessToken: data.access_token, isProd: attempt.isProd }
      }
    } else {
      const errText = await res.text().catch(() => '')
      lastError = `(${res.status} @ ${attempt.authUrl}): ${errText}`
    }
  }

  throw new Error(`Addi OAuth error: ${lastError}`)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ code: 'method_not_allowed' }, 405)

  // Requiere clave administrativa o service_role para evitar cancelaciones no autorizadas
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()

  if (!token || token !== serviceRoleKey) {
    return json({ code: 'unauthorized' }, 401)
  }

  let payload: any
  try {
    payload = await req.json()
  } catch {
    return json({ code: 'invalid_json' }, 400)
  }

  const orderId = typeof payload?.orderId === 'string' ? payload.orderId.trim() : ''
  const requestedCancelAmount = Number(payload?.amount)

  if (!orderId || !Number.isFinite(requestedCancelAmount) || requestedCancelAmount <= 0) {
    return json({ code: 'invalid_parameters' }, 400)
  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, serviceRoleKey, { auth: { persistSession: false } })

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('id, total, payment_method, payment_status, current_status')
    .eq('id', orderId)
    .maybeSingle()

  if (orderErr || !order) {
    return json({ code: 'order_not_found' }, 404)
  }

  if (order.payment_status !== 'paid') {
    return json({ code: 'order_not_paid', message: 'Solo se pueden cancelar órdenes previamente aprobadas.' }, 409)
  }

  if (requestedCancelAmount > Number(order.total)) {
    return json({ code: 'amount_exceeds_order_total' }, 400)
  }

  // Verificar que no exista ya una cancelación previa (Límite de 1 cancelación por transacción en Addi)
  const { data: existingCancellations } = await supabase
    .from('payments')
    .select('id')
    .eq('order_id', orderId)
    .eq('provider', 'addi')
    .in('status', ['refunded', 'voided'])
    .limit(1)

  if (existingCancellations && existingCancellations.length > 0) {
    return json({
      code: 'cancellation_limit_reached',
      message: 'Addi solo permite una (1) solicitud de cancelación por transacción. Contacta a soporte_aliados@addi.com.'
    }, 409)
  }

  const addiEnv = (Deno.env.get('ADDI_ENV') || 'staging').toLowerCase().trim()
  const preferProd = addiEnv === 'production'
  const clientId = Deno.env.get('ADDI_CLIENT_ID')?.trim() || ''
  const clientSecret = Deno.env.get('ADDI_CLIENT_SECRET')?.trim() || ''

  if (!clientId || !clientSecret) {
    return json({ code: 'addi_missing_credentials' }, 503)
  }

  try {
    const { accessToken, isProd } = await getAddiAccessToken(preferProd, clientId, clientSecret)
    const cancelUrl = isProd
      ? 'https://api.addi.com/v1/online-applications/cancellations'
      : 'https://api.addi-staging.com/v1/online-applications/cancellations'

    const cancelBody = {
      orderId,
      amount: `${Math.round(requestedCancelAmount)}.0`
    }

    const cancelRes = await fetch(cancelUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(cancelBody)
    })

    if (!cancelRes.ok) {
      const errText = await cancelRes.text().catch(() => '')
      console.error(`Error en cancelación Addi (${cancelRes.status}):`, errText)
      return json({ code: 'addi_cancellation_failed', status: cancelRes.status }, 502)
    }

    const isTotalCancellation = Math.round(requestedCancelAmount) === Math.round(Number(order.total))

    if (isTotalCancellation) {
      await supabase.rpc('restore_order_stock_if_cancelled', {
        p_order_id: orderId,
        p_payment_status: 'refunded'
      })
    } else {
      await supabase
        .from('orders')
        .update({
          payment_status: 'refunded',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
    }

    await supabase
      .from('payments')
      .insert([
        {
          order_id: orderId,
          provider: 'addi',
          amount: requestedCancelAmount,
          status: 'refunded',
          raw_payload: {
            type: isTotalCancellation ? 'total_cancellation' : 'partial_cancellation',
            requestedAmount: requestedCancelAmount
          }
        }
      ])

    return json({
      code: 'cancellation_processed',
      orderId,
      type: isTotalCancellation ? 'total' : 'partial',
      amount: requestedCancelAmount
    }, 200)
  } catch (err) {
    console.error('Error procesando cancelación en Addi:', err)
    return json({ code: 'internal_error' }, 500)
  }
})
