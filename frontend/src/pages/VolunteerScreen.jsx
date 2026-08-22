import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bike, MapPin, Clock, Award, Navigation, CheckCircle2 } from 'lucide-react';

const VolunteerScreen = () => {
  const navigate = useNavigate();

  const [pickups, setPickups] = useState([
    {
      id: 301,
      donor: 'Grand Hotel Indiranagar',
      receiver: 'Feed The Hungry NGO (MG Road)',
      food_title: 'Vegetable Biryani (25 Portions)',
      distance_km: 2.1,
      estimated_time: '12 Mins',
      reward_points: 50,
      status: 'available'
    },
    {
      id: 302,
      donor: 'SuperMart Fresh Market',
      receiver: 'Care Foundation Shelter (HSR Layout)',
      food_title: 'Organic Apple & Tomato Crates (30 kg)',
      distance_km: 3.8,
      estimated_time: '18 Mins',
      reward_points: 75,
      status: 'available'
    }
  ]);

  const handleAccept = (id) => {
    setPickups(prev =>
      prev.map(p => (p.id === id ? { ...p, status: 'accepted' } : p))
    );
    alert('Pickup task accepted! Navigating to live tracking map...');
    navigate('/tracking');
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', color: '#0f172a', minHeight: '100vh', padding: '1.5rem 1rem 90px 1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
              🚴 Volunteer Dispatch Portal
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Deliver food surplus to shelters & earn volunteer reward badges
            </p>
          </div>

          <div style={{ backgroundColor: '#f3e8ff', border: '1px solid #d8b4fe', padding: '0.5rem 1rem', borderRadius: '14px', color: '#7e22ce', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Award size={18} /> My Reward Points: 350 pts
          </div>
        </div>

        {/* Available Pickups List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {pickups.map(task => (
            <div
              key={task.id}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '20px',
                padding: '1.5rem',
                boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>{task.food_title}</h3>
                <span style={{ backgroundColor: '#f3e8ff', color: '#7e22ce', fontWeight: 800, padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Award size={14} /> +{task.reward_points} pts
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem', fontSize: '0.88rem', color: '#475569' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>Donor Pickup</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>{task.donor}</div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>NGO Receiver</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>{task.receiver}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#64748b' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={16} style={{ color: '#10b981' }} /> {task.distance_km} km total distance
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={16} style={{ color: '#f59e0b' }} /> Est Drive: {task.estimated_time}
                </span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => handleAccept(task.id)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Accept Task
                </button>

                <button
                  onClick={() => navigate('/tracking')}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <Navigation size={16} /> Navigate Route
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default VolunteerScreen;
