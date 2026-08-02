import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, AlertTriangle, Building2, Users, Wrench, Clock, Check, X, QrCode } from 'lucide-react';

export default function WardenDashboard() {
  const { apiFetch } = useAuth();

  const [stats, setStats] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState('Block A');
  const [tickets, setTickets] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // Assign staff modal state
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [staffName, setStaffName] = useState('');

  useEffect(() => {
    loadWardenData();
    const interval = setInterval(loadWardenData, 10000); // 10s auto refresh
    return () => clearInterval(interval);
  }, []);

  const loadWardenData = async () => {
    try {
      const data = await apiFetch('/api/dashboard/warden');
      setStats(data);

      const tRes = await apiFetch('/api/maintenance/tickets');
      setTickets(tRes.tickets || []);

      const lRes = await apiFetch('/api/holiday/all');
      setLeaves(lRes.passes || []);
    } catch (err) {
      console.error("Failed to load warden data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTicketStatus = async (ticketId, status, assignedStaff) => {
    try {
      await apiFetch(`/api/maintenance/tickets/${ticketId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, assigned_to: assignedStaff })
      });
      loadWardenData();
      setSelectedTicket(null);
      setStaffName('');
    } catch (err) {
      alert("Error updating ticket: " + err.message);
    }
  };

  const handleUpdateLeaveStatus = async (passId, status) => {
    try {
      await apiFetch(`/api/holiday/${passId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      loadWardenData();
    } catch (err) {
      alert("Error updating leave pass: " + err.message);
    }
  };

  if (loading || !stats) {
    return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading Warden Dashboard...</div>;
  }

  const { summary, blockStats, slaSummary, activeVisitors } = stats;
  const currentBlock = blockStats[selectedBlock] || { rooms: [] };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Header Metrics Row */}
      <div className="grid-4">
        <div className="glass-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Hostel Occupancy</p>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0' }}>{summary.totalOccupancy} / {summary.totalCapacity}</h2>
          <span className="badge badge-primary">{summary.occupancyPercentage}% Occupied ({summary.totalRooms} Rooms)</span>
        </div>

        <div className="glass-card" style={{ borderLeft: summary.slaBreachesCount > 0 ? '4px solid var(--accent-rose)' : '4px solid var(--accent-emerald)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Maintenance SLA Breaches (&gt;48h)</p>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0', color: summary.slaBreachesCount > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
            {summary.slaBreachesCount}
          </h2>
          <span className={`badge ${summary.slaBreachesCount > 0 ? 'badge-rose' : 'badge-emerald'}`}>
            {summary.slaBreachesCount > 0 ? 'ACTION REQUIRED' : 'SLA HEALTHY'}
          </span>
        </div>

        <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-cyan)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Visitor Passes</p>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0', color: 'var(--accent-cyan)' }}>{summary.activeVisitorsCount}</h2>
          <span className="badge badge-emerald">Valid (8h window)</span>
        </div>

        <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-amber)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pending Holiday Leaves</p>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0', color: 'var(--accent-amber)' }}>{summary.pendingLeavesCount}</h2>
          <span className="badge badge-amber">Awaiting Approval</span>
        </div>
      </div>

      {/* 2. SLA BREACH ALERT BANNER (High Visibility) */}
      {slaSummary.totalBreachedCount > 0 && (
        <div style={{
          padding: '20px 24px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(244,63,94,0.18), rgba(225,29,72,0.1))',
          border: '1px solid rgba(244,63,94,0.4)',
          boxShadow: 'var(--shadow-glow-rose)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <AlertTriangle color="var(--accent-rose)" size={28} style={{ animation: 'pulseBreach 1.5s infinite' }} />
            <div>
              <h3 style={{ color: 'var(--accent-rose)', fontSize: '1.2rem', fontWeight: '700' }}>
                ⚠️ CRITICAL ALERT: {slaSummary.totalBreachedCount} Maintenance Ticket(s) Exceeded 48-Hour SLA!
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                These tickets have remained unresolved past the 48-hour threshold and require immediate warden assignment.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginTop: '14px' }}>
            {slaSummary.breachedTickets.map(t => (
              <div key={t.id} style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.4)', borderRadius: '10px', border: '1px solid rgba(244,63,94,0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '700', color: '#fff' }}>{t.title}</span>
                  <span className="badge badge-rose">{t.ageInHours}h Old</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Student: {t.student_name} | Room {t.room_number} ({t.block})</p>
                <button
                  onClick={() => setSelectedTicket(t)}
                  className="btn btn-danger"
                  style={{ fontSize: '0.75rem', padding: '4px 10px', marginTop: '8px' }}
                >
                  Assign Staff Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. LIVE OCCUPANCY MAP / HEATMAP FOR 100 ROOMS */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 color="var(--primary)" size={22} /> Live Room Occupancy Map (100 Rooms)
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Real-time visual map of all hostel rooms, blocks, and floor status.</p>
          </div>

          {/* Block Selector */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {['Block A', 'Block B', 'Block C', 'Block D'].map(b => (
              <button
                key={b}
                onClick={() => setSelectedBlock(b)}
                className={`btn ${selectedBlock === b ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(16,185,129,0.3)', border: '1px solid var(--accent-emerald)' }}></span> Vacant
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(245,158,11,0.3)', border: '1px solid var(--accent-amber)' }}></span> Partially Occupied
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(244,63,94,0.3)', border: '1px solid var(--accent-rose)' }}></span> Full
          </span>
        </div>

        {/* Room Heatmap Grid */}
        <div className="occupancy-grid">
          {currentBlock.rooms.map(room => {
            const isFull = room.occupancy >= room.capacity;
            const isPartial = room.occupancy > 0 && room.occupancy < room.capacity;
            const statusClass = isFull ? 'full' : isPartial ? 'partial' : 'vacant';

            return (
              <div key={room.id} className={`room-node ${statusClass}`}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700' }}>{room.room_number}</h4>
                <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>Floor {room.floor} • {room.room_type}</p>
                <p style={{ fontSize: '0.75rem', fontWeight: '600', marginTop: '4px' }}>
                  {room.occupancy} / {room.capacity} beds
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. MAINTENANCE QUEUE & HOLIDAY APPROVALS */}
      <div className="grid-2">
        {/* Maintenance Queue */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wrench size={20} color="var(--primary)" /> Maintenance Ticket Queue
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '450px', overflowY: 'auto' }}>
            {tickets.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No maintenance tickets.</p>
            ) : (
              tickets.map(t => (
                <div key={t.id} style={{ padding: '14px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: t.isSlaBreached ? '1px solid var(--accent-rose)' : '1px solid var(--border-glass)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '600' }}>{t.title}</h4>
                    <span className={`badge ${t.isSlaBreached ? 'badge-rose' : t.status === 'RESOLVED' ? 'badge-emerald' : 'badge-amber'}`}>
                      {t.isSlaBreached ? 'SLA BREACHED' : t.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Room {t.room_number} ({t.block}) • Student: {t.student_name}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '4px 0' }}>Assigned: {t.assigned_to || 'Unassigned'}</p>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    {t.status !== 'RESOLVED' && (
                      <>
                        <button onClick={() => setSelectedTicket(t)} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                          Assign Staff
                        </button>
                        <button onClick={() => handleUpdateTicketStatus(t.id, 'RESOLVED', t.assigned_to)} className="btn btn-success" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                          Mark Resolved
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Holiday Leave Approvals */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="var(--accent-amber)" /> Holiday Gate Pass Approvals
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '450px', overflowY: 'auto' }}>
            {leaves.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No leave requests.</p>
            ) : (
              leaves.map(l => (
                <div key={l.id} style={{ padding: '14px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '600' }}>{l.student_name} ({l.roll_number})</h4>
                    <span className={`badge ${l.status === 'APPROVED' ? 'badge-emerald' : l.status === 'PENDING' ? 'badge-amber' : 'badge-rose'}`}>
                      {l.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>To: <strong>{l.destination}</strong> | Reason: {l.reason}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: '4px 0' }}>
                    Dates: {l.departure_date} to {l.return_date}
                  </p>

                  {l.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button onClick={() => handleUpdateLeaveStatus(l.id, 'APPROVED')} className="btn btn-success" style={{ fontSize: '0.78rem', padding: '4px 12px' }}>
                        <Check size={14} /> Approve
                      </button>
                      <button onClick={() => handleUpdateLeaveStatus(l.id, 'REJECTED')} className="btn btn-danger" style={{ fontSize: '0.78rem', padding: '4px 12px' }}>
                        <X size={14} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Staff Assignment Modal */}
      {selectedTicket && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ maxWidth: '420px', width: '90%' }}>
            <h3 style={{ marginBottom: '12px' }}>Assign Staff to Ticket</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Ticket: <strong>{selectedTicket.title}</strong> (Room {selectedTicket.room_number})
            </p>

            <div className="form-group">
              <label className="form-label">Staff Name / Technician</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Electrician Suresh / Plumber Ramesh"
                value={staffName}
                onChange={e => setStaffName(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'IN_PROGRESS', staffName || 'Technician Assigned')}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                Confirm Assignment
              </button>
              <button onClick={() => setSelectedTicket(null)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
