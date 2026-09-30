/**
 * IconButton.jsx
 * Botón accesible para íconos interactivos (Buscar, Carrito, Favoritos, Cerrar, etc.).
 * Regla técnica obligatoria: requiere 'ariaLabel' para accesibilidad.
 */

import styles from './IconButton.module.css'

export default function IconButton ({
  children,
  ariaLabel,
  onClick,
  badgeCount = 0,
  className = '',
  disabled = false,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`${styles.iconBtn} ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={ariaLabel}
      {...props}
    >
      {children}
      {badgeCount > 0 && <span className={styles.badge}>{badgeCount}</span>}
    </button>
  )
}
