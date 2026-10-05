/**
 * useCatalog.js
 * Hooks de datos del catálogo desde Supabase (productos y categorías).
 * Los servicios cachean en memoria, así que montar varios componentes que
 * usan estos hooks no repite la consulta.
 */

import { getCategories } from '@/services/categoryService'
import { getAllProducts } from '@/services/productService'
import { useCallback, useEffect, useState } from 'react'

function useAsync (loader) {
  const [state, setState] = useState({ data: [], loading: true, error: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    setState((s) => ({ ...s, loading: true, error: null }))
    loader()
      .then((data) => active && setState({ data, loading: false, error: null }))
      .catch((error) => {
        console.error('Error cargando datos desde Supabase:', error)
        active && setState({ data: [], loading: false, error })
      })
    return () => {
      active = false
    }
  }, [loader, attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])
  return { ...state, retry }
}

const loadProducts = () => getAllProducts()

export function useProducts () {
  const { data, loading, error, retry } = useAsync(loadProducts)
  return { products: data, loading, error, retry }
}

export function useCategories () {
  const { data, loading, error, retry } = useAsync(getCategories)
  return { categories: data, loading, error, retry }
}
