/**
 * PaymentMethods.jsx
 * Selector de métodos de pago en Checkout según el plan:
 * 1. Transferencia bancaria (despliega BankTransferInfo)
 * 2. Tarjeta / Bold (Demo)
 * 3. Pago Contraentrega
 * Copys 100% en español.
 */

import { useCheckoutStore } from '@/stores/checkoutStore'
import BankTransferInfo from '@/components/checkout/BankTransferInfo'
import styles from './PaymentMethods.module.css'

export default function PaymentMethods () {
  const paymentMethod = useCheckoutStore((state) => state.paymentMethod)
  const setPaymentMethod = useCheckoutStore((state) => state.setPaymentMethod)

  const methods = [
    {
      id: 'transfer',
      title: 'Transferencia Bancaria',
      desc: 'Transfiere desde tu app bancaria (Bancolombia, Nequi, etc.) y confirma por WhatsApp'
    },
    {
      id: 'cash-on-delivery',
      title: 'Pago Contraentrega',
      desc: 'Paga en efectivo al transportador al recibir tu pedido en la puerta de tu casa'
    },
    {
      id: 'bold-demo',
      title: 'Tarjeta de Crédito / Débito (Bold Demo)',
      desc: 'Simulación de pago seguro en línea con pasarela Bold'
    }
  ]

  return (
    <div className={styles.methodsList}>
      {methods.map((m) => {
        const isSelected = paymentMethod === m.id
        return (
          <div
            key={m.id}
            className={`${styles.optionCard} ${isSelected ? styles.selected : ''}`}
            onClick={() => setPaymentMethod(m.id)}
          >
            <div className={styles.header}>
              <input
                type='radio'
                name='payment-method'
                id={`method-${m.id}`}
                className={styles.radio}
                checked={isSelected}
                onChange={() => setPaymentMethod(m.id)}
              />
              <div className={styles.titleGroup}>
                <label htmlFor={`method-${m.id}`} className={styles.title}>
                  {m.title}
                </label>
                <span className={styles.desc}>{m.desc}</span>
              </div>
            </div>

            {isSelected && m.id === 'transfer' && <BankTransferInfo />}
          </div>
        )
      })}
    </div>
  )
}
