/**
 * HeroSection.jsx
 * Sección 1 de la Home según el plan:
 * Frase manuscrita, titular condensado, descripción urbana y botón "Comprar ahora" hacia /catalogo.
 * Todos los copys y textos en español.
 */

import { Link } from 'react-router-dom'
import styles from './HeroSection.module.css'

export default function HeroSection () {
  return (
    <section className={styles.hero} aria-label='Presentación principal'>
      <div className={styles.inner}>
        <div className={styles.content}>
          <span className={styles.scriptTag}>Domina las calles</span>
          <h1 className={styles.title}>
            CREADOS<br />
            DIFERENTE<span className={styles.accentDot}>.</span>
          </h1>
          <p className={styles.subtitle}>
            Streetwear y sneakers que rompen las reglas. Consigue las siluetas más buscadas con envíos contraentrega a toda Colombia y garantía de 30 días.
          </p>

          <div className={styles.actions}>
            <Link to='/catalogo' className={styles.ctaBtn}>
              <span>COMPRAR AHORA</span>
              <span>→</span>
            </Link>
            <Link to='/catalogo?oferta=1' className={styles.ctaSecondary}>
              VER OFERTAS
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
