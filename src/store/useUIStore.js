import { create } from 'zustand'

export const useUIStore = create((set) => ({
  isDarkMode: false,
  isMobileMenuOpen: false,
  searchQuery: '',
  showPromoModal: false,
  showSizeGuide: false,
  showOrdersModal: false,
  notificationsActive: true,

  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setShowPromoModal: (show) => set({ showPromoModal: show }),
  setShowSizeGuide: (show) => set({ showSizeGuide: show }),
  setShowOrdersModal: (show) => set({ showOrdersModal: show }),
  setNotificationsActive: (active) => set({ notificationsActive: active })
}))
