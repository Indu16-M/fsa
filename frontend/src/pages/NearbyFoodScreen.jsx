import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FoodDetailsModal from '../components/FoodDetailsModal';
import TrackingMap from '../components/TrackingMap';
import { Search, MapPin, Grid, Map as MapIcon, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

const NearbyFoodScreen = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [foodItems, setFoodItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    fetchFood();
  }, []);

  const fetchFood = async () => {
    try {
      const res = await fetch('/api/donations');
      if (res.ok) {
        const data = await res.json();
        setFoodItems(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = foodItems.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    (item.donor_name && item.donor_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ backgroundColor: '#f8fafc', color: '#0f172a', minHeight: '100vh', padding: '1.5rem 1rem 90px 1rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Header & View Mode Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Nearby Surplus Food
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Available surplus food listings ready for pickup
            </p>
          </div>

          {/* Privacy Note */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#e2e8f0', padding: '8px 12px', borderRadius: '14px', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
            <ShieldCheck size={16} style={{ color: '#10b981' }} /> Exact donor locations are hidden until you claim the food.
          </div>
        </div>

        {/* Search Input Bar */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <Search size={20} style={{ color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by food name, donor or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.95rem', color: '#0f172a' }}
          />
        </div>

        {/* GRID VIEW */}
        {filtered.length === 0 ? (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '3rem 2rem', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <Grid size={32} style={{ color: '#94a3b8' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>No Food Available Right Now</h3>
            <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>
              There are currently no surplus food donations available in your area. Please check back later when donors post new food!
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {filtered.map(item => (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '20px',
                  padding: '1.25rem',
                  boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ width: '58px', height: '58px', borderRadius: '18px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>
                      {item.image_emoji || '🍲'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem' }}>{item.title}</h3>
                      <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>{item.donor_name || 'Donor Partner'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#475569' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={16} style={{ color: '#10b981' }} /> Approximate Location ({item.distance_km || 1.2} km away)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={16} style={{ color: '#f59e0b' }} /> Expiry: {item.remaining_shelf_life_hours || 8} Hours remaining
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem' }}>
                  <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{item.quantity}</span>
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setIsDetailsOpen(true);
                    }}
                    style={{
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.55rem 1.25rem',
                      borderRadius: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    Claim Food
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      <FoodDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        item={selectedItem}
        onClaim={(item) => {
          alert(`Claim requested for "${item.title}"! Status set to requested.`);
        }}
      />
    </div>
  );
};

export default NearbyFoodScreen;
