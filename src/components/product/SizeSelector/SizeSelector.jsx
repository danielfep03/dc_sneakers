/**
 * SizeSelector.jsx
 * Selector de tallas según el plan (Sección 8.5):
 * - Tallas disponibles activas.
 * - Tallas con stock: 0 aparecen deshabilitadas y tachadas.
 * - Enlace a "Guía de tallas" que abre SizeGuideModal mediante uiStore.
 * Copys 100% en español.
 */

import { useUIStore } from '@/stores/uiStore'
import styles from './SizeSelector.module.css'

export default function SizeSelector ({
  sizes = [],
  selectedSize,
  onSelectSize,
  hasError = false
}) {
  const openSizeGuide = useUIStore((state) => state.openSizeGuide)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.label}>TALLA (COLOMBIA / EU):</span>
        <button
          type='button'
          className={styles.guideBtn}
          onClick={openSizeGuide}
        >
          Guía de tallas 📏
        </button>
      </div>

      <div className={styles.grid}>
        {sizes.map((s) => {
          const isOutOfStock = s.stock === 0
          const isSelected = selectedSize === s.size

          return (
            <button
              key={s.size}
              type='button'
              className={`${styles.sizeBtn} ${
                isSelected ? styles.active : ''
              } ${isOutOfStock ? styles.disabled : ''}`}
              disabled={isOutOfStock}
              onClick={() => onSelectSize(s.size)}
              aria-label={`Talla ${s.size} ${isOutOfStock ? 'Agotada' : 'Disponible'}`}
            >
              {s.size}
            </button>
          )
        })}
      </div>

      {hasError && !selectedSize && (
        <p className={styles.warning}>
          * Por favor selecciona tu talla antes de continuar.
        </p>
      )}
    </div>
  )
}
