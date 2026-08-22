import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NgoRegistrationModal from '../components/NgoRegistrationModal';
import DonorRegistrationModal from '../components/DonorRegistrationModal';
import ReceiverRegistrationModal from '../components/ReceiverRegistrationModal';
import {
  ShieldCheck,
  HeartHandshake,
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  UserPlus,
  LogIn
} from 'lucide-react';

// Role config
const ROLES = [
  {
    id: 'admin',
    label: 'Admin',
    description: 'Platform Management & NGO Approvals',
    icon: ShieldCheck,
    color: '#ef4444',
    bg: '#fef2f2',
    border: '#ef4444',
    badgeBg: '#fef2f2',
    badgeColor: '#b91c1c',
    badgeBorder: '#fecaca',
    btnColor: '#ef4444',
    btnShadow: 'rgba(239,68,68,0.3)',
  },
  {
    id: 'ngo',
    label: 'NGO',
    description: 'Food Shelters & Community Claim Portal',
    icon: HeartHandshake,
    color: '#0284c7',
    bg: '#e0f2fe',
    border: '#0284c7',
    badgeBg: '#e0f2fe',
    badgeColor: '#0369a1',
    badgeBorder: '#bae6fd',
    btnColor: '#0284c7',
    btnShadow: 'rgba(2,132,199,0.3)',
  },
  {
    id: 'donor',
    label: 'Donor',
    description: 'Hotels, Restaurants, Bakeries & Households',
    icon: Building2,
    color: '#10b981',
    bg: '#ecfdf5',
    border: '#10b981',
    badgeBg: '#ecfdf5',
    badgeColor: '#047857',
    badgeBorder: '#a7f3d0',
    btnColor: '#10b981',
    btnShadow: 'rgba(16,185,129,0.3)',
  },
  {
    id: 'receiver',
    label: 'Receiver',
    description: 'Individuals & Families Seeking Food',
    icon: UserPlus,
    color: '#f59e0b',
    bg: '#fef3c7',
    border: '#f59e0b',
    badgeBg: '#fef3c7',
    badgeColor: '#b45309',
    badgeBorder: '#fde68a',
    btnColor: '#f59e0b',
    btnShadow: 'rgba(245,158,11,0.3)',
  },
];

const inputStyle = {
  width: '100%',
  padding: '0.85rem 1rem 0.85rem 2.7rem',
  borderRadius: '12px',
  border: '1.5px solid #cbd5e1',
  outline: 'none',
  fontSize: '0.95rem',
  color: '#0f172a',
  boxSizing: 'border-box',
  transition: 'border 0.2s',
};

const Login = () => {
  const { loginWithPassword } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Registration modals
  const [isNgoModalOpen, setIsNgoModalOpen] = useState(false);
  const [isDonorModalOpen, setIsDonorModalOpen] = useState(false);
  const [isReceiverModalOpen, setIsReceiverModalOpen] = useState(false);

  const roleConfig = ROLES.find(r => r.id === selectedRole);

  const handleSelectRole = (roleId) => {
    setSelectedRole(roleId);
    setEmail('');
    setPassword('');
    setError('');
    setSuccess('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (!password.trim()) { setError('Please enter your password.'); return; }

    setLoading(true);
    try {
      const userData = await loginWithPassword(email.trim().toLowerCase(), password, selectedRole);
      const dbRole = userData?.role;
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        if (dbRole === 'admin') navigate('/admin/dashboard');
        else if (dbRole === 'ngo') {
          if (userData.status === 'pending_approval') navigate('/ngo-pending');
          else if (userData.status === 'rejected') navigate('/ngo-rejected');
          else navigate('/ngo/dashboard');
        } else if (dbRole === 'receiver') navigate('/receiver/dashboard');
        else if (dbRole === 'donor') navigate('/donor/dashboard');
        else setError(`Unknown role "${dbRole}". Please contact support.`);
      }, 700);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 1rem' }}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', width: '100%', maxWidth: '480px', padding: '2.5rem 2rem', boxShadow: '0 16px 48px -8px rgba(15,23,42,0.1)' }}>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
            🌱 ShareBite
          </div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#047857', backgroundColor: '#ecfdf5', padding: '0.25rem 0.75rem', borderRadius: '99px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <Sparkles size={13} /> Every Meal Matters
          </div>
        </div>

        {/* Error / Success */}
        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '12px', marginBottom: '1.25rem', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={17} style={{ flexShrink: 0 }} /> {error}
          </div>
        )}
        {success && (
          <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '0.75rem 1rem', borderRadius: '12px', marginBottom: '1.25rem', fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={17} style={{ flexShrink: 0 }} /> {success}
          </div>
        )}

        {/* ── STEP 1: Role Selection ── */}
        {!selectedRole && (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', textAlign: 'center', marginBottom: '0.3rem' }}>Sign In</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center', marginBottom: '1.5rem' }}>Choose your role to continue</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.75rem' }}>
              {ROLES.map(role => {
                const Icon = role.icon;
                return (
                  <div
                    key={role.id}
                    onClick={() => handleSelectRole(role.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      padding: '1rem 1.25rem',
                      borderRadius: '16px',
                      border: `2px solid ${role.border}`,
                      backgroundColor: '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      boxShadow: `0 2px 12px ${role.btnShadow}20`,
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = role.bg}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}
                  >
                    <div style={{ width: '46px', height: '46px', borderRadius: '13px', backgroundColor: role.bg, color: role.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 900, color: role.badgeColor }}>{role.label}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.1rem' }}>{role.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Register links */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem 1.5rem' }}>
              <button onClick={() => setIsNgoModalOpen(true)} style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <UserPlus size={14} /> Register NGO
              </button>
              <button onClick={() => setIsDonorModalOpen(true)} style={{ background: 'none', border: 'none', color: '#10b981', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <UserPlus size={14} /> Register as Donor
              </button>
              <button onClick={() => setIsReceiverModalOpen(true)} style={{ background: 'none', border: 'none', color: '#b45309', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <UserPlus size={14} /> Register as Receiver
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Email + Password Form ── */}
        {selectedRole && roleConfig && (
          <div>
            {/* Back button */}
            <button
              onClick={() => { setSelectedRole(null); setError(''); setSuccess(''); }}
              style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1rem' }}
            >
              <ArrowLeft size={16} /> Back
            </button>

            {/* Role badge */}
            <div style={{
              backgroundColor: roleConfig.badgeBg,
              border: `1px solid ${roleConfig.badgeBorder}`,
              color: roleConfig.badgeColor,
              padding: '0.5rem 1rem', borderRadius: '12px',
              textAlign: 'center', fontSize: '0.85rem', fontWeight: 800,
              marginBottom: '1.5rem', letterSpacing: '0.5px', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
            }}>
              {React.createElement(roleConfig.icon, { size: 16 })}
              {roleConfig.label} Login
            </div>

            <form onSubmit={handleLogin} autoComplete="on">
              {/* Email */}
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={inputStyle}
                    autoFocus
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ ...inputStyle, paddingRight: '3rem' }}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '0.9rem', borderRadius: '14px', border: 'none',
                  backgroundColor: loading ? '#94a3b8' : roleConfig.btnColor,
                  color: '#ffffff', fontWeight: 900, fontSize: '1.05rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: `0 4px 16px ${roleConfig.btnShadow}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  transition: 'all 0.2s ease',
                }}
              >
                <LogIn size={20} />
                {loading ? 'Signing in...' : `Sign In as ${roleConfig.label}`}
              </button>
            </form>

            {/* Register link */}
            {selectedRole !== 'admin' && (
              <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                  {selectedRole === 'ngo' ? "Don't have an NGO account? " : selectedRole === 'receiver' ? "Don't have a Receiver account? " : "Don't have a Donor account? "}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedRole === 'ngo') setIsNgoModalOpen(true);
                    else if (selectedRole === 'receiver') setIsReceiverModalOpen(true);
                    else setIsDonorModalOpen(true);
                  }}
                  style={{ background: 'none', border: 'none', color: roleConfig.btnColor, fontWeight: 900, fontSize: '0.88rem', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Register here
                </button>
              </div>
            )}
          </div>
        )}

        {/* Registration Modals */}
        <NgoRegistrationModal isOpen={isNgoModalOpen} onClose={() => setIsNgoModalOpen(false)} onSuccess={() => navigate('/ngo-pending')} />
        <DonorRegistrationModal isOpen={isDonorModalOpen} onClose={() => setIsDonorModalOpen(false)} onSuccess={() => navigate('/donor/dashboard')} />
        <ReceiverRegistrationModal isOpen={isReceiverModalOpen} onClose={() => setIsReceiverModalOpen(false)} onSuccess={() => navigate('/receiver/dashboard')} />
      </div>
    </div>
  );
};

export default Login;
