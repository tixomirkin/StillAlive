'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Dashboard' },
    { href: '/monitors', label: 'Monitors' },
    { href: '/status-pages', label: 'Status Pages' },
    { href: '/settings', label: 'Settings' },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <h2>StillAlive</h2>
      </div>
      <nav className={styles.nav}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${styles.link} ${pathname === link.href ? styles.active : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className={styles.footer}>
        <button className={styles.collapseBtn}>&lt;&lt; Collapse</button>
      </div>
    </aside>
  );
}
