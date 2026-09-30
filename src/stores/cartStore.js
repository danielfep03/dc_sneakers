/**
 * cartStore.js
 * Store de Zustand para la gestión del carrito de compras.
 * Sigue fielmente la especificación del plan (Sección 7):
 * - Clave única por ítem: productId + size (misma talla suma cantidad).
 * - Persistido en localStorage con 'persist'.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      /**
       * Agrega un producto al carrito. Si la misma talla ya existe, suma cantidad.
       * @param {Object} product - Objeto del producto
       * @param {number} size - Talla seleccionada
       * @param {number} quantity - Cantidad a agregar (default 1)
       */
      addItem: (product, size, quantity = 1) =>
        set((state) => {
          const unitPrice = product.salePrice || product.price
          const existingIndex = state.items.findIndex(
            (i) => i.productId === product.id && i.size === size
          )

          if (existingIndex > -1) {
            const updated = [...state.items]
            updated[existingIndex].quantity += quantity
            return { items: updated }
          }

          const newItem = {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            image: product.images?.[0] || product.image || '',
            size,
            unitPrice,
            originalPrice: product.price,
            quantity
          }

          return { items: [...state.items, newItem] }
        }),

      /**
       * Elimina un ítem específico del carrito por productId y talla.
       */
      removeItem: (productId, size) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.size === size)
          )
        })),

      /**
       * Actualiza la cantidad de un ítem. Si llega a 0, se remueve.
       */
      updateQuantity: (productId, size, delta) =>
        set((state) => {
          const updated = state.items
            .map((item) => {
              if (item.productId === productId && item.size === size) {
                const newQty = item.quantity + delta
                return newQty > 0 ? { ...item, quantity: newQty } : null
              }
              return item
            })
            .filter(Boolean)

          return { items: updated }
        }),

      /**
       * Vacía completamente el carrito.
       */
      clearCart: () => set({ items: [] }),

      /**
       * Cantidad total de pares/prendas en el carrito.
       */
      getTotalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      /**
       * Subtotal a pagar en COP.
       */
      getSubtotal: () =>
        get().items.reduce(
          (sum, item) => sum + item.unitPrice * item.quantity,
          0
        )
    }),
    {
      name: 'dc_sneakers_cart'
    }
  )
)
