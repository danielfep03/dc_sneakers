import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './DiscountPopup.module.css'

const STORAGE_KEY = 'dc_first_order_discount_dismissed'
const DISCOUNT_CODE = 'DC10'
const DISCOUNT_PERCENT = '10%'

export default function DiscountPopup () {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Verificar si ya fue cerrado o reclamado en los últimos 7 días
    const dismissedTime = window.localStorage.getItem(STORAGE_KEY)
    if (dismissedTime) {
      const daysSince = (Date.now() - parseInt(dismissedTime, 10)) / (1000 * 60 * 60 * 24)
      if (daysSince < 7) return
    }

    // Mostrar el popup tras 4 segundos de navegación
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 4000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleClose = () => {
    setIsOpen(false)
    window.localStorage.setItem(STORAGE_KEY, Date.now().toString())
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(DISCOUNT_CODE)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  const handleClaimAndShop = async () => {
    await handleCopyCode()
    handleClose()
    navigate('/categorias')
  }

  if (!isOpen) return null

  return (
    <div
      className={styles.backdrop}
      onClick={handleClose}
      role='dialog'
      aria-modal='true'
      aria-labelledby='discount-title'
    >
      <div
        className={styles.dialog}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type='button'
          className={styles.closeBtn}
          onClick={handleClose}
          aria-label='Cerrar descuento'
        >
          ✕
        </button>

        <div className={styles.visualSide}>
          <img
            src='/men.png'
            alt='Streetwear Sneaker Drop'
            className={styles.visualImage}
          />
          <div className={styles.visualOverlay} />
          <div className={styles.visualBadge}>
            <span className={styles.badgePulse} />
            <span>NUEVOS CLIENTES</span>
          </div>
          <div className={styles.discountFloatingTag}>
            <span className={styles.discountNum}>{DISCOUNT_PERCENT}</span>
            <span className={styles.discountOff}>OFF</span>
          </div>
        </div>

        <div className={styles.contentSide}>
          <span className={styles.scriptBadge}>DESBLOQUEA TU BENEFICIO</span>

          <h2 id='discount-title' className={styles.title}>
            {DISCOUNT_PERCENT} OFF EN TU<br />
            PRIMERA COMPRA<span className={styles.accentDot}>.</span>
          </h2>

          <p className={styles.description}>
            Únete a la cultura streetwear. Aplica tu código de descuento en el carrito o menciónalo al pagar por WhatsApp.
          </p>

          <div className={styles.couponContainer}>
            <div className={styles.couponBox}>
              <span className={styles.couponLabel}>CÓDIGO EXCLUSIVO:</span>
              <strong className={styles.couponCode}>{DISCOUNT_CODE}</strong>
            </div>
            <button
              type='button'
              onClick={handleCopyCode}
              className={`${styles.copyBtn} ${copied ? styles.copyBtnSuccess : ''}`}
              title='Copiar código'
            >
              {copied ? '¡COPIADO! ✓' : 'COPIAR'}
            </button>
          </div>

          <button
            type='button'
            className={styles.claimBtn}
            onClick={handleClaimAndShop}
          >
            <span>RECLAMAR Y EXPLORAR SNEAKERS</span>
            <span className={styles.claimArrow}>→</span>
          </button>

          <button
            type='button'
            className={styles.dismissLink}
            onClick={handleClose}
          >
            No gracias, prefiero pagar precio regular
          </button>

          <div className={styles.perksRow}>
            <span>✓ Envíos Contraentrega</span>
            <span>•</span>
            <span>✓ 30 Días Garantía</span>
            <span>•</span>
            <span>✓ Medias de Regalo</span>
          </div>
        </div>
      </div>
    </div>
  )
}
