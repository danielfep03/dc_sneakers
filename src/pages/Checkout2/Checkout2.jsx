/**
 * Checkout2.jsx
 * Vista de Checkout V2 en 2 columnas con estética streetwear:
 * - Conectado con useCartStore (cart, getSubtotal, clearCart).
 * - Formulario de contacto con validación colombiana.
 * - Métodos de pago: Contraentrega, Transferencia (con botón copiar cuenta) y Bold Demo.
 * - Resumen con lista de sneakers, medias de regalo y envío gratis.
 * - Finalización con generación de mensaje codificado para WhatsApp (wa.me).
 * Copys 100% en español.
 */

import { storeConfig } from '@/config/storeConfig'
import { confirmBoldPayment, createOrder, OrderError } from '@/services/orderService'
import { useCartStore } from '@/store/useCartStore'
import { buildWhatsappMessage } from '@/utils/buildWhatsappMessage'
import { formatPrice } from '@/utils/formatPrice'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import styles from './Checkout2.module.css'

export default function Checkout2 () {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { cart, getSubtotal, clearCart } = useCartStore()

  const [contact, setContact] = useState({
    name: '',
    phone: '',
    city: '',
    address: '',
    notes: ''
  })

  const [paymentMethod, setPaymentMethod] = useState('cash-on-delivery')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copiedBank, setCopiedBank] = useState(false)
  const [completedOrder, setCompletedOrder] = useState(null)
  const [submitError, setSubmitError] = useState(null)

  // Detectar si el usuario regresa de la pasarela Bold con orden completada
  useEffect(() => {
    const boldReturn = searchParams.get('bold')
    const orderId = searchParams.get('orderId')
    const boldStatus = searchParams.get('bold-status') || searchParams.get('status') || 'approved'
    const txId = searchParams.get('txId') || searchParams.get('bold-tx-id') || null

    if (boldReturn && orderId) {
      clearCart()
      setCompletedOrder({
        orderId,
        name: 'Cliente',
        total: 0,
        isBoldPayment: true
      })

      // Actualizar orden en Supabase directamente (sin requerir webhooks de Bold)
      confirmBoldPayment({ orderId, boldStatus, txId }).then((res) => {
        if (res?.order) {
          setCompletedOrder((prev) => ({
            ...prev,
            name: res.order.customer_name || 'Cliente',
            total: res.order.total || 0
          }))
        }
      })
    }
  }, [searchParams, clearCart])

  const subtotal = getSubtotal()

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

    // Si es Bold Checkout en línea, no abrimos WhatsApp popup
    const isBoldReal = paymentMethod === 'bold'
    const waWindow = !isBoldReal ? window.open('', '_blank') : null

    try {
      // 1. Crear la orden en Supabase (Edge Function: precios y stock se validan en servidor)
      const originUrl = window.location.origin
      const order = await createOrder({ contact, cart, paymentMethod, originUrl })

      // 2. Si el método es Bold (Pagos en línea), abrir la pasarela oficial de Bold
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

      // 3. Generar el mensaje de WhatsApp con el total calculado por el servidor
      const whatsappUrl = buildWhatsappMessage({
        orderId: order.orderId,
        contact,
        items: cart,
        total: order.total,
        paymentMethod
      })

      if (waWindow) waWindow.location.href = whatsappUrl

      // 4. Guardar estado completado y vaciar carrito
      setCompletedOrder({
        orderId: order.orderId,
        name: contact.name,
        total: order.total,
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
            {completedOrder.isBoldPayment
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
      <h1 className={styles.title}>FINALIZAR PEDIDO // CHECKOUT</h1>

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

          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <strong style={{ color: '#fff' }}>{formatPrice(subtotal)}</strong>
          </div>

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
            <span className={styles.totalAmount}>{formatPrice(subtotal)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

