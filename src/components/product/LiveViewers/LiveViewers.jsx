/**
 * LiveViewers.jsx
 * Indicador de visitantes en vivo según el plan:
 * "👀 X personas están viendo este producto".
 * Copys 100% en español.
 */

import { useLiveViewers } from '@/hooks/useLiveViewers'
import styles from './LiveViewers.module.css'

export default function LiveViewers ({ className = '' }) {
  const viewers = useLiveViewers()

  return (
    <div className={`${styles.container} ${className}`} aria-live='polite'>
      <span className={styles.pulseDot} aria-hidden='true' />
      <span className={styles.text}>
        👀 <strong className={styles.count}>{viewers} personas</strong> están viendo este sneaker ahora mismo
      </span>
    </div>
  )
}
