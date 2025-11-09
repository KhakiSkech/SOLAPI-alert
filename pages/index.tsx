/**
 * Home Page
 * Simple status page for the notification server
 */

import type { NextPage } from 'next';
import Head from 'next/head';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Verdi SOLAPI Notification Server</title>
        <meta name="description" content="Automated notification server for ad campaign leads" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={styles.main}>
        <div style={styles.container}>
          <h1 style={styles.title}>
            ✅ Multi-Tenant Notification Orchestrator
          </h1>

          <p style={styles.description}>
            SaaS platform for automated lead notifications via SOLAPI
          </p>

          <div style={styles.grid}>
            <div style={styles.card}>
              <h2>👤 User Dashboard</h2>
              <p>Manage your API keys: <code><a href="/dashboard" style={styles.link}>/dashboard</a></code></p>
              <span style={styles.status}>● Active</span>
            </div>

            <div style={styles.card}>
              <h2>🔐 Authentication</h2>
              <p>Login/Signup: <code><a href="/login" style={styles.link}>/login</a></code></p>
              <span style={styles.status}>● Active</span>
            </div>

            <div style={styles.card}>
              <h2>📡 Webhooks</h2>
              <p>Token-based routing for Meta, Google Ads, TikTok</p>
              <span style={styles.status}>● Active</span>
            </div>
          </div>

          <div style={styles.info}>
            <h3>🚀 Features</h3>
            <ul style={styles.list}>
              <li>✅ Multi-tenant architecture with user isolation</li>
              <li>✅ Encrypted API key storage (AES-256-GCM)</li>
              <li>✅ Token-based webhook routing</li>
              <li>✅ SOLAPI integration for SMS notifications</li>
              <li>✅ Firebase Authentication & Firestore</li>
            </ul>
          </div>

          <footer style={styles.footer}>
            <p>
              Built with <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer">Next.js</a>
              {' + '}
              <a href="https://firebase.google.com" target="_blank" rel="noopener noreferrer">Firebase</a>
              {' + '}
              <a href="https://solapi.com" target="_blank" rel="noopener noreferrer">SOLAPI</a>
            </p>
            <p style={styles.version}>v1.0.0 - Multi-Tenant</p>
          </footer>
        </div>
      </main>
    </>
  );
};

const styles = {
  main: {
    minHeight: '100vh',
    padding: '4rem 0',
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  container: {
    maxWidth: '1200px',
    width: '100%',
    padding: '0 2rem',
  },
  title: {
    margin: 0,
    lineHeight: 1.15,
    fontSize: '3rem',
    textAlign: 'center' as const,
    color: '#333',
  },
  description: {
    margin: '2rem 0',
    lineHeight: 1.5,
    fontSize: '1.5rem',
    textAlign: 'center' as const,
    color: '#666',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    marginTop: '3rem',
  },
  card: {
    padding: '1.5rem',
    textAlign: 'left' as const,
    color: 'inherit',
    textDecoration: 'none',
    border: '1px solid #eaeaea',
    borderRadius: '10px',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  status: {
    display: 'inline-block',
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#d4edda',
    color: '#155724',
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontWeight: 'bold' as const,
  },
  info: {
    marginTop: '3rem',
    padding: '2rem',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  list: {
    lineHeight: 2,
    fontSize: '1.1rem',
  },
  footer: {
    marginTop: '4rem',
    paddingTop: '2rem',
    borderTop: '1px solid #eaeaea',
    textAlign: 'center' as const,
    color: '#666',
  },
  version: {
    marginTop: '0.5rem',
    fontSize: '0.875rem',
    color: '#999',
  },
  link: {
    color: '#0070f3',
    textDecoration: 'none',
  },
};

export default Home;
