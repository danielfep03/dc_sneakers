/**
 * favoritesStore.js
 * Store de Zustand para la gestión de productos favoritos.
 * Persistido en localStorage con 'persist'.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useFavoritesStore = create(
  persist(
    (set, get) => ({
      favoriteIds: [],

      /**
       * Alterna el estado de favorito de un producto.
       * @param {string} id - ID del producto
       */
      toggleFavorite: (id) =>
        set((state) => {
          const exists = state.favoriteIds.includes(id)
          return {
            favoriteIds: exists
              ? state.favoriteIds.filter((favId) => favId !== id)
              : [...state.favoriteIds, id]
          }
        }),

      /**
       * Verifica si un producto está marcado como favorito.
       * @param {string} id - ID del producto
       */
      isFavorite: (id) => get().favoriteIds.includes(id)
    }),
    {
      name: 'dc_sneakers_favorites'
    }
  )
)
