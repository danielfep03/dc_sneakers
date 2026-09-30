/**
 * Button.jsx
 * Botón genérico reutilizable con variantes primary (verde lima), secondary y outline.
 * Soporta etiquetas de enlace (as = 'a' o Link) o botón nativo.
 */

import styles from './Button.module.css'

export default function Button ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline'
  size = 'md', // 'sm' | 'md' | 'lg'
  fullWidth = false,
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) {
  const combinedClasses = [
    styles.btn,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    className
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      className={combinedClasses}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}
