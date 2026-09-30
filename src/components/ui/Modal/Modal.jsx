/**
 * Modal.jsx
 * Modal accesible reutilizable.
 * Cumple con las reglas del plan:
 * - Cierre con tecla Escape.
 * - Cierre con clic fuera del contenedor (overlay).
 * - Bloqueo de scroll del body mientras está abierto.
 */

import { useEffect } from 'react'
import styles from './Modal.module.css'

export default function Modal ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '600px'
}) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role='dialog'
      aria-modal='true'
      aria-labelledby='modal-title'
    >
      <div
        className={styles.modalBox}
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 id='modal-title' className={styles.title}>
            {title}
          </h2>
          <button
            type='button'
            className={styles.closeBtn}
            onClick={onClose}
            aria-label='Cerrar modal'
          >
            ✕
          </button>
        </div>

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  )
}
