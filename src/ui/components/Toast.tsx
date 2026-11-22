import type { ReactNode } from 'react';
import styles from './Toast.module.css';

export interface ToastProps {
  message: string;
  actions?: ReactNode;
}

/** Avís flotant no modal, anunciat pels lectors de pantalla (role=status). */
export function Toast({ message, actions }: ToastProps) {
  return (
    <div role="status" aria-live="polite" className={styles.toast}>
      <span className={styles.message}>{message}</span>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}
