/**
 * uiStore.js
 * Store de Zustand para estados globales de interfaz de usuario.
 * Controla apertura de modales, menús móviles y cajón del carrito.
 */

import { create } from 'zustand'

export const useUIStore = create((set) => ({
  isMobileMenuOpen: false,
  isCartOpen: false,
  isSizeGuideOpen: false,

  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: (forceState) =>
    set((state) => ({
      isCartOpen: forceState !== undefined ? forceState : !state.isCartOpen
    })),

  openSizeGuide: () => set({ isSizeGuideOpen: true }),
  closeSizeGuide: () => set({ isSizeGuideOpen: false })
}))
