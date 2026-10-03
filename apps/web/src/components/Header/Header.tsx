'use client';

import styles from './Header.module.css';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.actions}>
        <button className={styles.bell}>🔔</button>
        <div className={styles.user}>
          <div className={styles.avatar}>U</div>
          <span className={styles.name}>User</span>
        </div>
      </div>
    </header>
  );
}
