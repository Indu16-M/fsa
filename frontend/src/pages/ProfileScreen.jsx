import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Phone, Mail, MapPin, Award, Utensils, TrendingUp, LogOut, Settings, History, Edit3 } from 'lucide-react';

const ProfileScreen = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.username || 'Indu Medagam');
  const [phone, setPhone] = useState('+91 9876543210');
  const [email, setEmail] = useState(user?.email || 'indumedagam@gmail.com');
  const [address, setAddress] = useState('Indiranagar, Bengaluru, KA');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', color: '#0f172a', minHeight: '100vh', padding: '1.5rem 1rem 90px 1rem' }}>
      <div style={{ maxWidth: '750px', margin: '0 auto' }}>
        
        {/* User Card Header */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom: '1.5rem', textAlign: 'center', position: 'relative' }}>
          
          <button
            onClick={() => setIsEditing(!isEditing)}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              backgroundColor: '#f1f5f9',
              border: '1px solid #e2e8f0',
              padding: '0.45rem 0.85rem',
              borderRadius: '10px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              color: '#0f172a'
            }}
          >
            <Edit3 size={15} /> {isEditing ? 'Save Profile' : 'Edit Profile'}
          </button>

          {/* Profile Photo Avatar */}
          <div
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              border: '4px solid #10b981',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              fontWeight: 900,
              margin: '0 auto 1rem auto',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.2)'
            }}
          >
            {name[0].toUpperCase()}
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.2rem' }}>
            {name}
          </h2>
          <div style={{ display: 'inline-block', backgroundColor: '#ecfdf5', color: '#047857', padding: '0.25rem 0.85rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1.25rem' }}>
            Role: {user?.role || 'Surplus Food Donor'}
          </div>

          {/* Profile Contact Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', textAlign: 'left', backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569' }}>
              <Mail size={16} style={{ color: '#10b981' }} /> {email}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569' }}>
              <Phone size={16} style={{ color: '#0284c7' }} /> {phone}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', gridColumn: '1 / -1' }}>
              <MapPin size={16} style={{ color: '#f59e0b' }} /> {address}
            </div>
          </div>
        </div>

        {/* IMPACT STATISTICS GRID */}
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
          My Impact Statistics
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Meals Donated</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a' }}>128 Meals</div>
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Meals Received</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a' }}>45 Meals</div>
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#9333ea', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Deliveries Done</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a' }}>18 Deliveries</div>
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Carbon Footprint Saved</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a' }}>320 kg CO₂</div>
          </div>


        </div>

        {/* QUICK BUTTONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={() => navigate('/nearby')}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              padding: '1rem',
              borderRadius: '16px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#0f172a'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><History size={18} style={{ color: '#10b981' }} /> Donation & Claim History</span>
            <span>➔</span>
          </button>

          <button
            onClick={() => alert('Platform Settings & Preferences coming soon!')}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              padding: '1rem',
              borderRadius: '16px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#0f172a'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Settings size={18} style={{ color: '#0284c7' }} /> App Settings & Preferences</span>
            <span>➔</span>
          </button>

          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#ef4444',
              padding: '1rem',
              borderRadius: '16px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '0.5rem'
            }}
          >
            <LogOut size={18} /> Log Out Account
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProfileScreen;
