'use client';

import { StatsCard } from '@/components/StatsCard/StatsCard';
import { MonitorCard } from '@/components/MonitorCard/MonitorCard';
import styles from './page.module.css';

export default function DashboardPage() {
  const monitors = [
    { id: '1', name: 'Main Website', url: 'https://example.com', status: 'UP' as const, uptime: 99.99, avgResponseTime: 120, lastChecked: '1 min ago' },
    { id: '2', name: 'API Server', url: 'https://api.example.com', status: 'DOWN' as const, uptime: 95.50, avgResponseTime: 450, lastChecked: '2 mins ago' },
    { id: '3', name: 'Database Proxy', url: 'tcp://db.example.com:5432', status: 'UP' as const, uptime: 100, avgResponseTime: 45, lastChecked: 'Just now' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.statsRow}>
        <StatsCard label="Total Monitors" value="12" icon="📊" />
        <StatsCard label="Monitors Up" value="11" icon="✅" trend="up" />
        <StatsCard label="Monitors Down" value="1" icon="❌" trend="down" />
        <StatsCard label="Avg Response" value="142ms" icon="⚡" />
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Your Monitors</h2>
        <div className={styles.grid}>
          {monitors.map(m => (
            <MonitorCard key={m.id} {...m} />
          ))}
        </div>
      </div>
    </div>
  );
}
