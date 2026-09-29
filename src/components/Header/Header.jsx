import { Link, useSearchParams } from 'react-router-dom'
import brandLogo from '/icon.png'
import { CATEGORIES } from '../../data/sneakers'
import { useCartStore } from '../../store/useCartStore'
import { useUIStore } from '../../store/useUIStore'
import styles from './Header.module.css'

export default function Header () {
  const [searchParams] = useSearchParams()
  const selectedCategory = searchParams.get('category') || 'ALL'

  const {
    isDarkMode,
    toggleDarkMode,
    isMobileMenuOpen,
    setMobileMenuOpen,
    searchQuery,
    setSearchQuery,
    setShowOrdersModal,
    notificationsActive,
    setNotificationsActive
  } = useUIStore()

  const { toggleCart, getTotalItems } = useCartStore()
  const cartCount = getTotalItems()

  return (
    <>
      {/* Top Banner Ticker */}
      <div className={styles.topTicker}>
        <span>ENVÍOS CONTRAENTREGA A TODA COLOMBIA 🇨🇴 | <span className={styles.topTickerHighlight}>DC SNEAKERS</span> | HASTA 30 DÍAS DE GARANTÍA</span>
      </div>

      {/* Main Premium Navbar */}
      <header className={styles.navbar}>
        {/* Burger Button (visible en mobile) */}
        <button
          className={styles.mobileBurgerBtn}
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          title='Menú de Categorías'
          aria-label='Abrir Menú'
        >
          {isMobileMenuOpen
            ? (
              <svg viewBox='0 0 24 24' width='24' height='24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                <line x1='18' y1='6' x2='6' y2='18' />
                <line x1='6' y1='6' x2='18' y2='18' />
              </svg>
              )
            : (
              <svg viewBox='0 0 24 24' width='24' height='24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                <line x1='3' y1='6' x2='21' y2='6' />
                <line x1='3' y1='12' x2='21' y2='12' />
                <line x1='3' y1='18' x2='21' y2='18' />
              </svg>
              )}
        </button>

        <div className={styles.navLeft}>
          <Link
            to='/'
            className={styles.logoContainer}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img src={brandLogo} alt='DC SNEAKERS' className={styles.logoImg} />
            <div className={styles.logoTextWrapper}>
              <span className={styles.logoTextMain}>DC</span>
              <span className={styles.logoTextSub}>SNEAKERS</span>
            </div>
          </Link>
          <nav className={styles.navLinks}>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                to={cat === 'ALL' ? '/' : `/?category=${cat}`}
                className={`${styles.navLink} ${selectedCategory === cat ? styles.activeLink : ''}`}
              >
                {cat === 'ALL' ? 'Inicio' : cat}
              </Link>
            ))}
            <Link
              to='/collections'
              className={styles.navLink}
            >
              Colecciones
            </Link>
          </nav>
        </div>

        <div className={styles.navCenter}>
          <div className={styles.searchWrapper}>
            <svg className={styles.searchIcon} viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
              <circle cx='11' cy='11' r='8' />
              <line x1='21' y1='21' x2='16.65' y2='16.65' />
            </svg>
            <input
              type='text'
              placeholder='Buscar modelos, marcas, colecciones...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button className={styles.clearSearch} onClick={() => setSearchQuery('')}>
                <svg viewBox='0 0 24 24' width='16' height='16' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                  <line x1='18' y1='6' x2='6' y2='18' />
                  <line x1='6' y1='6' x2='18' y2='18' />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className={styles.navRight}>
          {/* Dark Mode Toggle Button */}
          <button
            className={styles.navActionBtn}
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Cambiar a Modo Claro ☀️' : 'Cambiar a Modo Oscuro 🌙'}
          >
            {isDarkMode
              ? (
                <svg viewBox='0 0 24 24' width='20' height='20' fill='none' stroke='#f59e0b' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                  <circle cx='12' cy='12' r='5' />
                  <line x1='12' y1='1' x2='12' y2='3' />
                  <line x1='12' y1='21' x2='12' y2='23' />
                  <line x1='4.22' y1='4.22' x2='5.64' y2='5.64' />
                  <line x1='18.36' y1='18.36' x2='19.78' y2='19.78' />
                  <line x1='1' y1='12' x2='3' y2='12' />
                  <line x1='21' y1='12' x2='23' y2='12' />
                  <line x1='4.22' y1='19.78' x2='5.64' y2='18.36' />
                  <line x1='18.36' y1='5.64' x2='19.78' y2='4.22' />
                </svg>
                )
              : (
                <svg viewBox='0 0 24 24' width='20' height='20' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                  <path d='M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' />
                </svg>
                )}
          </button>

          {/* User Profile & Orders Modal Trigger */}
          <div
            className={styles.userInfo}
            onClick={() => setShowOrdersModal(true)}
            title='Ver Historial de Pedidos'
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.avatarWrapper}>
              <img
                src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                alt='Tariqul Islam Avatar'
                className={styles.avatar}
              />
              <span className={styles.verifiedDot} />
            </div>
            <div className={styles.userText}>
              <span className={styles.welcomeText}>Mis Pedidos</span>
              <h4 className={styles.userName}>T. ISLAM 📋</h4>
            </div>
          </div>

          {/* Notifications */}
          <button
            className={styles.navActionBtn}
            onClick={() => setNotificationsActive(!notificationsActive)}
            title='Notificaciones'
          >
            <svg viewBox='0 0 24 24' width='22' height='22' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' />
              <path d='M13.73 21a2 2 0 0 1-3.46 0' />
            </svg>
            {notificationsActive && <span className={styles.notificationBadge} />}
          </button>

          {/* Shopping Cart Button */}
          <button
            className={styles.navActionBtn}
            onClick={() => toggleCart(true)}
            title='Carrito de compras'
          >
            <svg viewBox='0 0 24 24' width='22' height='22' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <path d='M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z' />
              <line x1='3' y1='6' x2='21' y2='6' />
              <path d='M16 10a4 4 0 0 1-8 0' />
            </svg>
            {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
          </button>
        </div>
      </header>
    </>
  )
}
