/**
 * ProductGallery.jsx
 * Galería de imágenes del producto según el plan:
 * Imagen principal + miniaturas interactivas.
 */

import { useState } from 'react'
import styles from './ProductGallery.module.css'

export default function ProductGallery ({ images = [], productName = '' }) {
  const [activeIdx, setActiveIdx] = useState(0)

  const activeImage = images[activeIdx] || images[0] || 'https://placehold.co/800x800/141416/c6ff00?text=Sneaker'

  return (
    <div className={styles.gallery}>
      <div className={styles.mainWrapper}>
        <img
          src={activeImage}
          alt={`${productName} vista ${activeIdx + 1}`}
          className={styles.mainImage}
        />
      </div>

      {images.length > 1 && (
        <div className={styles.thumbnails}>
          {images.map((img, idx) => (
            <button
              key={idx}
              type='button'
              className={`${styles.thumbBtn} ${
                activeIdx === idx ? styles.activeThumb : ''
              }`}
              onClick={() => setActiveIdx(idx)}
              aria-label={`Ver imagen ${idx + 1}`}
            >
              <img src={img} alt='' className={styles.thumbImg} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
