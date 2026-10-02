import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '1rem', color: '#10b981' }}>
        StillAlive 🟢
      </h1>
      <p style={{ fontSize: '1.5rem', marginBottom: '2rem', color: '#9ca3af' }}>
        Open-source uptime monitoring platform
      </p>
      
      <div style={{ padding: '2rem', borderRadius: '0.5rem', backgroundColor: '#1f2937', marginBottom: '2rem' }}>
        <p style={{ fontSize: '1.25rem' }}>Dashboard coming soon...</p>
      </div>

      <Link 
        href="/dashboard"
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#10b981',
          color: '#ffffff',
          borderRadius: '0.375rem',
          textDecoration: 'none',
          fontWeight: '500'
        }}
      >
        Go to Dashboard
      </Link>
    </main>
  );
}
