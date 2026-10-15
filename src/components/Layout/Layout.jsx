import { Outlet } from 'react-router-dom'

import CartDrawer from '@/components/CartDrawer/CartDrawer'
import Footer from '@/components/Footer/Footer'
import Header from '@/components/Header/Header'
import SalesNotificationToast from '@/components/SalesNotificationToast/SalesNotificationToast'

import styles from './Layout.module.css'

export default function Layout () {
  return (
    <div className={styles.ecommerceWrapper}>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <SalesNotificationToast />
    </div>
  )
}
