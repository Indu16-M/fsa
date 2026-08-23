import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RefreshCw,
  X,
  ArrowRight,
  ArrowLeft,
  Utensils,
  Store,
  Home
} from 'lucide-react';

const DonorRegistrationModal = ({ isOpen, onClose, onSuccess }) => {

  // Multi-step: 1: Personal Info | 2: Donor Type | 3: Location & OTP Verification
  const [step, setStep] = useState(1);

  // Step 1: Personal Information
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Step 2: Donor Type
  const [donorType, setDonorType] = useState('Restaurant');
  const [organizationName, setOrganizationName] = useState('');

  // Step 3: Location Details
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // Password
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  if (!isOpen) return null;

  // Step 1 Validation
  const handleNextStep1 = () => {
    setError('');
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError('Full Name, Email, and Phone Number are required.');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setStep(2);
  };

  // Step 2 Validation
  const handleNextStep2 = () => {
    setError('');
    setStep(3);
  };


  // Final Registration Submission
  const handleSubmitRegistration = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register-donor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          donorType,
          organizationName: organizationName || name,
          address,
          city,
          state,
          pincode
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Donor registration failed');
      }

      setInfoMessage('Donor account created successfully! Redirecting to dashboard...');
      setTimeout(() => {
        if (onSuccess) onSuccess(data);
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0', padding: '2rem' }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#047857', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={24} /> Create Donor Account
            </h3>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.2rem' }}>
              Step {step} of 3 — {step === 1 ? 'Personal Details' : step === 2 ? 'Donor Type' : 'Location & Verification'}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.4rem', borderRadius: '8px' }}>
            <X size={22} />
          </button>
        </div>

        {/* Global Alerts */}
        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '0.75rem 1rem', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <div>{error}</div>
          </div>
        )}

        {infoMessage && (
          <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '0.75rem 1rem', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <div>{infoMessage}</div>
          </div>
        )}

        {/* STEP 1: PERSONAL INFORMATION */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                Full Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="rahul@restaurant.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
                {email.toLowerCase().includes('gamil.com') && (
                  <div style={{ color: '#b45309', fontSize: '0.75rem', fontWeight: 650, marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    ⚠️ Did you mean <strong style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => setEmail(email.toLowerCase().replace('gamil.com', 'gmail.com'))}>gmail.com</strong>? Click to fix.
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                  Phone Number *
                </label>
                <input
                  type="text"
                  placeholder="+91 98888 77777"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </div>
            </div>

            {/* Password fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>Password *</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>Confirm Password *</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#64748b', cursor: 'pointer', fontWeight: 600 }}>
                <input type="checkbox" checked={showPassword} onChange={e => setShowPassword(e.target.checked)} /> Show password
              </label>
            </div>

            <button
              onClick={handleNextStep1}
              style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: 'none', backgroundColor: '#10b981', color: '#ffffff', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '1rem' }}
            >
              Continue to Donor Type <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 2: DONOR TYPE */}
        {step === 2 && (
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
              Select Donor Category *
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {[
                { type: 'Restaurant', label: 'Restaurant / Eatery', icon: Utensils },
                { type: 'Hotel', label: 'Hotel & Banquet', icon: Building2 },
                { type: 'Bakery', label: 'Bakery & Cafe', icon: Store },
                { type: 'Supermarket', label: 'Store / Supermarket', icon: Store },
                { type: 'Household', label: 'Household Donor', icon: Home }
              ].map(item => {
                const IconComp = item.icon;
                const isSelected = donorType === item.type;
                return (
                  <div
                    key={item.type}
                    onClick={() => setDonorType(item.type)}
                    style={{
                      padding: '1rem',
                      borderRadius: '14px',
                      border: `2px solid ${isSelected ? '#10b981' : '#e2e8f0'}`,
                      backgroundColor: isSelected ? '#ecfdf5' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <IconComp size={22} style={{ color: isSelected ? '#10b981' : '#64748b' }} />
                    <div style={{ fontSize: '0.9rem', fontWeight: isSelected ? 800 : 600, color: isSelected ? '#047857' : '#0f172a' }}>
                      {item.label}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                Organization / House Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Grand Palace Hotel"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                onClick={() => setStep(1)}
                style={{ flex: 1, padding: '0.85rem', borderRadius: '14px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#64748b', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                <ArrowLeft size={18} /> Back
              </button>
              <button
                onClick={handleNextStep2}
                style={{ flex: 2, padding: '0.85rem', borderRadius: '14px', border: 'none', backgroundColor: '#10b981', color: '#ffffff', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                Continue to Location <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: LOCATION */}
        {step === 3 && (
          <form onSubmit={handleSubmitRegistration}>
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                Pickup Address Details
              </label>
              <input
                type="text"
                placeholder="Building No, Street, Landmark"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', marginBottom: '0.75rem' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} style={{ padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }} />
                <input type="text" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} style={{ padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }} />
                <input type="text" placeholder="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} style={{ padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{ flex: 1, padding: '0.85rem', borderRadius: '14px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#64748b', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                <ArrowLeft size={18} /> Back
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{ flex: 2, padding: '0.85rem', borderRadius: '14px', border: 'none', backgroundColor: '#10b981', color: '#ffffff', fontWeight: 900, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                <CheckCircle2 size={20} /> {loading ? 'Creating Account...' : 'Create Donor Account'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default DonorRegistrationModal;
