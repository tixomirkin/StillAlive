'use client';

import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import { StatsCard } from '@/components/StatsCard/StatsCard';
import { ResponseTimeChart } from '@/components/ResponseTimeChart/ResponseTimeChart';
import { UptimeBar } from '@/components/UptimeBar/UptimeBar';
import styles from './page.module.css';

export default function MonitorPage({ params }: { params: { id: string } }) {
  const monitor = {
    id: params.id,
    name: 'Main Website',
    url: 'https://example.com',
    status: 'UP' as const,
  };

  const chartData = Array.from({ length: 50 }).map(() => Math.floor(Math.random() * 200) + 50);

  const recentChecks = [
    { id: 1, time: '2026-10-03 12:20', status: 'UP', responseTime: 120 },
    { id: 2, time: '2026-10-03 12:19', status: 'UP', responseTime: 125 },
    { id: 3, time: '2026-10-03 12:18', status: 'DOWN', responseTime: 5000 },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>{monitor.name}</h1>
          <StatusBadge status={monitor.status} />
        </div>
        <a href={monitor.url} target="_blank" rel="noreferrer" className={styles.url}>
          {monitor.url}
        </a>
      </header>

      <div className={styles.statsRow}>
        <StatsCard label="Uptime (30d)" value="99.99%" />
        <StatsCard label="Avg Response" value="120ms" />
        <StatsCard label="P95 Response" value="250ms" />
        <StatsCard label="Total Checks" value="43,200" />
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Response Time</h3>
        <ResponseTimeChart data={chartData} />
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Uptime (30 Days)</h3>
        <UptimeBar days={30} />
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Recent Checks</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Time</th>
              <th>Status</th>
              <th>Response Time</th>
            </tr>
          </thead>
          <tbody>
            {recentChecks.map(check => (
              <tr key={check.id}>
                <td>{check.time}</td>
                <td>
                  <span className={check.status === 'UP' ? styles.textUp : styles.textDown}>
                    {check.status}
                  </span>
                </td>
                <td>{check.responseTime}ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
