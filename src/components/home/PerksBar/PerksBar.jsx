/**
 * PerksBar.jsx
 * Sección 2 del Home según el plan:
 * Barra con los 3 beneficios obligatorios en español:
 * 1. 🧦 Par de medias gratis con cada pedido
 * 2. 🛡️ Garantía de 30 días directa
 * 3. 🔄 Cambios por talla sin costo
 */

import styles from './PerksBar.module.css'

export default function PerksBar () {
  return (
    <section className={styles.perksBar} aria-label='Beneficios de compra'>
      <div className={styles.inner}>
        <div className={styles.perkItem}>
          <span className={styles.icon} role='img' aria-label='Medias gratis'>
            🧦
          </span>
          <div className={styles.textGroup}>
            <span className={styles.title}>Par de medias gratis</span>
            <span className={styles.desc}>En todas tus compras de calzado</span>
          </div>
        </div>

        <span className={styles.separator} aria-hidden='true'>
          +
        </span>

        <div className={styles.perkItem}>
          <span className={styles.icon} role='img' aria-label='Garantía'>
            🛡️
          </span>
          <div className={styles.textGroup}>
            <span className={styles.title}>Garantía de 30 días</span>
            <span className={styles.desc}>Calidad y autenticidad asegurada</span>
          </div>
        </div>

        <span className={styles.separator} aria-hidden='true'>
          +
        </span>

        <div className={styles.perkItem}>
          <span className={styles.icon} role='img' aria-label='Cambios'>
            🔄
          </span>
          <div className={styles.textGroup}>
            <span className={styles.title}>Cambios por talla</span>
            <span className={styles.desc}>Rápido y sin complicaciones</span>
          </div>
        </div>
      </div>
    </section>
  )
}
