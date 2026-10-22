/**
 * discountCodes.js
 * Códigos de descuento oficiales disponibles en DC SNEAKERS.
 */

export const DISCOUNT_CODES = [
  {
    code: 'DC10',
    type: 'percentage',
    value: 10,
    label: '10% DE DESCUENTO',
    description: 'Válido en todo el catálogo de sneakers sin mínimo de compra.',
    badge: 'MÁS USADO',
    minSubtotal: 0
  },
  {
    code: 'BIENVENIDO',
    type: 'fixed',
    value: 30000,
    label: '$30.000 COP OFF',
    description: 'Bono de bienvenida directo en tu primera orden.',
    badge: 'NUEVO DROP',
    minSubtotal: 0
  },
  {
    code: 'STREET15',
    type: 'percentage',
    value: 15,
    label: '15% DE DESCUENTO',
    description: 'Aplica en pedidos superiores a $350.000 COP.',
    badge: 'VIP ARCHIVE',
    minSubtotal: 350000
  }
]

/**
 * Valida un código contra el subtotal actual.
 * @param {string} inputCode
 * @param {number} subtotal
 */
export function validateDiscountCode (inputCode, subtotal = 0) {
  if (!inputCode || !inputCode.trim()) {
    return { valid: false, error: 'Por favor ingresa un código de descuento.' }
  }

  const normalized = inputCode.trim().toUpperCase()
  const coupon = DISCOUNT_CODES.find((c) => c.code === normalized)

  if (!coupon) {
    return { valid: false, error: 'El código ingresado no es válido o ha expirado.' }
  }

  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
    const formattedMin = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(coupon.minSubtotal)
    return {
      valid: false,
      error: `Este código requiere una compra mínima de ${formattedMin}.`
    }
  }

  let discountAmount = 0
  if (coupon.type === 'percentage') {
    discountAmount = Math.round((subtotal * coupon.value) / 100)
  } else if (coupon.type === 'fixed') {
    discountAmount = Math.min(coupon.value, subtotal)
  }

  return {
    valid: true,
    coupon,
    discountAmount,
    finalTotal: Math.max(0, subtotal - discountAmount)
  }
}
