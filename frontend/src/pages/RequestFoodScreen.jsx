import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartHandshake, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

const RequestFoodScreen = () => {
  const navigate = useNavigate();

  const [foodNeeded, setFoodNeeded] = useState('');
  const [numPeople, setNumPeople] = useState('');
  const [location, setLocation] = useState('');
  const [urgency, setUrgency] = useState('Medium');
  const [requestDate, setRequestDate] = useState(new Date().toISOString().slice(0, 10));
  const [requestTime, setRequestTime] = useState('18:00');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!foodNeeded || !numPeople || !location) {
      setError('Please fill in food needed, number of people, and location.');
      return;
    }

    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccess('Food assistance request submitted successfully! Donors will be notified.');
      setTimeout(() => navigate('/home-dashboard'), 1800);
    }, 1000);
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', color: '#0f172a', minHeight: '100vh', padding: '1.5rem 1rem 90px 1rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto' }}>
            <HeartHandshake size={32} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Request Food Assistance
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Submit a food request for your shelter or community distribution center
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '0.75rem 1rem', borderRadius: '12px', marginBottom: '1.25rem', fontSize: '0.88rem', fontWeight: 600 }}>
            <AlertCircle size={16} style={{ display: 'inline', marginRight: '0.4rem' }} /> {error}
          </div>
        )}

        {success && (
          <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '0.75rem 1rem', borderRadius: '12px', marginBottom: '1.25rem', fontSize: '0.88rem', fontWeight: 700 }}>
            <CheckCircle2 size={16} style={{ display: 'inline', marginRight: '0.4rem' }} /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Food Needed */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>Food Items Needed *</label>
            <input
              type="text"
              placeholder="e.g. Cooked Rice Meals, Breads, Fresh Milk"
              value={foodNeeded}
              onChange={(e) => setFoodNeeded(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>

          {/* Number of People */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>Number of People to Feed *</label>
            <input
              type="number"
              placeholder="e.g. 50 People"
              value={numPeople}
              onChange={(e) => setNumPeople(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>

          {/* Delivery Location */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>Dropoff Location Address *</label>
            <input
              type="text"
              placeholder="Shelter address, City"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>

          {/* Urgency Level */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>Urgency Level</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {['Low', 'Medium', 'High', 'Urgent'].map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setUrgency(level)}
                  style={{
                    padding: '0.6rem',
                    borderRadius: '10px',
                    border: urgency === level ? '2px solid #10b981' : '1px solid #cbd5e1',
                    backgroundColor: urgency === level ? '#ecfdf5' : '#ffffff',
                    color: urgency === level ? '#047857' : '#64748b',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.82rem'
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time Picker */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>Needed Date</label>
              <input
                type="date"
                value={requestDate}
                onChange={(e) => setRequestDate(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>Needed Time</label>
              <input
                type="time"
                value={requestTime}
                onChange={(e) => setRequestTime(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: '14px',
              border: 'none',
              backgroundColor: '#d97706',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '1.05rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(217, 119, 6, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <HeartHandshake size={20} /> {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default RequestFoodScreen;
