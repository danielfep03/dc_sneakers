/**
 * ContactForm.jsx
 * Formulario de contacto y envío en Checkout según el plan (Sección 8.6):
 * - Nombre, teléfono colombiano (10 dígitos), dirección y ciudad.
 * - Validación en español con mensajes de error claros.
 * - Conectado con useCheckoutStore.
 */

import { useCheckoutStore } from '@/stores/checkoutStore'
import styles from './ContactForm.module.css'

export default function ContactForm () {
  const contact = useCheckoutStore((state) => state.contact)
  const errors = useCheckoutStore((state) => state.errors)
  const setContactField = useCheckoutStore((state) => state.setContactField)

  return (
    <div className={styles.form}>
      <div className={styles.field}>
        <label htmlFor='contact-name' className={styles.label}>
          Nombre y Apellido <span className={styles.required}>*</span>
        </label>
        <input
          id='contact-name'
          type='text'
          placeholder='Ej: Carlos Mendoza'
          className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
          value={contact.name}
          onChange={(e) => setContactField('name', e.target.value)}
        />
        {errors.name && <p className={styles.errorMsg}>{errors.name}</p>}
      </div>

      <div className={styles.twoCols}>
        <div className={styles.field}>
          <label htmlFor='contact-phone' className={styles.label}>
            Celular (WhatsApp) <span className={styles.required}>*</span>
          </label>
          <input
            id='contact-phone'
            type='tel'
            placeholder='Ej: 310 123 4567'
            className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
            value={contact.phone}
            onChange={(e) => setContactField('phone', e.target.value)}
          />
          {errors.phone && <p className={styles.errorMsg}>{errors.phone}</p>}
        </div>

        <div className={styles.field}>
          <label htmlFor='contact-city' className={styles.label}>
            Ciudad / Municipio <span className={styles.required}>*</span>
          </label>
          <input
            id='contact-city'
            type='text'
            placeholder='Ej: Medellín, Bogotá, Cali...'
            className={`${styles.input} ${errors.city ? styles.inputError : ''}`}
            value={contact.city}
            onChange={(e) => setContactField('city', e.target.value)}
          />
          {errors.city && <p className={styles.errorMsg}>{errors.city}</p>}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor='contact-address' className={styles.label}>
          Dirección de entrega <span className={styles.required}>*</span>
        </label>
        <input
          id='contact-address'
          type='text'
          placeholder='Ej: Calle 10 # 43E - 20, Apto 402'
          className={`${styles.input} ${errors.address ? styles.inputError : ''}`}
          value={contact.address}
          onChange={(e) => setContactField('address', e.target.value)}
        />
        {errors.address && <p className={styles.errorMsg}>{errors.address}</p>}
      </div>

      <div className={styles.field}>
        <label htmlFor='contact-notes' className={styles.label}>
          Instrucciones de entrega (Opcional)
        </label>
        <input
          id='contact-notes'
          type='text'
          placeholder='Ej: Dejar en portería o tocar timbre 402'
          className={styles.input}
          value={contact.notes || ''}
          onChange={(e) => setContactField('notes', e.target.value)}
        />
      </div>
    </div>
  )
}
