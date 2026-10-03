'use client';
import styles from './StatusBadge.module.css';

interface StatusBadgeProps {
  status: 'UP' | 'DOWN' | 'PENDING' | 'PAUSED';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[status.toLowerCase()]}`}>
      <span className={styles.dot} />
      {status}
    </span>
  );
}
