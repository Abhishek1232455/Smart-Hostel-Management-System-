import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, Shield, User, QrCode, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (u, p) => {
    setError('');
    setLoading(true);
    try {
      await login(u, p);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '480px', width: '100%' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 16px auto',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--primary), var(--accent-cyan))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow-primary)'
          }}>
            <Building2 size={36} color="#fff" />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px' }}>SmartHostel</h1>
          <p style={{ color: 'var(--text-muted)' }}>AI & IoT Enabled Hostel Management System</p>
        </div>

        {/* Card */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: '600' }}>Sign In to Portal</h3>

          {error && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '10px',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: 'var(--accent-rose)',
              fontSize: '0.9rem',
              marginBottom: '18px'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. student1, warden1, guard1"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px', padding: '12px' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : <>Login <ArrowRight size={18} /></>}
            </button>
          </form>

          {/* Quick Demo Profiles */}
          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-glass)' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              One-Click Demo Profiles
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => handleQuickLogin('student1', 'password')}
                className="btn btn-secondary"
                style={{ fontSize: '0.82rem', justifyContent: 'flex-start' }}
              >
                <User size={16} color="var(--accent-emerald)" /> Student Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('warden1', 'password')}
                className="btn btn-secondary"
                style={{ fontSize: '0.82rem', justifyContent: 'flex-start' }}
              >
                <Shield size={16} color="var(--accent-rose)" /> Warden Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('guard1', 'password')}
                className="btn btn-secondary"
                style={{ fontSize: '0.82rem', justifyContent: 'flex-start' }}
              >
                <QrCode size={16} color="var(--accent-amber)" /> Guard Scanner
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin1', 'password')}
                className="btn btn-secondary"
                style={{ fontSize: '0.82rem', justifyContent: 'flex-start' }}
              >
                <Lock size={16} color="var(--primary)" /> Admin Demo
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
