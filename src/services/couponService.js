import { supabase } from '@/lib/supabaseClient'
import { formatPrice } from '@/utils/formatPrice'

/**
 * Normaliza un registro de cupón de Supabase para su uso consistente en la app.
 * @param {Object} c
 */
export function normalizeCoupon (c) {
  if (!c) return null
  const minSubtotal = Number(c.min_subtotal ?? c.minSubtotal ?? 0)
  const val = Number(c.value ?? 0)
  const defaultLabel = c.type === 'percentage'
    ? `${val}% DE DESCUENTO`
    : `${formatPrice(val)} OFF`

  return {
    id: c.id,
    code: String(c.code ?? '').toUpperCase().trim(),
    type: c.type || 'percentage',
    value: val,
    label: c.label || defaultLabel,
    description: c.description || '',
    badge: c.badge || 'PROMO EXCLUSIVA',
    minSubtotal,
    min_subtotal: minSubtotal,
    maxUses: c.max_uses ?? null,
    max_uses: c.max_uses ?? null,
    usesCount: Number(c.uses_count ?? 0),
    uses_count: Number(c.uses_count ?? 0),
    isActive: Boolean(c.is_active),
    expiresAt: c.expires_at || null
  }
}

/**
 * Obtiene los cupones activos y vigentes para mostrar en el catálogo o Home.
 * @returns {Promise<Array>}
 */
export async function getPublicCoupons () {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Aviso: no se pudieron cargar cupones de Supabase:', error.message)
      return []
    }

    const now = new Date()
    return (data || [])
      .map(normalizeCoupon)
      .filter((coupon) => {
        if (!coupon.code) return false
        if (coupon.expiresAt && new Date(coupon.expiresAt) <= now) return false
        if (coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses) return false
        return true
      })
  } catch (err) {
    console.error('Error al consultar cupones públicos:', err)
    return []
  }
}

/**
 * Valida un cupón contra Supabase y el subtotal de la compra.
 * @param {string} inputCode - Código ingresado por el usuario
 * @param {number} subtotal - Subtotal actual de la orden en COP
 * @returns {Promise<{ valid: boolean, coupon?: Object, discountAmount?: number, finalTotal?: number, error?: string }>}
 */
export async function validateCoupon (inputCode, subtotal = 0) {
  if (!inputCode || !inputCode.trim()) {
    return { valid: false, error: 'Por favor ingresa un código de descuento.' }
  }

  const cleanCode = inputCode.trim().toUpperCase()

  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .ilike('code', cleanCode)
      .eq('is_active', true)
      .maybeSingle()

    if (error) {
      console.error('Error al validar cupón en Supabase:', error)
      return { valid: false, error: 'No fue posible validar el cupón con el servidor. Intenta nuevamente.' }
    }

    if (!data) {
      return { valid: false, error: 'El código ingresado no existe o no se encuentra activo.' }
    }

    const coupon = normalizeCoupon(data)
    const now = new Date()

    if (coupon.expiresAt && new Date(coupon.expiresAt) <= now) {
      return { valid: false, error: 'Este código de descuento ya ha expirado.' }
    }

    if (coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses) {
      return { valid: false, error: 'Este cupón ha alcanzado el límite máximo de usos permitidos.' }
    }

    if (coupon.min_subtotal > 0 && subtotal < coupon.min_subtotal) {
      return {
        valid: false,
        error: `Este código requiere una compra mínima de ${formatPrice(coupon.min_subtotal)}.`
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
  } catch (err) {
    console.error('Error en validateCoupon:', err)
    return { valid: false, error: 'Error al verificar el cupón. Por favor intenta nuevamente.' }
  }
}
