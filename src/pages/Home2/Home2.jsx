import CultureBanner2 from '@/components/CultureBanner2/CultureBanner2'
import Hero2 from '@/components/Hero2/Hero2'
import Offers2 from '@/components/Offers2/Offers2'
import OutfitLookbook2 from '@/components/OutfitLookbook2/OutfitLookbook2'
import StoreBanner2 from '@/components/StoreBanner2/StoreBanner2'
import styles from './Home2.module.css'

export default function Home2 () {
  return (
    <div className={styles.homeContainer}>
      <Hero2 />
      <Offers2 />
      <CultureBanner2 />
      <StoreBanner2 />
      <OutfitLookbook2 />
    </div>
  )
}
