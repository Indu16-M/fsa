import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Settings, Bell, Shield, MapPin, Save, CheckCircle } from 'lucide-react';

const NgoSettings = () => {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    notifyNewDonation: true,
    notifyExpiryWarning: true,
    notifyClaimUpdate: true,
    autoAcceptMatches: false,
    serviceRadiusKm: 15,
    preferredVehicle: 'Personal NGO Vehicle'
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--text-primary, #111827)', margin: '0 0 0.35rem 0' }}>
          NGO Operational Settings
        </h1>
        <p style={{ color: 'var(--text-secondary, #6b7280)', margin: 0, fontSize: '0.96rem' }}>
          Configure notification preferences, operational service radius, and recovery settings.
        </p>
      </div>

      {saved && (
        <div style={{ padding: '0.9rem 1.25rem', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', color: '#065f46', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={18} color="#10b981" /> Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Notification Preferences */}
        <div style={{ backgroundColor: 'var(--bg-secondary, #ffffff)', borderRadius: '18px', border: '1px solid var(--border-color, #e5e7eb)', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#111827', fontWeight: 800, fontSize: '1.1rem' }}>
            <Bell size={20} color="#10b981" />
            <span>Notification & Alert Preferences</span>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#111827' }}>Nearby Donation Alerts</div>
              <div style={{ fontSize: '0.82rem', color: '#6b7280' }}>Notify whenever a donor lists surplus food in your service area.</div>
            </div>
            <input
              type="checkbox"
              checked={settings.notifyNewDonation}
              onChange={(e) => setSettings({ ...settings, notifyNewDonation: e.target.checked })}
              style={{ width: '18px', height: '18px', accentColor: '#10b981', cursor: 'pointer' }}
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#111827' }}>Urgent Expiry Reminders</div>
              <div style={{ fontSize: '0.82rem', color: '#6b7280' }}>Get alerts for unclaimed food expiring within 2 hours.</div>
            </div>
            <input
              type="checkbox"
              checked={settings.notifyExpiryWarning}
              onChange={(e) => setSettings({ ...settings, notifyExpiryWarning: e.target.checked })}
              style={{ width: '18px', height: '18px', accentColor: '#10b981', cursor: 'pointer' }}
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '0.5rem 0' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#111827' }}>Pickup & Status Updates</div>
              <div style={{ fontSize: '0.82rem', color: '#6b7280' }}>Receive notifications when claims are confirmed or ready for collection.</div>
            </div>
            <input
              type="checkbox"
              checked={settings.notifyClaimUpdate}
              onChange={(e) => setSettings({ ...settings, notifyClaimUpdate: e.target.checked })}
              style={{ width: '18px', height: '18px', accentColor: '#10b981', cursor: 'pointer' }}
            />
          </label>
        </div>

        {/* Operational Radius */}
        <div style={{ backgroundColor: 'var(--bg-secondary, #ffffff)', borderRadius: '18px', border: '1px solid var(--border-color, #e5e7eb)', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#111827', fontWeight: 800, fontSize: '1.1rem' }}>
            <MapPin size={20} color="#3b82f6" />
            <span>Service & Operational Radius</span>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
              <span>Max Recovery Radius</span>
              <span style={{ color: '#10b981' }}>{settings.serviceRadiusKm} km</span>
            </div>
            <input
              type="range"
              min="2"
              max="50"
              value={settings.serviceRadiusKm}
              onChange={(e) => setSettings({ ...settings, serviceRadiusKm: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
            />
            <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.3rem' }}>
              You will prioritize food matches and notifications within {settings.serviceRadiusKm} km of your NGO base.
            </div>
          </div>
        </div>

        {/* Account & Security Summary */}
        <div style={{ backgroundColor: 'var(--bg-secondary, #ffffff)', borderRadius: '18px', border: '1px solid var(--border-color, #e5e7eb)', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#111827', fontWeight: 800, fontSize: '1.1rem' }}>
            <Shield size={20} color="#8b5cf6" />
            <span>Account Security & Verification</span>
          </div>
          <p style={{ fontSize: '0.86rem', color: '#6b7280', margin: 0 }}>
            Logged in as: <strong>{user?.email}</strong> ({user?.username}). Authentication is protected by ShareByte JWT & Email OTP.
          </p>
        </div>

        <button
          type="submit"
          style={{
            alignSelf: 'flex-start',
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
          <Save size={18} /> Save Settings
        </button>

      </form>

    </div>
  );
};

export default NgoSettings;
