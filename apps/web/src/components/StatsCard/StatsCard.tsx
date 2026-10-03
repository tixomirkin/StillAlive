'use client';

import styles from './StatsCard.module.css';

interface StatsCardProps {
  label: string;
  value: string;
  icon?: string;
  trend?: 'up' | 'down' | 'none';
}

export function StatsCard({ label, value, icon, trend }: StatsCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        {icon && <span className={styles.icon}>{icon}</span>}
      </div>
      <div className={styles.body}>
        <span className={styles.value}>{value}</span>
        {trend === 'up' && <span className={`${styles.trend} ${styles.up}`}>↑</span>}
        {trend === 'down' && <span className={`${styles.trend} ${styles.down}`}>↓</span>}
      </div>
    </div>
  );
}
