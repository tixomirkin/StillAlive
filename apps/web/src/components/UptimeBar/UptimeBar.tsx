'use client';

import styles from './UptimeBar.module.css';

interface UptimeBarProps {
  days: number;
}

export function UptimeBar({ days }: UptimeBarProps) {
  const data = Array.from({ length: days }).map(() => {
    const r = Math.random();
    if (r > 0.1) return { status: 'up', p: 100 };
    if (r > 0.05) return { status: 'warn', p: 98.5 };
    return { status: 'down', p: 85.0 };
  });

  return (
    <div className={styles.container}>
      <div className={styles.bar}>
        {data.map((d, i) => (
          <div
            key={i}
            className={`${styles.segment} ${styles[d.status]}`}
            title={`Day ${days - i}: ${d.p}%`}
          />
        ))}
      </div>
      <div className={styles.labels}>
        <span>{days} days ago</span>
        <span>100.00% uptime</span>
        <span>Today</span>
      </div>
    </div>
  );
}
