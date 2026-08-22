import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Package, Clock, MapPin, AlertTriangle, ArrowLeft, CheckCircle } from 'lucide-react';

const ReceiverFoodDetail = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFoodDetail();
  }, [id]);

  const fetchFoodDetail = async () => {
    try {
      const res = await fetch(`/api/donations/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setFood(data);
      } else {
        setError(data.message || 'Failed to fetch food details.');
      }
    } catch (err) {
      setError('An error occurred while fetching details.');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    setClaiming(true);
    setError('');
    try {
      const res = await fetch(`/api/claims/${id}/claim`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        navigate(`/receiver/claims/${data.claim.id}`, { state: { justClaimed: true } });
      } else {
        setError(data.message || 'Failed to claim food.');
        setClaiming(false);
      }
    } catch (err) {
      setError('An error occurred during claiming.');
      setClaiming(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'var(--danger)', padding: '2rem' }}>{error}</div>;
  if (!food) return <div>Food not found.</div>;

  const isAvailable = food.status === 'AVAILABLE';

  return (
    <div>
      <button 
        onClick={() => navigate('/receiver/find-food')} 
        style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontWeight: 600 }}
      >
        <ArrowLeft size={18} /> Back to Find Food
      </button>

      <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
        {food.image_url ? (
          <div style={{ width: '100%', height: '300px', backgroundImage: `url(${food.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        ) : (
          <div style={{ width: '100%', height: '200px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={64} color="var(--text-muted)" />
          </div>
        )}

        <div style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>{food.title}</h1>
            <span style={{ padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 700, backgroundColor: isAvailable ? 'var(--primary-color)' : 'var(--bg-tertiary)', color: isAvailable ? 'white' : 'var(--text-secondary)' }}>
              {food.status}
            </span>
          </div>

          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            {food.description || 'No description provided.'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '12px', color: 'var(--primary-color)' }}>
                <Package size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Quantity & Type</div>
                <div style={{ fontWeight: 700 }}>{food.quantity} {food.quantity_unit} ({food.food_type})</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '12px', color: 'var(--warning)' }}>
                <Clock size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Expires At</div>
                <div style={{ fontWeight: 700 }}>{new Date(food.estimated_expiry).toLocaleString()}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '12px', color: 'var(--danger)' }}>
                <MapPin size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Approx. Location</div>
                <div style={{ fontWeight: 700 }}>{food.donor_city || 'Nearby Area'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Exact address revealed after claim</div>
              </div>
            </div>
          </div>

          <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '12px', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <AlertTriangle size={24} color="var(--warning)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Important Claiming Rules</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>By claiming this food, you commit to picking it up promptly from the donor's location before the expiry time. The exact pickup location will be unlocked immediately after claiming.</p>
            </div>
          </div>

          {isAvailable ? (
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '1.2rem', fontSize: '1.2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              onClick={handleClaim}
              disabled={claiming}
            >
              <CheckCircle size={24} />
              {claiming ? 'PROCESSING CLAIM...' : 'CLAIM FOOD NOW'}
            </button>
          ) : (
            <button 
              className="btn" 
              style={{ width: '100%', padding: '1.2rem', fontSize: '1.2rem', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)', border: 'none', cursor: 'not-allowed' }}
              disabled
            >
              THIS ITEM IS NO LONGER AVAILABLE
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiverFoodDetail;
