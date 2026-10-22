import { useState } from 'react'
import { storeConfig } from '@/config/storeConfig'
import styles from './WhatsAppButton.module.css'

export default function WhatsAppButton () {
  const [isHovered, setIsHovered] = useState(false)

  const defaultMessage = '¡Hola DC SNEAKERS! Quisiera asesoría con un pedido o disponibilidad de siluetas.'
  const whatsappUrl = `https://wa.me/${storeConfig.whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`

  return (
    <div
      className={styles.container}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`${styles.tooltip} ${isHovered ? styles.tooltipVisible : ''}`}>
        <span className={styles.tooltipPulse} />
        <span className={styles.tooltipText}>¿Asesoría con tu talla? Escríbenos</span>
      </div>

      <a
        href={whatsappUrl}
        target='_blank'
        rel='noopener noreferrer'
        className={styles.button}
        aria-label='Contactar a DC SNEAKERS por WhatsApp'
      >
        <span className={styles.pulseRing} />
        <svg
          viewBox='0 0 24 24'
          className={styles.icon}
          aria-hidden='true'
        >
          <path
            fillRule='evenodd'
            clipRule='evenodd'
            d='M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.16C10.57 20.16 9.12 19.76 7.85 19.01L7.55 18.83L4.44 19.65L5.27 16.61L5.07 16.3C4.24 14.98 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.68 12.05 3.68C14.25 3.68 16.32 4.54 17.87 6.09C19.42 7.64 20.28 9.72 20.27 11.92C20.27 16.46 16.58 20.16 12.05 20.16ZM16.56 14.37C16.31 14.25 15.09 13.65 14.86 13.57C14.63 13.48 14.47 13.44 14.3 13.69C14.14 13.94 13.67 14.5 13.52 14.67C13.38 14.84 13.23 14.86 12.98 14.73C12.73 14.61 11.93 14.35 10.98 13.5C10.24 12.84 9.74 12.03 9.6 11.78C9.45 11.53 9.58 11.4 9.71 11.27C9.82 11.16 9.96 10.99 10.08 10.84C10.2 10.69 10.25 10.59 10.33 10.42C10.41 10.26 10.37 10.11 10.31 9.99C10.25 9.87 9.76 8.66 9.56 8.16C9.36 7.68 9.16 7.74 9.01 7.74H8.54C8.37 7.74 8.1 7.8 7.87 8.05C7.64 8.3 7 8.9 7 10.12C7 11.34 7.89 12.52 8.01 12.69C8.13 12.86 9.76 15.37 12.25 16.44C12.84 16.7 13.3 16.85 13.66 16.97C14.25 17.16 14.79 17.13 15.22 17.07C15.7 17 16.69 16.47 16.9 15.89C17.11 15.31 17.11 14.81 17.05 14.71C16.99 14.61 16.82 14.54 16.56 14.37Z'
            fill='currentColor'
          />
        </svg>
      </a>
    </div>
  )
}
