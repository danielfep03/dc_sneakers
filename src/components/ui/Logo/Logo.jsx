/**
 * Logo.jsx
 * Logo centralizado de dc_sneakers.
 * Cumple con la prioridad alta del plan (Sección 4):
 * "Grande y siempre visible: en móvil también debe verse claramente".
 * Posee variantes para 'header' y 'footer'.
 */

import { Link } from 'react-router-dom'
import styles from './Logo.module.css'

export default function Logo ({
  variant = 'header', // 'header' | 'footer'
  className = ''
}) {
  return (
    <Link
      to='/'
      className={`${styles.logoLink} ${styles[`${variant}Variant`]} ${className}`}
      aria-label='DC SNEAKERS - Inicio'
    >
      <span className={styles.brandText}>DC</span>
      <span className={styles.scriptText}>sneakers</span>
    </Link>
  )
}
