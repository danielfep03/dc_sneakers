/**
 * buildWhatsappMessage.js
 * Template del mensaje estructurado de WhatsApp (click-to-chat wa.me).
 * Preparado para reutilizarse cuando se integre el envío automático con Kapso.
 */

import { storeConfig } from '../config/storeConfig'
import { formatPrice } from './formatPrice'

const PAYMENT_LABELS = {
  transfer: 'Transferencia bancaria',
  'cash-on-delivery': 'Pago contraentrega (efectivo al recibir)',
  'bold-demo': 'Tarjeta / pasarela digital'
}

/**
 * Normaliza un ítem del carrito ({ product, size, color, quantity })
 * o un ítem plano ({ name, variantName, size, quantity, unitPrice }).
 */
function normalizeItem (item) {
  if (item.product) {
    return {
      name: item.product.name,
      variantName: item.color?.name ?? null,
      size: item.size,
      quantity: item.quantity,
      unitPrice: item.product.price
    }
  }
  return item
}

/**
 * Construye el texto del mensaje (útil para pruebas y para Kapso).
 * @param {Object} params
 * @param {string} params.orderId - ej: "ORD-1001"
 * @param {Object} params.contact - { name, phone, address, city, notes }
 * @param {Array} params.items - ítems del carrito
 * @param {number} params.total - total a pagar en COP (el calculado por el servidor)
 * @param {string} params.paymentMethod - "transfer" | "cash-on-delivery" | "bold-demo"
 */
export function buildWhatsappText ({ orderId, contact, items, total, paymentMethod }) {
  const productLines = items
    .map(normalizeItem)
    .map((item) => {
      const variant = item.variantName ? ` (${item.variantName})` : ''
      return `▪️ *${item.name}*${variant}\n   Talla EU ${item.size} · x${item.quantity} · ${formatPrice(item.unitPrice * item.quantity)}`
    })
    .join('\n\n')

  const location = `${contact.address}${contact.city ? `, ${contact.city}` : ''}`

  return `👋 *¡Hola ${storeConfig.displayName}!* Quiero confirmar mi pedido *#${orderId}*

📋 *DATOS DE ENTREGA*
👤 *Nombre:* ${contact.name}
📱 *Teléfono:* ${contact.phone}
📍 *Dirección:* ${location}${contact.notes ? `\n📝 *Notas:* ${contact.notes}` : ''}

👟 *DETALLE DEL PEDIDO*
${productLines}

🎁 *Cortesía:* ${storeConfig.giftText}
🚚 *Envío:* ${storeConfig.freeShipping ? '¡Gratis a toda Colombia!' : '$ 15.000'}
💳 *Método de pago:* ${PAYMENT_LABELS[paymentMethod] ?? paymentMethod}
💰 *TOTAL A PAGAR:* ${formatPrice(total)}

_Quedo atento/a para coordinar el despacho. ¡Gracias!_`
}

/** URL de wa.me con el mensaje ya codificado. */
export function buildWhatsappMessage (params) {
  return `https://wa.me/${storeConfig.whatsappNumber}?text=${encodeURIComponent(buildWhatsappText(params))}`
}
