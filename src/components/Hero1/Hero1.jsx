import { useNavigate } from 'react-router-dom'
import { useUIStore } from '../../store/useUIStore'

import styles from './Hero1.module.css'

function Hero1 () {
  const { setShowPromoModal } = useUIStore()
  const navigate = useNavigate()

  return (
    <section className={styles.heroBanner}>
      <div className={styles.heroContent}>
        <span className={styles.heroSubtitle}>DC SNEAKERS • SNEAKERS & STREETWEAR</span>
        <h1 className={styles.heroTitle}>
          EL TEMPLO DEL <br />
          <span className={styles.heroHighlight}>SNEAKERHEAD</span>
        </h1>
        <p className={styles.heroDesc}>
          Descubre las siluetas más icónicas y exclusivas de tenis en Colombia.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            className={styles.heroCTA}
            onClick={() => setShowPromoModal(true)}
          >
            ACTIVAR CUPÓN DC SNEAKERS
          </button>
          <button
            className={styles.heroCTA}
            style={{ backgroundColor: '#1c1c1e', border: '1px solid rgba(255,255,255,0.2)' }}
            onClick={() => navigate('/collections')}
          >
            VER CATÁLOGO COMPLETO →
          </button>
        </div>
      </div>
    </section>
  )
}

export default Hero1
