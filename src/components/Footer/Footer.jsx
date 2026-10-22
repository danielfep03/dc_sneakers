import { Link } from 'react-router-dom'
import { storeConfig } from '@/config/storeConfig'
import DcLogo from '../common/DcLogo'
import styles from './Footer.module.css'

export default function Footer () {
  const whatsappChannelUrl = storeConfig.whatsappChannelUrl ||
    `https://wa.me/${storeConfig.whatsappNumber}?text=${encodeURIComponent('¡Hola DC SNEAKERS! Quiero unirme al canal oficial de alertas de lanzamientos.')}`

  return (
    <footer className={styles.footerContainer}>
      <div className={styles.footerInner}>
        <div className={styles.topGrid}>
          <div className={styles.brandCol}>
            <div className={styles.footerBrandHeader}>
              <Link to='/' style={{ textDecoration: 'none' }}>
                <DcLogo height={56} layout='stacked' />
              </Link>
            </div>
            <p className={styles.brandTagline}>
              Curaduría exclusiva de siluetas icónicas y streetwear en Colombia. Envíos contraentrega y garantía directa.
            </p>
          </div>

          <div>
            <h4 className={styles.colTitle}>COLECCIONES</h4>
            <ul className={styles.linksList}>
              <li><Link to='/categorias?category=basketball' className={styles.footerLink}>BASKETBALL</Link></li>
              <li><Link to='/categorias?category=casual' className={styles.footerLink}>CASUAL & RETRO</Link></li>
              <li><Link to='/categorias?category=running' className={styles.footerLink}>RUNNING</Link></li>
              <li><Link to='/categorias?category=voleibol' className={styles.footerLink}>VOLEIBOL</Link></li>
              <li><Link to='/categorias?tag=sale' className={styles.footerLink}>OFERTAS LIMITADAS</Link></li>
            </ul>
          </div>

          <div>
            <h4 className={styles.colTitle}>SOPORTE</h4>
            <ul className={styles.linksList}>
              <li><Link to='/checkout' className={styles.footerLink}>Estado del Pedido</Link></li>
              <li><span className={styles.footerLink}>Envíos Contraentrega</span></li>
              <li><span className={styles.footerLink}>Guía de Tallas EU</span></li>
              <li><span className={styles.footerLink}>Garantía de 30 Días</span></li>
            </ul>
          </div>

          <div>
            <h4 className={styles.colTitle}>CANAL DE ALERTAS</h4>
            <p className={styles.newsletterDesc}>
              Únete a nuestro canal exclusivo de WhatsApp para recibir alertas tempranas de drops, restocks y descuentos.
            </p>
            <a
              href={whatsappChannelUrl}
              target='_blank'
              rel='noopener noreferrer'
              className={styles.whatsappChannelBtn}
              aria-label='Unirme al canal de alertas en WhatsApp'
            >
              <svg viewBox='0 0 24 24' className={styles.waBtnIcon} aria-hidden='true'>
                <path
                  fillRule='evenodd'
                  clipRule='evenodd'
                  d='M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.16C10.57 20.16 9.12 19.76 7.85 19.01L7.55 18.83L4.44 19.65L5.27 16.61L5.07 16.3C4.24 14.98 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.68 12.05 3.68C14.25 3.68 16.32 4.54 17.87 6.09C19.42 7.64 20.28 9.72 20.27 11.92C20.27 16.46 16.58 20.16 12.05 20.16ZM16.56 14.37C16.31 14.25 15.09 13.65 14.86 13.57C14.63 13.48 14.47 13.44 14.3 13.69C14.14 13.94 13.67 14.5 13.52 14.67C13.38 14.84 13.23 14.86 12.98 14.73C12.73 14.61 11.93 14.35 10.98 13.5C10.24 12.84 9.74 12.03 9.6 11.78C9.45 11.53 9.58 11.4 9.71 11.27C9.82 11.16 9.96 10.99 10.08 10.84C10.2 10.69 10.25 10.59 10.33 10.42C10.41 10.26 10.37 10.11 10.31 9.99C10.25 9.87 9.76 8.66 9.56 8.16C9.36 7.68 9.16 7.74 9.01 7.74H8.54C8.37 7.74 8.1 7.8 7.87 8.05C7.64 8.3 7 8.9 7 10.12C7 11.34 7.89 12.52 8.01 12.69C8.13 12.86 9.76 15.37 12.25 16.44C12.84 16.7 13.3 16.85 13.66 16.97C14.25 17.16 14.79 17.13 15.22 17.07C15.7 17 16.69 16.47 16.9 15.89C17.11 15.31 17.11 14.81 17.05 14.71C16.99 14.61 16.82 14.54 16.56 14.37Z'
                  fill='currentColor'
                />
              </svg>
              <span>UNIRME AL CANAL</span>
              <span className={styles.btnArrow}>→</span>
            </a>
            <span className={styles.channelBadge}>DROPS EXCLUSIVOS & RESTOCKS</span>
          </div>
        </div>

        <div className={styles.bottomRow}>
          <span>© {new Date().getFullYear()} DC SNEAKERS COLOMBIA. TODOS LOS DERECHOS RESERVADOS.</span>
          <span>CULTURA URBANA Y ARCHIVO DE SNEAKERS // [01]</span>
        </div>
      </div>
    </footer>
  )
}
