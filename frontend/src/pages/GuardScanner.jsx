import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { QrCode, CheckCircle, XCircle, Search, ShieldCheck, UserCheck, Clock } from 'lucide-react';

export default function GuardScanner() {
  const { apiFetch } = useAuth();

  const [scanCode, setScanCode] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allVisitors, setAllVisitors] = useState([]);
  const [holidayPasses, setHolidayPasses] = useState([]);

  useEffect(() => {
    loadPasses();
  }, []);

  const loadPasses = async () => {
    try {
      const vRes = await apiFetch('/api/visitors/all');
      setAllVisitors(vRes.passes || []);

      const hRes = await apiFetch('/api/holiday/all');
      setHolidayPasses(hRes.passes || []);
    } catch (err) {
      console.error("Failed to load guard data:", err);
    }
  };

  const handleVerify = async (codeToVerify) => {
    const code = codeToVerify || scanCode;
    if (!code) return;

    setLoading(true);
    setScanResult(null);

    try {
      const res = await apiFetch('/api/visitors/verify', {
        method: 'POST',
        body: JSON.stringify({ codeOrToken: code })
      });
      setScanResult(res);
      loadPasses();
    } catch (err) {
      setScanResult({ valid: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleVisitorCheckout = async (passId) => {
    try {
      await apiFetch(`/api/visitors/checkout/${passId}`, { method: 'POST' });
      alert("Visitor checked out!");
      loadPasses();
    } catch (err) {
      alert("Checkout error: " + err.message);
    }
  };

  const handleHolidayStatusChange = async (passId, status) => {
    try {
      await apiFetch(`/api/holiday/${passId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      alert(`Student leave marked as ${status}`);
      loadPasses();
    } catch (err) {
      alert("Status error: " + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. QR Code Scanner / Pass Lookup */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.1), rgba(99,102,241,0.05))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <ShieldCheck size={28} color="var(--accent-cyan)" />
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Main Gate QR Visitor Verification</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Scan visitor QR code or enter Pass Code / Token to verify gate entry.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', maxWidth: '600px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Scan QR or enter Pass Code (e.g. VP-1001 or Token string)"
            value={scanCode}
            onChange={e => setScanCode(e.target.value)}
          />
          <button onClick={() => handleVerify()} className="btn btn-primary" style={{ whiteSpace: 'nowrap' }} disabled={loading}>
            <Search size={18} /> Verify Pass
          </button>
        </div>

        {/* Verification Result Dialog */}
        {scanResult && (
          <div style={{
            marginTop: '20px',
            padding: '20px',
            borderRadius: '14px',
            background: scanResult.valid ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
            border: scanResult.valid ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(244,63,94,0.4)',
            boxShadow: scanResult.valid ? 'var(--shadow-glow-emerald)' : 'var(--shadow-glow-rose)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {scanResult.valid ? <CheckCircle size={32} color="var(--accent-emerald)" /> : <XCircle size={32} color="var(--accent-rose)" />}
              <div>
                <h3 style={{ fontSize: '1.2rem', color: scanResult.valid ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                  {scanResult.valid ? 'PASS VERIFIED - ENTRY PERMITTED' : 'ACCESS DENIED / INVALID PASS'}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '2px' }}>
                  {scanResult.message || scanResult.error}
                </p>
              </div>
            </div>

            {scanResult.pass && (
              <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.88rem' }}>
                <div>Visitor Name: <strong>{scanResult.pass.visitor_name}</strong></div>
                <div>Host Student: <strong>{scanResult.pass.student_name} ({scanResult.pass.roll_number})</strong></div>
                <div>Phone: <strong>{scanResult.pass.visitor_phone}</strong></div>
                <div>Valid Until: <strong>{new Date(scanResult.pass.valid_until).toLocaleString()}</strong></div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Active Visitor Logs & Checkout */}
      <div className="grid-2">
        <div className="glass-card">
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={20} color="var(--accent-emerald)" /> Active Visitor Log
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
            {allVisitors.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No visitor logs recorded.</p>
            ) : (
              allVisitors.map(v => (
                <div key={v.id} style={{ padding: '14px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '600' }}>{v.visitor_name}</h4>
                      <span className={`badge ${v.status === 'ACTIVE' ? 'badge-emerald' : 'badge-rose'}`}>{v.status}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Student: {v.student_name} ({v.roll_number})</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Code: {v.pass_code} | Tel: {v.visitor_phone}</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                    <button onClick={() => handleVerify(v.pass_code)} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                      Verify Code
                    </button>
                    {v.status === 'ACTIVE' && (
                      <button onClick={() => handleVisitorCheckout(v.id)} className="btn btn-danger" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                        Mark Exit
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. Student Holiday Departure/Return Gate Check */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} color="var(--accent-amber)" /> Holiday Leave Gate Entry/Exit
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
            {holidayPasses.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No student holiday passes.</p>
            ) : (
              holidayPasses.map(h => (
                <div key={h.id} style={{ padding: '14px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '600' }}>{h.student_name} ({h.roll_number})</h4>
                    <span className={`badge ${h.status === 'APPROVED' ? 'badge-emerald' : h.status === 'CHECKED_OUT' ? 'badge-amber' : 'badge-primary'}`}>
                      {h.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>To: {h.destination} ({h.departure_date} to {h.return_date})</p>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    {h.status === 'APPROVED' && (
                      <button onClick={() => handleHolidayStatusChange(h.id, 'CHECKED_OUT')} className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                        Confirm Departure (Check-Out)
                      </button>
                    )}
                    {h.status === 'CHECKED_OUT' && (
                      <button onClick={() => handleHolidayStatusChange(h.id, 'COMPLETED')} className="btn btn-success" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                        Confirm Hostel Return (Check-In)
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
