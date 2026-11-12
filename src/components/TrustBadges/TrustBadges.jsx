import styles from './TrustBadges.module.css'

export default function TrustBadges () {
  const items = [
    {
      id: 'clients',
      icon: '/trust-sneaker-white.png',
      alt: 'Más de 100 clientes felices',
      primary: '+ 100',
      secondary: 'CLIENTES FELICES'
    },
    {
      id: 'shipping',
      icon: '/trust-shipping-white.png',
      alt: 'Envío totalmente gratis',
      primary: 'ENVÍO TOTALMENTE',
      secondary: 'GRATIS'
    },
    {
      id: 'quality',
      icon: '/trust-quality-white.png',
      alt: 'Tenis calidad 1.1',
      primary: 'TENIS CALIDAD',
      secondary: '1.1'
    },
    {
      id: 'bulk',
      icon: '/trust-discount-white.png',
      alt: 'Entre más llevas, menos pagas',
      primary: '¡ENTRE MÁS LLEVAS,',
      secondary: 'MENOS PAGAS!'
    }
  ]

  return (
    <section className={styles.section} aria-label='Beneficios y garantías'>
      <div className={styles.container}>
        <div className={styles.grid}>
          {items.map((item) => (
            <div key={item.id} className={styles.card}>
              <div className={styles.iconWrapper}>
                <img
                  src={item.icon}
                  alt={item.alt}
                  className={styles.icon}
                  loading='lazy'
                />
              </div>
              <div className={styles.textWrapper}>
                <span className={styles.linePrimary}>{item.primary}</span>
                <span className={styles.lineSecondary}>{item.secondary}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
