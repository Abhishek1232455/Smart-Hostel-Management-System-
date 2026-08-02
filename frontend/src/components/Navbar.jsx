import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, QrCode, Shield, UtensilsCrossed, LogOut, User, Calendar, AlertTriangle } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="glass-card nav-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, var(--primary), #7f1d1d)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-glow-red)'
        }}>
          <Building2 size={24} color="#fff" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>SmartHostel</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Management System</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '12px' }}>
        {user.role === 'student' && (
          <>
            <button
              onClick={() => setActiveTab('student_portal')}
              className={`btn ${activeTab === 'student_portal' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem', padding: '8px 14px' }}
            >
              <User size={16} /> My Portal
            </button>
            <button
              onClick={() => setActiveTab('mess_trends')}
              className={`btn ${activeTab === 'mess_trends' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem', padding: '8px 14px' }}
            >
              <UtensilsCrossed size={16} /> Mess Feedback
            </button>
          </>
        )}

        {(user.role === 'warden' || user.role === 'admin') && (
          <>
            <button
              onClick={() => setActiveTab('warden_dashboard')}
              className={`btn ${activeTab === 'warden_dashboard' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem', padding: '8px 14px' }}
            >
              <Shield size={16} /> Warden Dashboard
            </button>
            <button
              onClick={() => setActiveTab('guard_scanner')}
              className={`btn ${activeTab === 'guard_scanner' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem', padding: '8px 14px' }}
            >
              <QrCode size={16} /> Gate Scanner
            </button>
            <button
              onClick={() => setActiveTab('mess_trends')}
              className={`btn ${activeTab === 'mess_trends' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem', padding: '8px 14px' }}
            >
              <UtensilsCrossed size={16} /> Mess Analytics
            </button>
          </>
        )}

        {user.role === 'guard' && (
          <button
            onClick={() => setActiveTab('guard_scanner')}
            className={`btn ${activeTab === 'guard_scanner' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', padding: '8px 14px' }}
          >
            <QrCode size={16} /> QR Gate Scanner
          </button>
        )}
      </div>

      {/* User Info & Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user.name}</p>
          <span className={`badge ${user.role === 'warden' || user.role === 'admin' ? 'badge-rose' : user.role === 'guard' ? 'badge-amber' : 'badge-emerald'}`}>
            {user.role}
          </span>
        </div>
        <button onClick={logout} className="btn btn-secondary" style={{ padding: '8px 12px' }} title="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
}
