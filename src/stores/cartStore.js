/**
 * cartStore.js
 * Store de Zustand para la gestión del carrito de compras integrado con Supabase.
 * - Soporta variantes por color y talla (variantId) requeridas por orderService y create-order.
 * - Controla apertura y cierre del drawer del carrito (isCartOpen).
 * - Persistido en localStorage con clave 'dc-sneakers-cart-storage'.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],
      isCartOpen: false,
      appliedCoupon: null,

      /**
       * Guarda o actualiza el cupón aplicado.
       */
      applyCoupon: (coupon) => set({ appliedCoupon: coupon }),

      /**
       * Remueve el cupón activo.
       */
      removeCoupon: () => set({ appliedCoupon: null }),

      /**
       * Abre o cierra el drawer lateral del carrito.
       * @param {boolean} [open] - Estado forzado; si se omite, alterna el estado actual.
       */
      toggleCart: (open) =>
        set((state) => ({
          isCartOpen: open !== undefined ? open : !state.isCartOpen
        })),

      /**
       * Agrega un producto al carrito con su talla y variante de color.
       * Si ya existe la misma combinación, incrementa la cantidad.
       */
      addItem: (product, size, color, quantity = 1) =>
        set((state) => {
          const existingIndex = state.cart.findIndex(
            (item) =>
              item.product.id === product.id &&
              item.size === size &&
              item.color.name === color.name
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

      /**
       * Remueve un ítem del carrito por su índice.
       */
      removeItem: (index) =>
        set((state) => {
          const newCart = [...state.cart]
          newCart.splice(index, 1)
          return { cart: newCart }
        }),

      /**
       * Actualiza la cantidad de un ítem por delta (+1 o -1).
       */
      updateQuantity: (index, delta) =>
        set((state) => {
          const newCart = [...state.cart]
          const newQty = newCart[index].quantity + delta
          if (newQty > 0) {
            newCart[index].quantity = newQty
          }
          return { cart: newCart }
        }),

      /**
       * Vacía completamente el carrito y remueve el cupón.
       */
      clearCart: () => set({ cart: [], appliedCoupon: null }),

      /**
       * Total de unidades de calzado en el carrito.
       */
      getTotalItems: () => {
        return get().cart.reduce((sum, item) => sum + item.quantity, 0)
      },

      /**
       * Subtotal calculado en COP.
       */
      getSubtotal: () => {
        return get().cart.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        )
      },

      /**
       * Monto total de descuento en COP según el cupón aplicado.
       */
      getDiscountAmount: () => {
        const { appliedCoupon, getSubtotal } = get()
        if (!appliedCoupon) return 0
        const subtotal = getSubtotal()
        if (appliedCoupon.minSubtotal && subtotal < appliedCoupon.minSubtotal) return 0
        if (appliedCoupon.type === 'percentage') {
          return Math.round((subtotal * appliedCoupon.value) / 100)
        }
        if (appliedCoupon.type === 'fixed') {
          return Math.min(appliedCoupon.value, subtotal)
        }
        return 0
      },

      /**
       * Total a pagar efectivo (Subtotal - Descuento).
       */
      getTotal: () => {
        const subtotal = get().getSubtotal()
        const discount = get().getDiscountAmount()
        return Math.max(0, subtotal - discount)
      }
    }),
    {
      name: 'dc-sneakers-cart-storage',
      version: 1,
      migrate: (persistedState, version) =>
        version < 1 ? { ...persistedState, cart: [] } : persistedState
    }
  )
)

export default useCartStore
