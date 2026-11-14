/**
 * AddiWidget.jsx
 * Integra el Web Component oficial <addi-widget> siguiendo docs/addi_widget.md:
 * - Usa el script https://s3.amazonaws.com/widgets.addi.com/bundle.min.js (cargado en index.html).
 * - Envía `price` como entero positivo sin símbolos ni espacios y `ally-slug` desde VITE_ADDI_ALLY_SLUG.
 * - Actualiza el widget dinámicamente cuando cambia el precio (key reactiva).
 * - Personaliza `custom-widget-styles` acorde al tema oscuro streetwear de DC SNEAKERS.
 */

import { useEffect, useMemo } from 'react'

const ADDI_WIDGET_SCRIPT_SRC = 'https://s3.amazonaws.com/widgets.addi.com/bundle.min.js'

const CUSTOM_WIDGET_STYLES = JSON.stringify({
  widget: {
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: '4px',
    fontColor: '#ffffff',
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '13px',
    badgeBackgroundColor: '#304FFE',
    infoBackgroundColor: '#111114',
    margin: '0',
    whiteLogo: 'true'
  },
  modal: {
    backgroundColor: '#111114',
    fontColor: '#ffffff',
    fontFamily: "'Space Grotesk', sans-serif",
    priceColor: '#536DFE',
    badgeBorderRadius: '4px',
    badgeBackgroundColor: '#304FFE',
    badgeFontColor: '#ffffff',
    cardColor: '#18181d',
    buttonBorderColor: '#304FFE',
    buttonBorderRadius: '4px',
    buttonBackgroundColor: '#304FFE',
    buttonFontColor: '#ffffff'
  }
})

export default function AddiWidget ({ price, className = '' }) {
  const allySlug = (import.meta.env.VITE_ADDI_ALLY_SLUG || 'dcsneakers-ecommerce').trim()

  const cleanPrice = useMemo(() => {
    const numeric = Math.round(Number(price) || 0)
    return numeric > 0 ? String(numeric) : null
  }, [price])

  // Garantiza que el script del widget de Addi esté presente si no fue cargado previamente
  useEffect(() => {
    const existing = document.querySelector(`script[src="${ADDI_WIDGET_SCRIPT_SRC}"]`)
    if (!existing) {
      const script = document.createElement('script')
      script.src = ADDI_WIDGET_SCRIPT_SRC
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  if (!cleanPrice || !allySlug) return null

  return (
    <div className={className}>
      <addi-widget
        key={`${allySlug}-${cleanPrice}`}
        price={cleanPrice}
        ally-slug={allySlug}
        custom-widget-styles={CUSTOM_WIDGET_STYLES}
      />
    </div>
  )
}
