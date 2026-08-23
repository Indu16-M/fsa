import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  X,
  ArrowRight,
  ArrowLeft,
  Users,
  Heart
} from 'lucide-react';

const ReceiverRegistrationModal = ({ isOpen, onClose, onSuccess }) => {

  // Multi-step: 1: Personal Info | 2: Receiver Info | 3: Location & OTP Verification
  const [step, setStep] = useState(1);

  // Step 1: Personal Information
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Step 2: Receiver Info
  const [receiverCategory, setReceiverCategory] = useState('Individual / Family');
  const [familySize, setFamilySize] = useState('4');

  // Step 3: Location & Verification
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

  const handleNextStep1 = (e) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      setError('Please fill in your Full Name, Email, and Phone Number.');
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
    setError('');
    setStep(2);
  };

  const handleNextStep2 = (e) => {
    e.preventDefault();
    setError('');
    setStep(3);
  };


  const handleSubmitRegistration = async (e) => {
    e.preventDefault();
    if (!address || !city || !pincode) {
      setError('Please enter your Address, City, and Pincode.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register-receiver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          category: receiverCategory,
          familySize: parseInt(familySize) || 1,
          address,
          city,
          state,
          pincode
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Receiver registration failed.');
      }

      setInfoMessage('Receiver account created successfully! Opening Receiver Portal...');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess(data);
      }, 1200);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative' }}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#fef3c7', color: '#b45309', padding: '0.35rem 0.85rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            <Heart size={14} /> SHAREBITE RECEIVER REGISTRATION
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>
            Create Receiver Account
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
            Register to request surplus meals and access nearby food donations
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {[1, 2, 3].map(i => (
            <div
              key={i}
              style={{ flex: 1, height: '6px', borderRadius: '99px', backgroundColor: step >= i ? '#f59e0b' : '#e2e8f0', transition: 'all 0.3s ease' }}
            />
          ))}
        </div>

        {/* Global Error Alert */}
        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '0.75rem 1rem', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <div>{error}</div>
          </div>
        )}

        {/* Global Info Alert */}
        {infoMessage && (
          <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '0.75rem 1rem', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <div>{infoMessage}</div>
          </div>
        )}

        {/* STEP 1: PERSONAL INFORMATION */}
        {step === 1 && (
          <form onSubmit={handleNextStep1}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                Full Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Anitha Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="anitha@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }}
                  required
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
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }}
                  required
                />
              </div>
            </div>

            {/* Password fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
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
              type="submit"
              style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: 'none', backgroundColor: '#f59e0b', color: '#ffffff', fontWeight: 900, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              Next: Household Details <ArrowRight size={18} />
            </button>
          </form>
        )}

        {/* STEP 2: RECEIVER CATEGORY & HOUSEHOLD SIZE */}
        {step === 2 && (
          <form onSubmit={handleNextStep2}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                Category *
              </label>
              <select
                value={receiverCategory}
                onChange={(e) => setReceiverCategory(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: 700 }}
              >
                <option value="Individual / Family">Individual / Family</option>
                <option value="Community Caregiver">Community Caregiver</option>
                <option value="Shelter Home">Shelter Home Representative</option>
                <option value="Senior Citizen">Senior Citizen</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                Family / Household Size (Number of beneficiaries) *
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={familySize}
                onChange={(e) => setFamilySize(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ flex: 1, padding: '0.85rem', borderRadius: '14px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#64748b', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                <ArrowLeft size={18} /> Back
              </button>
              <button
                type="submit"
                style={{ flex: 2, padding: '0.85rem', borderRadius: '14px', border: 'none', backgroundColor: '#f59e0b', color: '#ffffff', fontWeight: 900, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                Next: Location <ArrowRight size={18} />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: LOCATION */}
        {step === 3 && (
          <form onSubmit={handleSubmitRegistration}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                Street Address *
              </label>
              <input
                type="text"
                placeholder="Door No, Street Name, Landmark"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>City *</label>
                <input type="text" placeholder="Bengaluru" value={city} onChange={(e) => setCity(e.target.value)} style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>State</label>
                <input type="text" placeholder="Karnataka" value={state} onChange={(e) => setState(e.target.value)} style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>Pincode *</label>
                <input type="text" placeholder="560001" value={pincode} onChange={(e) => setPincode(e.target.value)} style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }} required />
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
                style={{ flex: 2, padding: '0.85rem', borderRadius: '14px', border: 'none', backgroundColor: '#f59e0b', color: '#ffffff', fontWeight: 900, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                <CheckCircle2 size={20} /> {loading ? 'Creating Account...' : 'Create Receiver Account'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default ReceiverRegistrationModal;
