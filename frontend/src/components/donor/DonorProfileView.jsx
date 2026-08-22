import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, MapPin, Phone, Mail } from 'lucide-react';

const DonorProfileView = () => {
  const { user } = useAuth();
  
  // Note: For MVP, profile is read-only displaying the user context.
  // In a full version, this would be a form hitting a PUT /api/auth/profile endpoint.

  return (
    <div className="donor-profile-view fade-in max-w-2xl mx-auto">
      <h2 style={{ marginBottom: '2rem' }}>Profile Settings</h2>
      
      <div className="panel" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '50%', 
            background: 'linear-gradient(135deg, var(--primary-color), #3b82f6)', 
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: '2.5rem', fontWeight: 800 
          }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{user?.username}</h3>
            <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Registered Donor</p>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={16} /> Email Address</label>
            <input type="text" className="form-control" value={user?.email || ''} readOnly disabled style={{ backgroundColor: 'var(--bg-secondary)' }} />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={16} /> Phone Number</label>
            <input type="text" className="form-control" value={user?.phone || 'Not provided'} readOnly disabled style={{ backgroundColor: 'var(--bg-secondary)' }} />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={16} /> Primary Pickup Address</label>
            <textarea className="form-control" value={user?.address || 'Not provided'} readOnly disabled rows="3" style={{ backgroundColor: 'var(--bg-secondary)' }} />
          </div>
        </div>

        <div style={{ marginTop: '2.5rem', padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Account Status</h4>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Email Verified: {user?.is_email_verified ? <span style={{ color: 'var(--safe)', fontWeight: 600 }}>Yes</span> : <span style={{ color: 'var(--danger)', fontWeight: 600 }}>No</span>}
          </p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            Account Standing: <span style={{ color: 'var(--safe)', fontWeight: 600 }}>{user?.status.toUpperCase()}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DonorProfileView;
