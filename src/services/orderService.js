/**
 * orderService.js
 * Capa de abstracción para persistencia de órdenes.
 * Mock actual: guarda la orden en localStorage y devuelve un ID con prefijo 'ORD-'.
 * Futuro: insertará en tablas 'orders' y 'order_items' de Supabase.
 */

const ORDERS_STORAGE_KEY = 'dc_sneakers_orders'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Crea y registra una nueva orden.
 * @param {Object} orderData
 * @param {Object} orderData.contact - { name, phone, address, city, notes }
 * @param {Array} orderData.items - [{ productId, slug, name, size, unitPrice, quantity }]
 * @param {number} orderData.total - Monto total en COP
 * @param {string} orderData.paymentMethod - "transfer" | "bold-demo" | "cash-on-delivery"
 * @returns {Promise<{ orderId: string, createdAt: string }>}
 */
export async function createOrder (orderData) {
  await delay(400)

  // Generar ID único amigable tipo ORD-9481
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  const orderId = `ORD-${randomSuffix}`
  const createdAt = new Date().toISOString()

  const newOrder = {
    orderId,
    createdAt,
    ...orderData,
    status: 'pending'
  }

  try {
    const existingRaw = localStorage.getItem(ORDERS_STORAGE_KEY)
    const existing = existingRaw ? JSON.parse(existingRaw) : []
    existing.push(newOrder)
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(existing))
  } catch (err) {
    console.warn('No se pudo guardar la orden en localStorage:', err)
  }

  return { orderId, createdAt }
}
