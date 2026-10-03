'use client';

import Link from 'next/link';
import { StatusBadge } from '../StatusBadge/StatusBadge';
import styles from './MonitorCard.module.css';

interface MonitorCardProps {
  id: string;
  name: string;
  url: string;
  status: 'UP' | 'DOWN' | 'PENDING' | 'PAUSED';
  uptime: number;
  avgResponseTime: number;
  lastChecked: string;
}

export function MonitorCard({ id, name, url, status, uptime, avgResponseTime, lastChecked }: MonitorCardProps) {
  // Mock last 30 checks
  const checks = Array.from({ length: 30 }).map(() => (Math.random() > 0.1 ? 'up' : 'down'));

  return (
    <Link href={`/monitors/${id}`} className={styles.card}>
      <div className={styles.header}>
        <div className={styles.info}>
          <h3 className={styles.name}>{name}</h3>
          <span className={styles.url}>{url}</span>
        </div>
        <StatusBadge status={status} />
      </div>
      
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.label}>Uptime</span>
          <span className={styles.value}>{uptime.toFixed(2)}%</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Avg Response</span>
          <span className={styles.value}>{avgResponseTime}ms</span>
        </div>
      </div>

      <div className={styles.miniBar}>
        {checks.map((c, i) => (
          <div key={i} className={`${styles.barSegment} ${styles[c]}`} />
        ))}
      </div>

      <div className={styles.footer}>
        Last checked: {lastChecked}
      </div>
    </Link>
  );
}
