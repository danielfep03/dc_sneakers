import { Link } from 'react-router-dom'
import styles from './Footer2.module.css'

export default function Footer2 () {
  return (
    <footer className={styles.footerContainer}>
      <div className={styles.footerInner}>
        <div className={styles.topGrid}>
          <div className={styles.brandCol}>
            <div className={styles.footerBrandHeader}>
              <img src='/icon.png' alt='DC SNEAKERS' className={styles.footerLogo} />
              <h3 className={styles.brandTitle}>DC SNEAKERS</h3>
            </div>
            <p className={styles.brandTagline}>
              Curaduría exclusiva de siluetas icónicas y streetwear en Colombia. Envíos contraentrega y garantía directa.
            </p>
          </div>

          <div>
            <h4 className={styles.colTitle}>COLECCIONES</h4>
            <ul className={styles.linksList}>
              <li><Link to='/categorias?category=BASKETBALL' className={styles.footerLink}>BASKETBALL</Link></li>
              <li><Link to='/categorias?category=CASUAL' className={styles.footerLink}>CASUAL & RETRO</Link></li>
              <li><Link to='/categorias?category=RUNNING' className={styles.footerLink}>RUNNING</Link></li>
              <li><Link to='/categorias?category=VOLEIBOL' className={styles.footerLink}>VOLEIBOL</Link></li>
              <li><Link to='/categorias?tag=sale' className={styles.footerLink}>OFERTAS LIMITADAS</Link></li>
            </ul>
          </div>

          <div>
            <h4 className={styles.colTitle}>SOPORTE</h4>
            <ul className={styles.linksList}>
              <li><Link to='/checkout' className={styles.footerLink}>Estado del Pedido</Link></li>
              <li><span className={styles.footerLink}>Envíos Contraentrega</span></li>
              <li><span className={styles.footerLink}>Guía de Tallas EU</span></li>
              <li><span className={styles.footerLink}>Garantía de 30 Días</span></li>
            </ul>
          </div>

          <div>
            <h4 className={styles.colTitle}>ALERTAS DE LANZAMIENTOS</h4>
            <p className={styles.newsletterDesc}>
              Recibe notificaciones prioritarias de los próximos lanzamientos exclusivos.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className={styles.inputRow}>
              <input
                type='email'
                placeholder='TU EMAIL...'
                className={styles.newsletterInput}
                required
              />
              <button type='submit' className={styles.subscribeBtn}>
                UNIRME
              </button>
            </form>
          </div>
        </div>

        <div className={styles.bottomRow}>
          <span>© {new Date().getFullYear()} DC SNEAKERS COLOMBIA. TODOS LOS DERECHOS RESERVADOS.</span>
          <span>CULTURA URBANA Y ARCHIVO DE SNEAKERS // [01]</span>
        </div>
      </div>
    </footer>
  )
}
