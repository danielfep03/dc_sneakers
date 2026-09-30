/**
 * StoreBanner.jsx
 * Sección 6 del Home según el plan:
 * Foto de la tienda con el texto obligatorio en español:
 * "Bienvenido a la familia dc_sneakers"
 */

import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'
import styles from './StoreBanner.module.css'

export default function StoreBanner () {
  return (
    <section className={styles.section} aria-label='Nuestra tienda'>
      <div className={styles.bannerCard}>
        <div className={styles.imageWrap}>
          <img
            src='https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80'
            alt='Showroom de DC SNEAKERS'
            className={styles.storeImg}
            loading='lazy'
          />
          <div className={styles.badge}>
            <span>SHOWROOM</span>
            <span>OFICIAL</span>
            <span>COL</span>
          </div>
        </div>

        <div className={styles.content}>
          <span className={styles.tagline}>Cultura y autenticidad</span>
          <h2 className={styles.title}>
            BIENVENIDO A LA FAMILIA DC_SNEAKERS
          </h2>
          <p className={styles.desc}>
            Más que una tienda, somos un punto de encuentro para apasionados del streetwear y la cultura del calzado en Colombia. Te brindamos asesoría personalizada de tallas, fotos 100% reales de bodega y garantía directa.
          </p>

          <div className={styles.features}>
            <div className={styles.featureItem}>
              <span className={styles.dot} />
              <span>Envíos contraentrega</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.dot} />
              <span>Garantía de 30 días</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.dot} />
              <span>Medias de regalo</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.dot} />
              <span>Stock verificado</span>
            </div>
          </div>

          <div>
            <Link to='/catalogo' style={{ textDecoration: 'none' }}>
              <Button variant='primary' size='md'>
                <span>VER COLECCIÓN COMPLETA</span>
                <span>→</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
