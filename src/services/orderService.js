/**
 * orderService.js
 * Creación de órdenes vía Edge Function `create-order` (service role).
 * El cliente NO escribe en las tablas de órdenes: la función valida los datos,
 * recalcula precios desde la BD, descuenta stock de forma atómica y genera el ID.
 */

import { supabase } from '@/lib/supabaseClient'

export class OrderError extends Error {
  constructor (code, message, details = {}) {
    super(message)
    this.name = 'OrderError'
    this.code = code
    this.details = details
  }
}

const ERROR_MESSAGES = {
  out_of_stock: 'Una de las tallas que elegiste se agotó mientras comprabas. Revisa tu bolsa e intenta de nuevo.',
  invalid_contact: 'Revisa tus datos de contacto e intenta de nuevo.',
  invalid_items: 'Hay un problema con los productos de tu bolsa. Vuelve a agregarlos e intenta de nuevo.',
  variant_not_found: 'Uno de los productos de tu bolsa ya no está disponible. Vuelve a agregarlo desde el catálogo.',
  invalid_payment_method: 'Selecciona un método de pago válido.'
}

const GENERIC_MESSAGE = 'Hubo un inconveniente al generar tu orden. Por favor intenta nuevamente.'

/**
 * @param {Object} params
 * @param {Object} params.contact - { name, phone, city, address, notes }
 * @param {Array}  params.cart - items del carrito: [{ product, size, color: { variantId }, quantity }]
 * @param {string} params.paymentMethod - "transfer" | "cash-on-delivery" | "bold-demo"
 * @returns {Promise<{ orderId: string, total: number, createdAt: string }>}
 * @throws {OrderError}
 */
export async function createOrder ({ contact, cart, paymentMethod, originUrl }) {
  const items = cart.map((item) => ({
    variantId: item.color?.variantId,
    size: item.size,
    quantity: item.quantity
  }))

  if (items.some((i) => !i.variantId)) {
    // Carrito creado antes de la integración con la BD (sin variante).
    throw new OrderError('invalid_items', ERROR_MESSAGES.invalid_items)
  }

  const { data, error } = await supabase.functions.invoke('create-order', {
    body: { contact, items, paymentMethod, originUrl }
  })

  if (error) {
    let body = null
    try {
      body = await error.context?.json()
    } catch {
      // Error de red o respuesta no JSON.
    }
    const code = body?.code ?? 'internal_error'
    throw new OrderError(code, ERROR_MESSAGES[code] ?? GENERIC_MESSAGE, body ?? {})
  }

  return data
}

/**
 * Confirma el pago de una orden que retornó de Bold Checkout
 * @param {Object} params
 * @param {string} params.orderId
 * @param {string} params.boldStatus
 * @param {string} [params.txId]
 */
export async function confirmBoldPayment ({ orderId, boldStatus = 'approved', txId = null }) {
  try {
    const { data, error } = await supabase.functions.invoke('confirm-bold-payment', {
      body: { orderId, boldStatus, txId }
    })
    if (error) throw error
    return data
  } catch (err) {
    console.warn('Aviso: no se pudo confirmar la orden con confirm-bold-payment:', err)
    return null
  }
}
