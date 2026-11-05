import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import CultureBanner from '@/components/CultureBanner/CultureBanner'
import GenderCategories from '@/components/GenderCategories/GenderCategories'
import Hero from '@/components/Hero/Hero'
import Offers from '@/components/Offers/Offers'
import OutfitLookbook from '@/components/OutfitLookbook/OutfitLookbook'
import StoreBanner from '@/components/StoreBanner/StoreBanner'
import styles from './Home.module.css'

export default function Home () {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const target = document.querySelector(location.hash)
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 120)
      }
    }
  }, [location])

  return (
    <div className={styles.homeContainer}>
      <Hero />
      <GenderCategories />
      <Offers />
      <CultureBanner />
      <StoreBanner />
      <OutfitLookbook />
    </div>
  )
}
