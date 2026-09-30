/**
 * Skeleton.jsx
 * Bloque de carga con animación de brillo (shimmer) para simular contenido.
 */

import styles from './Skeleton.module.css'

export default function Skeleton ({
  width = '100%',
  height = '20px',
  borderRadius,
  className = '',
  style = {}
}) {
  return (
    <div
      className={`${styles.skeleton} ${className}`}
      style={{
        width,
        height,
        ...(borderRadius ? { borderRadius } : {}),
        ...style
      }}
      aria-hidden='true'
    />
  )
}
