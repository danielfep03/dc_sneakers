import { Outlet } from 'react-router-dom'

import CartDrawer from '@/components/CartDrawer/CartDrawer'
import DiscountPopup from '@/components/DiscountPopup/DiscountPopup'
import Footer from '@/components/Footer/Footer'
import Header from '@/components/Header/Header'
import SalesNotificationToast from '@/components/SalesNotificationToast/SalesNotificationToast'
import WhatsAppButton from '@/components/WhatsAppButton/WhatsAppButton'

import styles from './Layout.module.css'

export default function Layout () {
  return (
    <>
      <div className={styles.ecommerceWrapper}>
        <Header />
        <main>
          <Outlet />
        </main>
        <Footer />
        <CartDrawer />
        <SalesNotificationToast />
      </div>
      <WhatsAppButton />
      <DiscountPopup />
    </>
  )
}
