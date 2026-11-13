// Edge Function: create-order
// Endpoint público del checkout. Valida la entrada y delega la creación atómica
// (precios desde la BD, descuento de stock, ID único) en public.create_order_tx.
// Soporta:
// - Contraentrega ('cash-on-delivery') y Transferencia ('transfer')
// - Bold Checkout ('bold') con firma SHA256
// - Addi BNPL ('addi') con OAuth por intento + captura manual de redirección 301
import { createClient } from 'npm:@supabase/supabase-js@2'
import { crypto } from 'https://deno.land/std@0.224.0/crypto/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

const PAYMENT_METHODS = ['transfer', 'cash-on-delivery', 'bold-demo', 'bold', 'addi']
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function json (body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

// Calcula firma SHA256 para Bold: SHA256(orderId + amount + currency + secretKey)
async function generateBoldSignature (orderId: string, totalAmount: number, currency: string, secretKey: string): Promise<string> {
  const amountStr = String(Math.round(totalAmount))
  const concatenated = `${orderId}${amountStr}${currency}${secretKey}`
  const encoder = new TextEncoder()
  const data = encoder.encode(concatenated)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Genera un token OAuth nuevo por cada intento de transacción en Addi (docs/addi.md Sección 2).
// Nota técnica: Tanto en Staging (auth.addi-staging.com) como en Producción (auth.addi.com),
// el identificador del API (audience) registrado en Auth0 de Addi es "https://api.addi.com"
// (o "https://api.staging.addi.com" en ciertos tenants de prueba). Además, si las credenciales
// pertenecen a Producción o Staging indistintamente de ADDI_ENV, hace fallback automático.
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
      const tokenData = await res.json()
      if (tokenData?.access_token) {
        return { accessToken: tokenData.access_token, isProd: attempt.isProd }
      }
    } else {
      const errText = await res.text().catch(() => '')
      lastError = `(${res.status} @ ${attempt.authUrl} [${attempt.audience}]): ${errText}`
    }
  }

  throw new Error(`Addi OAuth falló en todos los endpoints: ${lastError}`)
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

  const paymentMethod = str(payload?.paymentMethod)
  if (!PAYMENT_METHODS.includes(paymentMethod)) return json({ code: 'invalid_payment_method' }, 400)

  // --- Validación de contacto ---
  const contact = {
    name: str(payload?.contact?.name),
    phone: str(payload?.contact?.phone).replace(/\D/g, ''),
    city: str(payload?.contact?.city),
    address: str(payload?.contact?.address),
    notes: str(payload?.contact?.notes),
    email: str(payload?.contact?.email),
    documentId: str(payload?.contact?.documentId).replace(/\D/g, '')
  }

  const fields: Record<string, string> = {}
  if (contact.name.length < 3 || contact.name.length > 100) fields.name = 'invalid'
  if (contact.phone.length < 10 || contact.phone.length > 13) fields.phone = 'invalid'
  if (contact.city.length < 2 || contact.city.length > 80) fields.city = 'invalid'
  if (contact.address.length < 5 || contact.address.length > 200) fields.address = 'invalid'
  if (contact.notes.length > 500) fields.notes = 'too_long'
  if (contact.email && !EMAIL_RE.test(contact.email)) fields.email = 'invalid'

  // Addi opera exclusivamente con personas naturales (Tipo de documento CC) y requiere email
  if (paymentMethod === 'addi') {
    if (!contact.documentId || contact.documentId.length < 5 || contact.documentId.length > 12) {
      fields.documentId = 'invalid'
    }
    if (!contact.email || !EMAIL_RE.test(contact.email)) {
      fields.email = 'invalid'
    }
  }

  if (Object.keys(fields).length > 0) return json({ code: 'invalid_contact', fields }, 400)

  // --- Validación de ítems ---
  const rawItems = payload?.items
  if (!Array.isArray(rawItems) || rawItems.length < 1 || rawItems.length > 20) {
    return json({ code: 'invalid_items' }, 400)
  }

  const items = []
  for (const it of rawItems) {
    const variantId = str(it?.variantId)
    const size = Number(it?.size)
    const quantity = Number(it?.quantity)
    if (
      !UUID_RE.test(variantId) ||
      !Number.isFinite(size) || size < 30 || size > 50 ||
      !Number.isInteger(quantity) || quantity < 1 || quantity > 10
    ) {
      return json({ code: 'invalid_items' }, 400)
    }
    items.push({ variantId, size, quantity })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabase = createClient(
    supabaseUrl,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } }
  )

  // Mapeo interno del método de pago para Postgres
  const dbPaymentMethod = paymentMethod === 'bold' ? 'bold-demo' : paymentMethod

  const { data, error } = await supabase.rpc('create_order_tx', {
    p_contact: contact,
    p_items: items,
    p_payment_method: dbPaymentMethod
  })

  if (error) {
    const message = error.message ?? ''
    if (message.startsWith('out_of_stock')) {
      const [, variantId, size] = message.split(':')
      return json({ code: 'out_of_stock', variantId, size: Number(size) }, 409)
    }
    if (message.startsWith('variant_not_found')) return json({ code: 'variant_not_found' }, 404)
    console.error('create_order_tx failed:', error)
    return json({ code: 'internal_error' }, 500)
  }

  // Determinar URL base del frontend para redirecciones de pasarelas
  let redirectionBase = str(payload?.originUrl)
  if (!redirectionBase || redirectionBase.includes('localhost') || redirectionBase.includes('127.0.0.1')) {
    const configuredReturn = Deno.env.get('ADDI_RETURN_URL') || Deno.env.get('BOLD_RETURN_URL')
    redirectionBase = configuredReturn || 'https://dcsneakers.shop'
  }

  // --- Opción A: Pago con Bold ---
  if (paymentMethod === 'bold') {
    const boldSecretKey =
      Deno.env.get('BOLD_SECRET_KEY')?.trim() ||
      Deno.env.get('BOLD_SECRET')?.trim() ||
      'SANDBOX_SECRET_KEY'

    const boldApiKey =
      Deno.env.get('BOLD_IDENTITY_KEY')?.trim() ||
      Deno.env.get('BOLD_API_KEY')?.trim() ||
      Deno.env.get('BOLD_KEY')?.trim() ||
      'SANDBOX_IDENTITY_KEY'

    const signature = await generateBoldSignature(data.orderId, data.total, 'COP', boldSecretKey)

    const boldCheckout = {
      orderId: data.orderId,
      currency: 'COP',
      amount: String(data.total),
      apiKey: boldApiKey,
      integritySignature: signature,
      description: `Pedido ${data.orderId} en DC SNEAKERS`,
      taxAmount: '0',
      redirectionUrl: `${redirectionBase}/checkout?orderId=${data.orderId}&bold=true`
    }

    return json({
      ...data,
      paymentMethod: 'bold',
      boldCheckout
    }, 201)
  }

  // --- Opción B: Pago con Addi (BNPL) ---
  if (paymentMethod === 'addi') {
    const addiEnv = (Deno.env.get('ADDI_ENV') || 'staging').toLowerCase().trim()
    const preferProd = addiEnv === 'production'
    const clientId = Deno.env.get('ADDI_CLIENT_ID')?.trim() || ''
    const clientSecret = Deno.env.get('ADDI_CLIENT_SECRET')?.trim() || ''

    if (!clientId || !clientSecret) {
      await supabase.rpc('restore_order_stock_if_cancelled', {
        p_order_id: data.orderId,
        p_payment_status: 'failed'
      })
      return json({ code: 'addi_missing_credentials' }, 503)
    }

    let accessToken: string
    let isProd = preferProd
    try {
      const authResult = await getAddiAccessToken(preferProd, clientId, clientSecret)
      accessToken = authResult.accessToken
      isProd = authResult.isProd
    } catch (authErr) {
      console.error('Error autenticando con Addi OAuth:', authErr)
      await supabase.rpc('restore_order_stock_if_cancelled', {
        p_order_id: data.orderId,
        p_payment_status: 'failed'
      })
      return json({ code: 'addi_auth_failed' }, 502)
    }

    const nameParts = contact.name.split(/\s+/).filter(Boolean)
    const firstName = nameParts[0] || contact.name
    const lastName = nameParts.slice(1).join(' ') || firstName
    const cellphoneClean = contact.phone.startsWith('57') && contact.phone.length > 10
      ? contact.phone.slice(2)
      : contact.phone

    const totalAmountStr = `${Math.round(Number(data.total))}.0`
    const addiItems = (Array.isArray(data.items) ? data.items : []).map((it: any) => ({
      sku: String(it.sku || 'SKU-DC'),
      name: String(it.name || 'Sneaker DC'),
      quantity: String(it.quantity || 1),
      unitPrice: Math.round(Number(it.unitPrice || 0)),
      tax: 0,
      pictureUrl: it.pictureUrl && String(it.pictureUrl).startsWith('http')
        ? String(it.pictureUrl)
        : `${redirectionBase}/icon.png`,
      category: String(it.category || 'footwear')
    }))

    const addressObj = {
      lineOne: contact.address,
      city: contact.city,
      country: 'CO'
    }

    const addiApplicationPayload = {
      orderId: data.orderId,
      totalAmount: totalAmountStr,
      shippingAmount: '0.0',
      totalTaxesAmount: '0.0',
      currency: 'COP',
      items: addiItems,
      client: {
        idType: 'CC',
        idNumber: contact.documentId,
        firstName,
        lastName,
        email: contact.email,
        cellphone: cellphoneClean,
        cellphoneCountryCode: '+57',
        address: addressObj
      },
      shippingAddress: addressObj,
      billingAddress: addressObj,
      allyUrlRedirection: {
        logoUrl: `${redirectionBase}/icon.png`,
        callbackUrl: `${supabaseUrl}/functions/v1/addi-webhook`,
        redirectionUrl: `${redirectionBase}/checkout?orderId=${encodeURIComponent(data.orderId)}&addi=true`
      }
    }

    const apiUrl = isProd
      ? 'https://api.addi.com/v1/online-applications'
      : 'https://api.addi-staging.com/v1/online-applications'

    try {
      // Importante (docs/addi.md Sección 3): Desactivar redirección automática
      // para capturar el status HTTP 301 y extraer la URL del header Location.
      const appRes = await fetch(apiUrl, {
        method: 'POST',
        redirect: 'manual',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(addiApplicationPayload)
      })

      const locationUrl = appRes.headers.get('location') || appRes.headers.get('Location')

      if ((appRes.status === 301 || appRes.status === 302 || appRes.status === 303 || appRes.status === 307 || appRes.status === 308 || appRes.status === 200 || appRes.status === 201) && locationUrl) {
        return json({
          orderId: data.orderId,
          total: data.total,
          createdAt: data.createdAt,
          paymentMethod: 'addi',
          addiRedirectUrl: locationUrl
        }, 201)
      }

      const errBody = await appRes.text().catch(() => '')
      console.error(`Addi /v1/online-applications respondió status ${appRes.status}:`, errBody)

      await supabase.rpc('restore_order_stock_if_cancelled', {
        p_order_id: data.orderId,
        p_payment_status: 'failed'
      })
      await fetch(`${supabaseUrl}/functions/v1/kapso-whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'notify_gateway_failure',
          orderId: data.orderId,
          provider: 'addi',
          status: `http_${appRes.status}`
        })
      }).catch(() => {})
      return json({ code: 'addi_application_failed', status: appRes.status, details: errBody }, 502)
    } catch (reqErr) {
      console.error('Error invocando /v1/online-applications de Addi:', reqErr)
      await supabase.rpc('restore_order_stock_if_cancelled', {
        p_order_id: data.orderId,
        p_payment_status: 'failed'
      })
      return json({ code: 'addi_application_failed' }, 502)
    }
  }

  // Si es contraentrega o transferencia, marcar cualquier borrador de checkout como convertido
  await fetch(`${supabaseUrl}/functions/v1/kapso-whatsapp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'mark_converted',
      orderId: data.orderId,
      phone: contact.phone
    })
  }).catch(() => {})

  return json(data, 201)
})
