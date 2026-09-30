/**
 * catalogStore.js
 * Store de Zustand para la gestión de filtros, orden y búsqueda del catálogo.
 * Soporta sincronización bidireccional con Query Params en la URL.
 */

import { create } from 'zustand'

const initialFilters = {
  brands: [], // ['nike', 'adidas', ...]
  categories: [], // ['lifestyle', 'basketball', ...]
  sizes: [], // [38, 40, 42, ...]
  priceRange: { min: null, max: null },
  onlyOffers: false
}

export const useCatalogStore = create((set) => ({
  filters: { ...initialFilters },
  sort: 'newest', // 'newest' | 'price-asc' | 'price-desc'

  /**
   * Establece un filtro específico por clave.
   */
  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value
      }
    })),

  /**
   * Alterna un valor dentro de un filtro de tipo arreglo (brands, categories, sizes).
   */
  toggleFilterValue: (key, value) =>
    set((state) => {
      const currentList = state.filters[key] || []
      const exists = currentList.includes(value)
      const updatedList = exists
        ? currentList.filter((item) => item !== value)
        : [...currentList, value]

      return {
        filters: {
          ...state.filters,
          [key]: updatedList
        }
      }
    }),

  /**
   * Cambia el criterio de ordenamiento.
   */
  setSort: (sortOption) => set({ sort: sortOption }),

  /**
   * Restablece todos los filtros al estado inicial.
   */
  clearFilters: () => set({ filters: { ...initialFilters } }),

  /**
   * Inicializa o sincroniza los filtros desde los query params de la URL.
   */
  syncFromUrlParams: (searchParams) => {
    const brands = searchParams.getAll('marca')
    const categories = searchParams.getAll('categoria')
    const onlyOffers = searchParams.get('oferta') === '1'
    const sort = searchParams.get('orden') || 'newest'

    set((state) => ({
      sort,
      filters: {
        ...state.filters,
        brands: brands.length > 0 ? brands : state.filters.brands,
        categories: categories.length > 0 ? categories : state.filters.categories,
        onlyOffers: onlyOffers || state.filters.onlyOffers
      }
    }))
  }
}))
