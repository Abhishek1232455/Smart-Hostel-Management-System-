import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Utensils, Star, TrendingUp, MessageSquare } from 'lucide-react';

export default function MessAnalytics() {
  const { apiFetch } = useAuth();
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrends();
  }, []);

  const loadTrends = async () => {
    try {
      const data = await apiFetch('/api/mess/trends');
      setTrends(data);
    } catch (err) {
      console.error("Failed to load mess trends:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !trends) {
    return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading Mess Analytics...</div>;
  }

  const { dishRankings, dailyTrends, recentReviews } = trends;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-card">
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Utensils color="var(--accent-amber)" size={24} /> Mess Menu Analytics & Student Ratings
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Real-time student rating trends per dish and daily satisfaction index.</p>
      </div>

      <div className="grid-2">
        {/* Dish Rankings Table */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star color="var(--accent-amber)" size={20} /> Dish Rating Leaderboard
          </h3>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Meal</th>
                  <th>Dish Name</th>
                  <th>Avg Rating</th>
                  <th>Total Reviews</th>
                </tr>
              </thead>
              <tbody>
                {dishRankings.map((dish, idx) => (
                  <tr key={idx}>
                    <td><span className="badge badge-primary">{dish.meal_type}</span></td>
                    <td style={{ fontWeight: '600' }}>{dish.dish_name}</td>
                    <td style={{ color: 'var(--accent-amber)', fontWeight: '700' }}>
                      ★ {dish.avg_rating} / 5.0
                    </td>
                    <td>{dish.total_reviews} reviews</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Student Reviews */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare color="var(--accent-cyan)" size={20} /> Recent Feedback Reviews
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
            {recentReviews.map(r => (
              <div key={r.id} style={{ padding: '14px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '600' }}>{r.dish_name} ({r.meal_type})</h4>
                  <span style={{ color: 'var(--accent-amber)', fontWeight: 'bold' }}>★ {r.rating}/5</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>"{r.comments || 'No comment provided.'}"</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                  By {r.student_name} on {r.date}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
