import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import WardenDashboard from './pages/WardenDashboard';
import GuardScanner from './pages/GuardScanner';
import MessAnalytics from './pages/MessAnalytics';

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('student_portal');

  useEffect(() => {
    if (user) {
      if (user.role === 'warden' || user.role === 'admin') {
        setActiveTab('warden_dashboard');
      } else if (user.role === 'guard') {
        setActiveTab('guard_scanner');
      } else {
        setActiveTab('student_portal');
      }
    }
  }, [user]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-muted)' }}>
        Loading SmartHostel System...
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main>
        {activeTab === 'student_portal' && <StudentDashboard />}
        {activeTab === 'warden_dashboard' && <WardenDashboard />}
        {activeTab === 'guard_scanner' && <GuardScanner />}
        {activeTab === 'mess_trends' && <MessAnalytics />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
