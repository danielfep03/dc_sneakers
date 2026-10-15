import { Link } from 'react-router-dom'
import styles from './GenderCategories.module.css'

export default function GenderCategories () {
  const categories = [
    {
      id: 'hombre',
      title: 'HOMBRE',
      scriptLabel: 'STREETWEAR MASCULINO',
      code: '// 01 MASCULINO',
      image: '/men.png',
      alt: 'Streetwear Masculino - DC SNEAKERS',
      path: '/categorias?gender=hombre'
    },
    {
      id: 'mujer',
      title: 'MUJER',
      scriptLabel: 'STREETWEAR FEMENINO',
      code: '// 02 FEMENINO',
      image: '/women.jpg',
      alt: 'Streetwear Femenino - DC SNEAKERS',
      path: '/categorias?gender=mujer'
    }
  ]

  return (
    <section className={styles.section} aria-label='Categorías por género'>
      <div className={styles.container}>
        <div className={styles.grid}>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={cat.path}
              className={styles.card}
              aria-label={`Ver colección para ${cat.title}`}
            >
              <div className={styles.imageWrapper}>
                <img
                  src={cat.image}
                  alt={cat.alt}
                  className={styles.image}
                  loading='lazy'
                />
                <div className={styles.overlay} />
              </div>

              <div className={styles.badgeTop}>
                <span className={styles.codeText}>{cat.code}</span>
              </div>

              <div className={styles.content}>
                <span className={styles.scriptBadge}>{cat.scriptLabel}</span>
                <h2 className={styles.title}>{cat.title}</h2>
                <div className={styles.actionRow}>
                  <span className={styles.actionText}>VER COLECCIÓN</span>
                  <span className={styles.actionArrow}>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
