import React, { useEffect, useState } from 'react';
import { Package, Utensils, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DonorHomeView = ({ onChangeView }) => {
  const { getAuthHeaders, user } = useAuth();
  const [impact, setImpact] = useState({
    totalDonations: 0,
    foodSavedKg: 0,
    mealsShared: 0,
    peopleHelped: 0
  });
  const [activeDonations, setActiveDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImpact();
    fetchActiveDonations();
  }, []);

  const fetchImpact = async () => {
    try {
      const res = await fetch('/api/donations/impact', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setImpact(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchActiveDonations = async () => {
    try {
      const res = await fetch('/api/donations/history', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        // filter out completed and expired
        setActiveDonations(data.filter(d => !['COMPLETED', 'EXPIRED', 'CANCELLED'].includes(d.status)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="donor-home-view fade-in">
      <div className="welcome-banner">
        <h2>Welcome back, {user?.username}! 🌟</h2>
        <p>Your contributions are making a real difference. See your impact below.</p>
      </div>

      {/* Impact Stats Grid */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', margin: '2rem 0' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <Package size={24} />
          </div>
          <div className="stat-info">
            <h4>{impact.totalDonations}</h4>
            <p>Total Donations</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <h4>{impact.foodSavedKg} kg</h4>
            <p>Food Saved</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <Utensils size={24} />
          </div>
          <div className="stat-info">
            <h4>{impact.mealsShared}</h4>
            <p>Meals Shared</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h4>{impact.peopleHelped}</h4>
            <p>People Helped</p>
          </div>
        </div>
      </div>

      {/* Quick Actions & Active Donations */}
      <div className="home-content-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        <div className="panel action-panel" style={{ backgroundColor: 'var(--bg-tertiary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3>Got Surplus Food?</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Help nearby NGOs by donating your excess food right now.</p>
          </div>
          <button className="btn btn-primary" onClick={() => onChangeView('donate')}>
            Donate Food Now <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
          </button>
        </div>

        <div className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 className="panel-title">Active Donations</h3>
            <button className="btn-link" onClick={() => onChangeView('history')}>View All</button>
          </div>

          {loading ? (
            <p className="text-muted">Loading...</p>
          ) : activeDonations.length === 0 ? (
            <div className="empty-state">
              <p>No active donations right now.</p>
              <button className="btn btn-secondary mt-2" onClick={() => onChangeView('donate')}>Create One</button>
            </div>
          ) : (
            <div className="active-donations-list">
              {activeDonations.slice(0, 3).map(don => (
                <div key={don.id} className="donation-list-item" style={{ display: 'flex', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0 }}>{don.title}</h4>
                    <small style={{ color: 'var(--text-muted)' }}>{don.quantity} {don.quantity_unit} • {don.food_type}</small>
                  </div>
                  <div>
                    <span className={`status-badge status-${don.status}`}>
                      {don.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonorHomeView;
