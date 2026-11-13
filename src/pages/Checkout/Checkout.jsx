/**
 * Checkout.jsx
 * Vista de Checkout V2 en 2 columnas con estética streetwear:
 * - Conectado con useCartStore (cart, getSubtotal, clearCart).
 * - Formulario de contacto con validación colombiana y persistencia en sessionStorage.
 * - Métodos de pago: Contraentrega, Transferencia, Addi (BNPL) y Bold Pagos en Línea.
 * - Pantallas dedicadas de Verificación de Estado de Transacción (redirecting, verifying, approved, rejected, abandoned, pending).
 * Copys 100% en español.
 */

import { storeConfig } from '@/config/storeConfig'
import { getAddiConfig, isAmountValidForAddi } from '@/services/addiService'
import { markCheckoutConverted, saveCheckoutDraft } from '@/services/checkoutRecoveryService'
import { validateCoupon } from '@/services/couponService'
import { checkOrderStatus, confirmBoldPayment, createOrder, OrderError } from '@/services/orderService'
import { useCartStore } from '@/stores/cartStore'
import { buildWhatsappMessage } from '@/utils/buildWhatsappMessage'
import { formatPrice } from '@/utils/formatPrice'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import styles from './Checkout.module.css'

const CONTACT_STORAGE_KEY = 'dc_checkout_contact_draft'

const INITIAL_CONTACT = {
  name: '',
  phone: '',
  city: '',
  address: '',
  notes: '',
  email: '',
  documentId: ''
}

function loadSavedContact () {
  try {
    const raw = window.sessionStorage.getItem(CONTACT_STORAGE_KEY)
    if (!raw) return INITIAL_CONTACT
    const parsed = JSON.parse(raw)
    return { ...INITIAL_CONTACT, ...parsed }
  } catch {
    return INITIAL_CONTACT
  }
}

function saveContactDraftStorage (contact) {
  try {
    window.sessionStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(contact))
  } catch {
    // Ignorar errores de sessionStorage restringido
  }
}

function clearContactDraftStorage () {
  try {
    window.sessionStorage.removeItem(CONTACT_STORAGE_KEY)
  } catch {
    // Ignorar errores de sessionStorage restringido
  }
}

function normalizeGatewayStatus (raw) {
  const s = typeof raw === 'string' ? raw.toLowerCase().trim() : ''
  if (!s) return ''
  if (['approved', 'paid', 'successful', 'succeeded', 'confirmed', 'completed'].includes(s)) {
    return 'approved'
  }
  if (s === 'abandoned') {
    return 'abandoned'
  }
  if (['rejected', 'failed', 'voided', 'declined', 'cancelled', 'canceled', 'error', 'expired', 'refunded'].includes(s)) {
    return 'rejected'
  }
  if (['pending', 'processing', 'in_process', 'created', 'active'].includes(s)) {
    return 'pending'
  }
  return ''
}

export default function Checkout () {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const {
    cart,
    getSubtotal,
    clearCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    getDiscountAmount,
    getTotal
  } = useCartStore()

  const [contact, setContact] = useState(loadSavedContact)
  const [paymentMethod, setPaymentMethod] = useState('cash-on-delivery')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copiedBank, setCopiedBank] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [couponCodeInput, setCouponCodeInput] = useState('')
  const [couponMessage, setCouponMessage] = useState({ text: '', type: '' })
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false)
  const [addiConfig, setAddiConfig] = useState({
    minAmount: 50000,
    maxAmount: 10000000,
    isActiveAlly: true,
    isActivePayNow: true,
    discount: 0,
    isDiscountVisible: false
  })

  // Estado unificado para las pantallas de transición y verificación de transacciones:
  // null | { status: 'redirecting' | 'verifying' | 'approved' | 'rejected' | 'abandoned' | 'pending', provider: 'bold' | 'addi' | 'manual', orderId, name, total, rawStatus, whatsappUrl, whatsappOpened }
  const [transactionView, setTransactionView] = useState(null)

  const subtotal = getSubtotal()
  const discountAmount = getDiscountAmount()
  const total = getTotal()

  // Persistir borrador local de contacto para no perderlo al ir y volver de pasarelas externas
  useEffect(() => {
    saveContactDraftStorage(contact)
  }, [contact])

  // Función reutilizable para verificar estado de orden en Bold o Addi
  const verifyGatewayTransaction = useCallback(async ({ provider, orderId, rawStatus, txId }) => {
    const urlNorm = normalizeGatewayStatus(rawStatus)

    setTransactionView((prev) => ({
      status: 'verifying',
      provider,
      orderId,
      rawStatus,
      name: prev?.name || 'Cliente',
      total: prev?.total || 0
    }))

    if (provider === 'bold') {
      const res = await confirmBoldPayment({
        orderId,
        boldStatus: rawStatus,
        txId
      })

      const backendNorm = normalizeGatewayStatus(
        res?.finalStatus || res?.order?.final_status || res?.order?.latest_payment_status || res?.order?.payment_status
      )

      // Si la URL indica explícitamente rechazo/abandono, respetarlo siempre
      let resolved = 'pending'
      if (urlNorm === 'rejected' || urlNorm === 'abandoned') {
        resolved = urlNorm
      } else if (backendNorm) {
        resolved = backendNorm
      } else if (urlNorm === 'approved') {
        resolved = 'approved'
      }

      const customerName = res?.order?.customer_name || 'Cliente'
      const orderTotal = Number(res?.order?.total || 0)

      if (resolved === 'approved') {
        clearCart()
        clearContactDraftStorage()
        markCheckoutConverted({ orderId })
      }

      setTransactionView({
        status: resolved,
        provider: 'bold',
        orderId,
        rawStatus: rawStatus || resolved,
        name: customerName,
        total: orderTotal
      })
      return
    }

    // Proveedor: Addi
    let orderData = null
    const maxAttempts = (urlNorm === 'rejected' || urlNorm === 'abandoned') ? 1 : 4

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      orderData = await checkOrderStatus(orderId, rawStatus, 'addi')
      const dbNorm = normalizeGatewayStatus(
        orderData?.final_status || orderData?.latest_payment_status || orderData?.payment_status
      )
      if (dbNorm && dbNorm !== 'pending') break
      if (urlNorm && urlNorm !== 'pending') break
      if (attempt < maxAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2200))
      }
    }

    const dbNorm = normalizeGatewayStatus(
      orderData?.final_status || orderData?.latest_payment_status || orderData?.payment_status
    )

    let resolved = 'pending'
    if (urlNorm === 'rejected' || urlNorm === 'abandoned') {
      resolved = urlNorm
    } else if (dbNorm && dbNorm !== 'pending') {
      resolved = dbNorm
    } else if (urlNorm === 'approved') {
      resolved = 'approved'
    }

    const customerName = orderData?.customer_name || 'Cliente'
    const orderTotal = Number(orderData?.total || 0)

    if (resolved === 'approved') {
      clearCart()
      clearContactDraftStorage()
      markCheckoutConverted({ orderId })
    }

    setTransactionView({
      status: resolved,
      provider: 'addi',
      orderId,
      rawStatus: rawStatus || resolved,
      name: customerName,
      total: orderTotal
    })
  }, [clearCart])

  // Detectar si el usuario regresa de la pasarela Bold o Addi mediante parámetros de URL
  useEffect(() => {
    const boldFlag = searchParams.get('bold')
    const addiFlag = searchParams.get('addi')
    const boldOrderIdParam = searchParams.get('bold-order-id')
    const boldTxStatusParam = searchParams.get('bold-tx-status')

    const orderId = (
      searchParams.get('orderId') ||
      boldOrderIdParam ||
      searchParams.get('reference') ||
      ''
    ).trim()

    const rawStatus = (
      boldTxStatusParam ||
      searchParams.get('bold-status') ||
      searchParams.get('status') ||
      searchParams.get('payment_status') ||
      searchParams.get('tx_status') ||
      ''
    ).toLowerCase().trim()

    const txId = (
      searchParams.get('bold-tx-id') ||
      searchParams.get('txId') ||
      searchParams.get('transaction_id') ||
      ''
    ).trim() || null

    const isBoldReturn = Boolean(boldFlag || boldOrderIdParam || boldTxStatusParam)
    const isAddiReturn = Boolean(addiFlag)

    if (!orderId || (!isBoldReturn && !isAddiReturn)) return

    const provider = isAddiReturn ? 'addi' : 'bold'
    verifyGatewayTransaction({ provider, orderId, rawStatus, txId })
  }, [searchParams, verifyGatewayTransaction])

  // Consultar el endpoint de configuración de Addi cuando cambia el total del carrito (docs/addi.md Sección 1)
  useEffect(() => {
    let active = true
    if (total > 0) {
      getAddiConfig(total).then((cfg) => {
        if (active) setAddiConfig(cfg)
      })
    }
    return () => {
      active = false
    }
  }, [total])

  const isAddiAllowed = isAmountValidForAddi(total, addiConfig)

  useEffect(() => {
    if (paymentMethod === 'addi' && !isAddiAllowed) {
      setPaymentMethod('cash-on-delivery')
    }
  }, [paymentMethod, isAddiAllowed])

  // Guardar borrador de checkout (con debounce de 2s) para asesoría por WhatsApp vía Kapso si abandona
  useEffect(() => {
    if (transactionView || cart.length === 0) return
    const nameClean = (contact.name || '').trim()
    const phoneDigits = (contact.phone || '').replace(/\D/g, '')
    if (nameClean.length < 3 || phoneDigits.length < 10) return

    const timer = setTimeout(() => {
      saveCheckoutDraft({
        contact,
        cart,
        paymentMethod,
        total
      })
    }, 2000)

    return () => clearTimeout(timer)
  }, [
    contact,
    cart,
    paymentMethod,
    total,
    transactionView
  ])

  const handleApplyCoupon = async (e) => {
    e.preventDefault()
    if (!couponCodeInput.trim() || isValidatingCoupon) return
    setCouponMessage({ text: '', type: '' })
    setIsValidatingCoupon(true)

    try {
      const result = await validateCoupon(couponCodeInput, subtotal)
      if (!result.valid) {
        setCouponMessage({ text: result.error, type: 'error' })
        return
      }

      applyCoupon(result.coupon)
      setCouponMessage({
        text: `¡Cupón ${result.coupon.code} aplicado con éxito (-${formatPrice(result.discountAmount)})!`,
        type: 'success'
      })
      setCouponCodeInput('')
    } finally {
      setIsValidatingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    removeCoupon()
    setCouponMessage({ text: '', type: '' })
  }

  const handleFieldChange = (field, value) => {
    setContact((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: null }))
  }

  const validate = () => {
    const errs = {}
    if (!contact.name || contact.name.trim().length < 3) {
      errs.name = 'Ingresa tu nombre y apellido completos.'
    }
    const phoneClean = contact.phone.replace(/\D/g, '')
    if (!phoneClean || phoneClean.length < 10) {
      errs.phone = 'Ingresa un número de celular de 10 dígitos.'
    }
    if (!contact.city || contact.city.trim().length < 2) {
      errs.city = 'Ingresa la ciudad o municipio de entrega.'
    }
    if (!contact.address || contact.address.trim().length < 5) {
      errs.address = 'Ingresa tu dirección completa de entrega.'
    }
    if (paymentMethod === 'addi') {
      const docClean = (contact.documentId || '').replace(/\D/g, '')
      if (!docClean || docClean.length < 5 || docClean.length > 12) {
        errs.documentId = 'Ingresa tu número de Cédula de Ciudadanía (CC) válido para pagar con Addi.'
      }
      const emailClean = (contact.email || '').trim()
      if (!emailClean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean)) {
        errs.email = 'Ingresa un correo electrónico válido para tu solicitud en Addi.'
      }
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(storeConfig.bank.accountNumber)
    setCopiedBank(true)
    setTimeout(() => setCopiedBank(false), 2500)
  }

  const handleReturnToCheckoutForm = (preferredMethod = null) => {
    if (preferredMethod) {
      setPaymentMethod(preferredMethod)
    }
    setIsSubmitting(false)
    setSubmitError(null)
    setTransactionView(null)
    navigate('/checkout', { replace: true })
  }

  const handleFinalizeOrder = async () => {
    if (isSubmitting) return
    if (!validate()) {
      window.scrollTo({ top: 100, behavior: 'smooth' })
      return
    }

    setSubmitError(null)
    setIsSubmitting(true)
    saveContactDraftStorage(contact)

    // Si es pasarela en línea (Bold o Addi), no abrimos WhatsApp popup
    const isBoldReal = paymentMethod === 'bold'
    const isAddiReal = paymentMethod === 'addi'
    const waWindow = (!isBoldReal && !isAddiReal) ? window.open('', '_blank') : null

    try {
      // 1. Crear la orden en Supabase (Edge Function: precios y stock se validan en servidor)
      const originUrl = window.location.origin
      const order = await createOrder({
        contact,
        cart,
        paymentMethod,
        originUrl,
        couponCode: appliedCoupon?.code
      })

      // 2A. Si el método es Addi, mostrar pantalla de redirección y enviar a Addi
      // NO vaciamos el carrito antes de confirmar el pago para permitir reintentos si es rechazado o abandonado.
      if (isAddiReal && order.addiRedirectUrl) {
        setTransactionView({
          status: 'redirecting',
          provider: 'addi',
          orderId: order.orderId,
          name: contact.name,
          total: order.total || total
        })
        window.location.href = order.addiRedirectUrl
        return
      }

      // 2B. Si el método es Bold (Pagos en línea), mostrar pantalla de conexión con Bold SIN vaciar el carrito
      if (isBoldReal && (order.boldCheckout || order.boldCheckoutUrl)) {
        setTransactionView({
          status: 'redirecting',
          provider: 'bold',
          orderId: order.orderId,
          name: contact.name,
          total: order.total || total
        })

        if (order.boldCheckout) {
          if (!window.BoldCheckout) {
            await new Promise((resolve, reject) => {
              const existing = document.querySelector('script[src*="boldPaymentButton.js"]')
              if (existing) {
                existing.addEventListener('load', resolve)
                existing.addEventListener('error', () => reject(new Error('No se pudo cargar el SDK de Bold')))
              } else {
                const s = document.createElement('script')
                s.src = 'https://checkout.bold.co/library/boldPaymentButton.js'
                s.onload = resolve
                s.onerror = () => reject(new Error('No se pudo cargar el SDK de Bold'))
                document.head.appendChild(s)
              }
            })
          }
          const checkout = new window.BoldCheckout(order.boldCheckout)
          checkout.open()
          return
        }
        if (order.boldCheckoutUrl) {
          window.location.href = order.boldCheckoutUrl
          return
        }
      }

      // 3. Contraentrega o Transferencia: generar mensaje de WhatsApp y confirmar pedido
      const finalAmount = order.total ? Math.max(0, order.total - discountAmount) : total
      const whatsappUrl = buildWhatsappMessage({
        orderId: order.orderId,
        contact,
        items: cart,
        total: finalAmount,
        paymentMethod,
        discountAmount,
        couponCode: appliedCoupon?.code
      })

      if (waWindow) waWindow.location.href = whatsappUrl

      // 4. Marcar como convertido, mostrar pantalla de éxito y vaciar carrito
      markCheckoutConverted({ orderId: order.orderId, phone: contact.phone })
      clearContactDraftStorage()
      setTransactionView({
        status: 'approved',
        provider: 'manual',
        orderId: order.orderId,
        name: contact.name,
        total: finalAmount,
        whatsappUrl,
        whatsappOpened: Boolean(waWindow)
      })
      clearCart()
    } catch (err) {
      if (waWindow) waWindow.close()
      setTransactionView(null)
      console.error('Error al crear la orden:', err)
      setSubmitError(
        err instanceof OrderError
          ? err.message
          : 'Hubo un inconveniente al generar tu orden. Por favor intenta nuevamente.'
      )
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // ============================================================================
  // 1. PANTALLAS DE VERIFICACIÓN DE ESTADO DE TRANSACCIÓN (Prioridad Máxima)
  // ============================================================================
  if (transactionView) {
    const {
      status,
      provider,
      orderId,
      name,
      total: txTotal,
      rawStatus,
      whatsappUrl,
      whatsappOpened
    } = transactionView

    const gatewayLabel = provider === 'addi' ? 'Addi' : provider === 'bold' ? 'Bold' : 'WhatsApp'
    const supportWaText = encodeURIComponent(
      `Hola DC SNEAKERS, necesito ayuda con mi orden #${orderId} (intento de pago con ${gatewayLabel}).`
    )
    const supportWaUrl = `https://wa.me/${storeConfig.whatsappNumber}?text=${supportWaText}`

    // 1A. Pantalla: Redirigiendo o Verificando Estado con el Servidor
    if (status === 'redirecting' || status === 'verifying') {
      return (
        <div className={styles.checkoutPage}>
          <div className={`${styles.statusCard} ${styles.statusCardVerifying}`} role='status' aria-live='polite'>
            <span className={`${styles.statusBadge} ${styles.badgeVerifying}`}>
              {status === 'redirecting' ? `CONECTANDO CON ${gatewayLabel.toUpperCase()}` : `VERIFICACIÓN ${gatewayLabel.toUpperCase()}`}
            </span>
            <div className={styles.statusSpinner} />
            <h1 className={styles.statusTitle}>
              {status === 'redirecting'
                ? `PREPARANDO TU PAGO SEGURO CON ${gatewayLabel.toUpperCase()}...`
                : 'VERIFICANDO EL ESTADO DE TU TRANSACCIÓN...'}
            </h1>
            <p className={styles.statusDesc}>
              {status === 'redirecting'
                ? `Te estamos redirigiendo a la pasarela oficial de ${gatewayLabel} para completar la orden #${orderId}. Tu bolsa de compras permanece guardada.`
                : `Estamos consultando la confirmación de tu pago con ${gatewayLabel} para la orden #${orderId}. Por favor espera unos segundos.`}
            </p>
            <div className={styles.statusMetaBox}>
              <div className={styles.statusMetaRow}>
                <span>Referencia de orden:</span>
                <strong>#{orderId}</strong>
              </div>
              <div className={styles.statusMetaRow}>
                <span>Pasarela:</span>
                <strong>{gatewayLabel}</strong>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // 1B. Pantalla: Pago Aprobado / Pedido Confirmado
    if (status === 'approved') {
      return (
        <div className={styles.checkoutPage}>
          <div className={`${styles.statusCard} ${styles.statusCardApproved}`}>
            <span className={`${styles.statusBadge} ${styles.badgeApproved}`}>
              ✓ TRANSACCIÓN APROBADA
            </span>
            <div className={`${styles.statusIconCircle} ${styles.iconApproved}`}>
              ✓
            </div>
            <h1 className={styles.statusTitle}>¡PEDIDO CONFIRMADO CON ÉXITO!</h1>
            <p className={styles.statusDesc}>
              Gracias por tu compra, <strong>{name || 'Cliente'}</strong>.{' '}
              {provider === 'addi'
                ? 'Tu solicitud de crédito en cuotas con Addi fue aprobada exitosamente. Alistaremos y despacharemos tus sneakers de inmediato.'
                : provider === 'bold'
                  ? 'Hemos verificado y confirmado tu pago en línea con Bold. Alistaremos y despacharemos tu pedido de inmediato.'
                  : whatsappOpened
                    ? 'Se ha abierto una ventana de WhatsApp para coordinar la entrega directamente con nuestro equipo.'
                    : 'Toca el botón de abajo para enviarnos tu pedido por WhatsApp y coordinar la entrega.'}
            </p>

            <div className={styles.statusMetaBox}>
              <div className={styles.statusMetaRow}>
                <span>Número de orden:</span>
                <strong>#{orderId}</strong>
              </div>
              <div className={styles.statusMetaRow}>
                <span>Estado del pago:</span>
                <strong style={{ color: '#25D366' }}>APROBADO</strong>
              </div>
              <div className={styles.statusMetaRow}>
                <span>Método de pago:</span>
                <strong>
                  {provider === 'addi'
                    ? 'Addi (Pago a cuotas)'
                    : provider === 'bold'
                      ? 'Bold (Pago en línea)'
                      : 'Coordinación directa'}
                </strong>
              </div>
              {txTotal > 0 && (
                <div className={styles.statusMetaRow}>
                  <span>Total de la orden:</span>
                  <strong>{formatPrice(txTotal)}</strong>
                </div>
              )}
            </div>

            <div className={styles.statusActions}>
              {whatsappUrl
                ? (
                  <a
                    href={whatsappUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className={styles.submitBtn}
                    style={{ textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box' }}
                  >
                    ENVIAR PEDIDO POR WHATSAPP →
                  </a>
                  )
                : (
                  <a
                    href={supportWaUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className={styles.whatsappSupportBtn}
                  >
                    COORDINAR ENVÍO POR WHATSAPP →
                  </a>
                  )}
              <button
                type='button'
                className={styles.secondaryBtn}
                onClick={() => navigate('/')}
              >
                VOLVER AL INICIO →
              </button>
            </div>
          </div>
        </div>
      )
    }

    // 1C. Pantalla: Pago Rechazado / Declinado / Abandonado
    if (status === 'rejected' || status === 'abandoned') {
      const isAbandoned = status === 'abandoned'
      return (
        <div className={styles.checkoutPage}>
          <div className={`${styles.statusCard} ${styles.statusCardRejected}`} role='alert'>
            <span className={`${styles.statusBadge} ${styles.badgeRejected}`}>
              ✕ {isAbandoned ? 'PROCESO NO FINALIZADO' : 'TRANSACCIÓN RECHAZADA'}
            </span>
            <div className={`${styles.statusIconCircle} ${styles.iconRejected}`}>
              ✕
            </div>
            <h1 className={styles.statusTitle}>
              {isAbandoned
                ? `TU SOLICITUD EN ${gatewayLabel.toUpperCase()} NO FUE COMPLETADA`
                : `EL PAGO CON ${gatewayLabel.toUpperCase()} FUE RECHAZADO`}
            </h1>
            <p className={styles.statusDesc}>
              {isAbandoned
                ? `Saliste de ${gatewayLabel} antes de finalizar el proceso para la orden #${orderId}. No se ha realizado ningún cobro.`
                : `La pasarela ${gatewayLabel} reportó que la transacción para la orden #${orderId} no fue aprobada (${String(rawStatus || 'REJECTED').toUpperCase()}). No se realizó ningún cobro a tu cuenta.`}
            </p>

            <div className={styles.statusMetaBox}>
              <div className={styles.statusMetaRow}>
                <span>Referencia de orden:</span>
                <strong>#{orderId}</strong>
              </div>
              <div className={styles.statusMetaRow}>
                <span>Pasarela utilizada:</span>
                <strong>{gatewayLabel}</strong>
              </div>
              <div className={styles.statusMetaRow}>
                <span>Estado reportado:</span>
                <strong style={{ color: '#ff453a' }}>
                  {isAbandoned ? 'ABANDONADO / CANCELADO' : 'RECHAZADO'}
                </strong>
              </div>
              {txTotal > 0 && (
                <div className={styles.statusMetaRow}>
                  <span>Valor del pedido:</span>
                  <strong>{formatPrice(txTotal)}</strong>
                </div>
              )}
            </div>

            <div className={styles.statusNoticeBox}>
              <strong>Tu carrito y tus datos siguen guardados.</strong> Puedes regresar al checkout para intentar con otro medio de pago (como <strong>Pago Contraentrega en efectivo</strong> o <strong>Transferencia</strong>) sin volver a llenar el formulario.
            </div>

            <div className={styles.statusActions}>
              <button
                type='button'
                className={styles.submitBtn}
                onClick={() => handleReturnToCheckoutForm('cash-on-delivery')}
              >
                CAMBIAR A PAGO CONTRAENTREGA (EFECTIVO) →
              </button>
              <button
                type='button'
                className={styles.secondaryBtn}
                onClick={() => handleReturnToCheckoutForm(provider)}
              >
                VOLVER AL CHECKOUT Y ELEGIR OTRO MÉTODO →
              </button>
              <a
                href={supportWaUrl}
                target='_blank'
                rel='noopener noreferrer'
                className={styles.whatsappSupportBtn}
              >
                HABLAR CON UN ASESOR POR WHATSAPP →
              </a>
            </div>
          </div>
        </div>
      )
    }

    // 1D. Pantalla: Pago en Proceso de Validación (Pending)
    return (
      <div className={styles.checkoutPage}>
        <div className={`${styles.statusCard} ${styles.statusCardPending}`}>
          <span className={`${styles.statusBadge} ${styles.badgePending}`}>
            ⏳ PAGO EN VALIDACIÓN
          </span>
          <div className={`${styles.statusIconCircle} ${styles.iconPending}`}>
            ⏳
          </div>
          <h1 className={styles.statusTitle}>
            ESTAMOS VALIDANDO TU TRANSACCIÓN CON {gatewayLabel.toUpperCase()}
          </h1>
          <p className={styles.statusDesc}>
            La pasarela {gatewayLabel} aún está procesando la confirmación de tu orden <strong>#{orderId}</strong>. Puedes actualizar el estado aquí mismo o elegir otro método de pago si no lograste finalizarla.
          </p>

          <div className={styles.statusMetaBox}>
            <div className={styles.statusMetaRow}>
              <span>Referencia de orden:</span>
              <strong>#{orderId}</strong>
            </div>
            <div className={styles.statusMetaRow}>
              <span>Estado actual:</span>
              <strong style={{ color: '#ffca28' }}>EN VALIDACIÓN (PENDIENTE)</strong>
            </div>
            {txTotal > 0 && (
              <div className={styles.statusMetaRow}>
                <span>Total de la orden:</span>
                <strong>{formatPrice(txTotal)}</strong>
              </div>
            )}
          </div>

          <div className={styles.statusActions}>
            <button
              type='button'
              className={styles.submitBtn}
              onClick={() => verifyGatewayTransaction({ provider, orderId, rawStatus: '', txId: null })}
            >
              VOLVER A VERIFICAR ESTADO ↻
            </button>
            <button
              type='button'
              className={styles.secondaryBtn}
              onClick={() => handleReturnToCheckoutForm('cash-on-delivery')}
            >
              VOLVER AL CHECKOUT / CAMBIAR MÉTODO DE PAGO →
            </button>
            <a
              href={supportWaUrl}
              target='_blank'
              rel='noopener noreferrer'
              className={styles.whatsappSupportBtn}
            >
              CONSULTAR ESTADO POR WHATSAPP →
            </a>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================================
  // 2. VISTA DE CARRITO VACÍO (Solo cuando no hay una transacción en curso)
  // ============================================================================
  if (cart.length === 0) {
    return (
      <div className={styles.checkoutPage}>
        <div className={styles.emptyState}>
          <span style={{ fontSize: '3rem' }}>🛒</span>
          <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '2.5rem', margin: 0 }}>
            TU BOLSA DE COMPRAS ESTÁ VACÍA
          </h2>
          <p style={{ color: '#8e8e93', maxWidth: '400px' }}>
            Añade al menos un sneaker a tu carrito antes de proceder al checkout.
          </p>
          <Link
            to='/categorias'
            className={styles.submitBtn}
            style={{ textDecoration: 'none', width: 'auto', padding: '0.9rem 2rem' }}
          >
            EXPLORAR CATÁLOGO →
          </Link>
        </div>
      </div>
    )
  }

  // ============================================================================
  // 3. VISTA PRINCIPAL DEL FORMULARIO DE CHECKOUT
  // ============================================================================
  return (
    <div className={styles.checkoutPage}>
      <h1 className={styles.title}>FINALIZAR PEDIDO</h1>

      <div className={styles.checkoutGrid}>
        {/* Columna Izquierda: Formulario y Pago */}
        <div className={styles.leftCol}>
          {/* Paso 1: Datos de Entrega */}
          <div className={styles.sectionBox}>
            <div className={styles.sectionHeader}>
              <span className={styles.stepNumber}>1</span>
              <h2 className={styles.sectionTitle}>DATOS DE ENVÍO Y CONTACTO</h2>
            </div>

            <div className={styles.formBox}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Nombre y Apellido <span className={styles.required}>*</span>
                </label>
                <input
                  type='text'
                  placeholder='Ej: Carlos Mendoza'
                  className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                  value={contact.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                />
                {errors.name && <p className={styles.errorMsg}>{errors.name}</p>}
              </div>

              <div className={styles.twoCols}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Celular WhatsApp <span className={styles.required}>*</span>
                  </label>
                  <input
                    type='tel'
                    placeholder='Ej: 310 123 4567'
                    className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                    value={contact.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                  />
                  {errors.phone && <p className={styles.errorMsg}>{errors.phone}</p>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Ciudad / Municipio <span className={styles.required}>*</span>
                  </label>
                  <input
                    type='text'
                    placeholder='Ej: Medellín, Bogotá, Cali...'
                    className={`${styles.input} ${errors.city ? styles.inputError : ''}`}
                    value={contact.city}
                    onChange={(e) => handleFieldChange('city', e.target.value)}
                  />
                  {errors.city && <p className={styles.errorMsg}>{errors.city}</p>}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Dirección de Entrega <span className={styles.required}>*</span>
                </label>
                <input
                  type='text'
                  placeholder='Ej: Calle 10 # 43E - 20, Apto 402'
                  className={`${styles.input} ${errors.address ? styles.inputError : ''}`}
                  value={contact.address}
                  onChange={(e) => handleFieldChange('address', e.target.value)}
                />
                {errors.address && <p className={styles.errorMsg}>{errors.address}</p>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Instrucciones de entrega (Opcional)</label>
                <input
                  type='text'
                  placeholder='Ej: Dejar en portería o timbre 402'
                  className={styles.input}
                  value={contact.notes}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                />
              </div>

              {paymentMethod === 'addi' && (
                <div className={styles.twoCols}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Cédula de Ciudadanía (CC) <span className={styles.required}>*</span>
                    </label>
                    <input
                      type='text'
                      inputMode='numeric'
                      placeholder='Ej: 1020304050'
                      className={`${styles.input} ${errors.documentId ? styles.inputError : ''}`}
                      value={contact.documentId}
                      onChange={(e) => handleFieldChange('documentId', e.target.value.replace(/\D/g, ''))}
                    />
                    {errors.documentId && <p className={styles.errorMsg}>{errors.documentId}</p>}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Correo Electrónico <span className={styles.required}>*</span>
                    </label>
                    <input
                      type='email'
                      placeholder='Ej: cliente@correo.com'
                      className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                      value={contact.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                    />
                    {errors.email && <p className={styles.errorMsg}>{errors.email}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Paso 2: Método de Pago */}
          <div className={styles.sectionBox}>
            <div className={styles.sectionHeader}>
              <span className={styles.stepNumber}>2</span>
              <h2 className={styles.sectionTitle}>MÉTODO DE PAGO</h2>
            </div>

            <div className={styles.paymentList}>
              {/* Opción 1: Contraentrega */}
              <div
                className={`${styles.paymentOption} ${
                  paymentMethod === 'cash-on-delivery' ? styles.paymentSelected : ''
                }`}
                onClick={() => setPaymentMethod('cash-on-delivery')}
              >
                <div className={styles.paymentHeader}>
                  <input
                    type='radio'
                    name='payment'
                    className={styles.radio}
                    checked={paymentMethod === 'cash-on-delivery'}
                    onChange={() => setPaymentMethod('cash-on-delivery')}
                  />
                  <div>
                    <div className={styles.paymentTitle}>PAGO CONTRAENTREGA (EFECTIVO)</div>
                    <div className={styles.paymentDesc}>
                      Pagas en efectivo al recibir tu paquete en la puerta de tu casa.
                    </div>
                  </div>
                </div>
              </div>

              {/* Opción 2: Addi (BNPL - Compra ahora y paga después) */}
              <div
                className={`${styles.paymentOption} ${
                  paymentMethod === 'addi' ? styles.paymentSelected : ''
                } ${!isAddiAllowed ? styles.paymentOptionDisabled : ''}`}
                aria-disabled={!isAddiAllowed}
                onClick={() => {
                  if (isAddiAllowed) setPaymentMethod('addi')
                }}
              >
                <div className={styles.paymentHeader}>
                  <input
                    type='radio'
                    name='payment'
                    className={styles.radio}
                    disabled={!isAddiAllowed}
                    checked={paymentMethod === 'addi'}
                    onChange={() => {
                      if (isAddiAllowed) setPaymentMethod('addi')
                    }}
                  />
                  <div className={styles.addiContentWrap}>
                    <div className={styles.addiTitleRow}>
                      <img src='/addi.png' alt='Addi' className={styles.addiOptionLogo} />
                      <span className={styles.paymentTitle}>
                        PAGA A CUOTAS CON ADDI
                      </span>
                      <span className={styles.addiZeroBadge}>0% INTERÉS</span>
                      {addiConfig.isDiscountVisible && addiConfig.discount > 0 && (
                        <span className={styles.addiDiscountBadge}>
                          -{Math.round(addiConfig.discount * 100)}% DTO ADDI
                        </span>
                      )}
                    </div>
                    <div className={styles.paymentDesc}>
                      Financia tu compra en cuotas solo con tu Cédula de Ciudadanía (CC) y WhatsApp. Sin tarjeta de crédito.
                    </div>

                    {!isAddiAllowed && (
                      <div className={styles.addiDisclaimer}>
                        Aplica solo para compras entre {formatPrice(addiConfig.minAmount)} y {formatPrice(addiConfig.maxAmount)} COP. Agrega más productos a tu bolsa para activar Addi.
                      </div>
                    )}

                    {isAddiAllowed && addiConfig.isDiscountVisible && addiConfig.discount > 0 && (
                      <div className={styles.addiPolicyNote}>
                        ✨ Tienes un {Math.round(addiConfig.discount * 100)}% de descuento aplicable directamente en la pasarela de Addi sobre el total de {formatPrice(total)}.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Opción 3: Transferencia */}
              <div
                className={`${styles.paymentOption} ${
                  paymentMethod === 'transfer' ? styles.paymentSelected : ''
                }`}
                onClick={() => setPaymentMethod('transfer')}
              >
                <div className={styles.paymentHeader}>
                  <input
                    type='radio'
                    name='payment'
                    className={styles.radio}
                    checked={paymentMethod === 'transfer'}
                    onChange={() => setPaymentMethod('transfer')}
                  />
                  <div>
                    <div className={styles.paymentTitle}>TRANSFERENCIA BANCARIA</div>
                    <div className={styles.paymentDesc}>
                      Bancolombia, Nequi o transferencia directa.
                    </div>
                  </div>
                </div>

                {paymentMethod === 'transfer' && (
                  <div className={styles.bankBox}>
                    <div className={styles.bankRow}>
                      <span>Banco:</span>
                      <strong>{storeConfig.bank.bankName}</strong>
                    </div>
                    <div className={styles.bankRow}>
                      <span>Tipo de cuenta:</span>
                      <strong>{storeConfig.bank.accountType}</strong>
                    </div>
                    <div className={styles.bankRow}>
                      <span>Número:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong>{storeConfig.bank.accountNumber}</strong>
                        <button
                          type='button'
                          className={styles.copyBtn}
                          onClick={handleCopyAccount}
                        >
                          {copiedBank ? '¡Copiado!' : 'Copiar'}
                        </button>
                      </div>
                    </div>
                    <div className={styles.bankRow}>
                      <span>Titular:</span>
                      <strong>{storeConfig.bank.accountHolder}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Opción 4: Bold Pasarela en línea */}
              <div
                className={`${styles.paymentOption} ${
                  paymentMethod === 'bold' ? styles.paymentSelected : ''
                }`}
                onClick={() => setPaymentMethod('bold')}
              >
                <div className={styles.paymentHeader}>
                  <input
                    type='radio'
                    name='payment'
                    className={styles.radio}
                    checked={paymentMethod === 'bold'}
                    onChange={() => setPaymentMethod('bold')}
                  />
                  <div>
                    <div className={styles.paymentTitle}>
                      PAGO EN LÍNEA SEGURO (BOLD) 💳
                    </div>
                    <div className={styles.paymentDesc}>
                      Tarjeta de crédito/débito, PSE, Nequi y Bancolombia. Redirección segura.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botón Finalizar */}
          <button
            type='button'
            className={styles.submitBtn}
            onClick={handleFinalizeOrder}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'PROCESANDO ORDEN...'
              : paymentMethod === 'addi'
                ? 'CONTINUAR A ADDI (PAGO A CUOTAS) →'
                : paymentMethod === 'bold'
                  ? 'IR A PAGAR CON BOLD →'
                  : 'FINALIZAR PEDIDO POR WHATSAPP →'}
          </button>
          {submitError && (
            <p role='alert' style={{ color: '#ff453a', fontSize: '0.85rem', fontWeight: 700, margin: '0.75rem 0 0' }}>
              {submitError}
            </p>
          )}
        </div>

        {/* Columna Derecha: Resumen de Orden */}
        <div className={styles.summaryBox}>
          <h2 className={styles.summaryTitle}>RESUMEN DE TU COMPRA [{cart.length}]</h2>

          <div className={styles.itemsList}>
            {cart.map((item, index) => (
              <div key={`${item.product.id}-${item.size}-${index}`} className={styles.itemRow}>
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className={styles.thumb}
                />
                <div className={styles.itemInfo}>
                  <h4 className={styles.itemName}>{item.product.name}</h4>
                  <span className={styles.itemMeta}>
                    Talla EU {item.size} · Cant: {item.quantity}
                  </span>
                </div>
                <span className={styles.itemPrice}>
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Banner de Medias Gratis */}
          <div className={styles.giftBanner}>
            <span style={{ fontSize: '1.2rem' }}>🧦</span>
            <span>
              <strong>¡Te regalamos un par de medias con tu pedido!</strong>
              <br />
              <span style={{ color: '#a0a0a5' }}>Incluido automáticamente.</span>
            </span>
          </div>

          {/* Sección de Cupón de Descuento */}
          <div className={styles.couponSection}>
            <span className={styles.couponSectionLabel}>¿TIENES UN CÓDIGO DE DESCUENTO?</span>
            {appliedCoupon
              ? (
                <div className={styles.appliedCouponBox}>
                  <div className={styles.appliedCouponInfo}>
                    <span className={styles.couponTagIcon}>🏷️</span>
                    <div>
                      <span className={styles.appliedCouponCode}>{appliedCoupon.code}</span>
                      <span className={styles.appliedCouponLabel}>{appliedCoupon.label}</span>
                    </div>
                  </div>
                  <button
                    type='button'
                    className={styles.removeCouponBtn}
                    onClick={handleRemoveCoupon}
                    aria-label='Remover código de descuento'
                  >
                    ✕ REMOVER
                  </button>
                </div>
                )
              : (
                <form onSubmit={handleApplyCoupon} className={styles.couponForm}>
                  <input
                    type='text'
                    value={couponCodeInput}
                    onChange={(e) => {
                      setCouponCodeInput(e.target.value.toUpperCase())
                      if (couponMessage.text) setCouponMessage({ text: '', type: '' })
                    }}
                    placeholder='CÓDIGO (EJ: DC10)'
                    className={styles.couponInput}
                    aria-label='Código de descuento'
                  />
                  <button
                    type='submit'
                    className={styles.applyCouponBtn}
                    disabled={isValidatingCoupon}
                  >
                    {isValidatingCoupon ? '...' : 'APLICAR'}
                  </button>
                </form>
                )}

            {couponMessage.text && (
              <p className={couponMessage.type === 'error' ? styles.couponError : styles.couponSuccess}>
                {couponMessage.text}
              </p>
            )}
          </div>

          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <strong style={{ color: '#fff' }}>{formatPrice(subtotal)}</strong>
          </div>

          {discountAmount > 0 && (
            <div className={styles.summaryRow}>
              <span className={styles.discountRowLabel}>
                Descuento ({appliedCoupon?.code})
              </span>
              <strong className={styles.discountAmount}>
                -{formatPrice(discountAmount)}
              </strong>
            </div>
          )}

          <div className={styles.summaryRow}>
            <span>Envío nacional</span>
            <strong className={styles.freeTag}>¡GRATIS!</strong>
          </div>

          <div className={styles.summaryRow}>
            <span>Garantía de satisfacción</span>
            <span>30 días directa</span>
          </div>

          <div className={styles.summaryTotal}>
            <span>TOTAL:</span>
            <span className={styles.totalAmount}>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
