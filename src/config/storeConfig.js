/**
 * storeConfig.js
 * Configuración centralizada de la tienda dc_sneakers.
 * Todos los valores comerciales, bancarios y de contacto que pueden cambiar
 * sin necesidad de modificar componentes visuales.
 */

export const storeConfig = {
  name: 'dc_sneakers',
  displayName: 'DC SNEAKERS',
  tagline: 'Street Culture & Sneaker Archive',
  whatsappNumber: '573008625143', // PENDIENTE: número real entregado por el cliente (con indicativo 57, sin +)
  whatsappChannelUrl: '', // PENDIENTE: link al canal oficial de WhatsApp (si está vacío, abre chat de alertas)
  freeShipping: true,
  freeShippingThreshold: 0,
  giftText: 'Par de medias de regalo',
  deliveryTime: '2 a 5 días hábiles a toda Colombia',
  warrantyDays: 30,
  bank: {
    bankName: 'Bancolombia',
    accountType: 'Cuenta de Ahorros',
    accountNumber: '123-456789-00', // PENDIENTE: número de cuenta real
    accountHolder: 'DC SNEAKERS S.A.S.',
    nit: '901.XXX.XXX-X'
  },
  coverageText: 'Colombia — Envíos a nivel nacional',
  scheduleText: 'Lun – Sáb: 8am – 8pm',
  contactPhone: '+57 300 862 5143',
  socials: {
    instagram: 'https://instagram.com/dc.sneakers_',
    tiktok: 'https://tiktok.com/@dc.sneakers__',
    facebook: 'https://facebook.com',
    x: 'https://x.com'
  }
}
