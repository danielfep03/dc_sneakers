import styles from './Footer.module.css'
import brandLogo from '/icon.jpeg'

export default function Footer () {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerMain}>
        <div className={styles.footerBrand}>
          <div className={styles.logoContainer}>
            <img src={brandLogo} alt='DC SNEAKERS' className={styles.logoImg} />
            <div className={styles.logoTextWrapper}>
              <span className={styles.logoTextMain} style={{ color: '#ffffff' }}>DC</span>
              <span className={styles.logoTextSub}>SNEAKERS</span>
            </div>
          </div>
          <p style={{ marginTop: '12px' }}>La tienda oficial para los verdaderos apasionados del sneaker culture, la cultura basket y el estilo urbano en Colombia.</p>
          <div style={{ marginTop: '14px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div>📱 <strong>WhatsApp:</strong> <a href='https://wa.me/573008625143' target='_blank' rel='noreferrer' style={{ color: '#25d366', textDecoration: 'none', fontWeight: '800' }}>300 862 5143</a></div>
            <div>📸 <strong>Instagram:</strong> <a href='https://instagram.com/dc.sneakers_' target='_blank' rel='noreferrer' style={{ color: '#e1306c', textDecoration: 'none', fontWeight: '800' }}>@dc.sneakers_</a></div>
          </div>
        </div>
        <div className={styles.footerLinksGroup}>
          <div className={styles.footerLinksCol}>
            <h4>Soporte</h4>
            <a href='#'>Ayuda y Contacto</a>
            <a href='#'>Envíos a Colombia</a>
            <a href='#'>Devoluciones</a>
            <a href='#'>Garantía DC SNEAKERS</a>
          </div>
          <div className={styles.footerLinksCol}>
            <h4>Tienda</h4>
            <a href='#'>Drop Jordan</a>
            <a href='#'>Colecciones Especiales</a>
            <a href='#'>Outlets y Descuentos</a>
            <a href='#'>Tarjetas de Regalo</a>
          </div>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <span>© 2026 DC SNEAKERS (@dc.sneakers_). Todos los derechos reservados.</span>
        <span>El templo del sneakerhead & streetwear en Colombia 🇨🇴</span>
      </div>
    </footer>
  )
}
