// Edge Function: create-order
// Endpoint público del checkout. Valida la entrada y delega la creación atómica
// (precios desde la BD, descuento de stock, ID único) en public.create_order_tx.
// Para pagos con Bold, genera la firma de integridad SHA256 y la URL de redirección.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { crypto } from 'https://deno.land/std@0.224.0/crypto/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

const PAYMENT_METHODS = ['transfer', 'cash-on-delivery', 'bold-demo', 'bold']
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function json (body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

// Calcula firma SHA256 para Bold Integrity Signature: SHA256(orderId + totalAmountInCents + currency + secretKey)
async function generateBoldSignature (orderId: string, totalAmount: number, currency: string, secretKey: string): Promise<string> {
  const amountInCents = Math.round(totalAmount * 100)
  const concatenated = `${orderId}${amountInCents}${currency}${secretKey}`
  const encoder = new TextEncoder()
  const data = encoder.encode(concatenated)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
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

  // --- Validación de contacto ---
  const contact = {
    name: str(payload?.contact?.name),
    phone: str(payload?.contact?.phone).replace(/\D/g, ''),
    city: str(payload?.contact?.city),
    address: str(payload?.contact?.address),
    notes: str(payload?.contact?.notes),
    email: str(payload?.contact?.email)
  }

  const fields: Record<string, string> = {}
  if (contact.name.length < 3 || contact.name.length > 100) fields.name = 'invalid'
  if (contact.phone.length < 10 || contact.phone.length > 13) fields.phone = 'invalid'
  if (contact.city.length < 2 || contact.city.length > 80) fields.city = 'invalid'
  if (contact.address.length < 5 || contact.address.length > 200) fields.address = 'invalid'
  if (contact.notes.length > 500) fields.notes = 'too_long'
  if (contact.email && !EMAIL_RE.test(contact.email)) fields.email = 'invalid'
  if (Object.keys(fields).length > 0) return json({ code: 'invalid_contact', fields }, 400)

  // --- Validación de pago e ítems ---
  const paymentMethod = str(payload?.paymentMethod)
  if (!PAYMENT_METHODS.includes(paymentMethod)) return json({ code: 'invalid_payment_method' }, 400)

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

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } }
  )

  // Mapeo interno del método de pago para Postgres
  const dbPaymentMethod = (paymentMethod === 'bold' || paymentMethod === 'bold-demo') ? 'bold-demo' : paymentMethod

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

  // --- Si el método de pago es Bold real, se construye la firma y URL de Redirección ---
  if (paymentMethod === 'bold') {
    const boldSecretKey = Deno.env.get('BOLD_SECRET_KEY') || 'SANDBOX_SECRET_KEY'
    const boldApiKey = Deno.env.get('BOLD_IDENTITY_KEY') || 'SANDBOX_IDENTITY_KEY'
    const boldBaseUrl = Deno.env.get('BOLD_CHECKOUT_URL') || 'https://checkout.bold.co'

    const signature = await generateBoldSignature(data.orderId, data.total, 'COP', boldSecretKey)
    
    // Bold exige que la URL de redirección sea HTTPS válida y no localhost
    let redirectionBase = payload?.originUrl || ''
    if (!redirectionBase || redirectionBase.includes('localhost') || redirectionBase.includes('127.0.0.1')) {
      const configuredReturn = Deno.env.get('BOLD_RETURN_URL')
      redirectionBase = configuredReturn || 'https://dc-sneakers.vercel.app'
    }

    // URL de Redirección con parámetros formateados según la API de Bold
    const redirectParams = new URLSearchParams({
      'api-key': boldApiKey,
      'order-id': data.orderId,
      amount: String(data.total),
      currency: 'COP',
      integrity_signature: signature,
      description: `Pedido ${data.orderId} en DC SNEAKERS`,
      'tax-amount': '0',
      'redirection-url': `${redirectionBase}/checkout?orderId=${data.orderId}&bold=true`
    })

    const boldCheckoutUrl = `${boldBaseUrl}/payment?${redirectParams.toString()}`

    return json({
      ...data,
      paymentMethod: 'bold',
      boldCheckoutUrl,
      signature
    }, 201)
  }

  return json(data, 201)
})
