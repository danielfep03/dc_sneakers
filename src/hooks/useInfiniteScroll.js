/**
 * useInfiniteScroll.js
 * Hook personalizado para implementar Infinite Scroll mediante IntersectionObserver.
 * Sigue la regla del plan (Sección 8.3):
 * - Observa un elemento centinela al final de la lista.
 * - Dispara 'onLoadMore' cuando el centinela entra al viewport y 'hasMore' es true.
 */

import { useEffect, useRef, useCallback } from 'react'

export function useInfiniteScroll ({
  onLoadMore,
  hasMore = false,
  isLoading = false,
  rootMargin = '250px'
}) {
  const sentinelRef = useRef(null)

  const handleObserver = useCallback(
    (entries) => {
      const [target] = entries
      if (target.isIntersecting && hasMore && !isLoading) {
        onLoadMore()
      }
    },
    [hasMore, isLoading, onLoadMore]
  )

  useEffect(() => {
    const element = sentinelRef.current
    if (!element) return

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin,
      threshold: 0
    })

    observer.observe(element)

    return () => {
      if (element) observer.unobserve(element)
    }
  }, [handleObserver, rootMargin])

  return { sentinelRef }
}
