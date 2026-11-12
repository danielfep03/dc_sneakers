/**
 * SizeGuideModal.jsx
 * Modal con tabla de equivalencias de tallas según el plan:
 * Talla COL/EU, US Hombre, US Mujer y Longitud en CM.
 * Lee sizeGuide.json y se controla con useUIStore.
 * Copys 100% en español.
 */

import { useUIStore } from '@/stores/uiStore'
import Modal from '@/components/ui/Modal'
import sizeGuideData from '@/data/sizeGuide.json'
import styles from './SizeGuideModal.module.css'

export default function SizeGuideModal () {
  const isOpen = useUIStore((state) => state.isSizeGuideOpen)
  const closeGuide = useUIStore((state) => state.closeSizeGuide)

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeGuide}
      title='GUÍA DE TALLAS OFICIAL'
      maxWidth='540px'
    >
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>
        En Colombia utilizamos el tallaje europeo (EU/COL). Te recomendamos medir tu pie en centímetros para elegir tu talla exacta.
      </p>

      <div className={styles.tableWrap}>
        <div className={styles.sectionTitle}>TALLAS PARA CABALLEROS</div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>CO 🇨🇴</th>
              <th>US 🇺🇸</th>
              <th>EUR 🇪🇸</th>
              <th>CM</th>
            </tr>
          </thead>
          <tbody>
            {sizeGuideData.men.map((row) => (
              <tr key={`men-${row.co}`}>
                <td><strong>{row.co}</strong></td>
                <td>{row.us}</td>
                <td>{row.eur}</td>
                <td>{row.cm} cm</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.tableWrap}>
        <div className={styles.sectionTitle}>TALLAS PARA DAMAS</div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>CO 🇨🇴</th>
              <th>US 🇺🇸</th>
              <th>EUR 🇪🇸</th>
              <th>CM</th>
            </tr>
          </thead>
          <tbody>
            {sizeGuideData.women.map((row) => (
              <tr key={`women-${row.co}`}>
                <td><strong>{row.co}</strong></td>
                <td>{row.us}</td>
                <td>{row.eur}</td>
                <td>{row.cm} cm</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.tipBox}>
        <div className={styles.tipTitle}>💡 ¿Cómo medir tu pie?</div>
        <span>Coloca una hoja de papel en el suelo pegada a la pared. Apoya el talón contra la pared y marca la punta de tu dedo más largo. Mide la distancia en centímetros y compárala en la tabla.</span>
      </div>
    </Modal>
  )
}
