import React from 'react'
import styles from './DcLogo.module.css'

/**
 * Componente oficial DC SNEAKERS Logo
 * Rediseñado fielmente a partir de la identidad gráfica (Monograma DC entrelazado + texto 'SNEAKERS' + silueta de tenis).
 */
export default function DcLogo ({
  height = 42,
  showText = true,
  className = ''
}) {
  const iconHeight = showText ? height * 0.75 : height
  const textSize = height * 0.24

  return (
    <div className={`${styles.logoContainer} ${className}`}>
      {/* Icono de imagen oficial */}
      <img
        src='/icon.png'
        alt='DC SNEAKERS'
        style={{ height: `${iconHeight}px`, width: 'auto' }}
        className={styles.brandImg}
      />

      {/* Texto SNEAKERS debajo con tipografía extendida */}
      {showText && (
        <span
          className={styles.brandWord}
          style={{ fontSize: `${textSize}px` }}
        >
          SNEAKERS
        </span>
      )}
    </div>
  )
}
