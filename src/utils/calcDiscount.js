/**
 * calcDiscount.js
 * Calcula el porcentaje de descuento entre el precio original y el precio de oferta.
 */

/**
 * Calcula el porcentaje entero de descuento.
 * @param {number} originalPrice - Precio normal.
 * @param {number|null} salePrice - Precio con descuento.
 * @returns {number} Porcentaje de descuento redondeado (ej: 25 para un 25%).
 */
export function calcDiscount (originalPrice, salePrice) {
  if (!originalPrice || !salePrice || salePrice >= originalPrice) {
    return 0
  }
  const discount = ((originalPrice - salePrice) / originalPrice) * 100
  return Math.round(discount)
}
