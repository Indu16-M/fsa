import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Sparkles, LogOut, RefreshCw, CheckCircle2, AlertCircle, UploadCloud } from 'lucide-react';

const NgoRejectedScreen = () => {
  const { user, token, logout, setUser } = useAuth();
  const navigate = useNavigate();

  const [showResubmitModal, setShowResubmitModal] = useState(false);

  // Resubmit Form Fields
  const [ngoName, setNgoName] = useState(user?.ngo_profile?.organization_name || '');
  const [registrationNumber, setRegistrationNumber] = useState(user?.ngo_profile?.registration_number || '');
  const [contactPerson, setContactPerson] = useState(user?.ngo_profile?.contact_person || '');
  const [phone, setPhone] = useState(user?.ngo_profile?.phone || user?.phone || '');
  const [address, setAddress] = useState(user?.ngo_profile?.address || user?.address || '');
  const [docName, setDocName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleResubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/resubmit-ngo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ngoName,
          registrationNumber,
          contactPerson,
          phone,
          address,
          documents: {
            updated_certificate: docName || 'Updated_Reg_Certificate.pdf'
          }
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to resubmit application');
      }

      setInfoMessage(data.message || 'Application resubmitted successfully!');
      if (data.user) setUser(data.user);

      setTimeout(() => {
        navigate('/ngo-pending');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to resubmit application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          width: '100%',
          maxWidth: '520px',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          boxShadow: '0 12px 35px -4px rgba(15, 23, 42, 0.08)'
        }}
      >
        {/* Brand Logo */}
        <div style={{ fontSize: '2rem', fontWeight: 900, color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
          🌱 ShareBite
        </div>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#047857', backgroundColor: '#ecfdf5', padding: '0.2rem 0.75rem', borderRadius: '99px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1.75rem' }}>
          <Sparkles size={13} /> "Every Meal Matters"
        </div>

        {/* Status Badge */}
        <div style={{ width: '64px', height: '64px', borderRadius: '20px', backgroundColor: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
          <ShieldAlert size={34} />
        </div>

        <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.4rem' }}>
          NGO Application Status
        </h2>

        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '0.6rem 1rem', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 800, display: 'inline-block', marginBottom: '1.25rem' }}>
          STATUS: APPLICATION REJECTED
        </div>

        <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.25rem' }}>
          Your NGO application for <strong>"{user?.ngo_profile?.organization_name || user?.username}"</strong> was reviewed and not approved at this time.
        </p>

        {/* Rejection Reason Card */}
        <div style={{ backgroundColor: '#fff1f2', borderRadius: '16px', border: '1px solid #fecdd3', padding: '1.2rem', textAlign: 'left', marginBottom: '1.75rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#b91c1c', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertCircle size={16} /> Admin Rejection Reason:
          </div>
          <div style={{ fontSize: '0.88rem', color: '#881337', fontWeight: 600 }}>
            "{user?.ngo_profile?.rejection_reason || 'Document verification could not be completed. Please upload updated NGO registration certificates.'}"
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={() => setShowResubmitModal(true)}
            style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: 'none', backgroundColor: '#0284c7', color: '#ffffff', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={18} /> Update & Resubmit Application
          </button>

          <button
            onClick={handleLogout}
            style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#64748b', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
          >
            <LogOut size={18} /> Log Out
          </button>
        </div>

        {/* Resubmit Modal */}
        {showResubmitModal && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', width: '100%', maxWidth: '500px', padding: '2rem', textAlign: 'left', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
              
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.3rem' }}>
                Resubmit NGO Application
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1.25rem' }}>
                Update your registration details or upload corrected verification documents
              </p>

              {error && (
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '0.6rem 0.85rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600, marginBottom: '1rem' }}>
                  {error}
                </div>
              )}

              {infoMessage && (
                <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '0.6rem 0.85rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '1rem' }}>
                  {infoMessage}
                </div>
              )}

              <form onSubmit={handleResubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.3rem' }}>NGO Name</label>
                  <input type="text" value={ngoName} onChange={(e) => setNgoName(e.target.value)} style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }} />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.3rem' }}>Registration Number</label>
                  <input type="text" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }} />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.3rem' }}>Contact Person</label>
                  <input type="text" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }} />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.3rem' }}>Upload Corrected Certificate Document</label>
                  <div style={{ border: '1px dashed #cbd5e1', padding: '0.75rem', borderRadius: '12px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
                    <UploadCloud size={22} style={{ color: '#0284c7', marginBottom: '0.2rem' }} />
                    <input
                      type="text"
                      placeholder="Corrected_Cert.pdf"
                      value={docName}
                      onChange={(e) => setDocName(e.target.value)}
                      style={{ width: '100%', fontSize: '0.78rem', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'center' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowResubmitModal(false)}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#64748b', fontWeight: 800, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{ flex: 2, padding: '0.75rem', borderRadius: '12px', border: 'none', backgroundColor: '#0284c7', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}
                  >
                    {loading ? 'Resubmitting...' : 'Submit Updated Details'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default NgoRejectedScreen;
