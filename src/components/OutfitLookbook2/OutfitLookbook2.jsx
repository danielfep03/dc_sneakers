import { Link } from 'react-router-dom'
import styles from './OutfitLookbook2.module.css'

export default function OutfitLookbook2 () {
  const sneakersOnFeet = [
    {
      id: 1,
      tag: 'SILUETA 01 // BASKETBALL',
      title: 'RETRO HIGH TOPS',
      subtitle: 'VER MODELOS RETRO',
      link: '/categorias?category=basketball',
      image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 2,
      tag: 'SILUETA 02 // CASUAL',
      title: 'DUNK LOW & COURT',
      subtitle: 'VER MODELOS CASUAL',
      link: '/categorias?category=casual',
      image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 3,
      tag: 'SILUETA 03 // RUNNING',
      title: 'TECH RUNNER & SPORT',
      subtitle: 'VER MODELOS RUNNING',
      link: '/categorias?category=running',
      image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 4,
      tag: 'SILUETA 04 // DUELA & CANCHA',
      title: 'PRO PERFORMANCE',
      subtitle: 'VER MODELOS DE CANCHA',
      link: '/categorias?category=basketball',
      image: 'https://images.unsplash.com/photo-1579338559194-a162d19bf842?auto=format&fit=crop&w=800&q=80'
    }
  ]

  return (
    <section className={styles.lookbookSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleGroup}>
          <h2 className={styles.sectionTitle}>SNEAKERS EN LA CALLE // ON-FEET</h2>
          <span className={styles.titleArrow}>→</span>
        </div>
        <Link to='/categorias' className={styles.viewAllLink}>
          EXPLORAR CATÁLOGO <span>→</span>
        </Link>
      </div>

      <div className={styles.lookbookGrid}>
        {sneakersOnFeet.map((item) => (
          <Link
            key={item.id}
            to={item.link}
            className={styles.lookCard}
            title={`Explorar ${item.title}`}
          >
            <img
              src={item.image}
              alt={item.title}
              className={styles.lookImage}
              loading='lazy'
            />
            <div className={styles.cardOverlay}>
              <span className={styles.lookTag}>{item.tag}</span>
              <h3 className={styles.lookTitle}>{item.title}</h3>
              <span className={styles.lookSub}>{item.subtitle} →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
