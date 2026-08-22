import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeft, MapPin, Clock, Package, Utensils, ShieldCheck, 
  AlertTriangle, CheckCircle, Info, Sparkles 
} from 'lucide-react';

const NgoFoodDetail = () => {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(null);

  useEffect(() => {
    fetchFoodDetails();
  }, [id]);

  const fetchFoodDetails = async () => {
    try {
      const res = await fetch(`/api/donations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFood(data);
      } else {
        setError('Donation not found or no longer available.');
      }
    } catch {
      setError('Network error fetching food details.');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!window.confirm(`Claim ${food.title} for your NGO? You will be responsible for collecting this food.`)) {
      return;
    }

    setClaiming(true);
    try {
      const res = await fetch(`/api/ngo/claims/${id}/claim`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (res.ok) {
        setClaimSuccess(data.claim);
      } else {
        alert(data.message || 'Failed to claim donation.');
      }
    } catch (err) {
      alert('Error processing claim. Please try again.');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #e5e7eb', borderTop: '3px solid #10b981', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: '#6b7280' }}>Loading donation specifications...</p>
      </div>
    );
  }

  if (error || !food) {
    return (
      <div style={{ backgroundColor: 'var(--bg-secondary, #ffffff)', padding: '3rem 2rem', borderRadius: '18px', border: '1px solid var(--border-color, #e5e7eb)', textAlign: 'center' }}>
        <AlertTriangle size={44} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>{error || 'Donation Not Found'}</h2>
        <button onClick={() => navigate('/ngo/find-food')} style={{ marginTop: '1rem', padding: '0.6rem 1.4rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
          Back to Find Food
        </button>
      </div>
    );
  }

  const hoursRemaining = Math.max(0, (new Date(food.estimated_expiry) - new Date()) / 3600000);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Back button */}
      <button
        onClick={() => navigate('/ngo/find-food')}
        style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', alignSelf: 'flex-start' }}
      >
        <ArrowLeft size={18} /> Back to Surplus Food List
      </button>

      {/* Claim Success Banner */}
      {claimSuccess && (
        <div style={{ backgroundColor: '#ecfdf5', border: '2px solid #10b981', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#065f46' }}>
            <CheckCircle size={24} color="#10b981" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, margin: 0 }}>
              Food Successfully Claimed for Your NGO!
            </h3>
          </div>
          <p style={{ color: '#047857', fontSize: '0.92rem', margin: 0 }}>
            Your claim #{claimSuccess.id} is confirmed. Handover Verification Code:{' '}
            <strong style={{ backgroundColor: 'rgba(16,185,129,0.2)', padding: '0.2rem 0.6rem', borderRadius: '6px', letterSpacing: '0.08em' }}>
              {claimSuccess.verification_code}
            </strong>
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button
              onClick={() => navigate(`/ngo/pickup/${claimSuccess.id}`)}
              style={{ padding: '0.75rem 1.4rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer' }}
            >
              PROCEED TO IN-APP PICKUP MAP →
            </button>
            <button
              onClick={() => navigate('/ngo/claims')}
              style={{ padding: '0.75rem 1.4rem', backgroundColor: 'transparent', border: '1px solid #10b981', color: '#065f46', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}
            >
              View My Claims
            </button>
          </div>
        </div>
      )}

      {/* Main Spec Card */}
      <div style={{ backgroundColor: 'var(--bg-secondary, #ffffff)', borderRadius: '20px', border: '1px solid var(--border-color, #e5e7eb)', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        
        {/* Hero image */}
        {food.image_url ? (
          <img src={food.image_url} alt={food.title} style={{ width: '100%', height: '280px', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '200px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Utensils size={60} color="#9ca3af" />
          </div>
        )}

        <div style={{ padding: '2rem' }}>
          
          {/* Title & Status */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary, #111827)', margin: '0 0 0.4rem 0' }}>
                {food.title}
              </h1>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ padding: '0.25rem 0.75rem', backgroundColor: 'rgba(16,185,129,0.12)', color: '#047857', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 800 }}>
                  {food.quantity} {food.quantity_unit}
                </span>
                <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#f3f4f6', color: '#374151', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700 }}>
                  {food.food_type}
                </span>
                <span style={{ padding: '0.25rem 0.75rem', backgroundColor: 'rgba(59,130,246,0.1)', color: '#2563eb', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700 }}>
                  {food.storage_condition || 'Ambient'}
                </span>
              </div>
            </div>

            <div style={{ padding: '0.6rem 1rem', backgroundColor: hoursRemaining < 2 ? '#fef2f2' : '#fffbeb', border: `1px solid ${hoursRemaining < 2 ? '#fecaca' : '#fde68a'}`, borderRadius: '12px', textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Remaining Shelf Life</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: hoursRemaining < 2 ? '#ef4444' : '#d97706' }}>
                {hoursRemaining.toFixed(1)} Hours
              </div>
            </div>
          </div>

          {/* Description */}
          {food.description && (
            <div style={{ marginBottom: '1.75rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                Food Description
              </h3>
              <p style={{ color: 'var(--text-secondary, #4b5563)', lineHeight: 1.6, fontSize: '0.96rem', margin: 0 }}>
                {food.description}
              </p>
            </div>
          )}

          {/* Key Specifications Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem', padding: '1.25rem', backgroundColor: 'var(--bg-primary, #f9fafb)', borderRadius: '14px', border: '1px solid var(--border-color, #e5e7eb)' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>Preparation Time</div>
              <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#111827', marginTop: '0.2rem' }}>
                {new Date(food.prep_time).toLocaleString()}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>Estimated Expiry</div>
              <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#111827', marginTop: '0.2rem' }}>
                {new Date(food.estimated_expiry).toLocaleString()}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>Risk Level</div>
              <div style={{ fontSize: '0.94rem', fontWeight: 800, color: food.risk_level === 'Safe' ? '#10b981' : '#f59e0b', marginTop: '0.2rem' }}>
                {food.risk_level || 'Safe'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>Temperature</div>
              <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#111827', marginTop: '0.2rem' }}>
                {food.temperature_celsius ? `${food.temperature_celsius}°C` : 'Room Temperature'}
              </div>
            </div>
          </div>

          {/* Location Privacy Callout */}
          <div style={{ padding: '1.25rem', backgroundColor: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '14px', marginBottom: '2rem', display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
            <MapPin size={22} color="#3b82f6" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.94rem', color: '#1e40af', marginBottom: '0.2rem' }}>
                Pickup Location Privacy Protection
              </div>
              <p style={{ fontSize: '0.86rem', color: '#3b82f6', margin: 0, lineHeight: 1.5 }}>
                General Area: <strong>{food.donor_city || 'Nearby Area'}</strong>. In accordance with ShareByte safety policy, exact pickup address and in-app navigation routes are securely unlocked after claiming this food.
              </p>
            </div>
          </div>

          {/* Action CTA Button */}
          {!claimSuccess && (
            <button
              onClick={handleClaim}
              disabled={claiming || food.status !== 'AVAILABLE'}
              style={{
                width: '100%',
                padding: '1.1rem',
                backgroundColor: food.status === 'AVAILABLE' ? '#10b981' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '14px',
                fontWeight: 900,
                fontSize: '1.05rem',
                letterSpacing: '0.02em',
                cursor: food.status === 'AVAILABLE' ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                boxShadow: food.status === 'AVAILABLE' ? '0 6px 20px rgba(16,185,129,0.3)' : 'none'
              }}
            >
              <Package size={22} />
              {claiming ? 'Processing Claim...' : food.status === 'AVAILABLE' ? 'CLAIM FOOD FOR NGO' : 'ALREADY CLAIMED'}
            </button>
          )}

        </div>
      </div>

    </div>
  );
};

export default NgoFoodDetail;
