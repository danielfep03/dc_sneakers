import { SNEAKERS_DATA } from '@/data/sneakers'
import { formatPrice } from '@/utils/formatPrice'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './SalesNotificationToast.module.css'

const BUYERS = [
  { name: 'Mateo', city: 'Medellín' },
  { name: 'Valentina', city: 'Bogotá' },
  { name: 'Sebastián', city: 'Cali' },
  { name: 'Camila', city: 'Barranquilla' },
  { name: 'Andrés', city: 'Bucaramanga' },
  { name: 'Mariana', city: 'Pereira' },
  { name: 'Felipe', city: 'Manizales' },
  { name: 'Daniela', city: 'Cartagena' },
  { name: 'Alejandro', city: 'Envigado' },
  { name: 'Sofía', city: 'Ibagué' }
]

const TIME_AGOS = [
  'Hace 2 minutos',
  'Hace 4 minutos',
  'Hace 6 minutos',
  'Hace 9 minutos',
  'Hace 12 minutos',
  'Hace 15 minutos'
]

export default function SalesNotificationToast () {
  const [currentNotification, setCurrentNotification] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (SNEAKERS_DATA.length === 0) return

    let displayTimeout
    let nextTimeout

    const triggerNotification = () => {
      const randomBuyer = BUYERS[Math.floor(Math.random() * BUYERS.length)]
      const randomProduct = SNEAKERS_DATA[Math.floor(Math.random() * SNEAKERS_DATA.length)]
      const randomTime = TIME_AGOS[Math.floor(Math.random() * TIME_AGOS.length)]

      setCurrentNotification({
        buyer: randomBuyer,
        product: randomProduct,
        timeAgo: randomTime
      })
      setIsVisible(true)

      // Permanece visible 5.5 segundos
      displayTimeout = setTimeout(() => {
        setIsVisible(false)

        // Vuelve a aparecer en un lapso de 11 a 15 segundos
        const delay = Math.floor(11000 + Math.random() * 4000)
        nextTimeout = setTimeout(triggerNotification, delay)
      }, 5500)
    }

    // Primer disparo a los 4 segundos tras cargar la página
    nextTimeout = setTimeout(triggerNotification, 4000)

    return () => {
      clearTimeout(displayTimeout)
      clearTimeout(nextTimeout)
    }
  }, [])

  if (!currentNotification) return null

  return (
    <div
      className={`${styles.toastWrapper} ${isVisible ? styles.toastVisible : styles.toastHidden}`}
      role='status'
      aria-live='polite'
    >
      <div className={styles.toastCard}>
        {/* Botón cerrar para descartar manualmente */}
        <button
          type='button'
          className={styles.closeBtn}
          onClick={() => setIsVisible(false)}
          aria-label='Cerrar notificación'
        >
          ✕
        </button>

        {/* Thumbnail del sneaker */}
        <Link
          to={`/producto/${currentNotification.product.id}`}
          className={styles.imgLink}
        >
          <img
            src={currentNotification.product.image}
            alt={currentNotification.product.name}
            className={styles.sneakerThumb}
          />
          <span className={styles.fireBadge}>🔥</span>
        </Link>

        {/* Información de compra */}
        <div className={styles.content}>
          <div className={styles.headerRow}>
            <span className={styles.verifiedTag}>
              <span className={styles.verifiedDot} /> COMPRA VERIFICADA
            </span>
            <span className={styles.timeAgo}>{currentNotification.timeAgo}</span>
          </div>

          <p className={styles.buyerText}>
            <strong>{currentNotification.buyer.name}</strong> en {currentNotification.buyer.city} acaba de comprar:
          </p>

          <Link
            to={`/producto/${currentNotification.product.id}`}
            className={styles.productLink}
            title={currentNotification.product.name}
          >
            {currentNotification.product.name}
          </Link>

          <div className={styles.priceRow}>
            <span className={styles.price}>{formatPrice(currentNotification.product.price)}</span>
            <span className={styles.freeShip}>• Envío gratis 🇨🇴</span>
          </div>
        </div>
      </div>
    </div>
  )
}

