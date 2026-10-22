import { Link } from 'react-router-dom'
import styles from './OutfitLookbook.module.css'

export default function OutfitLookbook () {
  const sneakersOnFeet = [
    {
      id: 1,
      title: 'Puma',
      subtitle: 'VER MODELOS RETRO',
      link: '/categorias?category=basketball',
      image: 'https://i.pinimg.com/1200x/eb/3d/92/eb3d9271a91f7b264fdfe02a58d410e9.jpg'
    },
    {
      id: 2,
      title: 'Adidas',
      subtitle: 'VER MODELOS CASUAL',
      link: '/categorias?category=casual',
      image: '/adidas.jpeg'
    },
    {
      id: 3,
      title: 'JORDAN',
      subtitle: 'VER MODELOS RUNNING',
      link: '/categorias?category=running',
      image: 'https://i.pinimg.com/736x/59/ac/c9/59acc94b564ceccb7e5404a627ccb5a2.jpg'
    },
    {
      id: 4,
      title: 'New Balance',
      subtitle: 'VER MODELOS DE CANCHA',
      link: '/categorias?category=basketball',
      image: 'https://i.pinimg.com/1200x/92/b7/e6/92b7e609148e54637fb1a6d5b17c4783.jpg'
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
              <h3 className={styles.lookTitle}>{item.title}</h3>
              <span className={styles.lookSub}>{item.subtitle} →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
