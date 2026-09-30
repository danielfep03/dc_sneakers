/**
 * HomePage.jsx
 * Vista principal según el plan (Sección 8.2) con las 6 secciones en el orden exacto:
 * 1. HeroSection
 * 2. PerksBar
 * 3. OffersCarousel
 * 4. BrandsSection
 * 5. MoreProducts
 * 6. StoreBanner
 * Todos los textos y copys 100% en español.
 */

import HeroSection from '@/components/home/HeroSection'
import PerksBar from '@/components/home/PerksBar'
import OffersCarousel from '@/components/home/OffersCarousel'
import BrandsSection from '@/components/home/BrandsSection'
import MoreProducts from '@/components/home/MoreProducts'
import StoreBanner from '@/components/home/StoreBanner'

export default function HomePage () {
  return (
    <>
      <HeroSection />
      <PerksBar />
      <OffersCarousel />
      <BrandsSection />
      <MoreProducts />
      <StoreBanner />
    </>
  )
}
