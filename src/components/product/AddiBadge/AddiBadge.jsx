/**
 * AddiBadge.jsx
 * Bloque informativo visual según el plan (Sección 8.5):
 * "AddiBadge: bloque informativo 'Paga con Addi'. Solo visual por ahora.
 * Dejarlo como componente aislado para conectarlo después".
 * Copys 100% en español.
 */

import styles from './AddiBadge.module.css'

export default function AddiBadge () {
  return (
    <div className={styles.badge} aria-label='Información de pago con Addi'>
      <span className={styles.logo}>addi</span>
      <div className={styles.textGroup}>
        <span className={styles.mainText}>Compra ahora y paga a cuotas con 0% de interés</span>
        <span className={styles.subText}>Sin tarjetas de crédito ni papeleos. Sujeto a aprobación de Addi.</span>
      </div>
    </div>
  )
}
