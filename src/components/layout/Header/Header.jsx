/**
 * Header.jsx
 * Header sticky global según el plan (Sección 8.1):
 * - Logo grande y visible a la izquierda.
 * - Nav de escritorio con enlaces a categorías y catálogo.
 * - Íconos de favoritos y carrito (con contador que lee cartStore).
 * - Copys 100% en español.
 */

import { Link } from 'react-router-dom'
import { useCartStore } from '@/stores/cartStore'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { useUIStore } from '@/stores/uiStore'
import Logo from '@/components/ui/Logo'
import IconButton from '@/components/ui/IconButton'
import styles from './Header.module.css'

export default function Header () {
  const totalCartItems = useCartStore((state) => state.getTotalItems())
  const favoriteCount = useFavoritesStore((state) => state.favoriteIds.length)
  const openCart = useUIStore((state) => state.openCart)
  const openMobileMenu = useUIStore((state) => state.openMobileMenu)

  const navLinks = [
    { label: 'CATÁLOGO', path: '/catalogo' },
    { label: 'NIKE', path: '/catalogo?marca=nike' },
    { label: 'JORDAN', path: '/catalogo?marca=jordan' },
    { label: 'ADIDAS', path: '/catalogo?marca=adidas' },
    { label: 'NEW BALANCE', path: '/catalogo?marca=new-balance' },
    { label: 'OFERTAS', path: '/catalogo?oferta=1' }
  ]

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Botón Hamburguesa Móvil */}
        <button
          type='button'
          className={styles.burgerBtn}
          onClick={openMobileMenu}
          aria-label='Abrir menú de navegación'
        >
          <span className={styles.line} />
          <span className={styles.line} />
        </button>

        {/* Logo Grande */}
        <Logo variant='header' />

        {/* Navegación Desktop */}
        <nav aria-label='Menú principal'>
          <ul className={styles.nav}>
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.path} className={styles.navLink}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Acciones: Favoritos y Carrito */}
        <div className={styles.actions}>
          <Link to='/catalogo?favoritos=1' style={{ textDecoration: 'none' }}>
            <IconButton
              ariaLabel='Mis favoritos'
              badgeCount={favoriteCount}
            >
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
              >
                <path d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' />
              </svg>
            </IconButton>
          </Link>

          <IconButton
            ariaLabel='Ver carrito de compras'
            badgeCount={totalCartItems}
            onClick={openCart}
          >
            <svg
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
            >
              <path d='M6 3h12l2 6v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9l2-6z' />
              <path d='M9 9a3 3 0 0 0 6 0' />
            </svg>
          </IconButton>
        </div>
      </div>
    </header>
  )
}
