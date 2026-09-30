import { Link } from 'react-router-dom'
import store from '/store.jpeg'
import styles from './StoreBanner2.module.css'

export default function StoreBanner2 () {
  return (
    <section className={styles.storeBannerSection}>
      <div className={styles.bannerCard}>
        <div className={styles.imageSide}>
          <img
            src={store}
            alt='DC Sneakers Showroom'
            className={styles.storeImage}
            loading='lazy'
          />

          <div className={styles.imageOverlay} />

          <div className={styles.neonSticker}>
            <span>VISITA</span>
            <span>NUESTRA</span>
            <span>TIENDA</span>
          </div>

          <div className={styles.photoBadge}>
            <span className={styles.livePulse} />
            <span>SHOWROOM OFICIAL // COLOMBIA</span>
          </div>
        </div>

        <div className={styles.textSide}>
          <span className={styles.tagline}>Experiencia Física</span>
          <h2 className={styles.storeTitle}>
            NUESTRO SHOWROOM & SEDE PRINCIPAL
          </h2>

          <p className={styles.storeDescription}>
            Vive la cultura sneakerhead en persona. Conoce nuestro showroom con las siluetas más exclusivas, asesoría personalizada de tallas y entrega inmediata.
          </p>

          <div className={styles.featuresGrid}>
            <div className={styles.featureItem}>
              <span className={styles.featureDot} />
              <span className={styles.featureText}>Prueba en persona</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureDot} />
              <span className={styles.featureText}>Stock inmediato</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureDot} />
              <span className={styles.featureText}>Asesoría experta</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureDot} />
              <span className={styles.featureText}>Garantía directa</span>
            </div>
          </div>

          <div className={styles.actionRow}>
            <Link to='/categorias' className={styles.locationBtn}>
              <span>EXPLORAR CATÁLOGO</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
