import { Link } from 'react-router-dom'
import styles from './NotFound.module.css'

export default function NotFound () {
  return (
    <div className={styles.container}>
      <span className={styles.code}>404</span>
      <h1 className={styles.title}>SILUETA NO ENCONTRADA</h1>
      <p className={styles.text}>La página o producto que buscas no existe o fue movido.</p>
      <Link to='/' className={styles.btn}>
        VOLVER AL INICIO →
      </Link>
    </div>
  )
}
