/**
 * Badge.jsx
 * Etiqueta visual para indicar ofertas, lanzamientos o marcas.
 */

import styles from './Badge.module.css'

export default function Badge ({
  children,
  variant = 'new', // 'sale' | 'new' | 'soldOut' | 'brand'
  className = ''
}) {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${className}`}>
      {children}
    </span>
  )
}
