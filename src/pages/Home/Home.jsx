import CultureBanner from '@/components/CultureBanner/CultureBanner'
import GenderCategories from '@/components/GenderCategories/GenderCategories'
import Hero from '@/components/Hero/Hero'
import Offers from '@/components/Offers/Offers'
import OutfitLookbook from '@/components/OutfitLookbook/OutfitLookbook'
import StoreBanner from '@/components/StoreBanner/StoreBanner'
import styles from './Home.module.css'

export default function Home () {
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
