import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Navigation, Clock, CheckCircle, ArrowLeft, Key } from 'lucide-react';

const ReceiverClaimDetail = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClaimDetail();
  }, [id]);

  const fetchClaimDetail = async () => {
    try {
      const res = await fetch(`/api/claims/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setClaim(data);
      } else {
        setError(data.message || 'Failed to fetch claim details.');
      }
    } catch (err) {
      setError('An error occurred while fetching details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading claim details...</div>;
  if (error) return <div style={{ color: 'var(--danger)', padding: '2rem' }}>{error}</div>;
  if (!claim) return <div>Claim not found.</div>;

  return (
    <div>
      <button 
        onClick={() => navigate('/receiver/claims')} 
        style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontWeight: 600 }}
      >
        <ArrowLeft size={18} /> Back to My Pickups
      </button>

      {location.state?.justClaimed && (
        <div style={{ padding: '1.5rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', borderRadius: '12px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--success)' }}>
          <CheckCircle size={28} />
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Food Claimed Successfully! 🎉</h3>
            <p>Your pickup location is now available. Please proceed to pick up the food.</p>
          </div>
        </div>
      )}

      <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>{claim.donation_title}</h1>
        
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '2rem' }}>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Status</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-color)' }}>{claim.status.replace(/_/g, ' ')}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Claimed On</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{new Date(claim.claimed_at).toLocaleString()}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Distance</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{claim.distance_km} km</div>
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Key size={20} color="var(--primary-color)" /> Security Verification
          </h3>
          <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '12px' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Provide this code to the donor when you arrive to verify your identity.</p>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '4px', color: 'var(--primary-color)' }}>
              {claim.verification_code}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
            onClick={() => navigate(`/receiver/pickup/${claim.id}`)}
          >
            <MapPin size={20} /> VIEW PICKUP MAP & LOCATION
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiverClaimDetail;
