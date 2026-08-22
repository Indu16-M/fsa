import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Package, Clock, MapPin, CheckCircle, XCircle, BarChart3, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReceiverHistory = () => {
  const { token } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/claims/my-claims', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setClaims(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const tabs = [
    { key: 'all', label: 'All History', statuses: null },
    { key: 'completed', label: 'Completed', statuses: ['COMPLETED', 'FOOD_COLLECTED'] },
    { key: 'cancelled', label: 'Cancelled', statuses: ['CANCELLED'] },
    { key: 'active', label: 'Active', statuses: ['CLAIMED', 'ON_THE_WAY', 'ARRIVED'] },
  ];

  const filteredClaims = activeTab === 'all' ? claims : claims.filter(c => (tabs.find(t => t.key === activeTab)?.statuses || []).includes(c.status));

  const getStatusStyle = (status) => {
    const map = {
      COMPLETED: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'Completed' },
      FOOD_COLLECTED: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'Food Collected' },
      CLAIMED: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', label: 'Claimed' },
      ON_THE_WAY: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', label: 'On the Way' },
      ARRIVED: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Arrived' },
      CANCELLED: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Cancelled' },
    };
    return map[status] || { color: 'var(--text-secondary)', bg: 'var(--bg-tertiary)', label: status };
  };

  const stats = {
    total: claims.length,
    completed: claims.filter(c => ['COMPLETED','FOOD_COLLECTED'].includes(c.status)).length,
    cancelled: claims.filter(c => c.status === 'CANCELLED').length,
    active: claims.filter(c => ['CLAIMED','ON_THE_WAY','ARRIVED'].includes(c.status)).length,
  };

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Food History</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>All your past and current food claims.</p>
      </header>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Claims', value: stats.total, color: 'var(--primary-color)', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Completed', value: stats.completed, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Active', value: stats.active, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
          { label: 'Cancelled', value: stats.cancelled, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
        ].map((s, i) => (
          <div key={i} style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{ padding: '0.5rem 1.1rem', borderRadius: '20px', border: '1px solid', borderColor: activeTab === tab.key ? 'var(--primary-color)' : 'var(--border-color)', backgroundColor: activeTab === tab.key ? 'var(--primary-color)' : 'transparent', color: activeTab === tab.key ? 'white' : 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Claims List */}
      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Loading history...</p>
      ) : filteredClaims.length === 0 ? (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
          <BarChart3 size={44} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No records found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>No claims in this category yet.</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/receiver/find-food')}>Find Food</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredClaims.map(claim => {
            const statusStyle = getStatusStyle(claim.status);
            const isActive = ['CLAIMED', 'ON_THE_WAY', 'ARRIVED'].includes(claim.status);
            return (
              <div key={claim.id} style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '14px', border: '1px solid var(--border-color)', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{claim.donation_title}</h3>
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                      {statusStyle.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={13} /> Claimed: {new Date(claim.claimed_at).toLocaleDateString()}
                    </div>
                    {claim.completed_at && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981' }}>
                        <CheckCircle size={13} /> Collected: {new Date(claim.completed_at).toLocaleDateString()}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Package size={13} /> Claim #{claim.id}
                    </div>
                  </div>
                </div>
                <div>
                  <button className="btn" style={{ border: '1px solid var(--border-color)', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
                    onClick={() => isActive ? navigate(`/receiver/pickup/${claim.id}`) : navigate(`/receiver/claims/${claim.id}`)}>
                    {isActive ? 'VIEW PICKUP' : 'VIEW DETAILS'} <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReceiverHistory;
