/**
 * MobileMenu.jsx
 * Menú lateral móvil según el plan (Sección 8.1):
 * - Panel lateral con categorías, marcas y acceso a favoritos.
 * - Cierra con tecla Escape, clic fuera y al hacer clic en un enlace.
 * - Copys 100% en español.
 */

import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useUIStore } from '@/stores/uiStore'
import Logo from '@/components/ui/Logo'
import styles from './MobileMenu.module.css'

export default function MobileMenu () {
  const isOpen = useUIStore((state) => state.isMobileMenuOpen)
  const closeMenu = useUIStore((state) => state.closeMobileMenu)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeMenu()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, closeMenu])

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={closeMenu} aria-modal='true' role='dialog'>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <Logo variant='header' />
          <button
            type='button'
            className={styles.closeBtn}
            onClick={closeMenu}
            aria-label='Cerrar menú'
          >
            ✕
          </button>
        </div>

        <nav>
          <div className={styles.sectionTitle}>EXPLORAR</div>
          <ul className={styles.navLinks}>
            <li>
              <Link to='/catalogo' className={styles.link} onClick={closeMenu}>
                <span>TODO EL CATÁLOGO</span>
                <span className={styles.arrow}>→</span>
              </Link>
            </li>
            <li>
              <Link to='/catalogo?oferta=1' className={styles.link} onClick={closeMenu} style={{ color: 'var(--color-danger)' }}>
                <span>OFERTAS ESPECIALES</span>
                <span className={styles.arrow}>→</span>
              </Link>
            </li>
            <li>
              <Link to='/catalogo?favoritos=1' className={styles.link} onClick={closeMenu}>
                <span>MIS FAVORITOS</span>
                <span className={styles.arrow}>→</span>
              </Link>
            </li>
          </ul>

          <div className={styles.sectionTitle}>MARCAS</div>
          <ul className={styles.navLinks}>
            <li>
              <Link to='/catalogo?marca=nike' className={styles.link} onClick={closeMenu}>
                <span>NIKE</span>
              </Link>
            </li>
            <li>
              <Link to='/catalogo?marca=jordan' className={styles.link} onClick={closeMenu}>
                <span>JORDAN</span>
              </Link>
            </li>
            <li>
              <Link to='/catalogo?marca=adidas' className={styles.link} onClick={closeMenu}>
                <span>ADIDAS</span>
              </Link>
            </li>
            <li>
              <Link to='/catalogo?marca=new-balance' className={styles.link} onClick={closeMenu}>
                <span>NEW BALANCE</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}
