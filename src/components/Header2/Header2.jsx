import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCartStore } from '../../store/useCartStore'
import styles from './Header2.module.css'

export default function Header2 () {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const { toggleCart, getTotalItems } = useCartStore()
  const cartCount = getTotalItems()

  const navLinks = [
    { label: 'CATÁLOGO', path: '/categorias' },
    { label: 'NOVEDADES', path: '/categorias?tag=new' },
    { label: 'MARCAS', path: '/categorias?tag=brands' },
    { label: 'OFERTAS', path: '/categorias?tag=sale' },
    { label: 'LOOKBOOK', path: '/categorias?tag=lookbook' }
  ]

  return (
    <header className={styles.headerContainer}>
      <div className={styles.navRow}>
        {/* 1. Logotipo oficial DC SNEAKERS */}
        <Link to='/' className={styles.brandLink} aria-label='DC SNEAKERS Inicio'>
          <img src='/icon.png' alt='DC SNEAKERS' className={styles.brandLogo} />
          <div className={styles.brandTextWrapper}>
            <span className={styles.brandText}>DC</span>
            <span className={styles.brandScript}>sneakers</span>
          </div>
        </Link>

        {/* 2. Menú Central Desktop */}
        <nav aria-label='Navegación principal'>
          <ul className={styles.navCenter}>
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.path} className={styles.navLink}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* 3. Acciones Derecha (Search, Cart Bag con badge neón, Menú Hamburguesa de dos líneas) */}
        <div className={styles.navActions}>
          {/* Botón Buscar */}
          <button
            type='button'
            className={styles.iconBtn}
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            aria-label='Buscar'
          >
            <svg
              width='19'
              height='19'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <circle cx='11' cy='11' r='7' />
              <line x1='21' y1='21' x2='16.5' y2='16.5' />
            </svg>
          </button>

          {/* Botón Carrito / Bolsa */}
          <button
            type='button'
            className={styles.iconBtn}
            onClick={() => toggleCart(true)}
            aria-label='Bolsa de compras'
          >
            <svg
              width='19'
              height='19'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M6 3h12l2 6v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9l2-6z' />
              <path d='M9 9a3 3 0 0 0 6 0' />
            </svg>
            {cartCount > 0 && (
              <span className={styles.cartBadge}>{cartCount}</span>
            )}
          </button>

          {/* Botón Menú Hamburguesa de dos líneas paralelas horizontales (idéntico a la imagen) */}
          <button
            type='button'
            className={`${styles.burgerBtn} ${isMenuOpen ? styles.burgerBtnActive : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label='Menú'
          >
            <span className={styles.burgerLineTop} />
            <span className={styles.burgerLineBottom} />
          </button>
        </div>
      </div>

      {/* Barra de Búsqueda Desplegable */}
      {isSearchOpen && (
        <div className={styles.searchBar}>
          <div className={styles.searchInner}>
            <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#9e9ea7' strokeWidth='2'>
              <circle cx='11' cy='11' r='7' />
              <line x1='21' y1='21' x2='16.5' y2='16.5' />
            </svg>
            <input
              type='text'
              autoFocus
              className={styles.searchInput}
              placeholder='BUSCAR SNEAKERS...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type='button'
              className={styles.searchClose}
              onClick={() => setIsSearchOpen(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Drawer de Navegación en Mobile */}
      {isMenuOpen && (
        <div className={styles.mobileDrawer}>
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.path}
              className={styles.mobileNavLink}
              onClick={() => setIsMenuOpen(false)}
            >
              <span>{link.label}</span>
              <span style={{ color: '#d4ff00' }}>→</span>
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}

