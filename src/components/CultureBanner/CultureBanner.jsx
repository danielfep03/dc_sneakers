import { Link } from 'react-router-dom'
import styles from './CultureBanner.module.css'

export default function CultureBanner () {
  const benefits = [
    {
      title: 'SIN TARJETA DE CRÉDITO',
      desc: 'Solo necesitas tu cédula y número de WhatsApp para iniciar.'
    },
    {
      title: 'APROBACIÓN EN MINUTOS',
      desc: 'Proceso 100% digital e inmediato, sin papeleos ni filas.'
    },
    {
      title: 'PAGO A TU RITMO',
      desc: 'Elige el plan de cuotas que mejor se adapte a tu bolsillo.'
    }
  ]

  return (
    <section className={styles.addiSection} aria-label='Financia con Addi'>
      <div className={styles.container}>
        <div className={styles.bannerCard}>
          <div className={styles.contentSide}>
            <div className={styles.partnerBadge}>
              <img src='/addi.png' alt='Logo de Addi' className={styles.addiLogo} />
              <span className={styles.badgeDivider} aria-hidden='true' />
              <span className={styles.badgeText}>PAGA A CUOTAS</span>
            </div>

            <h2 className={styles.headline}>
              COMPRA AHORA,<br />
              PAGA DESPUÉS<span className={styles.accentDot}>.</span>
            </h2>

            <p className={styles.subheadline}>
              Financia tu compra en minutos con Addi, sin necesidad de tarjeta de crédito y con aprobación al instante.
            </p>

            <div className={styles.benefitsGrid}>
              {benefits.map((b, idx) => (
                <div key={idx} className={styles.benefitItem}>
                  <div className={styles.benefitDot} />
                  <div>
                    <h3 className={styles.benefitTitle}>{b.title}</h3>
                    <p className={styles.benefitDesc}>{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.ctaWrapper}>
              <Link to='/categorias' className={styles.ctaButton}>
                <span>COMPRA CON ADDI</span>
                <span className={styles.ctaArrow}>→</span>
              </Link>
              <span className={styles.ctaSubtext}>Aplica en todas las siluetas del catálogo</span>
            </div>
          </div>

          <div className={styles.visualSide}>
            <div className={styles.imageOverlay} />
            <img
              src='https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=80'
              alt='Sneakers con financiamiento Addi'
              className={styles.bannerImage}
              loading='lazy'
            />

            <div className={styles.simulatorCard}>
              <div className={styles.simulatorHeader}>
                <span className={styles.simulatorLogo}>addi</span>
                <span className={styles.simulatorBadge}>0% INTERÉS*</span>
              </div>
              <p className={styles.simulatorTitle}>LLEVA TUS SNEAKERS FAVORITOS</p>
              <div className={styles.installmentsRow}>
                <div className={styles.installmentStep}>
                  <span className={styles.stepNum}>1</span>
                  <span className={styles.stepLabel}>Hoy</span>
                </div>
                <div className={styles.installmentDivider} />
                <div className={styles.installmentStep}>
                  <span className={styles.stepNum}>2</span>
                  <span className={styles.stepLabel}>Mes 1</span>
                </div>
                <div className={styles.installmentDivider} />
                <div className={styles.installmentStep}>
                  <span className={styles.stepNum}>3</span>
                  <span className={styles.stepLabel}>Mes 2</span>
                </div>
              </div>
              <div className={styles.simulatorFooter}>
                <span className={styles.checkIcon}>✓</span>
                <span>Aprobación 100% digital en minutos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
