/**
 * formatPrice.js
 * Formatea valores numéricos a Pesos Colombianos (COP) según la regla técnica:
 * Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
 */

const copFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
})

/**
 * Convierte un número a formato de moneda COP.
 * @param {number} amount - Monto numérico en COP (ej: 459900).
 * @returns {string} Texto formateado (ej: "$ 459.900").
 */
export function formatPrice (amount) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '$ 0'
  }
  return copFormatter.format(amount)
}
