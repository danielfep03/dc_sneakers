/**
 * checkoutRecoveryService.js
 * Servicio para registrar borradores de checkout y recuperar carritos abandonados
 * o pagos rechazados mediante mensajería de asesoría en WhatsApp vía Kapso.
 */

import { supabase } from '@/lib/supabaseClient'

const SESSION_KEY = 'dc_checkout_session_id'

/**
 * Obtiene o genera un identificador único de sesión de checkout en sessionStorage.
 * @returns {string}
 */
export function getCheckoutSessionId () {
  try {
    let sessionId = window.sessionStorage.getItem(SESSION_KEY)
    if (!sessionId) {
      sessionId = `chk_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
      window.sessionStorage.setItem(SESSION_KEY, sessionId)
    }
    return sessionId
  } catch {
    return `chk_${Date.now()}_fallback`
  }
}

/**
 * Limpia el identificador de sesión de checkout cuando la compra se completa.
 */
export function clearCheckoutSessionId () {
  try {
    window.sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // Ignorar errores de storage restringido
  }
}

/**
 * Guarda o actualiza silenciosamente el borrador del checkout cuando el cliente
 * ingresa su nombre y teléfono válido.
 * @param {Object} params
 * @param {Object} params.contact
 * @param {Array}  params.cart
 * @param {string} params.paymentMethod
 * @param {number} params.total
 */
export async function saveCheckoutDraft ({ contact, cart, paymentMethod, total }) {
  try {
    const sessionId = getCheckoutSessionId()
    const items = (cart || []).map((item) => ({
      name: item.product?.name || 'Sneaker DC',
      size: item.size,
      quantity: item.quantity || 1,
      price: item.product?.price || 0,
      variantId: item.color?.variantId || null
    }))

    const { data, error } = await supabase.functions.invoke('kapso-whatsapp', {
      body: {
        action: 'save_draft',
        sessionId,
        contact: {
          name: contact.name,
          phone: contact.phone,
          city: contact.city,
          address: contact.address,
          email: contact.email
        },
        items,
        paymentMethod,
        total
      }
    })

    if (error) return null
    return data
  } catch {
    return null
  }
}

/**
 * Marca el borrador de checkout como convertido para evitar enviar el mensaje de abandono.
 * @param {Object} params
 * @param {string} [params.orderId]
 * @param {string} [params.phone]
 */
export async function markCheckoutConverted ({ orderId = null, phone = null } = {}) {
  try {
    const sessionId = getCheckoutSessionId()
    await supabase.functions.invoke('kapso-whatsapp', {
      body: {
        action: 'mark_converted',
        sessionId,
        orderId,
        phone
      }
    })
    clearCheckoutSessionId()
  } catch {
    // Silencioso para no afectar la experiencia de compra
  }
}
