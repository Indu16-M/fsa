import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, MapPin, Save, Shield } from 'lucide-react';

const ReceiverProfile = () => {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState({
    contact_name: '',
    phone: '',
    address: '',
    city: '',
    state: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    // In a full implementation, you'd have a specific /api/auth/profile or /api/receiver/profile endpoint
    // For now, we'll just populate with what we have from the user object if they are new
    try {
      setProfile({
        contact_name: user?.username || '',
        phone: '',
        address: '',
        city: '',
        state: ''
      });
      // Mock fetch
      setTimeout(() => setLoading(false), 500);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    // In a real app, send a PUT/POST request to update the profile in the DB
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading profile...</div>;

  return (
    <div style={{ maxWidth: '800px' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Profile Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your personal information and preferences.</p>
      </header>

      <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '2rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--primary-color-10)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
            <User size={48} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>{user?.username}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <Mail size={16} /> {user?.email}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              <Shield size={16} color="var(--primary-color)" /> Receiver Account
            </div>
          </div>
        </div>

        <div style={{ padding: '2rem' }}>
          {success && (
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 600 }}>
              Profile updated successfully!
            </div>
          )}
          
          <form onSubmit={handleSave} style={{ display: 'grid', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Personal Information</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" name="contact_name" className="form-input" value={profile.contact_name} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="tel" name="phone" className="form-input" style={{ paddingLeft: '2.5rem' }} value={profile.phone} onChange={handleInputChange} placeholder="+91 xxxxx xxxxx" />
                </div>
              </div>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginTop: '1rem' }}>Location Information</h3>
            
            <div className="form-group">
              <label className="form-label">General Address / Area</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" name="address" className="form-input" style={{ paddingLeft: '2.5rem' }} value={profile.address} onChange={handleInputChange} placeholder="e.g. 1st Main Road, Indiranagar" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">City</label>
                <input type="text" name="city" className="form-input" value={profile.city} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input type="text" name="state" className="form-input" value={profile.state} onChange={handleInputChange} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem' }}>
                <Save size={18} /> Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReceiverProfile;
