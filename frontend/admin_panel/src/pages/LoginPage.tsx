import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../api/client';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiRequest<{ access_token?: string; data?: { access_token?: string } }>(
        '/auth/login',
        { method: 'POST', body: { email_or_phone: email, password } }
      );
      const token = res.access_token ?? (res.data as any)?.access_token;
      if (!token) throw new Error('No token in response');
      localStorage.setItem('access_token', token);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <p className={styles.logo}>RideConnect</p>
        <p className={styles.subtitle}>Admin Portal</p>
        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Email or Phone</label>
            <input className={styles.input} type="text" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input className={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
          {error && <p className={styles.error}>{error}</p>}
        </form>
      </div>
    </div>
  );
}
