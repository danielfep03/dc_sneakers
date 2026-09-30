/**
 * SectionTitle.jsx
 * Encabezado estándar para secciones principales (New Drops, Ofertas, Lookbook).
 * Combina tipografía brutalista (Bebas Neue) con acento script opcional.
 */

import styles from './SectionTitle.module.css'

export default function SectionTitle ({
  title,
  subtitle,
  action,
  showArrow = true,
  className = ''
}) {
  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.titleGroup}>
        {subtitle && <span className={styles.scriptSubtitle}>{subtitle}</span>}
        <h2 className={styles.mainTitle}>
          {title}
          {showArrow && <span className={styles.arrow}>→</span>}
        </h2>
      </div>

      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}
