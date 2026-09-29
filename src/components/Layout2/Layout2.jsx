import { Outlet } from 'react-router-dom'

import Header from '@/components/Header2/Header2'
import Footer from '@/components/Footer2/Footer2'
import CartDrawer from '@/components/CartDrawer2/CartDrawer2'

import styles from './Layout2.module.css'

export default function Layout () {
  return (
    <div className={styles.ecommerceWrapper}>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}
