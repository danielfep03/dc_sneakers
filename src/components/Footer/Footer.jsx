import { storeConfig } from '@/config/storeConfig'
import { useUIStore } from '@/stores/uiStore'
import { Link } from 'react-router-dom'
import DcLogo from '../common/DcLogo'
import styles from './Footer.module.css'

export default function Footer () {
  const openSizeGuide = useUIStore((state) => state.openSizeGuide)
  const whatsappChannelUrl = storeConfig.whatsappChannelUrl ||
    `https://wa.me/${storeConfig.whatsappNumber}?text=${encodeURIComponent('¡Hola DC SNEAKERS! Vengo de su Pagina Web y quiero atencion personalizada.')}`

  const directWhatsappUrl = `https://wa.me/${storeConfig.whatsappNumber}?text=${encodeURIComponent('¡Hola DC SNEAKERS! Tengo una consulta sobre sus productos.')}`

  const followSocials = [
    {
      name: 'Instagram',
      url: storeConfig.socials?.instagram || 'https://instagram.com/dc.sneakers_',
      icon: (
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' className={styles.followIcon}>
          <rect x='2' y='2' width='20' height='20' rx='5' ry='5' />
          <path d='M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z' />
          <line x1='17.5' y1='6.5' x2='17.51' y2='6.5' />
        </svg>
      )
    },
    {
      name: 'TikTok',
      url: storeConfig.socials?.tiktok || 'https://tiktok.com/@dc.sneakers__',
      icon: (
        <svg viewBox='0 0 24 24' fill='currentColor' className={styles.followIcon}>
          <path d='M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.11V9.42a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.68a6.34 6.34 0 0 0 10.82 4.49 6.26 6.26 0 0 0 1.86-4.5V8.8a8.28 8.28 0 0 0 4.91 1.6V6.95c-.34-.05-.68-.14-1-.26z' />
        </svg>
      )
    }
  ]

  return (
    <footer className={styles.footerContainer}>
      <div className={styles.footerInner}>
        <div className={styles.topGrid}>
          {/* 1. Marca */}
          <div className={styles.brandCol}>
            <div className={styles.footerBrandHeader}>
              <Link to='/' style={{ textDecoration: 'none' }}>
                <DcLogo height={56} layout='stacked' />
              </Link>
            </div>
            <p className={styles.brandTagline}>
              Los pares que buscas para marcar tu estilo están en DC SNEAKERS Tus marcas favoritas en un solo lugar.
              <br />
              <br /> Cali, Colombia 🇨🇴
            </p>
          </div>

          {/* 2. Información & Contacto */}
          <div className={styles.contactCol}>
            <div className={styles.contactList}>
              {/* Cobertura */}
              <div className={styles.contactItem}>
                <div className={styles.contactIconWrap}>
                  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className={styles.contactIcon}>
                    <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' />
                    <circle cx='12' cy='10' r='3' />
                  </svg>
                </div>
                <div className={styles.contactContent}>
                  <span className={styles.contactLabel}>COBERTURA</span>
                  <span className={styles.contactValue}>
                    {storeConfig.coverageText || 'Colombia — Envíos a nivel nacional'}
                  </span>
                </div>
              </div>

              {/* WhatsApp */}
              <div className={styles.contactItem}>
                <div className={styles.contactIconWrap}>
                  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className={styles.contactIcon}>
                    <path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z' />
                  </svg>
                </div>
                <div className={styles.contactContent}>
                  <span className={styles.contactLabel}>WHATSAPP</span>
                  <a
                    href={directWhatsappUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className={`${styles.contactValue} ${styles.contactValueLink}`}
                  >
                    {storeConfig.contactPhone || '+57 324 410 6826'}
                  </a>
                </div>
              </div>

              {/* Horario */}
              <div className={styles.contactItem}>
                <div className={styles.contactIconWrap}>
                  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className={styles.contactIcon}>
                    <circle cx='12' cy='12' r='10' />
                    <line x1='12' y1='16' x2='12' y2='12' />
                    <line x1='12' y1='8' x2='12.01' y2='8' />
                  </svg>
                </div>
                <div className={styles.contactContent}>
                  <span className={styles.contactLabel}>HORARIO</span>
                  <span className={styles.contactValue}>
                    {storeConfig.scheduleText || 'Lun – Sáb: 8am – 8pm'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* 3. Soporte */}
          <div>
            <h4 className={styles.colTitle}>SOPORTE</h4>
            <ul className={styles.linksList}>
              <li><Link to='/checkout' className={styles.footerLink}>Estado del Pedido</Link></li>
              <li><span className={styles.footerLink}>Envíos Contraentrega</span></li>
              <li>
                <button
                  type='button'
                  className={styles.footerLink}
                  onClick={openSizeGuide}
                >
                  Guía de Tallas EU
                </button>
              </li>
              <li><span className={styles.footerLink}>Garantía de 30 Días</span></li>
            </ul>
          </div>

          {/* 4. Canal de Alertas */}
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
              <span className={styles.btnArrow}>Escríbenos</span>
            </a>
            <span className={styles.channelBadge}>DROPS EXCLUSIVOS & RESTOCKS</span>
          </div>
        </div>

        <div className={styles.bottomRow}>
          <span>© {new Date().getFullYear()} DC SNEAKERS COLOMBIA. TODOS LOS DERECHOS RESERVADOS.</span>

          {/* Síguenos */}
          <div className={styles.followBlock}>
            <div className={styles.followIcons}>
              {followSocials.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className={styles.followBtn}
                  aria-label={`Síguenos en ${social.name}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          <span>CULTURA URBANA Y ARCHIVO DE SNEAKERS // [01]</span>
        </div>
      </div>
    </footer>
  )
}
