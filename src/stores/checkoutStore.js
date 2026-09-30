/**
 * checkoutStore.js
 * Store de Zustand para la gestión de datos de contacto y pago en el Checkout.
 */

import { create } from 'zustand'

const initialContact = {
  name: '',
  phone: '',
  address: '',
  city: '',
  notes: ''
}

export const useCheckoutStore = create((set, get) => ({
  contact: { ...initialContact },
  paymentMethod: 'transfer', // 'transfer' | 'bold-demo'
  errors: {},

  /**
   * Actualiza un campo individual del formulario de contacto.
   */
  setContactField: (field, value) =>
    set((state) => ({
      contact: { ...state.contact, [field]: value },
      errors: { ...state.errors, [field]: null }
    })),

  /**
   * Selecciona el método de pago.
   */
  setPaymentMethod: (method) => set({ paymentMethod: method }),

  /**
   * Valida los campos requeridos y formato de teléfono colombiano.
   * @returns {boolean} True si es válido, False si hay errores.
   */
  validate: () => {
    const { contact } = get()
    const errors = {}

    if (!contact.name || contact.name.trim().length < 3) {
      errors.name = 'Ingresa tu nombre completo (mínimo 3 caracteres).'
    }

    // Teléfono colombiano: 10 dígitos típicamente
    const phoneClean = contact.phone ? contact.phone.replace(/\D/g, '') : ''
    if (!phoneClean || phoneClean.length < 10) {
      errors.phone = 'Ingresa un número de celular válido de 10 dígitos.'
    }

    if (!contact.address || contact.address.trim().length < 5) {
      errors.address = 'Ingresa tu dirección completa de entrega.'
    }

    if (!contact.city || contact.city.trim().length < 2) {
      errors.city = 'Ingresa la ciudad o municipio.'
    }

    set({ errors })
    return Object.keys(errors).length === 0
  },

  /**
   * Reinicia el store al estado inicial.
   */
  reset: () => set({ contact: { ...initialContact }, errors: {} })
}))
