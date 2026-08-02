import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { User, QrCode, Wrench, Utensils, PlaneTakeoff, Clock, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function StudentDashboard() {
  const { user, apiFetch, setUser } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [visitorPasses, setVisitorPasses] = useState([]);
  const [maintenanceTickets, setMaintenanceTickets] = useState([]);
  const [holidayPasses, setHolidayPasses] = useState([]);

  // Allotment form
  const [prefFloor, setPrefFloor] = useState(1);
  const [prefType, setPrefType] = useState('Single');
  const [prefBlock, setPrefBlock] = useState('Block A');
  const [allotMsg, setAllotMsg] = useState('');

  // Visitor form
  const [visName, setVisName] = useState('');
  const [visPhone, setVisPhone] = useState('');
  const [visPurpose, setVisPurpose] = useState('');
  const [visMsg, setVisMsg] = useState('');

  // Ticket form
  const [mCategory, setMCategory] = useState('Plumbing');
  const [mPriority, setMPriority] = useState('Medium');
  const [mTitle, setMTitle] = useState('');
  const [mDesc, setMDesc] = useState('');
  const [tMsg, setTMsg] = useState('');

  // Mess form
  const [messMeal, setMessMeal] = useState('Breakfast');
  const [messDish, setMessDish] = useState('Poha & Jalebi');
  const [messRating, setMessRating] = useState(5);
  const [messComment, setMessComment] = useState('');
  const [messMsg, setMessMsg] = useState('');

  // Holiday form
  const [hDest, setHDest] = useState('');
  const [hReason, setHReason] = useState('');
  const [hDepDate, setHDepDate] = useState('');
  const [hRetDate, setHRetDate] = useState('');
  const [hMsg, setHMsg] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const vRes = await apiFetch('/api/visitors/my-passes');
      setVisitorPasses(vRes.passes || []);

      const mRes = await apiFetch('/api/maintenance/my-tickets');
      setMaintenanceTickets(mRes.tickets || []);

      const hRes = await apiFetch('/api/holiday/my-passes');
      setHolidayPasses(hRes.passes || []);
    } catch (err) {
      console.error("Failed to load student data:", err);
    }
  };

  const handleAllotment = async (e) => {
    e.preventDefault();
    setAllotMsg('');
    try {
      const res = await apiFetch('/api/rooms/allot', {
        method: 'POST',
        body: JSON.stringify({
          preferred_floor: prefFloor,
          preferred_room_type: prefType,
          preferred_block: prefBlock
        })
      });
      setAllotMsg(res.message);
      // Refresh user profile
      const meRes = await apiFetch('/api/auth/me');
      setUser(meRes.user);
    } catch (err) {
      setAllotMsg('Error: ' + err.message);
    }
  };

  const handleCreatePass = async (e) => {
    e.preventDefault();
    setVisMsg('');
    try {
      const res = await apiFetch('/api/visitors/pass', {
        method: 'POST',
        body: JSON.stringify({ visitor_name: visName, visitor_phone: visPhone, purpose: visPurpose })
      });
      setVisMsg(res.message);
      setVisName('');
      setVisPhone('');
      setVisPurpose('');
      loadData();
    } catch (err) {
      setVisMsg('Error: ' + err.message);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setTMsg('');
    try {
      const res = await apiFetch('/api/maintenance/ticket', {
        method: 'POST',
        body: JSON.stringify({ category: mCategory, priority: mPriority, title: mTitle, description: mDesc })
      });
      setTMsg('Ticket submitted successfully!');
      setMTitle('');
      setMDesc('');
      loadData();
    } catch (err) {
      setTMsg('Error: ' + err.message);
    }
  };

  const handleMessRating = async (e) => {
    e.preventDefault();
    setMessMsg('');
    try {
      await apiFetch('/api/mess/rating', {
        method: 'POST',
        body: JSON.stringify({ meal_type: messMeal, dish_name: messDish, rating: messRating, comments: messComment })
      });
      setMessMsg('Rating submitted! Thank you.');
      setMessComment('');
    } catch (err) {
      setMessMsg('Error: ' + err.message);
    }
  };

  const handleHolidayPass = async (e) => {
    e.preventDefault();
    setHMsg('');
    try {
      await apiFetch('/api/holiday/request', {
        method: 'POST',
        body: JSON.stringify({ destination: hDest, reason: hReason, departure_date: hDepDate, return_date: hRetDate })
      });
      setHMsg('Gate pass request submitted to Warden!');
      setHDest('');
      setHReason('');
      loadData();
    } catch (err) {
      setHMsg('Error: ' + err.message);
    }
  };

  return (
    <div>
      {/* Profile Overview Card */}
      <div className="glass-card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(6,182,212,0.05))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Welcome, {user.name}</h2>
              <span className="badge badge-primary">{user.batch || 'Batch 2024'}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Roll Number: <strong>{user.roll_number || 'N/A'}</strong> | Email: {user.email}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ padding: '12px 20px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', textAlign: 'center' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ALLOTTED ROOM</p>
              <h3 style={{ fontSize: '1.3rem', color: user.room ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                {user.room ? user.room.room_number : 'Not Allotted'}
              </h3>
            </div>

            <div style={{ padding: '12px 20px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', textAlign: 'center' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>HOSTEL BLOCK</p>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--primary)' }}>
                {user.room ? user.room.block : 'Pending'}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Navigation */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('overview')} className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}>
          <User size={16} /> Room & Overview
        </button>
        <button onClick={() => setActiveTab('visitor')} className={`btn ${activeTab === 'visitor' ? 'btn-primary' : 'btn-secondary'}`}>
          <QrCode size={16} /> Visitor Pass (8h QR)
        </button>
        <button onClick={() => setActiveTab('maintenance')} className={`btn ${activeTab === 'maintenance' ? 'btn-primary' : 'btn-secondary'}`}>
          <Wrench size={16} /> Maintenance Ticket
        </button>
        <button onClick={() => setActiveTab('mess')} className={`btn ${activeTab === 'mess' ? 'btn-primary' : 'btn-secondary'}`}>
          <Utensils size={16} /> Mess Rating
        </button>
        <button onClick={() => setActiveTab('holiday')} className={`btn ${activeTab === 'holiday' ? 'btn-primary' : 'btn-secondary'}`}>
          <PlaneTakeoff size={16} /> Holiday Gate Pass
        </button>
      </div>

      {/* TAB 1: Room Allotment Engine */}
      {activeTab === 'overview' && (
        <div className="grid-2">
          <div className="glass-card">
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="var(--primary)" /> Preference Allotment Engine
            </h3>
            {user.room ? (
              <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                <CheckCircle2 color="var(--accent-emerald)" size={24} style={{ marginBottom: '8px' }} />
                <h4 style={{ color: 'var(--accent-emerald)', marginBottom: '4px' }}>Room Allotment Confirmed</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  You have been assigned to <strong>Room {user.room.room_number}</strong> ({user.room.block}, Floor {user.room.floor}, Type: {user.room.room_type}).
                </p>
              </div>
            ) : (
              <form onSubmit={handleAllotment}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Our algorithm calculates room availability and matches your floor, block, and room type preferences.
                </p>

                {allotMsg && <div style={{ marginBottom: '16px', color: allotMsg.includes('Error') ? 'var(--accent-rose)' : 'var(--accent-emerald)', fontSize: '0.9rem' }}>{allotMsg}</div>}

                <div className="form-group">
                  <label className="form-label">Preferred Block</label>
                  <select className="form-select" value={prefBlock} onChange={e => setPrefBlock(e.target.value)}>
                    <option value="Block A">Block A (North Wing)</option>
                    <option value="Block B">Block B (South Wing)</option>
                    <option value="Block C">Block C (East Wing)</option>
                    <option value="Block D">Block D (West Wing)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Floor</label>
                  <select className="form-select" value={prefFloor} onChange={e => setPrefFloor(e.target.value)}>
                    <option value={1}>1st Floor (Ground Level)</option>
                    <option value={2}>2nd Floor</option>
                    <option value={3}>3rd Floor</option>
                    <option value={4}>4th Floor</option>
                    <option value={5}>5th Floor</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Room Type</label>
                  <select className="form-select" value={prefType} onChange={e => setPrefType(e.target.value)}>
                    <option value="Single">Single Occupancy</option>
                    <option value="Double">Double Sharing</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Run Preference Matching Engine
                </button>
              </form>
            )}
          </div>

          <div className="glass-card">
            <h3 style={{ marginBottom: '16px' }}>Hostel Rules & Quick Notices</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', fontSize: '0.88rem' }}>
                📌 <strong>Curfew Timing:</strong> Main Gate closes at 10:00 PM. Gate passes required for late entry.
              </li>
              <li style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', fontSize: '0.88rem' }}>
                📌 <strong>Visitor Pass Validity:</strong> Visitor QR codes automatically expire 8 hours after issuance.
              </li>
              <li style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', fontSize: '0.88rem' }}>
                📌 <strong>Maintenance SLA:</strong> Tickets unresolved past 48 hours trigger high-urgency Warden alerts.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 2: Visitor Pass QR Generator */}
      {activeTab === 'visitor' && (
        <div className="grid-2">
          <div className="glass-card">
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <QrCode size={20} color="var(--accent-cyan)" /> Generate Visitor Pass (8h Limit)
            </h3>
            
            {visMsg && <div style={{ marginBottom: '16px', color: visMsg.includes('Error') ? 'var(--accent-rose)' : 'var(--accent-emerald)', fontSize: '0.9rem' }}>{visMsg}</div>}

            <form onSubmit={handleCreatePass}>
              <div className="form-group">
                <label className="form-label">Visitor Full Name</label>
                <input type="text" className="form-input" placeholder="e.g. Ramesh Sharma" value={visName} onChange={e => setVisName(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Visitor Contact Phone</label>
                <input type="text" className="form-input" placeholder="e.g. 9876543210" value={visPhone} onChange={e => setVisPhone(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Purpose of Visit</label>
                <input type="text" className="form-input" placeholder="e.g. Parent Visit / Book Delivery" value={visPurpose} onChange={e => setVisPurpose(e.target.value)} required />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Generate QR Code Pass (Valid 8h)
              </button>
            </form>
          </div>

          <div className="glass-card">
            <h3 style={{ marginBottom: '16px' }}>Active & Past Visitor Passes</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '420px', overflowY: 'auto' }}>
              {visitorPasses.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No visitor passes generated yet.</p>
              ) : (
                visitorPasses.map(pass => (
                  <div key={pass.id} style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid var(--border-glass)', display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ padding: '8px', background: '#fff', borderRadius: '8px' }}>
                      <QRCodeSVG value={pass.token || pass.pass_code} size={80} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: '600' }}>{pass.visitor_name}</h4>
                        <span className={`badge ${pass.status === 'ACTIVE' ? 'badge-emerald' : 'badge-rose'}`}>
                          {pass.status}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Code: {pass.pass_code} | Purpose: {pass.purpose}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', marginTop: '4px' }}>
                        <Clock size={12} inline="true" /> Valid until: {new Date(pass.valid_until).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Maintenance Tickets */}
      {activeTab === 'maintenance' && (
        <div className="grid-2">
          <div className="glass-card">
            <h3 style={{ marginBottom: '16px' }}>Submit Maintenance Ticket</h3>
            {tMsg && <div style={{ marginBottom: '16px', color: tMsg.includes('Error') ? 'var(--accent-rose)' : 'var(--accent-emerald)', fontSize: '0.9rem' }}>{tMsg}</div>}
            
            <form onSubmit={handleCreateTicket}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={mCategory} onChange={e => setMCategory(e.target.value)}>
                  <option value="Plumbing">Plumbing (Tap / Flush / Leakage)</option>
                  <option value="Electrical">Electrical (Light / Fan / Socket)</option>
                  <option value="Furniture">Furniture (Bed / Desk / Chair)</option>
                  <option value="Internet">Wi-Fi & Internet</option>
                  <option value="Cleanliness">Room Cleanliness</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Urgency / Priority</label>
                <select className="form-select" value={mPriority} onChange={e => setMPriority(e.target.value)}>
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Urgent</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Issue Title</label>
                <input type="text" className="form-input" placeholder="e.g. Leaking bathroom faucet" value={mTitle} onChange={e => setMTitle(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Description</label>
                <textarea className="form-textarea" rows={3} placeholder="Provide details about the issue..." value={mDesc} onChange={e => setMDesc(e.target.value)} required />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Submit Maintenance Ticket
              </button>
            </form>
          </div>

          <div className="glass-card">
            <h3 style={{ marginBottom: '16px' }}>My Submitted Tickets</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
              {maintenanceTickets.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No maintenance tickets submitted.</p>
              ) : (
                maintenanceTickets.map(t => (
                  <div key={t.id} style={{ padding: '14px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '600' }}>{t.title}</h4>
                      <span className={`badge ${t.isSlaBreached ? 'badge-rose' : t.status === 'RESOLVED' ? 'badge-emerald' : 'badge-amber'}`}>
                        {t.isSlaBreached ? 'SLA BREACHED (>48h)' : t.status}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>{t.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      <span>Cat: {t.category} | Priority: {t.priority}</span>
                      <span>{t.ageInHours}h ago</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Mess Rating */}
      {activeTab === 'mess' && (
        <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Utensils size={20} color="var(--accent-amber)" /> Rate Today's Mess Food
          </h3>
          
          {messMsg && <div style={{ marginBottom: '16px', color: 'var(--accent-emerald)', fontSize: '0.9rem' }}>{messMsg}</div>}

          <form onSubmit={handleMessRating}>
            <div className="form-group">
              <label className="form-label">Meal Type</label>
              <select className="form-select" value={messMeal} onChange={e => setMessMeal(e.target.value)}>
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Dish Name</label>
              <input type="text" className="form-input" value={messDish} onChange={e => setMessDish(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Rating (1 to 5 Stars)</label>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setMessRating(star)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-glass)',
                      background: messRating >= star ? 'rgba(245,158,11,0.2)' : 'rgba(0,0,0,0.2)',
                      color: messRating >= star ? 'var(--accent-amber)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '1rem'
                    }}
                  >
                    ★ {star}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Comments / Feedback</label>
              <textarea className="form-textarea" rows={3} placeholder="Was it good, spicy, or undercooked?" value={messComment} onChange={e => setMessComment(e.target.value)} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Submit Feedback
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: Holiday Gate Pass */}
      {activeTab === 'holiday' && (
        <div className="grid-2">
          <div className="glass-card">
            <h3 style={{ marginBottom: '16px' }}>Apply for Holiday Leave Gate Pass</h3>
            {hMsg && <div style={{ marginBottom: '16px', color: 'var(--accent-emerald)', fontSize: '0.9rem' }}>{hMsg}</div>}
            
            <form onSubmit={handleHolidayPass}>
              <div className="form-group">
                <label className="form-label">Destination City / Place</label>
                <input type="text" className="form-input" placeholder="e.g. Jaipur / Delhi" value={hDest} onChange={e => setHDest(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Reason for Leave</label>
                <input type="text" className="form-input" placeholder="e.g. Festival / Family Event" value={hReason} onChange={e => setHReason(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Departure Date</label>
                <input type="date" className="form-input" value={hDepDate} onChange={e => setHDepDate(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Expected Return Date</label>
                <input type="date" className="form-input" value={hRetDate} onChange={e => setHRetDate(e.target.value)} required />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Submit Leave Application
              </button>
            </form>
          </div>

          <div className="glass-card">
            <h3 style={{ marginBottom: '16px' }}>My Leave Passes</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
              {holidayPasses.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No holiday passes requested.</p>
              ) : (
                holidayPasses.map(p => (
                  <div key={p.id} style={{ padding: '14px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '600' }}>To: {p.destination}</h4>
                      <span className={`badge ${p.status === 'APPROVED' ? 'badge-emerald' : p.status === 'PENDING' ? 'badge-amber' : 'badge-rose'}`}>
                        {p.status}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Reason: {p.reason}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      From {p.departure_date} to {p.return_date}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
