/**
 * Checkout.jsx
 * Vista de Checkout V2 en 2 columnas con estética streetwear:
 * - Conectado con useCartStore (cart, getSubtotal, clearCart).
 * - Formulario de contacto con validación colombiana.
 * - Métodos de pago: Contraentrega, Transferencia (con botón copiar cuenta) y Bold Demo.
 * - Resumen con lista de sneakers, medias de regalo y envío gratis.
 * - Finalización con generación de mensaje codificado para WhatsApp (wa.me).
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
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import styles from './Checkout.module.css'

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

  const [contact, setContact] = useState({
    name: '',
    phone: '',
    city: '',
    address: '',
    notes: '',
    email: '',
    documentId: ''
  })

  const [paymentMethod, setPaymentMethod] = useState('cash-on-delivery')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copiedBank, setCopiedBank] = useState(false)
  const [completedOrder, setCompletedOrder] = useState(null)
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
  const [addiReturnNotice, setAddiReturnNotice] = useState(null)
  const [isCheckingAddiOrder, setIsCheckingAddiOrder] = useState(false)

  // Detectar si el usuario regresa de la pasarela Bold o Addi
  useEffect(() => {
    const boldReturn = searchParams.get('bold')
    const addiReturn = searchParams.get('addi')
    const orderId = searchParams.get('orderId')
    const boldStatus = searchParams.get('bold-status') || searchParams.get('status') || 'approved'
    const txId = searchParams.get('txId') || searchParams.get('bold-tx-id') || null

    if (boldReturn && orderId) {
      const normalizedBoldStatus = String(boldStatus || 'approved').toLowerCase().trim()
      const isBoldRejected = ['rejected', 'failed', 'voided', 'declined'].includes(normalizedBoldStatus)

      if (isBoldRejected) {
        setPaymentMethod('bold')
        setAddiReturnNotice(
          `Tu pago en línea con Bold (Orden #${orderId}) no pudo completarse (${normalizedBoldStatus.toUpperCase()}). Tu bolsa sigue intacta para que intentes nuevamente o elijas otro método de pago.`
        )
        confirmBoldPayment({ orderId, boldStatus, txId })
        return
      }

      clearCart()
      markCheckoutConverted({ orderId })
      setCompletedOrder({
        orderId,
        name: 'Cliente',
        total: 0,
        isBoldPayment: true
      })

      confirmBoldPayment({ orderId, boldStatus, txId }).then((res) => {
        if (res?.order) {
          setCompletedOrder((prev) => ({
            ...prev,
            name: res.order.customer_name || 'Cliente',
            total: res.order.total || 0
          }))
        }
      })
      return
    }

    if (addiReturn && orderId) {
      let cancelled = false
      const urlStatus = (searchParams.get('status') || '').toLowerCase().trim()

      const verifyAddiOrder = async () => {
        setIsCheckingAddiOrder(true)
        setAddiReturnNotice(null)

        // Consultar estado en BD (con breves reintentos si sigue pending mientras llega el callback de Addi)
        let orderData = null
        for (let attempt = 0; attempt < 5; attempt++) {
          if (cancelled) return
          orderData = await checkOrderStatus(orderId)
          const pStatus = (orderData?.latest_payment_status || orderData?.payment_status || '').toLowerCase()
          if (pStatus && pStatus !== 'pending') break
          if (urlStatus && urlStatus !== 'pending') break
          await new Promise((resolve) => setTimeout(resolve, 2500))
        }

        if (cancelled) return
        setIsCheckingAddiOrder(false)

        const finalStatus = (
          orderData?.latest_payment_status ||
          orderData?.payment_status ||
          urlStatus ||
          'pending'
        ).toLowerCase()

        if (finalStatus === 'approved' || finalStatus === 'paid') {
          clearCart()
          markCheckoutConverted({ orderId })
          setCompletedOrder({
            orderId,
            name: orderData?.customer_name || 'Cliente',
            total: orderData?.total || 0,
            isAddiPayment: true
          })
        } else if (finalStatus === 'rejected' || finalStatus === 'declined' || finalStatus === 'abandoned' || finalStatus === 'failed') {
          // Regla docs/addi.md Sección 4: Para cualquier estado distinto a approved,
          // mantener al cliente en el carrito/checkout para permitir un nuevo intento con Addi u otro medio.
          setPaymentMethod('addi')
          setAddiReturnNotice(
            finalStatus === 'abandoned'
              ? `Tu solicitud en Addi (Orden #${orderId}) no fue finalizada. Tu bolsa sigue intacta por si deseas intentar de nuevo con Addi o elegir otro método de pago.`
              : `Tu solicitud de crédito con Addi (Orden #${orderId}) no fue aprobada (${finalStatus.toUpperCase()}). Puedes intentar nuevamente o elegir otro método de pago.`
          )
        } else {
          setAddiReturnNotice(
            `Estamos recibiendo la confirmación de Addi para tu orden #${orderId}. Si tu crédito fue aprobado, te notificaremos en breve.`
          )
        }
      }

      verifyAddiOrder()
      return () => {
        cancelled = true
      }
    }
  }, [searchParams, clearCart])

  const subtotal = getSubtotal()
  const discountAmount = getDiscountAmount()
  const total = getTotal()

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
    if (completedOrder || cart.length === 0) return
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
    completedOrder
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

  const handleFinalizeOrder = async () => {
    if (isSubmitting) return
    if (!validate()) {
      window.scrollTo({ top: 100, behavior: 'smooth' })
      return
    }

    setSubmitError(null)
    setIsSubmitting(true)

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

      // 2A. Si el método es Addi, redirigir manualmente a la URL obtenida del header Location (301)
      // No vaciamos el carrito antes de ir a Addi para permitir reintentos si el cliente abandona o es rechazado.
      if (isAddiReal && order.addiRedirectUrl) {
        window.location.href = order.addiRedirectUrl
        return
      }

      // 2B. Si el método es Bold (Pagos en línea), abrir la pasarela oficial de Bold
      if (isBoldReal && (order.boldCheckout || order.boldCheckoutUrl)) {
        clearCart()
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

      // 3. Generar el mensaje de WhatsApp con el total calculado y descuento
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

      // 4. Guardar estado completado y vaciar carrito
      markCheckoutConverted({ orderId: order.orderId, phone: contact.phone })
      setCompletedOrder({
        orderId: order.orderId,
        name: contact.name,
        total: finalAmount,
        whatsappUrl,
        whatsappOpened: Boolean(waWindow)
      })
      clearCart()
    } catch (err) {
      // Si falla, NO se vacía el carrito ni se abre WhatsApp
      if (waWindow) waWindow.close()
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

  // 1. Vista de Éxito
  if (completedOrder) {
    return (
      <div className={styles.checkoutPage}>
        <div className={styles.successCard}>
          <span style={{ fontSize: '3.5rem' }}>🔥</span>
          <h1 className={styles.successTitle}>¡PEDIDO CONFIRMADO CON ÉXITO!</h1>
          <p style={{ fontSize: '1.1rem', margin: 0 }}>
            Orden <strong>#{completedOrder.orderId}</strong>
          </p>
          <p style={{ color: '#a0a0a5', lineHeight: '1.6', maxWidth: '480px' }}>
            Gracias por tu compra, <strong>{completedOrder.name}</strong>.{' '}
            {completedOrder.isAddiPayment
              ? 'Tu crédito con Addi fue aprobado exitosamente. Procesaremos el envío de tus sneakers de inmediato.'
              : completedOrder.isBoldPayment
                ? 'Hemos recibido la confirmación de tu pago en línea con Bold. Procesaremos tu envío de inmediato.'
                : completedOrder.whatsappOpened
                  ? 'Se ha abierto una ventana de WhatsApp para coordinar la entrega directamente con nuestro equipo.'
                  : 'Toca el botón de abajo para enviarnos tu pedido por WhatsApp y coordinar la entrega.'}
          </p>
          {completedOrder.whatsappUrl && (
            <a
              href={completedOrder.whatsappUrl}
              target='_blank'
              rel='noopener noreferrer'
              className={styles.submitBtn}
              style={{ width: 'auto', padding: '0.9rem 2rem', textDecoration: 'none', textAlign: 'center' }}
            >
              ABRIR WHATSAPP →
            </a>
          )}
          <button
            type='button'
            className={styles.submitBtn}
            style={{ width: 'auto', padding: '0.9rem 2rem' }}
            onClick={() => navigate('/')}
          >
            VOLVER AL INICIO →
          </button>
        </div>
      </div>
    )
  }

  // 2. Vista de Carrito Vacío
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

  // 3. Vista Principal del Checkout
  return (
    <div className={styles.checkoutPage}>
      <h1 className={styles.title}>FINALIZAR PEDIDO</h1>

      {isCheckingAddiOrder && (
        <div className={styles.addiStatusBanner} role='status'>
          <span>⏳ Verificando el estado de tu solicitud con Addi...</span>
        </div>
      )}

      {addiReturnNotice && (
        <div className={styles.addiAlertBanner} role='alert'>
          <span>⚠️ {addiReturnNotice}</span>
        </div>
      )}

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

                    {/* Manejo de topes según docs/addi.md Sección 1: no ocultar, deshabilitar y mostrar disclaimer */}
                    {!isAddiAllowed && (
                      <div className={styles.addiDisclaimer}>
                        Aplica solo para compras entre {formatPrice(addiConfig.minAmount)} y {formatPrice(addiConfig.maxAmount)} COP. Agrega más productos a tu bolsa para activar Addi.
                      </div>
                    )}

                    {/* Descuento puramente visual según docs/addi.md Sección 1 */}
                    {isAddiAllowed && addiConfig.isDiscountVisible && addiConfig.discount > 0 && (
                      <div className={styles.addiPolicyNote}>
                        ✨ Tienes un {Math.round(addiConfig.discount * 100)}% de descuento aplicable directamente en la pasarela de Addi sobre el total de {formatPrice(total)}.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Opción 2: Transferencia */}
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

              {/* Opción 3: Bold Pasarela en línea */}
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
