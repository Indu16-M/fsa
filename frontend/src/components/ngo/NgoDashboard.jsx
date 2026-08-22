import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Package, MapPin, Clock, Heart, Users, FileText, 
  Utensils, AlertTriangle, ArrowRight, CheckCircle, 
  Search, PlusCircle, Navigation, Sparkles, ShieldCheck 
} from 'lucide-react';

const NgoDashboard = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOverview();
    const interval = setInterval(() => fetchOverview(true), 12000);
    return () => clearInterval(interval);
  }, []);

  const fetchOverview = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/ngo/overview', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        setError('Failed to load NGO dashboard data.');
      }
    } catch (err) {
      setError('Network error loading dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: 'Find Food', sub: 'Explore donor surplus', path: '/ngo/find-food', icon: <Search size={22} />, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    { label: 'Create Food Request', sub: 'Post requirement', path: '/ngo/requests', icon: <PlusCircle size={22} />, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    { label: 'My Claims', sub: 'Manage pickups', path: '/ngo/claims', icon: <Package size={22} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    { label: 'Pickup & Route', sub: 'In-app navigation', path: '/ngo/claims', icon: <Navigation size={22} />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
    { label: 'Add Beneficiary', sub: 'Manage communities', path: '/ngo/beneficiaries', icon: <Users size={22} />, color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
    { label: 'Record Distribution', sub: 'Log meals served', path: '/ngo/distribution', icon: <Utensils size={22} />, color: '#14b8a6', bg: 'rgba(20,184,166,0.12)' },
  ];

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
        <div style={{ width: '45px', height: '45px', border: '4px solid #e5e7eb', borderTop: '4px solid #10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#6b7280', fontWeight: 600 }}>Loading NGO operations dashboard...</p>
        <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const stats = data?.stats || {};
  const urgentActions = data?.urgent_actions || [];
  const activeClaim = data?.active_claim;
  const recentDonations = data?.recent_donations || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Welcome Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', backgroundColor: 'var(--bg-secondary, #ffffff)', padding: '1.75rem 2rem', borderRadius: '18px', border: '1px solid var(--border-color, #e5e7eb)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--text-primary, #111827)', margin: 0 }}>
              Welcome back, {data?.ngo_name || user?.username} 👋
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary, #6b7280)', fontSize: '1rem', margin: 0 }}>
            Together, let's make every meal matter. Real-time food recovery & community distribution.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1.1rem', backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.3)' }}>
          <ShieldCheck size={18} color="#10b981" />
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981' }}>
            Status: {data?.verification_badge || 'PENDING'}
          </span>
        </div>
      </div>

      {/* Urgent Actions Section (Extremely important for NGO usability) */}
      {urgentActions.length > 0 && (
        <section style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b45309', fontWeight: 800, fontSize: '1.05rem' }}>
            <AlertTriangle size={20} color="#f59e0b" />
            <span>Urgent Operational Actions</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {urgentActions.map((action, i) => (
              <div key={i} style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1.1rem 1.25rem', border: '1px solid #fef3c7', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#111827', marginBottom: '0.2rem' }}>
                    {action.title}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#6b7280' }}>
                    {action.description}
                  </div>
                </div>
                <button 
                  onClick={() => navigate(action.action_link)}
                  style={{ padding: '0.5rem 1rem', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap', cursor: 'pointer' }}
                >
                  {action.action_label}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8 Overview Statistics Cards */}
      <section>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary, #111827)' }}>
          Operational Statistics
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.1rem' }}>
          {[
            { label: 'Available Donations', value: stats.available_donations || 0, icon: <Search size={22} />, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
            { label: 'Active Claims', value: stats.active_claims || 0, icon: <Package size={22} />, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
            { label: 'Food Collected', value: stats.food_collected || 0, icon: <CheckCircle size={22} />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
            { label: 'Meals Distributed', value: (stats.meals_distributed || 0).toLocaleString(), icon: <Utensils size={22} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
            { label: 'People Served', value: (stats.people_served || 0).toLocaleString(), icon: <Heart size={22} />, color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
            { label: 'Food Saved', value: `${stats.food_saved_kg || 0} kg`, icon: <Package size={22} />, color: '#14b8a6', bg: 'rgba(20,184,166,0.1)' },
            { label: 'Pending Requests', value: stats.pending_requests || 0, icon: <FileText size={22} />, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
            { label: 'Active Beneficiaries', value: stats.active_beneficiaries || 0, icon: <Users size={22} />, color: '#059669', bg: 'rgba(5,150,105,0.1)' },
          ].map((stat, idx) => (
            <div key={idx} style={{ backgroundColor: 'var(--bg-secondary, #ffffff)', padding: '1.25rem 1.4rem', borderRadius: '16px', border: '1px solid var(--border-color, #e5e7eb)', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ padding: '0.85rem', backgroundColor: stat.bg, color: stat.color, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary, #111827)', lineHeight: 1.1 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary, #6b7280)', marginTop: '0.2rem' }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions Grid */}
      <section>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary, #111827)' }}>
          Quick Actions
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => navigate(action.path)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '0.6rem',
                padding: '1.25rem',
                backgroundColor: 'var(--bg-secondary, #ffffff)',
                border: '1px solid var(--border-color, #e5e7eb)',
                borderRadius: '16px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = action.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-color, #e5e7eb)';
              }}
            >
              <div style={{ padding: '0.7rem', backgroundColor: action.bg, color: action.color, borderRadius: '12px' }}>
                {action.icon}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.94rem', color: 'var(--text-primary, #111827)' }}>
                  {action.label}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #6b7280)', marginTop: '0.15rem' }}>
                  {action.sub}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Main Bottom Section: Recent Food & Active Pickup Highlight */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.75rem', alignItems: 'flex-start' }}>
        
        {/* Left Column: Recent Available Food */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary, #111827)', margin: 0 }}>
              Available Food for Recovery
            </h2>
            <button 
              onClick={() => navigate('/ngo/find-food')} 
              style={{ background: 'none', border: 'none', color: '#10b981', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}
            >
              View All <ArrowRight size={15} />
            </button>
          </div>

          {recentDonations.length === 0 ? (
            <div style={{ backgroundColor: 'var(--bg-secondary, #ffffff)', padding: '3rem 2rem', borderRadius: '16px', border: '1px dashed var(--border-color, #e5e7eb)', textAlign: 'center' }}>
              <Search size={40} color="#9ca3af" style={{ margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#374151', marginBottom: '0.35rem' }}>
                No surplus food currently listed
              </h3>
              <p style={{ color: '#6b7280', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                Post a custom food requirement so donors can directly fulfill it.
              </p>
              <button onClick={() => navigate('/ngo/requests')} style={{ padding: '0.6rem 1.2rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>
                Post Food Request
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {recentDonations.map((food) => {
                const hoursLeft = Math.max(0, (new Date(food.estimated_expiry) - new Date()) / 3600000);
                const isUrgent = hoursLeft < 2;
                return (
                  <div key={food.id} style={{ display: 'flex', gap: '1rem', padding: '1.1rem 1.25rem', backgroundColor: 'var(--bg-secondary, #ffffff)', borderRadius: '14px', border: '1px solid var(--border-color, #e5e7eb)', alignItems: 'center' }}>
                    {food.image_url ? (
                      <img src={food.image_url} alt={food.title} style={{ width: '74px', height: '74px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: '74px', height: '74px', borderRadius: '10px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Utensils size={26} color="#9ca3af" />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-primary, #111827)', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {food.title}
                      </h3>
                      <div style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '0.35rem' }}>
                        {food.quantity} {food.quantity_unit} · {food.food_type} · 📍 {food.donor_city || 'Nearby Area'} (~{food.distance_km || 2.5} km)
                      </div>
                      <div style={{ fontSize: '0.78rem', color: isUrgent ? '#ef4444' : '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={13} /> {isUrgent ? `⚠️ Urgent! ${hoursLeft.toFixed(1)}h left` : `${hoursLeft.toFixed(1)}h remaining`}
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/ngo/food/${food.id}`)} 
                      style={{ padding: '0.55rem 1.1rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      View & Claim
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Active Claim Highlight */}
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary, #111827)' }}>
            Active Pickup Operation
          </h2>

          {activeClaim ? (
            <div style={{ backgroundColor: 'var(--bg-secondary, #ffffff)', borderRadius: '18px', border: '2px solid #10b981', overflow: 'hidden', boxShadow: '0 4px 14px rgba(16,185,129,0.1)' }}>
              <div style={{ background: 'linear-gradient(135deg, #10b981, #047857)', color: 'white', padding: '1.1rem 1.4rem' }}>
                <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.85, fontWeight: 700 }}>Active Collection</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, marginTop: '0.15rem' }}>
                  {(activeClaim.status || '').replace(/_/g, ' ')}
                </div>
              </div>
              <div style={{ padding: '1.4rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827', marginBottom: '0.4rem' }}>
                  {activeClaim.donation_title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#6b7280', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                  <Clock size={14} /> Claimed on {new Date(activeClaim.claimed_at).toLocaleDateString()}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                  <MapPin size={14} /> Protected Pickup Address Unlocked
                </div>
                <button
                  onClick={() => navigate(`/ngo/pickup/${activeClaim.id}`)}
                  style={{ width: '100%', padding: '0.85rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '0.92rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Navigation size={17} /> OPEN PICKUP MAP
                </button>
              </div>
            </div>
          ) : (
            <div style={{ backgroundColor: 'var(--bg-secondary, #ffffff)', padding: '2.5rem 1.5rem', borderRadius: '18px', border: '1px dashed var(--border-color, #e5e7eb)', textAlign: 'center' }}>
              <Package size={42} color="#9ca3af" style={{ margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#374151', marginBottom: '0.35rem' }}>
                No active pickups
              </h3>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Browse available donor surplus food to arrange food collection.
              </p>
              <button 
                onClick={() => navigate('/ngo/find-food')} 
                style={{ padding: '0.6rem 1.2rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Find Surplus Food
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default NgoDashboard;
