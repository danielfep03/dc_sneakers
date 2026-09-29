import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../Header/Header'
import Footer from '../Footer/Footer'
import CartDrawer from '../CartDrawer/CartDrawer'
import { useUIStore } from '../../store/useUIStore'
import { useCartStore } from '../../store/useCartStore'

import styles from './Layout.module.css'

export default function Layout () {
  const { isDarkMode, isMobileMenuOpen, showPromoModal, showSizeGuide, showOrdersModal } = useUIStore()
  const { isCartOpen } = useCartStore()

  useEffect(() => {
    const isAnyModalOpen = isCartOpen || showPromoModal || showSizeGuide || showOrdersModal || isMobileMenuOpen
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isCartOpen, showPromoModal, showSizeGuide, showOrdersModal, isMobileMenuOpen])

  return (
    <div className={`${styles.ecommerceWrapper} ${isDarkMode ? styles.darkTheme : ''}`}>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}
