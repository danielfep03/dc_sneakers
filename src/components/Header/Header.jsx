import { useState, useRef, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '@/stores/cartStore'
import { useProducts } from '@/hooks/useCatalog'
import { formatPrice } from '@/utils/formatPrice'
import DcLogo from '../common/DcLogo'
import styles from './Header.module.css'

export default function Header () {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const navigate = useNavigate()
  const { products } = useProducts()
  const searchContainerRef = useRef(null)
  const searchInputRef = useRef(null)

  const { toggleCart, getTotalItems } = useCartStore()
  const cartCount = getTotalItems()

  // Cerrar búsqueda con tecla Escape o al hacer click fuera
  useEffect(() => {
    if (!isSearchOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false)
      }
    }

    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isSearchOpen])

  // Enfocar input automáticamente al abrir la búsqueda
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchOpen])

  // Coincidencias en tiempo real para previsualización
  const previewMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (q.length < 2) return []
    return products
      .filter((p) =>
        p.name.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      )
      .slice(0, 5)
  }, [products, searchQuery])

  const totalMatchesCount = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (q.length < 2) return 0
    return products.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    ).length
  }, [products, searchQuery])

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault()
    const clean = searchQuery.trim()
    if (!clean) return
    navigate(`/categorias?q=${encodeURIComponent(clean)}`)
    setIsSearchOpen(false)
  }

  const handleSelectProduct = (productId) => {
    setIsSearchOpen(false)
    setSearchQuery('')
    navigate(`/producto/${productId}`)
  }

  const handleScrollToAddi = (e) => {
    const el = document.getElementById('addi-financiacion')
    if (el) {
      e.preventDefault()
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setIsMenuOpen(false)
    setIsSearchOpen(false)
  }

  const navLinks = [
    { label: 'CATÁLOGO', path: '/categorias' },
    { label: 'NOVEDADES', path: '/categorias?tag=new' },
    { label: 'MARCAS', path: '/categorias?tag=brands' },
    { label: 'OFERTAS', path: '/categorias?tag=sale' },
    { label: 'LOOKBOOK', path: '/categorias?tag=lookbook' }
  ]

  return (
    <header className={styles.headerContainer}>
      {/* Barra superior de financiamiento Addi (Visible en versión mobile) */}
      <Link
        to='/#addi-financiacion'
        onClick={handleScrollToAddi}
        className={styles.mobileTopBar}
        aria-label='Financiación Addi: Paga a cuotas'
      >
        <div className={styles.mobileTopBarInner}>
          <img src='/addi.png' alt='Addi' className={styles.addiTopLogo} />
          <span className={styles.mobileTopBarText}>Paga a cuotas con Addi</span>
          <span className={styles.mobileTopBarBadge}>0% INTERÉS</span>
          <span className={styles.mobileTopBarArrow}>→</span>
        </div>
      </Link>

      <div className={styles.navRow}>
        {/* Mobile Left: Botón Menú Hamburguesa */}
        <div className={styles.navMobileLeft}>
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

        {/* 1. Logotipo oficial DC SNEAKERS */}
        <Link to='/' className={styles.brandLink} aria-label='DC SNEAKERS Inicio'>
          <DcLogo height={42} layout='stacked' />
        </Link>

        {/* 2. Menú Central Desktop */}
        <nav className={styles.desktopNav} aria-label='Navegación principal'>
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

        {/* 3. Acciones Derecha (Buscar, luego Carrito) */}
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
        </div>
      </div>

      {/* Barra de Búsqueda Desplegable */}
      {isSearchOpen && (
        <div className={styles.searchBar} ref={searchContainerRef}>
          <div className={styles.searchWrapper}>
            <form onSubmit={handleSearchSubmit} className={styles.searchInner}>
              <button
                type='submit'
                className={styles.searchSubmitBtn}
                aria-label='Ejecutar búsqueda'
              >
                <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                  <circle cx='11' cy='11' r='7' />
                  <line x1='21' y1='21' x2='16.5' y2='16.5' />
                </svg>
              </button>

              <input
                ref={searchInputRef}
                type='text'
                className={styles.searchInput}
                placeholder='BUSCAR POR MODELO, MARCA O CATEGORÍA...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {searchQuery && (
                <button
                  type='button'
                  className={styles.searchClearBtn}
                  onClick={() => setSearchQuery('')}
                  aria-label='Borrar búsqueda'
                >
                  ✕
                </button>
              )}

              <button
                type='button'
                className={styles.searchClose}
                onClick={() => setIsSearchOpen(false)}
                aria-label='Cerrar barra de búsqueda'
              >
                ✕
              </button>
            </form>

            {/* Dropdown de Resultados Rápidos (Live Search) */}
            {searchQuery.trim().length >= 2 && (
              <div className={styles.searchDropdown}>
                {previewMatches.length > 0
                  ? (
                    <>
                      <div className={styles.dropdownHeader}>
                        <span className={styles.dropdownTitle}>SUGERENCIAS ({totalMatchesCount})</span>
                        <button
                          type='button'
                          className={styles.dropdownViewAllBtn}
                          onClick={handleSearchSubmit}
                        >
                          Ver en catálogo →
                        </button>
                      </div>

                      <div className={styles.previewList}>
                        {previewMatches.map((product) => (
                          <div
                            key={product.id}
                            className={styles.previewItem}
                            onClick={() => handleSelectProduct(product.id)}
                            role='button'
                            tabIndex={0}
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className={styles.previewThumb}
                            />
                            <div className={styles.previewInfo}>
                              <span className={styles.previewBrand}>{product.brand}</span>
                              <span className={styles.previewName}>{product.name}</span>
                            </div>
                            <div className={styles.previewPriceGroup}>
                              <span className={styles.previewPrice}>{formatPrice(product.price)}</span>
                              {product.originalPrice && (
                                <span className={styles.previewOldPrice}>
                                  {formatPrice(product.originalPrice)}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className={styles.dropdownFooter}>
                        <button
                          type='button'
                          className={styles.viewAllResultsBtn}
                          onClick={handleSearchSubmit}
                        >
                          VER TODOS LOS {totalMatchesCount} RESULTADOS →
                        </button>
                      </div>
                    </>
                    )
                  : (
                    <div className={styles.emptyPreview}>
                      <p className={styles.emptyPreviewText}>
                        No encontramos sneakers para "{searchQuery}".
                      </p>
                      <button
                        type='button'
                        className={styles.emptyPreviewBtn}
                        onClick={handleSearchSubmit}
                      >
                        Explorar todo el catálogo
                      </button>
                    </div>
                    )}
              </div>
            )}
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
              <span style={{ color: '#304FFE' }}>→</span>
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
