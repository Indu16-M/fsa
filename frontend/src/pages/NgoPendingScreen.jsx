import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Clock, ShieldCheck, Sparkles, LogOut, CheckCircle2, FileText } from 'lucide-react';

const NgoPendingScreen = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
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
        <div style={{ width: '64px', height: '64px', borderRadius: '20px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
          <Clock size={34} />
        </div>

        <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.4rem' }}>
          NGO Application Submitted
        </h2>

        <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', color: '#0369a1', padding: '0.6rem 1rem', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 800, display: 'inline-block', marginBottom: '1.25rem' }}>
          STATUS: PENDING ADMIN APPROVAL
        </div>

        <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          Thank you for registering <strong>"{user?.ngo_profile?.organization_name || user?.username}"</strong>! Your official documents and NGO registration details have been received and are currently under review by our Admin Verification Team.
        </p>

        {/* Application Details Card */}
        <div style={{ backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.2rem', textAlign: 'left', marginBottom: '1.75rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileText size={16} style={{ color: '#0284c7' }} /> Submission Summary:
          </div>
          <div style={{ fontSize: '0.82rem', color: '#64748b', display: 'grid', gap: '0.4rem' }}>
            <div>• <strong>Registration No:</strong> {user?.ngo_profile?.registration_number || 'PENDING'}</div>
            <div>• <strong>Official Email:</strong> {user?.email}</div>
            <div>• <strong>Contact Person:</strong> {user?.ngo_profile?.contact_person || 'N/A'}</div>
            <div>• <strong>Verification Status:</strong> Waiting for Admin Review</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={() => window.location.reload()}
            style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: 'none', backgroundColor: '#0284c7', color: '#ffffff', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
          >
            <CheckCircle2 size={18} /> Check Approval Status
          </button>

          <button
            onClick={handleLogout}
            style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#64748b', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
          >
            <LogOut size={18} /> Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default NgoPendingScreen;
