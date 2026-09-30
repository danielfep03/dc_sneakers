/**
 * BankTransferInfo.jsx
 * Información bancaria según el plan:
 * Banco, tipo de cuenta, número y titular leídos de storeConfig.js
 * con botón interactivo "Copiar número de cuenta".
 * Copys 100% en español.
 */

import { useState } from 'react'
import { storeConfig } from '@/config/storeConfig'
import styles from './BankTransferInfo.module.css'

export default function BankTransferInfo () {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(storeConfig.bank.accountNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className={styles.container}>
      <div className={styles.title}>DATOS PARA TRANSFERENCIA</div>
      <div className={styles.dataList}>
        <div className={styles.dataRow}>
          <span>Banco:</span>
          <span className={styles.val}>{storeConfig.bank.bankName}</span>
        </div>
        <div className={styles.dataRow}>
          <span>Tipo de cuenta:</span>
          <span className={styles.val}>{storeConfig.bank.accountType}</span>
        </div>
        <div className={styles.dataRow}>
          <span>Número:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={styles.val}>{storeConfig.bank.accountNumber}</span>
            <button
              type='button'
              className={styles.copyBtn}
              onClick={handleCopy}
              aria-label='Copiar número de cuenta'
            >
              {copied ? '¡Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>
        <div className={styles.dataRow}>
          <span>Titular:</span>
          <span className={styles.val}>{storeConfig.bank.accountHolder}</span>
        </div>
      </div>
    </div>
  )
}
