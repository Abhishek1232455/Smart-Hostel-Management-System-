import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, Shield, User, QrCode, Lock, ArrowRight, UserCheck } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();

  const [selectedRole, setSelectedRole] = useState('student');
  const [username, setUsername] = useState('student1');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    { id: 'student', label: 'Student', icon: User, defaultUser: 'student1', color: 'var(--accent-emerald)', badge: 'badge-emerald' },
    { id: 'warden', label: 'Warden', icon: Shield, defaultUser: 'warden1', color: 'var(--accent-rose)', badge: 'badge-rose' },
    { id: 'guard', label: 'Gate Staff', icon: QrCode, defaultUser: 'guard1', color: 'var(--accent-amber)', badge: 'badge-amber' },
    { id: 'admin', label: 'Admin', icon: Lock, defaultUser: 'admin1', color: 'var(--primary)', badge: 'badge-primary' }
  ];

  const handleRoleSelect = (roleObj) => {
    setSelectedRole(roleObj.id);
    setUsername(roleObj.defaultUser);
    setPassword('password');
    setError('');
  };

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

  const currentRoleObj = roles.find(r => r.id === selectedRole) || roles[0];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '520px', width: '100%' }}>
        
        {/* Branding Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
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
          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '6px' }}>SmartHostel</h1>
          <p style={{ color: 'var(--text-muted)' }}>AI & IoT Enabled Hostel Management Platform</p>
        </div>

        {/* Card */}
        <div className="glass-card">
          
          {/* Role Selector Buttons */}
          <div style={{ marginBottom: '24px' }}>
            <label className="form-label" style={{ textAlign: 'center', marginBottom: '12px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Select Login Role
            </label>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '12px' }}>
              {roles.map(r => {
                const IconComponent = r.icon;
                const isSelected = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRoleSelect(r)}
                    style={{
                      padding: '10px 6px',
                      borderRadius: '10px',
                      border: isSelected ? `1px solid ${r.color}` : '1px solid transparent',
                      background: isSelected ? 'rgba(255,255,255,0.08)' : 'transparent',
                      color: isSelected ? '#fff' : 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? `0 4px 14px rgba(0,0,0,0.4)` : 'none'
                    }}
                  >
                    <IconComponent size={20} color={isSelected ? r.color : 'var(--text-muted)'} />
                    <span style={{ fontSize: '0.78rem', fontWeight: isSelected ? '700' : '500' }}>{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Role Status Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-glass)',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={18} color={currentRoleObj.color} />
              <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>Logging in as <strong>{currentRoleObj.label}</strong></span>
            </div>
            <span className={`badge ${currentRoleObj.badge}`}>{currentRoleObj.id}</span>
          </div>

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
                placeholder={`Enter ${currentRoleObj.label} Username`}
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
                placeholder="Enter password"
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
              {loading ? 'Authenticating...' : <>Login as {currentRoleObj.label} <ArrowRight size={18} /></>}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
