// Edge Function: kapso-whatsapp
// Gestiona el flujo de recuperación de carritos/checkouts abandonados y fallos en pasarela (Addi / Bold)
// enviando un mensaje de asesoría por WhatsApp mediante la API de Kapso (https://api.kapso.ai/meta/whatsapp).
//
// Acciones soportadas:
// 1. "save_draft": Guarda/actualiza el borrador cuando el cliente llena sus datos en Checkout.
// 2. "mark_converted": Marca el borrador como completado cuando el cliente finaliza su compra.
// 3. "notify_gateway_failure": Envía asesoría inmediata por WhatsApp cuando Addi o Bold rechazan/abandonan el pago.
// 4. "process_abandoned": Ejecutado por pg_cron cada minuto; detecta borradores con >= 5 minutos de inactividad y envía el WhatsApp.

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

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

/** Normaliza un teléfono colombiano a formato internacional sin '+' (ej: 573101234567) */
function normalizeColombianPhone (rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '')
  if (digits.length === 10 && digits.startsWith('3')) {
    return `57${digits}`
  }
  if (digits.length === 12 && digits.startsWith('573')) {
    return digits
  }
  return digits
}

function formatCop (amount: number): string {
  const n = Math.round(Number(amount) || 0)
  return `$ ${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
}

/** Construye el resumen legible de los tenis del carrito */
function buildItemsSummary (items: any[]): string {
  if (!Array.isArray(items) || items.length === 0) return 'tus sneakers'
  return items
    .map((it) => {
      const name = it?.name || it?.product_name || 'Sneaker'
      const size = it?.size ? ` (Talla EU ${it.size})` : ''
      const qty = Number(it?.quantity || 1) > 1 ? ` x${it.quantity}` : ''
      return `*${name}*${size}${qty}`
    })
    .join(', ')
}

/** Construye el texto de asesoría por WhatsApp según el motivo */
function buildAdvisoryText (params: {
  customerName: string
  items: any[]
  total: number
  reason: 'abandoned' | 'addi_failed' | 'bold_failed'
  orderId?: string | null
}): string {
  const firstName = params.customerName.split(/\s+/)[0] || params.customerName
  const itemsSummary = buildItemsSummary(params.items)
  const totalFormatted = params.total > 0 ? ` por *${formatCop(params.total)}*` : ''

  if (params.reason === 'addi_failed') {
    return (
      `¡Hola *${firstName}*! 👋 Te escribimos del equipo de *DC SNEAKERS* 👟.\n\n` +
      `Notamos que intentaste realizar tu compra de ${itemsSummary}${totalFormatted} con *Addi*, pero la solicitud no alcanzó a completarse.\n\n` +
      `¿Tuviste algún inconveniente con la plataforma o te gustaría que te ayudemos a despacharlo con *Pago Contraentrega (pagas en casa al recibir)* o *Transferencia*? 🚚🇨🇴\n\n` +
      `Respóndenos este mensaje y un asesor te ayudará al instante para separar tu talla.`
    )
  }

  if (params.reason === 'bold_failed') {
    return (
      `¡Hola *${firstName}*! 👋 Te escribimos del equipo de *DC SNEAKERS* 👟.\n\n` +
      `Vimos que intentaste procesar el pago en línea con *Bold* para tus ${itemsSummary}${totalFormatted}, pero la transacción fue rechazada o no se completó.\n\n` +
      `Si deseas, podemos ayudarte por aquí mismo a enviártelos con *Pago Contraentrega* (pagas al recibir en tu puerta) o por *Nequi / Bancolombia* sin complicaciones. 🚚🔥\n\n` +
      `¿Confirmamos tu pedido por este medio?`
    )
  }

  return (
    `¡Hola *${firstName}*! 👋 Soy del equipo de *DC SNEAKERS* 👟.\n\n` +
    `Vimos que estabas en el checkout separando tus ${itemsSummary}${totalFormatted}, pero no alcanzaste a finalizar el pedido.\n\n` +
    `¿Tienes alguna duda sobre la *talla*, el *envío gratis* o el *método de pago*? Recuerda que incluimos *medias de regalo* 🧦 y puedes pedir con *Pago Contraentrega* o a cuotas con *Addi*.\n\n` +
    `Escríbenos por aquí y te asesoramos de inmediato para que no te quedes sin tu par.`
  )
}

/** Envía el mensaje de WhatsApp a través de Kapso API (por defecto tipo 'text') */
async function sendKapsoMessage (params: {
  toPhone: string
  customerName: string
  items: any[]
  total: number
  reason: 'abandoned' | 'addi_failed' | 'bold_failed'
  orderId?: string | null
}): Promise<{ ok: boolean; status: number; data: any }> {
  const apiKey = Deno.env.get('KAPSO_API_KEY')?.trim() || ''
  const phoneNumberId = Deno.env.get('KAPSO_PHONE_NUMBER_ID')?.trim() || '1126724263862621'
  const apiVersion = Deno.env.get('KAPSO_API_VERSION')?.trim() || 'v24.0'
  const baseUrl = (Deno.env.get('KAPSO_BASE_URL')?.trim() || 'https://api.kapso.ai/meta/whatsapp').replace(/\/$/, '')
  const templateName = Deno.env.get('KAPSO_TEMPLATE_NAME')?.trim() || ''
  const templateLang = Deno.env.get('KAPSO_TEMPLATE_LANGUAGE')?.trim() || 'es'

  const textBody = buildAdvisoryText(params)

  if (!apiKey) {
    console.warn('Secreto KAPSO_API_KEY aún no configurado en Supabase Edge Functions.')
    return {
      ok: false,
      status: 503,
      data: {
        code: 'kapso_missing_credentials',
        phoneNumberId,
        previewMessage: textBody,
        to: params.toPhone
      }
    }
  }

  const endpoint = `${baseUrl}/${apiVersion}/${encodeURIComponent(phoneNumberId)}/messages`

  // Por defecto enviamos mensaje de texto directo ('text') según la especificación de Kapso Meta Proxy.
  // Si en el futuro se configura KAPSO_TEMPLATE_NAME, soporta plantilla con parámetros NAMED.
  const messagePayload = templateName
    ? {
        messaging_product: 'whatsapp',
        to: params.toPhone,
        type: 'template',
        template: {
          name: templateName,
          language: { code: templateLang },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', parameter_name: 'customer_name', text: params.customerName.split(/\s+/)[0] || params.customerName },
                { type: 'text', parameter_name: 'items', text: buildItemsSummary(params.items) },
                { type: 'text', parameter_name: 'total', text: formatCop(params.total) }
              ]
            }
          ]
        }
      }
    : {
        messaging_product: 'whatsapp',
        to: params.toPhone,
        type: 'text',
        text: {
          preview_url: false,
          body: textBody
        }
      }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(messagePayload)
    })

    const resData = await res.json().catch(() => ({}))
    if (!res.ok) {
      console.error(`Kapso API respondió ${res.status}:`, resData)
    }
    return { ok: res.ok, status: res.status, data: resData }
  } catch (err) {
    console.error('Error de red llamando a Kapso API:', err)
    return { ok: false, status: 502, data: { error: String(err) } }
  }
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

  const action = str(payload?.action || 'save_draft')
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } }
  )

  // ============================================================================
  // 1. GUARDAR / ACTUALIZAR BORRADOR DEL CHECKOUT ("save_draft")
  // ============================================================================
  if (action === 'save_draft') {
    const sessionId = str(payload?.sessionId)
    const name = str(payload?.contact?.name)
    const phone = normalizeColombianPhone(str(payload?.contact?.phone))
    const email = str(payload?.contact?.email) || null
    const city = str(payload?.contact?.city) || null
    const address = str(payload?.contact?.address) || null
    const paymentMethod = str(payload?.paymentMethod) || 'cash-on-delivery'
    const total = Math.max(0, Number(payload?.total) || 0)
    const rawItems = Array.isArray(payload?.items) ? payload.items : []

    if (!sessionId || name.length < 3 || phone.length < 10 || rawItems.length === 0) {
      return json({ code: 'ignored_incomplete_draft' }, 200)
    }

    const normalizedItems = rawItems.slice(0, 15).map((it: any) => ({
      name: str(it?.name || it?.product?.name || 'Sneaker'),
      variantName: str(it?.variantName || it?.color?.name || ''),
      size: it?.size ?? null,
      quantity: Number(it?.quantity || 1),
      unitPrice: Number(it?.unitPrice || it?.product?.price || 0),
      image: str(it?.image || it?.product?.image || '')
    }))

    // Si la sesión ya fue convertida en compra, no la regresamos a 'draft'
    const { data: existing } = await supabase
      .from('abandoned_checkouts')
      .select('id, status')
      .eq('session_id', sessionId)
      .maybeSingle()

    if (existing?.status === 'converted') {
      return json({ code: 'already_converted' }, 200)
    }

    const nowIso = new Date().toISOString()
    const { error } = await supabase
      .from('abandoned_checkouts')
      .upsert(
        {
          session_id: sessionId,
          customer_name: name,
          customer_phone: phone,
          customer_email: email,
          shipping_city: city,
          shipping_address: address,
          payment_method: paymentMethod,
          cart_items: normalizedItems,
          cart_total: total,
          status: existing?.status === 'notified' ? 'notified' : 'draft',
          updated_at: nowIso
        },
        { onConflict: 'session_id' }
      )

    if (error) {
      console.error('Error guardando borrador de checkout:', error)
      return json({ code: 'db_error' }, 500)
    }

    return json({ code: 'draft_saved', sessionId }, 200)
  }

  // ============================================================================
  // 2. MARCAR CHECKOUT COMO CONVERTIDO ("mark_converted")
  // ============================================================================
  if (action === 'mark_converted') {
    const sessionId = str(payload?.sessionId)
    const phone = normalizeColombianPhone(str(payload?.phone))
    const orderId = str(payload?.orderId) || null
    const nowIso = new Date().toISOString()

    if (sessionId) {
      await supabase
        .from('abandoned_checkouts')
        .update({ status: 'converted', order_id: orderId, updated_at: nowIso })
        .eq('session_id', sessionId)
    }

    if (phone && phone.length >= 10) {
      await supabase
        .from('abandoned_checkouts')
        .update({ status: 'converted', order_id: orderId, updated_at: nowIso })
        .eq('customer_phone', phone)
        .eq('status', 'draft')
    }

    return json({ code: 'marked_converted' }, 200)
  }

  // ============================================================================
  // 3. NOTIFICAR FALLO / RECHAZO DE PASARELA ADDI O BOLD ("notify_gateway_failure")
  // ============================================================================
  if (action === 'notify_gateway_failure') {
    const orderId = str(payload?.orderId)
    const provider = str(payload?.provider).toLowerCase() // 'addi' | 'bold'
    const gatewayStatus = str(payload?.status).toLowerCase()

    if (!orderId) return json({ code: 'missing_order_id' }, 400)

    const { data: order } = await supabase
      .from('orders')
      .select('id, customer_name, customer_phone, customer_email, shipping_city, shipping_address, total, payment_method')
      .eq('id', orderId)
      .maybeSingle()

    if (!order) return json({ code: 'order_not_found' }, 404)

    const phone = normalizeColombianPhone(order.customer_phone)

    // Verificar cooldown de 24h para evitar enviar mensajes duplicados al mismo teléfono
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: recentNotif } = await supabase
      .from('abandoned_checkouts')
      .select('id')
      .eq('customer_phone', phone)
      .eq('status', 'notified')
      .gte('notified_at', twentyFourHoursAgo)
      .limit(1)

    if (recentNotif && recentNotif.length > 0) {
      return json({ code: 'already_notified_recently', orderId }, 200)
    }

    const { data: orderItems } = await supabase
      .from('order_items')
      .select('product_name, variant_name, size, quantity, unit_price')
      .eq('order_id', orderId)

    const items = (orderItems || []).map((it: any) => ({
      name: it.product_name,
      variantName: it.variant_name,
      size: it.size,
      quantity: it.quantity,
      unitPrice: it.unit_price
    }))

    const reason = provider === 'bold' ? 'bold_failed' : 'addi_failed'
    const kapsoRes = await sendKapsoMessage({
      toPhone: phone,
      customerName: order.customer_name,
      items,
      total: Number(order.total || 0),
      reason,
      orderId
    })

    const nowIso = new Date().toISOString()
    const nextStatus = kapsoRes.ok ? 'notified' : 'dismissed'

    // Actualizar cualquier borrador existente de este teléfono o insertar registro de auditoría
    const { data: existingDraft } = await supabase
      .from('abandoned_checkouts')
      .select('id, session_id')
      .eq('customer_phone', phone)
      .eq('status', 'draft')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existingDraft) {
      await supabase
        .from('abandoned_checkouts')
        .update({
          order_id: orderId,
          status: nextStatus,
          failure_reason: `${provider}_${gatewayStatus || 'failed'}`,
          kapso_response: kapsoRes.data,
          notified_at: kapsoRes.ok ? nowIso : null,
          updated_at: nowIso
        })
        .eq('id', existingDraft.id)
    } else {
      await supabase
        .from('abandoned_checkouts')
        .upsert(
          {
            session_id: `gateway-${orderId}`,
            customer_name: order.customer_name,
            customer_phone: phone,
            customer_email: order.customer_email,
            shipping_city: order.shipping_city,
            shipping_address: order.shipping_address,
            payment_method: provider,
            cart_items: items,
            cart_total: Number(order.total || 0),
            order_id: orderId,
            status: nextStatus,
            failure_reason: `${provider}_${gatewayStatus || 'failed'}`,
            kapso_response: kapsoRes.data,
            notified_at: kapsoRes.ok ? nowIso : null,
            updated_at: nowIso
          },
          { onConflict: 'session_id' }
        )
    }

    return json({
      code: 'gateway_failure_processed',
      orderId,
      kapsoSent: kapsoRes.ok,
      kapsoStatus: kapsoRes.status
    }, 200)
  }

  // ============================================================================
  // 4. PROCESAR CHECKOUTS ABANDONADOS >= 5 MINUTOS ("process_abandoned")
  // ============================================================================
  if (action === 'process_abandoned') {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()

    const { data: candidates, error: fetchErr } = await supabase
      .from('abandoned_checkouts')
      .select('*')
      .eq('status', 'draft')
      .lte('updated_at', fiveMinutesAgo)
      .order('updated_at', { ascending: true })
      .limit(20)

    if (fetchErr) {
      console.error('Error consultando abandoned_checkouts:', fetchErr)
      return json({ code: 'db_query_error' }, 500)
    }

    if (!candidates || candidates.length === 0) {
      return json({ code: 'no_abandoned_checkouts', processed: 0 }, 200)
    }

    let sentCount = 0
    let convertedCount = 0
    let skippedCount = 0

    for (const draft of candidates) {
      const phone = normalizeColombianPhone(draft.customer_phone)
      const last10Digits = phone.slice(-10)
      const nowIso = new Date().toISOString()

      // A. Verificar si el usuario ya creó una orden exitosa en las últimas 2 horas
      const { data: recentOrders } = await supabase
        .from('orders')
        .select('id, current_status, payment_status, payment_method')
        .ilike('customer_phone', `%${last10Digits}%`)
        .gte('created_at', twoHoursAgo)
        .order('created_at', { ascending: false })
        .limit(5)

      const hasCompletedOrder = (recentOrders || []).some((o: any) =>
        o.payment_status === 'paid' ||
        ['confirmed', 'processing', 'shipped', 'delivered'].includes(o.current_status) ||
        (['cash-on-delivery', 'transfer'].includes(o.payment_method) && o.current_status !== 'cancelled')
      )

      if (hasCompletedOrder) {
        await supabase
          .from('abandoned_checkouts')
          .update({ status: 'converted', updated_at: nowIso })
          .eq('id', draft.id)
        convertedCount++
        continue
      }

      // B. Verificar si ya se le envió un WhatsApp a este teléfono en las últimas 24h
      const { data: recentNotif } = await supabase
        .from('abandoned_checkouts')
        .select('id')
        .eq('customer_phone', phone)
        .eq('status', 'notified')
        .gte('notified_at', twentyFourHoursAgo)
        .limit(1)

      if (recentNotif && recentNotif.length > 0) {
        await supabase
          .from('abandoned_checkouts')
          .update({ status: 'dismissed', failure_reason: 'cooldown_24h', updated_at: nowIso })
          .eq('id', draft.id)
        skippedCount++
        continue
      }

      // C. Enviar mensaje de asesoría por WhatsApp usando Kapso
      const kapsoRes = await sendKapsoMessage({
        toPhone: phone,
        customerName: draft.customer_name,
        items: Array.isArray(draft.cart_items) ? draft.cart_items : [],
        total: Number(draft.cart_total || 0),
        reason: 'abandoned',
        orderId: draft.order_id
      })

      await supabase
        .from('abandoned_checkouts')
        .update({
          status: kapsoRes.ok ? 'notified' : 'dismissed',
          failure_reason: 'checkout_abandoned_5m',
          kapso_response: kapsoRes.data,
          notified_at: kapsoRes.ok ? nowIso : null,
          updated_at: nowIso
        })
        .eq('id', draft.id)

      if (kapsoRes.ok) sentCount++
    }

    return json({
      code: 'abandoned_checkouts_processed',
      sentCount,
      convertedCount,
      skippedCount
    }, 200)
  }

  return json({ code: 'unknown_action' }, 400)
})
