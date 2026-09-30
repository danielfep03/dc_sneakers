/**
 * Footer.jsx
 * Footer global según el plan (Sección 8.1):
 * - Logo grande y visible.
 * - Enlaces a categorías y marcas.
 * - Medios de pago y garantías.
 * - Copys 100% en español.
 */

import { Link } from 'react-router-dom'
import Logo from '@/components/ui/Logo'
import styles from './Footer.module.css'

export default function Footer () {
  return (
    <footer className={styles.footer} aria-label='Pie de página'>
      <div className={styles.inner}>
        <div className={styles.grid}>
          {/* Columna Marca */}
          <div className={styles.brandCol}>
            <Logo variant='footer' />
            <p className={styles.tagline}>
              Curaduría exclusiva de las mejores siluetas de calzado y streetwear en Colombia. Envíos contraentrega y 30 días de garantía.
            </p>
          </div>

          {/* Marcas */}
          <div>
            <h4 className={styles.colTitle}>MARCAS OFICIALES</h4>
            <ul className={styles.list}>
              <li><Link to='/catalogo?marca=nike' className={styles.link}>Nike</Link></li>
              <li><Link to='/catalogo?marca=jordan' className={styles.link}>Jordan</Link></li>
              <li><Link to='/catalogo?marca=adidas' className={styles.link}>Adidas</Link></li>
              <li><Link to='/catalogo?marca=new-balance' className={styles.link}>New Balance</Link></li>
            </ul>
          </div>

          {/* Categorías */}
          <div>
            <h4 className={styles.colTitle}>CATEGORÍAS</h4>
            <ul className={styles.list}>
              <li><Link to='/catalogo?categoria=lifestyle' className={styles.link}>Casual & Lifestyle</Link></li>
              <li><Link to='/catalogo?categoria=basketball' className={styles.link}>Basketball</Link></li>
              <li><Link to='/catalogo?categoria=running' className={styles.link}>Running & Retro</Link></li>
              <li><Link to='/catalogo?categoria=skate' className={styles.link}>Skateboarding</Link></li>
              <li><Link to='/catalogo?oferta=1' className={styles.link} style={{ color: 'var(--color-accent)' }}>Ofertas Especiales</Link></li>
            </ul>
          </div>

          {/* Garantías y Soporte */}
          <div>
            <h4 className={styles.colTitle}>COMPRA SEGURA</h4>
            <ul className={styles.list}>
              <li><span className={styles.link}>Pago contraentrega en toda Colombia</span></li>
              <li><span className={styles.link}>Garantía directa de 30 días</span></li>
              <li><span className={styles.link}>Par de medias gratis con tu orden</span></li>
              <li><span className={styles.link}>Fotos 100% reales de bodega</span></li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>© {new Date().getFullYear()} DC SNEAKERS COLOMBIA. TODOS LOS DERECHOS RESERVADOS.</span>
          <span>TIENDA ONLINE DE SNEAKERS Y STREETWEAR</span>
        </div>
      </div>
    </footer>
  )
}
