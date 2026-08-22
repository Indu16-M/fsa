import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Package, Clock, Heart, ArrowRight, Search, Utensils, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReceiverDashboard = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    availableMeals: 0,
    activeClaims: 0,
    expiringSoon: 0,
    mealsCollected: 0
  });
  
  const [activeClaim, setActiveClaim] = useState(null);
  const [recentFood, setRecentFood] = useState([]);
  const [loading, setLoading] = useState(true);

  const quickActions = [
    { icon: <Search size={26} />, label: 'Find Food', sub: 'Browse available donations', path: '/receiver/find-food', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    { icon: <Package size={26} />, label: 'My Claims', sub: 'Track active pickups', path: '/receiver/claims', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    { icon: <Utensils size={26} />, label: 'Request Food', sub: 'Submit a request', path: '/receiver/requests', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    { icon: <BarChart3 size={26} />, label: 'Food History', sub: 'Past claims & pickups', path: '/receiver/history', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  ];

  useEffect(() => {
    fetchDashboardData();
    const intervalId = setInterval(() => fetchDashboardData(true), 10000);
    return () => clearInterval(intervalId);
  }, []);

  const fetchDashboardData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [resFood, resClaims] = await Promise.all([
        fetch('/api/claims/available', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/claims/my-claims', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const availableData = resFood.ok ? await resFood.json() : [];
      const claimsData = resClaims.ok ? await resClaims.json() : [];
      const now = new Date();
      const expiringCount = availableData.filter(f => {
        const h = (new Date(f.estimated_expiry) - now) / (1000 * 60 * 60);
        return h > 0 && h < 12;
      }).length;
      const active = claimsData.filter(c => ['CLAIMED', 'ON_THE_WAY', 'ARRIVED'].includes(c.status));
      const completed = claimsData.filter(c => ['COMPLETED', 'FOOD_COLLECTED'].includes(c.status));
      setStats({ availableMeals: availableData.length, activeClaims: active.length, expiringSoon: expiringCount, mealsCollected: completed.length });
      setActiveClaim(active.length > 0 ? active[0] : null);
      setRecentFood(availableData.slice(0, 3));
    } catch (e) { console.error('Dashboard error:', e); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: '44px', height: '44px', border: '4px solid var(--border-color)', borderTop: '4px solid var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div>
      <header style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Welcome back, {user?.username} 👋</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.3rem' }}>Find fresh food near you and help reduce food waste.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#10b981', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#10b981' }}>Live Updates</span>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(195px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {[
          { icon: <MapPin size={22}/>, value: stats.availableMeals, label: 'Available Near You', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          { icon: <Package size={22}/>, value: stats.activeClaims, label: 'Active Claims', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
          { icon: <Clock size={22}/>, value: stats.expiringSoon, label: 'Expiring < 12h', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          { icon: <Heart size={22}/>, value: stats.mealsCollected, label: 'Meals Collected', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
        ].map((s, i) => (
          <div key={i} style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.85rem', backgroundColor: s.bg, borderRadius: '12px', color: s.color }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{s.value}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(195px, 1fr))', gap: '1rem' }}>
          {quickActions.map((a, i) => (
            <button key={i} onClick={() => navigate(a.path)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem', padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = a.color; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}>
              <div style={{ padding: '0.75rem', backgroundColor: a.bg, borderRadius: '12px', color: a.color }}>{a.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{a.label}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{a.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Bottom: Recent Food + Active Claim */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Recently Added</h2>
            <button onClick={() => navigate('/receiver/find-food')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem' }}>
              View All <ArrowRight size={16} />
            </button>
          </div>
          {recentFood.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
              <Search size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>No food available right now.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentFood.map(food => {
                const h = Math.max(0, (new Date(food.estimated_expiry) - new Date()) / (1000 * 60 * 60));
                return (
                  <div key={food.id} style={{ display: 'flex', gap: '1rem', padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '14px', border: '1px solid var(--border-color)', alignItems: 'center' }}>
                    {food.image_url ? (
                      <img src={food.image_url} alt={food.title} style={{ width: '76px', height: '76px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: '76px', height: '76px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Utensils size={26} color="var(--text-muted)" />
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{food.title}</h3>
                      <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                        {food.quantity} {food.quantity_unit} · {food.food_type} · 📍 {food.donor_city || 'Nearby'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: h < 6 ? '#ef4444' : '#f59e0b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={13} /> {h.toFixed(1)}h remaining
                      </div>
                    </div>
                    <button onClick={() => navigate(`/receiver/food/${food.id}`)} className="btn btn-primary" style={{ padding: '0.6rem 1.1rem' }}>View</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>My Active Claim</h2>
          {activeClaim ? (
            <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '2px solid var(--primary-color)', overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(135deg, var(--primary-color), #047857)', color: 'white', padding: '1rem 1.5rem' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>Status</div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{(activeClaim.status || '').replace(/_/g, ' ')}</div>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ fontWeight: 800, fontSize: '1.15rem', marginBottom: '0.5rem' }}>{activeClaim.donation_title}</h3>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={14} /> Claimed {new Date(activeClaim.claimed_at).toLocaleDateString()}
                </div>
                <div style={{ color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem' }}>
                  <MapPin size={14} /> Pickup location unlocked
                </div>
                <button onClick={() => navigate(`/receiver/pickup/${activeClaim.id}`)} className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={16} /> VIEW PICKUP MAP
                </button>
              </div>
            </div>
          ) : (
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '2.5rem 2rem', borderRadius: '16px', border: '1px dashed var(--border-color)', textAlign: 'center' }}>
              <Package size={44} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No Active Claims</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>You don't have any ongoing pickups.</p>
              <button onClick={() => navigate('/receiver/find-food')} className="btn" style={{ border: '1px solid var(--border-color)', backgroundColor: 'transparent', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <Search size={15} /> Find Food
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
};

export default ReceiverDashboard;
