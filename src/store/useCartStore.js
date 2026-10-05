import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],
      isCartOpen: false,

      toggleCart: (open) => set((state) => ({
        isCartOpen: open !== undefined ? open : !state.isCartOpen
      })),

      addItem: (product, size, color, quantity = 1) => set((state) => {
        const existingIndex = state.cart.findIndex(
          (item) => item.product.id === product.id && item.size === size && item.color.name === color.name
        )

        if (existingIndex > -1) {
          const newCart = [...state.cart]
          newCart[existingIndex].quantity += quantity
          return { cart: newCart, isCartOpen: true }
        }

        return {
          cart: [...state.cart, { product, size, color, quantity }],
          isCartOpen: true
        }
      }),

      removeItem: (index) => set((state) => {
        const newCart = [...state.cart]
        newCart.splice(index, 1)
        return { cart: newCart }
      }),

      updateQuantity: (index, delta) => set((state) => {
        const newCart = [...state.cart]
        const newQty = newCart[index].quantity + delta
        if (newQty > 0) {
          newCart[index].quantity = newQty
        }
        return { cart: newCart }
      }),

      clearCart: () => set({ cart: [] }),

      getTotalItems: () => {
        return get().cart.reduce((sum, item) => sum + item.quantity, 0)
      },

      getSubtotal: () => {
        return get().cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
      }
    }),
    {
      name: 'dc-sneakers-cart-storage',
      // v1: los productos ahora vienen de Supabase (id = slug, colores con variantId).
      // Los carritos guardados antes de la integración no son compatibles y se descartan.
      version: 1,
      migrate: (persistedState, version) =>
        version < 1 ? { ...persistedState, cart: [] } : persistedState
    }
  )
)
