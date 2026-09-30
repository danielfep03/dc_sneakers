/**
 * useLiveViewers.js
 * Hook según la especificación del plan (Sección 8.5):
 * - Simula un número de espectadores activos entre 3 y 15.
 * - Cambia cada 4 segundos con pequeñas variaciones (±1 a ±3) para sentirse natural.
 * - Limpia el setInterval al desmontar el componente para evitar fugas de memoria.
 */

import { useState, useEffect } from 'react'

export function useLiveViewers (initialMin = 4, initialMax = 12) {
  const [viewers, setViewers] = useState(() => {
    return Math.floor(Math.random() * (initialMax - initialMin + 1)) + initialMin
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setViewers((prev) => {
        // Variación entre -2 y +2
        const delta = Math.floor(Math.random() * 5) - 2
        const next = prev + delta
        // Mantener dentro del rango de 3 a 15
        if (next < 3) return 3
        if (next > 15) return 15
        return next
      })
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return viewers
}
