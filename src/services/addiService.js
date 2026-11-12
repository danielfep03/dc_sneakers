/**
 * addiService.js
 * Servicio público para consultar la configuración de Addi (Config Endpoint):
 * - Verifica montos mínimos y máximos permitidos por el comercio (minAmount, maxAmount).
 * - Obtiene políticas de descuento visual (policy.discount, policy.isVisible).
 * Referencia: docs/addi.md (Sección 1: Verificación de Montos y Descuentos)
 */

const DEFAULT_ADDI_CONFIG = {
  minAmount: 50000,
  maxAmount: 10000000,
  isActiveAlly: true,
  isActivePayNow: true,
  discount: 0,
  isDiscountVisible: false,
  productType: 'ADDI_PAGO',
  policyMaxAmount: null
}

function getChannelsBaseUrl () {
  const env = (import.meta.env.VITE_ADDI_ENV || 'staging').toLowerCase().trim()
  return env === 'production'
    ? 'https://channels-public-api.addi.com'
    : 'https://channels-public-api.addi-staging.com'
}

/**
 * Consulta la configuración de Addi para el comercio y monto solicitado.
 * @param {number} requestedAmount - Monto total del carrito en COP
 * @returns {Promise<{
 *   minAmount: number,
 *   maxAmount: number,
 *   isActiveAlly: boolean,
 *   isActivePayNow: boolean,
 *   discount: number,
 *   isDiscountVisible: boolean,
 *   productType: string,
 *   policyMaxAmount: number | null
 * }>}
 */
export async function getAddiConfig (requestedAmount) {
  const allySlug = (import.meta.env.VITE_ADDI_ALLY_SLUG || '').trim()
  const amount = Math.max(0, Math.round(Number(requestedAmount) || 0))

  // Si aún no se ha configurado VITE_ADDI_ALLY_SLUG en el entorno local,
  // retornamos los topes estándar de Addi para permitir probar el flujo completo.
  if (!allySlug || amount <= 0) {
    return { ...DEFAULT_ADDI_CONFIG }
  }

  const baseUrl = getChannelsBaseUrl()
  const url = `${baseUrl}/allies/${encodeURIComponent(allySlug)}/config?requestedamount=${amount}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      return { ...DEFAULT_ADDI_CONFIG }
    }

    const data = await response.json()
    const discount = Number(data?.policy?.discount ?? 0)
    const isDiscountVisible = Boolean(data?.policy?.isVisible && discount > 0)

    return {
      minAmount: Number(data?.minAmount ?? DEFAULT_ADDI_CONFIG.minAmount),
      maxAmount: Number(data?.maxAmount ?? DEFAULT_ADDI_CONFIG.maxAmount),
      isActiveAlly: data?.isActiveAlly !== false,
      isActivePayNow: Boolean(data?.isActivePayNow ?? true),
      discount,
      isDiscountVisible,
      productType: data?.policy?.productType || 'ADDI_PAGO',
      policyMaxAmount: data?.policy?.policyMaxAmount ? Number(data.policy.policyMaxAmount) : null
    }
  } catch (err) {
    console.warn('Aviso: no se pudo consultar el endpoint de configuración de Addi:', err)
    return { ...DEFAULT_ADDI_CONFIG }
  }
}

/**
 * Determina si el monto actual cumple con los topes de Addi.
 * @param {number} amount
 * @param {Object} config
 */
export function isAmountValidForAddi (amount, config = DEFAULT_ADDI_CONFIG) {
  if (!config || !config.isActiveAlly) return false
  const num = Number(amount) || 0
  return num >= config.minAmount && num <= config.maxAmount
}
