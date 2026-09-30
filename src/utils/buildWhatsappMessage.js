/**
 * buildWhatsappMessage.js
 * Construye el mensaje estructurado de WhatsApp y genera la URL de wa.me
 * siguiendo fielmente la plantilla de la sección 8.6 del plan.
 */

import { formatPrice } from './formatPrice'
import { storeConfig } from '../config/storeConfig'

/**
 * Genera el texto y la URL directa para abrir WhatsApp con los datos de la orden.
 * @param {Object} params
 * @param {string} params.orderId - Identificador único de orden (ej: "ORD-9481")
 * @param {Object} params.contact - Datos de contacto { name, phone, address, city }
 * @param {Array} params.items - Lista de productos comprados
 * @param {number} params.total - Total a pagar en COP
 * @param {string} params.paymentMethod - "transfer" | "bold-demo" | "cash-on-delivery"
 * @returns {string} URL completa hacia api.whatsapp.com / wa.me
 */
export function buildWhatsappMessage ({
  orderId,
  contact,
  items,
  total,
  paymentMethod
}) {
  const paymentMethodLabel =
    paymentMethod === 'transfer'
      ? 'Transferencia bancaria'
      : paymentMethod === 'bold-demo'
        ? 'Tarjeta / Bold (Demo)'
        : 'Pago Contraentrega'

  const productLines = items
    .map(
      (item) =>
        `- ${item.name} · Talla ${item.size} · x${item.quantity} · ${formatPrice(item.unitPrice * item.quantity)}`
    )
    .join('\n')

  const message = `Hola ${storeConfig.name}, quiero confirmar mi pedido #${orderId}

👤 Nombre: ${contact.name}
📞 Teléfono: ${contact.phone}
📍 Dirección: ${contact.address}${contact.city ? `, ${contact.city}` : ''}

🛒 Productos:
${productLines}

🧦 Incluye par de medias de regalo
🚚 Envío: ${storeConfig.freeShipping ? 'Gratis' : '$ 15.000'}
💰 Total: ${formatPrice(total)}
💳 Método de pago: ${paymentMethodLabel}`

  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${storeConfig.whatsappNumber}?text=${encodedMessage}`
}
