import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FoodDetailsModal from '../components/FoodDetailsModal';
import LocationPickerModal from '../components/LocationPickerModal';
import {
  Utensils,
  Search,
  PlusCircle,
  MapPin,
  Bell,
  HeartHandshake,
  Bike,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Award
} from 'lucide-react';

const HomeDashboard = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentLocation, setCurrentLocation] = useState('Indiranagar, Bengaluru');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedFoodItem, setSelectedFoodItem] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [nearbyDonations, setNearbyDonations] = useState([]);

  useEffect(() => {
    fetchNearbyFood();
  }, []);

  const fetchNearbyFood = async () => {
    try {
      const res = await fetch('/api/donations');
      if (res.ok) {
        const data = await res.json();
        setNearbyDonations(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const initialDonations = [
    {
      id: 101,
      title: 'Fresh Paneer Butter Masala & Rotis',
      food_type: 'cooked',
      quantity: '25 portions',
      donor_name: 'Grand Hotel Indiranagar',
      donor_address: 'Indiranagar 100ft Road, Bengaluru',
      donor_phone: '+91 9888888881',
      risk_level: 'Safe',
      remaining_shelf_life_hours: 8,
      image_emoji: '🍲',
      description: 'Hygiene packed fresh meals prepared 2 hours ago.'
    },
    {
      id: 102,
      title: 'Organic Garden Salad & Fresh Fruits',
      food_type: 'produce',
      quantity: '15 kg',
      donor_name: 'FreshMart Supermarket',
      donor_address: 'Koramangala 4th Block, Bengaluru',
      donor_phone: '+91 9888888882',
      risk_level: 'Safe',
      remaining_shelf_life_hours: 36,
      image_emoji: '🍎',
      description: 'Crisp green farm apples, cucumbers & fresh tomatoes.'
    },
    {
      id: 103,
      title: 'Artisan Whole Wheat Bread & Muffins',
      food_type: 'bakery',
      quantity: '30 packets',
      donor_name: 'The French Loaf Bakery',
      donor_address: 'MG Road, Bengaluru',
      donor_phone: '+91 9888888883',
      risk_level: 'Safe',
      remaining_shelf_life_hours: 24,
      image_emoji: '🍞',
      description: 'Freshly baked sandwich bread loaves & wheat buns.'
    }
  ];

  const displayListings = nearbyDonations.length > 0 ? nearbyDonations : initialDonations;

  const filteredListings = displayListings.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ backgroundColor: '#f8fafc', color: '#0f172a', minHeight: '100vh', paddingBottom: '80px' }}>
      
      {/* TOP HEADER */}
      <header
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '1.25rem 1.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Welcome User & Profile Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: '#ecfdf5',
                border: '2px solid #10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                fontWeight: 800,
                color: '#10b981'
              }}
            >
              {user?.username ? user.username[0].toUpperCase() : 'S'}
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Welcome back 👋</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                {user?.username ? user.username : 'Guest Partner'}
              </div>
            </div>
          </div>

          {/* Location Picker & Notification Icon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setIsLocationModalOpen(true)}
              style={{
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                padding: '0.45rem 0.85rem',
                borderRadius: '99px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#0f172a',
                cursor: 'pointer'
              }}
            >
              <MapPin size={16} style={{ color: '#10b981' }} /> {currentLocation}
            </button>

            <button
              onClick={() => navigate('/notifications')}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#475569',
                position: 'relative'
              }}
            >
              <Bell size={20} />
              <span
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#ef4444',
                  borderRadius: '50%'
                }}
              />
            </button>
          </div>

        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        
        {/* HERO BANNER & SEARCH */}
        <div
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '24px',
            padding: '2rem 1.5rem',
            color: '#ffffff',
            boxShadow: '0 12px 30px -4px rgba(16, 185, 129, 0.3)',
            marginBottom: '2rem'
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.3rem 0.8rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            <Sparkles size={14} /> Zero Waste Food Redistribution
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Every Meal Matters
          </h2>
          <p style={{ opacity: 0.9, fontSize: '0.95rem', marginBottom: '1.5rem', maxWidth: '600px' }}>
            Connect surplus food donors with local NGOs, food shelters, and volunteer transport networks using AI shelf-life predictions.
          </p>

          {/* Search Input Bar */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '0.4rem 0.5rem 0.4rem 1rem',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
          >
            <Search size={20} style={{ color: '#94a3b8', marginRight: '0.5rem' }} />
            <input
              type="text"
              placeholder="Search surplus meals, bakery items, fruits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', width: '100%', outline: 'none', fontSize: '0.95rem', color: '#0f172a' }}
            />
            <button
              onClick={() => navigate('/nearby')}
              style={{
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: 'none',
                padding: '0.65rem 1.25rem',
                borderRadius: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              Search
            </button>
          </div>
        </div>

        {/* QUICK ACTIONS GRID */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
            Quick Actions
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            
            {/* ➕ Donate Food */}
            <div
              onClick={() => navigate('/login')}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '20px',
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <PlusCircle size={26} />
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem' }}>Donate Food</h4>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>Post surplus meals with AI shelf life estimation</p>
            </div>

            {/* 🔍 Find Food */}
            <div
              onClick={() => navigate('/nearby')}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '20px',
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Search size={26} />
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem' }}>Find Food</h4>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>Browse nearby donations on map or grid cards</p>
            </div>

            {/* 🙋 Request Food */}
            <div
              onClick={() => navigate('/request')}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '20px',
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <HeartHandshake size={26} />
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem' }}>Request Food</h4>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>Submit food assistance request for your shelter</p>
            </div>

            {/* 🚴 Volunteer */}
            <div
              onClick={() => navigate('/volunteer')}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '20px',
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#f3e8ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Bike size={26} />
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem' }}>Volunteer</h4>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>Accept pickup tasks & earn reward points</p>
            </div>

          </div>
        </div>

        {/* RECENT NEARBY DONATIONS */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              Recent Nearby Donations
            </h3>
            <button
              onClick={() => navigate('/nearby')}
              style={{ background: 'none', border: 'none', color: '#10b981', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              View All <ArrowRight size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {filteredListings.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedFoodItem(item);
                  setIsDetailsOpen(true);
                }}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '20px',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ width: '54px', height: '54px', borderRadius: '16px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', flexShrink: 0 }}>
                    {item.image_emoji || '🍲'}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem' }}>{item.title}</h4>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.donor_name || 'Hotel Partner'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem', fontSize: '0.82rem' }}>
                  <span style={{ fontWeight: 700, color: '#10b981' }}>{item.quantity}</span>
                  <span style={{ backgroundColor: '#ecfdf5', color: '#047857', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <ShieldCheck size={14} /> Freshness: {item.risk_level || 'Safe'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PLATFORM STATISTICS CARDS */}
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
            Impact Statistics
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '14px', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Utensils size={26} />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>148,250</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Meals Donated</div>
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '14px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={26} />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>92,400 kg</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Food Waste Saved</div>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* FOOD DETAILS MODAL (SCREEN 6) */}
      <FoodDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        item={selectedFoodItem}
        onClaim={(item) => {
          alert(`Successfully claimed "${item.title}"! Redirecting to pickup routing...`);
          navigate('/nearby');
        }}
      />

      {/* LOCATION PICKER MODAL */}
      <LocationPickerModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        initialLat={12.9716}
        initialLon={77.5946}
        onSelectLocation={(loc) => {
          setCurrentLocation(loc.address || 'Bengaluru, India');
        }}
      />

    </div>
  );
};

export default HomeDashboard;
