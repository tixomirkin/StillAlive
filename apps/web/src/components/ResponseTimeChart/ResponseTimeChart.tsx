'use client';

import styles from './ResponseTimeChart.module.css';

interface ResponseTimeChartProps {
  data: number[];
}

export function ResponseTimeChart({ data }: ResponseTimeChartProps) {
  if (!data || data.length === 0) return <div>No data</div>;

  const max = Math.max(...data, 1000);
  const min = 0;
  const height = 150;
  const width = 600;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / (max - min)) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className={styles.container}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2"
          points={points}
        />
      </svg>
    </div>
  );
}
