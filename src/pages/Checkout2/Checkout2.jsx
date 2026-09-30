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
import { useCartStore } from '@/store/useCartStore'
import { formatPrice } from '@/utils/formatPrice'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from './Checkout2.module.css'

export default function Checkout2 () {
  const navigate = useNavigate()
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

  const handleFinalizeOrder = () => {
    if (!validate()) {
      window.scrollTo({ top: 100, behavior: 'smooth' })
      return
    }

    setIsSubmitting(true)

    // Generar ID amigable de orden
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`

    // Método de pago formateado
    const paymentLabel =
      paymentMethod === 'cash-on-delivery'
        ? 'Pago Contraentrega (Efectivo al recibir)'
        : paymentMethod === 'transfer'
          ? 'Transferencia Bancaria'
          : 'Tarjeta / Bold (Demo)'

    // Desglose de productos
    const productLines = cart
      .map(
        (item) =>
          `- ${item.product.name} · Talla EU ${item.size} · x${item.quantity} · ${formatPrice(item.product.price * item.quantity)}`
      )
      .join('\n')

    // Mensaje estructurado de WhatsApp
    const message = `Hola ${storeConfig.name}, quiero confirmar mi pedido #${orderId}

👤 Nombre: ${contact.name}
📞 Teléfono: ${contact.phone}
📍 Dirección: ${contact.address}, ${contact.city}
${contact.notes ? `📝 Notas: ${contact.notes}\n` : ''}
🛒 Productos:
${productLines}

🧦 Incluye par de medias de regalo
🚚 Envío: Gratis a toda Colombia
💰 Total: ${formatPrice(subtotal)}
💳 Método de pago: ${paymentLabel}`

    const encoded = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${storeConfig.whatsappNumber}?text=${encoded}`

    // Abrir WhatsApp en nueva pestaña
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')

    // Guardar estado completado y vaciar carrito
    setCompletedOrder({
      orderId,
      name: contact.name,
      total: subtotal
    })

    clearCart()
    setIsSubmitting(false)
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
            Gracias por tu compra, <strong>{completedOrder.name}</strong>. Se ha abierto una ventana de WhatsApp para coordinar la entrega directamente con nuestro equipo.
          </p>
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

              {/* Opción 3: Bold Demo */}
              <div
                className={`${styles.paymentOption} ${
                  paymentMethod === 'bold-demo' ? styles.paymentSelected : ''
                }`}
                onClick={() => setPaymentMethod('bold-demo')}
              >
                <div className={styles.paymentHeader}>
                  <input
                    type='radio'
                    name='payment'
                    className={styles.radio}
                    checked={paymentMethod === 'bold-demo'}
                    onChange={() => setPaymentMethod('bold-demo')}
                  />
                  <div>
                    <div className={styles.paymentTitle}>TARJETA CRÉDITO / DÉBITO (BOLD DEMO)</div>
                    <div className={styles.paymentDesc}>
                      Simulación de pago en línea seguro con Bold.
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
            {isSubmitting ? 'PROCESANDO ORDEN...' : 'FINALIZAR PEDIDO POR WHATSAPP →'}
          </button>
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

