/**
 * CheckoutPage.jsx
 * Vista de Checkout en 2 columnas según el plan (Sección 8.6):
 * - Columna izquierda:
 *   1. ContactForm (nombre, celular colombiano, dirección, ciudad).
 *   2. PaymentMethods (Transferencia bancaria con BankTransferInfo, Contraentrega, Bold demo).
 *   3. Botón principal: "FINALIZAR PEDIDO POR WHATSAPP →".
 * - Columna derecha:
 *   OrderSummary (resumen de compra, subtotal, envío gratis, regalo de medias).
 * - Flujo al finalizar:
 *   1. Valida el formulario con checkoutStore.validate().
 *   2. Ejecuta orderService.createOrder(...) (genera ID ORD-XXXX).
 *   3. Construye el mensaje con buildWhatsappMessage(...) y abre wa.me en pestaña nueva.
 *   4. Vacía el carrito y muestra pantalla de confirmación sin recargar.
 * Copys 100% en español.
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '@/stores/cartStore'
import { useCheckoutStore } from '@/stores/checkoutStore'
import { createOrder } from '@/services/orderService'
import { buildWhatsappMessage } from '@/utils/buildWhatsappMessage'
import ContactForm from '@/components/checkout/ContactForm'
import PaymentMethods from '@/components/checkout/PaymentMethods'
import OrderSummary from '@/components/checkout/OrderSummary'
import Button from '@/components/ui/Button'
import styles from './CheckoutPage.module.css'

export default function CheckoutPage () {
  const navigate = useNavigate()

  const items = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clearCart)
  const getSubtotal = useCartStore((state) => state.getSubtotal)

  const contact = useCheckoutStore((state) => state.contact)
  const paymentMethod = useCheckoutStore((state) => state.paymentMethod)
  const validate = useCheckoutStore((state) => state.validate)
  const resetCheckout = useCheckoutStore((state) => state.reset)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completedOrder, setCompletedOrder] = useState(null)

  const subtotal = getSubtotal()

  // Manejo de finalización de compra
  const handleFinalizeOrder = async () => {
    // 1. Validar formulario
    const isValid = validate()
    if (!isValid) {
      window.scrollTo({ top: 120, behavior: 'smooth' })
      return
    }

    setIsSubmitting(true)

    try {
      // 2. Crear orden en el servicio
      const orderResult = await createOrder({
        contact,
        items,
        total: subtotal,
        paymentMethod
      })

      // 3. Generar enlace a WhatsApp
      const whatsappUrl = buildWhatsappMessage({
        orderId: orderResult.orderId,
        contact,
        items,
        total: subtotal,
        paymentMethod
      })

      // 4. Abrir WhatsApp en nueva pestaña
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer')

      // 5. Guardar estado de éxito y vaciar carrito
      setCompletedOrder({
        orderId: orderResult.orderId,
        contactName: contact.name,
        total: subtotal
      })

      clearCart()
      resetCheckout()
    } catch (err) {
      console.error('Error al procesar pedido:', err)
      alert('Hubo un inconveniente al generar tu orden. Por favor intenta nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 1. Estado de Pedido Completado
  if (completedOrder) {
    return (
      <div className={styles.checkoutPage}>
        <div className={styles.successCard}>
          <span style={{ fontSize: '3rem' }}>🎉</span>
          <h1 className={styles.successTitle}>¡PEDIDO REGISTRADO CON ÉXITO!</h1>
          <p style={{ color: '#ffffff', fontSize: '1.05rem', margin: 0 }}>
            Orden <strong>#{completedOrder.orderId}</strong>
          </p>
          <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
            Gracias por tu compra, <strong>{completedOrder.contactName}</strong>. Se ha abierto una ventana de WhatsApp para que nos envíes los detalles y coordinemos la entrega de inmediato.
          </p>
          <div style={{ marginTop: '1rem' }}>
            <Button variant='primary' size='md' onClick={() => navigate('/catalogo')}>
              VOLVER A LA TIENDA →
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // 2. Estado de Carrito Vacío
  if (items.length === 0) {
    return (
      <div className={styles.checkoutPage}>
        <div className={styles.emptyPage}>
          <span style={{ fontSize: '2.5rem' }}>🛒</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: '#ffffff', margin: 0 }}>
            TU BOLSA DE COMPRAS ESTÁ VACÍA
          </h2>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '420px' }}>
            Para realizar un pedido necesitas agregar al menos un sneaker a tu bolsa de compra.
          </p>
          <Link to='/catalogo' style={{ textDecoration: 'none' }}>
            <Button variant='primary' size='md'>
              EXPLORAR EL CATÁLOGO →
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // 3. Vista de Checkout en 2 Columnas
  return (
    <div className={styles.checkoutPage}>
      <h1 className={styles.topTitle}>FINALIZAR TU COMPRA</h1>

      <div className={styles.grid}>
        {/* Columna Izquierda: Datos y Pago */}
        <div className={styles.leftCol}>
          <div className={styles.sectionBox}>
            <div className={styles.sectionHeader}>
              <span className={styles.stepNumber}>1</span>
              <h2 className={styles.sectionTitle}>DATOS DE ENVÍO Y CONTACTO</h2>
            </div>
            <ContactForm />
          </div>

          <div className={styles.sectionBox}>
            <div className={styles.sectionHeader}>
              <span className={styles.stepNumber}>2</span>
              <h2 className={styles.sectionTitle}>MÉTODO DE PAGO</h2>
            </div>
            <PaymentMethods />
          </div>

          {/* Botón de Finalización */}
          <Button
            variant='primary'
            size='lg'
            fullWidth
            onClick={handleFinalizeOrder}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span>GENERANDO ORDEN...</span>
            ) : (
              <span>FINALIZAR PEDIDO POR WHATSAPP →</span>
            )}
          </Button>

          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>
            🔒 Compra 100% segura. Tus datos se usan exclusivamente para la coordinación de la entrega.
          </p>
        </div>

        {/* Columna Derecha: Resumen de Orden */}
        <div>
          <OrderSummary />
        </div>
      </div>
    </div>
  )
}
