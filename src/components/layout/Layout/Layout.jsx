/**
 * Layout.jsx
 * Envoltura global de la aplicación (Sección 8.1):
 * Renderiza Header, MobileMenu, CartDrawer, Footer y la vista activa (Outlet).
 */

import { Outlet } from 'react-router-dom'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/layout/CartDrawer'
import MobileMenu from '@/components/layout/MobileMenu'
import styles from './Layout.module.css'

export default function Layout () {
  return (
    <div className={styles.layoutWrapper}>
      <Header />
      <MobileMenu />
      <CartDrawer />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
