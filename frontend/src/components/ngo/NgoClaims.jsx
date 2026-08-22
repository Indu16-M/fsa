import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, MapPin, CheckCircle, Navigation, ArrowRight, XCircle, Search } from 'lucide-react';

const NgoClaims = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ACTIVE');

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const res = await fetch('/api/ngo/claims', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setClaims(data);
      }
    } catch (err) {
      console.error('Error fetching claims:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredClaims = claims.filter((c) => {
    if (activeTab === 'ACTIVE') return ['CLAIMED', 'ON_THE_WAY', 'ARRIVED'].includes(c.status);
    if (activeTab === 'COMPLETED') return ['FOOD_COLLECTED', 'COMPLETED'].includes(c.status);
    if (activeTab === 'CANCELLED') return c.status === 'CANCELLED';
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'CLAIMED': return { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' };
      case 'ON_THE_WAY': return { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' };
      case 'ARRIVED': return { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' };
      case 'FOOD_COLLECTED':
      case 'COMPLETED': return { color: '#10b981', bg: 'rgba(16,185,129,0.12)' };
      default: return { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--text-primary, #111827)', margin: '0 0 0.35rem 0' }}>
            My Food Claims & Pickups
          </h1>
          <p style={{ color: 'var(--text-secondary, #6b7280)', margin: 0, fontSize: '0.96rem' }}>
            Manage active recovery pickups, view handover codes, and track past distributions.
          </p>
        </div>
        <button
          onClick={() => navigate('/ngo/find-food')}
          style={{ padding: '0.75rem 1.4rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Search size={16} /> Find More Food
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color, #e5e7eb)', paddingBottom: '0.85rem' }}>
        {[
          { key: 'ACTIVE', label: 'Active Pickups', count: claims.filter(c => ['CLAIMED', 'ON_THE_WAY', 'ARRIVED'].includes(c.status)).length },
          { key: 'COMPLETED', label: 'Collected & Completed', count: claims.filter(c => ['FOOD_COLLECTED', 'COMPLETED'].includes(c.status)).length },
          { key: 'CANCELLED', label: 'Cancelled', count: claims.filter(c => c.status === 'CANCELLED').length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: activeTab === tab.key ? '#10b981' : 'transparent',
              backgroundColor: activeTab === tab.key ? '#10b981' : 'transparent',
              color: activeTab === tab.key ? 'white' : 'var(--text-primary, #4b5563)',
              fontSize: '0.86rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.15s'
            }}
          >
            <span>{tab.label}</span>
            <span style={{ padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.74rem', backgroundColor: activeTab === tab.key ? 'rgba(255,255,255,0.25)' : '#e5e7eb', color: activeTab === tab.key ? 'white' : '#4b5563' }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Claims List */}
      {loading ? (
        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #e5e7eb', borderTop: '3px solid #10b981', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: '#6b7280' }}>Loading claims...</p>
        </div>
      ) : filteredClaims.length === 0 ? (
        <div style={{ backgroundColor: 'var(--bg-secondary, #ffffff)', padding: '4rem 2rem', borderRadius: '18px', border: '1px dashed var(--border-color, #e5e7eb)', textAlign: 'center' }}>
          <Package size={44} color="#9ca3af" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827', marginBottom: '0.35rem' }}>
            No {activeTab.toLowerCase()} claims found
          </h3>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {activeTab === 'ACTIVE' ? "You don't have any ongoing pickups right now." : `No ${activeTab.toLowerCase()} claims recorded.`}
          </p>
          {activeTab === 'ACTIVE' && (
            <button onClick={() => navigate('/ngo/find-food')} style={{ padding: '0.6rem 1.3rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
              Browse Available Food
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredClaims.map((claim) => {
            const statusStyle = getStatusColor(claim.status);
            const isActive = ['CLAIMED', 'ON_THE_WAY', 'ARRIVED'].includes(claim.status);

            return (
              <div
                key={claim.id}
                style={{
                  backgroundColor: 'var(--bg-secondary, #ffffff)',
                  borderRadius: '16px',
                  border: '1px solid var(--border-color, #e5e7eb)',
                  padding: '1.4rem 1.6rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1.25rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary, #111827)', margin: 0 }}>
                      {claim.donation_title}
                    </h3>
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.76rem', fontWeight: 800, backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                      {(claim.status || '').replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600 }}>
                      Claim #{claim.id}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.85rem', color: '#6b7280' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={14} /> Claimed on {new Date(claim.claimed_at).toLocaleDateString()}
                    </div>
                    {claim.verification_code && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#047857', fontWeight: 700 }}>
                        <span>Code:</span>
                        <code style={{ backgroundColor: 'rgba(16,185,129,0.12)', padding: '0.1rem 0.5rem', borderRadius: '4px', letterSpacing: '0.08em' }}>
                          {claim.verification_code}
                        </code>
                      </div>
                    )}
                    {claim.donor_address && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <MapPin size={14} color="#10b981" /> {claim.donor_address}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action */}
                <div>
                  {isActive ? (
                    <button
                      onClick={() => navigate(`/ngo/pickup/${claim.id}`)}
                      style={{
                        padding: '0.75rem 1.3rem',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <Navigation size={16} /> VIEW PICKUP MAP
                    </button>
                  ) : claim.status === 'FOOD_COLLECTED' ? (
                    <button
                      onClick={() => navigate('/ngo/distribution')}
                      style={{
                        padding: '0.75rem 1.3rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      RECORD DISTRIBUTION →
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.86rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <CheckCircle size={16} /> Completed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default NgoClaims;
