import { Link } from 'react-router-dom'
import styles from './CultureBanner2.module.css'

export default function CultureBanner2 () {
  const categoriesList = [
    { num: '01', label: 'TENIS BASKETBALL', tag: 'BASKETBALL' },
    { num: '02', label: 'TENIS CASUAL / RETRO', tag: 'CASUAL' },
    { num: '03', label: 'TENIS RUNNING', tag: 'RUNNING' },
    { num: '04', label: 'TENIS VOLEIBOL', tag: 'VOLEIBOL' },
    { num: '05', label: 'TODAS LAS SILUETAS', tag: 'ALL' }
  ]

  return (
    <section className={styles.cultureSection}>
      <div className={styles.cultureGrid}>
        <nav className={styles.categoriesNav} aria-label='Categorías de tenis'>
          {categoriesList.map((item) => (
            <Link
              key={item.num}
              to={`/categorias?category=${item.tag}`}
              className={styles.categoryItem}
            >
              <span className={styles.catNumber}>{item.num}</span>
              <span className={styles.catName}>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.cultureCenter}>
          <svg className={styles.crownIcon} viewBox='0 0 48 36' fill='none'>
            <path
              d='M4 30L10 10L24 24L38 10L44 30H4Z'
              stroke='#d4ff00'
              strokeWidth='2.8'
              strokeLinejoin='round'
              strokeLinecap='round'
            />
            <circle cx='10' cy='8' r='2' fill='#d4ff00' />
            <circle cx='24' cy='22' r='2' fill='#d4ff00' />
            <circle cx='38' cy='8' r='2' fill='#d4ff00' />
          </svg>

          <h2 className={styles.cultureTitle}>
            PASIÓN POR<br />
            LOS SNEAKERS
          </h2>

          <div className={styles.titleUnderline} />

          <p className={styles.cultureDesc}>
            Más que calzado, coleccionamos historia y rendimiento. Siluetas de tenis seleccionadas para dominar la cancha y el asfalto.
          </p>
        </div>

        <div className={styles.photoWrapper}>
          <div className={styles.tapeTopLeft} />

          <img
            src='https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=1000&q=80'
            alt='Tenis icónicos DC Sneakers'
            className={styles.streetPhoto}
            loading='lazy'
          />

          <div className={styles.technicalOverlay}>
            <div className={styles.verticalTag}>
              DC SNEAKERS // TIENDA DE TENIS
            </div>
            <div className={styles.barcode}>
              <span className={styles.barcodeLineThick} />
              <span className={styles.barcodeLine} />
              <span className={styles.barcodeLine} />
              <span className={styles.barcodeLineThick} />
              <span className={styles.barcodeLine} />
              <span className={styles.barcodeLineThick} />
              <span className={styles.barcodeLine} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
