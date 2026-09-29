import Hero1 from '@/components/Hero1/Hero1'
import Highlines from '@/components/Highlines/Highlines'

import styles from './Home.module.css'

export default function Home () {
  return (
    <div className={styles.homeWrapper}>
      <Hero1 />
      <Highlines />
    </div>
  )
}
