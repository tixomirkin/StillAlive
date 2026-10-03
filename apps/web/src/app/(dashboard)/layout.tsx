import { Sidebar } from '@/components/Sidebar/Sidebar';
import { Header } from '@/components/Header/Header';
import styles from './layout.module.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.main}>
        <Header title="Dashboard" />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
