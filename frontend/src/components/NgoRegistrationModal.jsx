import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  FileText,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RefreshCw,
  X,
  ArrowRight,
  ArrowLeft,
  ShieldAlert
} from 'lucide-react';

const NgoRegistrationModal = ({ isOpen, onClose, onSuccess }) => {
  const { sendOtp, verifyOtp } = useAuth();

  // Multi-step: 1: NGO Info | 2: Contact Info | 3: Documents & OTP Verification
  const [step, setStep] = useState(1);

  // Step 1: NGO Information
  const [ngoName, setNgoName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [ngoType, setNgoType] = useState('Shelter');
  const [description, setDescription] = useState('');
  const [establishedYear, setEstablishedYear] = useState('');

  // Step 2: Contact Information
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // Step 3: Documents Metadata
  const [regCertName, setRegCertName] = useState('');
  const [govIdName, setGovIdName] = useState('');
  const [logoName, setLogoName] = useState('');

  // Password
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  if (!isOpen) return null;

  // Step 1 -> Step 2 Validation
  const handleNextStep1 = () => {
    setError('');
    if (!ngoName.trim() || !registrationNumber.trim()) {
      setError('NGO Name and Registration Number are required.');
      return;
    }
    setStep(2);
  };

  // Step 2 -> Step 3 Validation
  const handleNextStep2 = () => {
    setError('');
    if (!contactPerson.trim() || !phone.trim() || !email.trim()) {
      setError('Contact Person, Phone Number, and Official Email are required.');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid official email address.');
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
    setStep(3);
  };

  // Final Registration Submission
  const handleSubmitRegistration = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register-ngo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ngoName,
          registrationNumber,
          ngoType,
          description,
          establishedYear,
          contactPerson,
          phone,
          email,
          password,
          address,
          city,
          state,
          pincode,
          documents: {
            registration_certificate: regCertName || 'NGO_Reg_Certificate.pdf',
            government_id: govIdName || 'Govt_ID_Proof.pdf',
            ngo_logo: logoName || 'NGO_Logo.png'
          }
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'NGO registration failed');
      }

      setInfoMessage(data.message || 'NGO Registration submitted successfully!');
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
      <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0', padding: '2rem' }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0369a1', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={24} /> NGO Registration
            </h3>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.2rem' }}>
              Step {step} of 3 — {step === 1 ? 'NGO Information' : step === 2 ? 'Contact Details' : 'Documents & OTP Verification'}
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

        {/* STEP 1: NGO INFORMATION */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                NGO Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Hope & Care Foundation"
                value={ngoName}
                onChange={(e) => setNgoName(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                  NGO Registration Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. REG-NGO-2024-889"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                  NGO Type
                </label>
                <select
                  value={ngoType}
                  onChange={(e) => setNgoType(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#ffffff' }}
                >
                  <option value="Shelter">Shelter Home</option>
                  <option value="Orphanage">Orphanage</option>
                  <option value="Community Kitchen">Community Kitchen</option>
                  <option value="Charity NGO">Charity NGO</option>
                  <option value="Old Age Home">Old Age Home</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                  Description & Mission
                </label>
                <input
                  type="text"
                  placeholder="Providing daily meals to underprivileged families"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                  Established Year
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2018"
                  value={establishedYear}
                  onChange={(e) => setEstablishedYear(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </div>
            </div>

            <button
              onClick={handleNextStep1}
              style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: 'none', backgroundColor: '#0284c7', color: '#ffffff', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '1rem' }}
            >
              Continue to Contact Details <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 2: CONTACT INFORMATION */}
        {step === 2 && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                  Contact Person Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
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
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                Official NGO Email *
              </label>
              <input
                type="email"
                placeholder="contact@hopefoundation.org"
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

            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                NGO Street Address
              </label>
              <input
                type="text"
                placeholder="124 Community Lane, Indiranagar"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>City</label>
                <input type="text" placeholder="Bengaluru" value={city} onChange={(e) => setCity(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>State</label>
                <input type="text" placeholder="Karnataka" value={state} onChange={(e) => setState(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>Pincode</label>
                <input type="text" placeholder="560038" value={pincode} onChange={(e) => setPincode(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }} />
              </div>
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
                style={{ flex: 2, padding: '0.85rem', borderRadius: '14px', border: 'none', backgroundColor: '#0284c7', color: '#ffffff', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                Continue to Verification <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DOCUMENTS & OTP VERIFICATION */}
        {step === 3 && (
          <form onSubmit={handleSubmitRegistration}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                Upload Verification Documents
              </label>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ border: '1px dashed #cbd5e1', padding: '0.75rem', borderRadius: '12px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
                  <UploadCloud size={22} style={{ color: '#0284c7', marginBottom: '0.2rem' }} />
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>NGO Reg Certificate</div>
                  <input
                    type="text"
                    placeholder="Reg_Cert.pdf"
                    value={regCertName}
                    onChange={(e) => setRegCertName(e.target.value)}
                    style={{ width: '100%', fontSize: '0.75rem', padding: '0.3rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginTop: '0.4rem', textAlign: 'center' }}
                  />
                </div>

                <div style={{ border: '1px dashed #cbd5e1', padding: '0.75rem', borderRadius: '12px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
                  <UploadCloud size={22} style={{ color: '#0284c7', marginBottom: '0.2rem' }} />
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>Authorized Govt ID</div>
                  <input
                    type="text"
                    placeholder="Govt_ID.pdf"
                    value={govIdName}
                    onChange={(e) => setGovIdName(e.target.value)}
                    style={{ width: '100%', fontSize: '0.75rem', padding: '0.3rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginTop: '0.4rem', textAlign: 'center' }}
                  />
                </div>
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
                style={{ flex: 2, padding: '0.85rem', borderRadius: '14px', border: 'none', backgroundColor: '#0284c7', color: '#ffffff', fontWeight: 900, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                <CheckCircle2 size={20} /> {loading ? 'Submitting Application...' : 'Submit NGO Application'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default NgoRegistrationModal;
