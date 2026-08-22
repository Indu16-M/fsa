import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Building, MapPin, Phone, Mail, Globe, CheckCircle, Clock, AlertTriangle, Save } from 'lucide-react';

const NgoProfile = () => {
  const { token, user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    organization_name: '',
    description: '',
    contact_person: '',
    official_email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    website: '',
    ngo_type: 'Shelter',
    capacity_people: 100,
    preferred_food_types: 'Cooked Meals, Bakery, Fruits'
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/ngo/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        const p = data.profile || {};
        setFormData({
          organization_name: p.organization_name || user?.username || '',
          description: p.description || '',
          contact_person: p.contact_person || '',
          official_email: p.official_email || user?.email || '',
          phone: p.phone || user?.phone || '',
          address: p.address || user?.address || '',
          city: p.city || '',
          state: p.state || '',
          pincode: p.pincode || '',
          website: p.website || '',
          ngo_type: p.ngo_type || 'NGO',
          capacity_people: p.capacity_people || 100,
          preferred_food_types: p.preferred_food_types || 'All Food Types'
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const res = await fetch('/api/ngo/profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSuccessMsg('Profile updated successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        alert('Failed to update profile.');
      }
    } catch {
      alert('Error updating profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>Loading NGO profile...</div>;
  }

  const verStatus = profile?.verification_status || 'PENDING';

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--text-primary, #111827)', margin: '0 0 0.35rem 0' }}>
          NGO Organization Profile
        </h1>
        <p style={{ color: 'var(--text-secondary, #6b7280)', margin: 0, fontSize: '0.96rem' }}>
          Manage your organization details, service credentials, and food preference specifications.
        </p>
      </div>

      {/* Verification Status Banner */}
      <div style={{ backgroundColor: 'var(--bg-secondary, #ffffff)', borderRadius: '18px', border: '1px solid var(--border-color, #e5e7eb)', padding: '1.5rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: verStatus === 'VERIFIED' ? 'rgba(16,185,129,0.12)' : '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {verStatus === 'VERIFIED' ? <CheckCircle size={26} color="#10b981" /> : <Clock size={26} color="#f59e0b" />}
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#111827' }}>
              Verification Status: {verStatus}
            </div>
            <div style={{ fontSize: '0.84rem', color: '#6b7280', marginTop: '0.15rem' }}>
              {verStatus === 'VERIFIED' 
                ? 'Your NGO registration has been verified by the ShareByte safety team.' 
                : 'Your organization is currently undergoing verification by platform administrators.'}
            </div>
          </div>
        </div>
      </div>

      {successMsg && (
        <div style={{ padding: '0.9rem 1.25rem', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', color: '#065f46', fontWeight: 700, fontSize: '0.9rem' }}>
          {successMsg}
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSave} style={{ backgroundColor: 'var(--bg-secondary, #ffffff)', borderRadius: '18px', border: '1px solid var(--border-color, #e5e7eb)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
        
        <div>
          <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
            Organization Name *
          </label>
          <input
            type="text"
            required
            value={formData.organization_name}
            onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
            style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.92rem', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
            Description & Mission
          </label>
          <textarea
            rows="3"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Tell donors about your mission, communities served, and food programs..."
            style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.92rem', boxSizing: 'border-box', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
              Organization Type
            </label>
            <select
              value={formData.ngo_type}
              onChange={(e) => setFormData({ ...formData, ngo_type: e.target.value })}
              style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.92rem', boxSizing: 'border-box' }}
            >
              <option value="Shelter">Shelter / Homeless Support</option>
              <option value="Orphanage">Orphanage</option>
              <option value="Community Kitchen">Community Kitchen</option>
              <option value="NGO">Registered Charity / NGO</option>
              <option value="Relief Organization">Disaster / Relief Organization</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
              Daily People Capacity
            </label>
            <input
              type="number"
              min="0"
              value={formData.capacity_people}
              onChange={(e) => setFormData({ ...formData, capacity_people: parseInt(e.target.value) || 0 })}
              style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.92rem', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
              Contact Person
            </label>
            <input
              type="text"
              value={formData.contact_person}
              onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.92rem', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
              Phone Number
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.92rem', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div>
          <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
            Primary Address
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.92rem', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
            Preferred Food Types
          </label>
          <input
            type="text"
            placeholder="e.g. Cooked Meals, Bakery, Vegetarian, Dry Goods"
            value={formData.preferred_food_types}
            onChange={(e) => setFormData({ ...formData, preferred_food_types: e.target.value })}
            style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.92rem', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            alignSelf: 'flex-start',
            marginTop: '0.5rem',
            padding: '0.85rem 1.8rem',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 800,
            fontSize: '0.94rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Save size={18} /> {saving ? 'Saving Profile...' : 'Save Profile Changes'}
        </button>

      </form>

    </div>
  );
};

export default NgoProfile;
