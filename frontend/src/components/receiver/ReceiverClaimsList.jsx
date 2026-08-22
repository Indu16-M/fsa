import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Package, Clock, MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReceiverClaimsList = () => {
  const { token, user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyClaims();
  }, []);

  const fetchMyClaims = async () => {
    try {
      const res = await fetch('/api/claims/my-claims', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setClaims(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'CLAIMED': return 'var(--primary-color)';
      case 'ON_THE_WAY': return '#3b82f6';
      case 'ARRIVED': return '#8b5cf6';
      case 'COMPLETED': return 'var(--success)';
      case 'CANCELLED': return 'var(--danger)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>My Pickups</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Track and manage your claimed food donations.</p>
      </header>

      {loading ? (
        <p>Loading claims...</p>
      ) : claims.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: '16px' }}>
          <Package size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Claims Yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>You haven't claimed any food yet. Go to Find Food to see what's available!</p>
          <button className="btn btn-primary" onClick={() => navigate('/receiver/find-food')}>
            Find Food
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {claims.map(claim => (
            <div key={claim.id} style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{claim.donation_title}</h3>
                  <span style={{ padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, backgroundColor: getStatusColor(claim.status), color: 'white' }}>
                    {claim.status.replace(/_/g, ' ')}
                  </span>
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={14} /> Claimed: {new Date(claim.claimed_at).toLocaleDateString()}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={14} /> Dist: {claim.distance_km} km
                  </div>
                </div>
              </div>

              <div>
                <button 
                  className="btn btn-primary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  onClick={() => navigate(`/receiver/claims/${claim.id}`)}
                >
                  VIEW PICKUP DETAILS <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReceiverClaimsList;
