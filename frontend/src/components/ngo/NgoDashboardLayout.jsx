import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, MapPin, Package, FileText, Users, 
  Navigation, Utensils, BarChart3, Bell, Bot, User, 
  Settings, LogOut, CheckCircle, Clock, AlertTriangle, Sparkles 
} from 'lucide-react';
import AnnamitraNgoAssistant from './AnnamitraNgoAssistant';

const NgoDashboardLayout = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAi, setShowAi] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('PENDING');

  useEffect(() => {
    fetchProfileStatus();
  }, []);

  const fetchProfileStatus = async () => {
    try {
      const res = await fetch('/api/ngo/overview', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setVerificationStatus(data.verification_badge || 'PENDING');
      }
    } catch {
      // Fallback
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/ngo/dashboard', icon: <LayoutDashboard size={19} /> },
    { name: 'Find Food', path: '/ngo/find-food', icon: <MapPin size={19} /> },
    { name: 'My Claims', path: '/ngo/claims', icon: <Package size={19} /> },
    { name: 'Food Requests', path: '/ngo/requests', icon: <FileText size={19} /> },
    { name: 'Beneficiaries', path: '/ngo/beneficiaries', icon: <Users size={19} /> },
    { name: 'Pickup & Collection', path: '/ngo/claims', icon: <Navigation size={19} /> },
    { name: 'Distribution', path: '/ngo/distribution', icon: <Utensils size={19} /> },
    { name: 'Impact & Reports', path: '/ngo/impact', icon: <BarChart3 size={19} /> },
    { name: 'Notifications', path: '/ngo/notifications', icon: <Bell size={19} /> },
    { name: 'Annamitra AI', isAction: true, onClick: () => setShowAi(!showAi), icon: <Bot size={19} />, highlight: true },
    { name: 'NGO Profile', path: '/ngo/profile', icon: <User size={19} /> },
    { name: 'Settings', path: '/ngo/settings', icon: <Settings size={19} /> },
  ];

  const getVerificationBadge = () => {
    switch (verificationStatus) {
      case 'VERIFIED':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.6rem', backgroundColor: 'rgba(16,185,129,0.12)', color: '#10b981', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700 }}>
            <CheckCircle size={12} /> Verified NGO
          </span>
        );
      case 'REJECTED':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.6rem', backgroundColor: 'rgba(239,68,68,0.12)', color: '#ef4444', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700 }}>
            <AlertTriangle size={12} /> Verification Rejected
          </span>
        );
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.6rem', backgroundColor: 'rgba(245,158,11,0.12)', color: '#f59e0b', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700 }}>
            <Clock size={12} /> Verification Pending
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary, #f9fafb)', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* NGO Operations Sidebar */}
      <aside style={{ width: '270px', backgroundColor: 'var(--bg-secondary, #ffffff)', borderRight: '1px solid var(--border-color, #e5e7eb)', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', zIndex: 100 }}>
        
        {/* Brand Header */}
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid var(--border-color, #e5e7eb)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981', letterSpacing: '-0.02em', margin: 0 }}>
              ShareByte
            </h2>
            {getVerificationBadge()}
          </div>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary, #6b7280)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
            NGO Operations Platform
          </p>
        </div>

        {/* Navigation items */}
        <nav style={{ padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, overflowY: 'auto' }}>
          {navItems.map((item, idx) => {
            if (item.isAction) {
              return (
                <button
                  key={idx}
                  onClick={item.onClick}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    backgroundColor: showAi ? 'rgba(16,185,129,0.15)' : 'transparent',
                    color: showAi ? '#10b981' : 'var(--text-primary, #374151)',
                    border: showAi ? '1px solid #10b981' : '1px solid transparent',
                    borderRadius: '10px',
                    padding: '0.65rem 0.9rem',
                    fontWeight: 600,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all 0.15s'
                  }}
                >
                  <span style={{ color: '#10b981' }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.name}</span>
                  <Sparkles size={13} color="#f59e0b" />
                </button>
              );
            }

            return (
              <NavLink
                key={item.path + idx}
                to={item.path}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  backgroundColor: isActive ? '#10b981' : 'transparent',
                  color: isActive ? 'white' : 'var(--text-primary, #374151)',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  padding: '0.65rem 0.9rem',
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  transition: 'all 0.15s',
                })}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Footer */}
        <div style={{ padding: '1.25rem 1rem', borderTop: '1px solid var(--border-color, #e5e7eb)', backgroundColor: 'var(--bg-secondary, #ffffff)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #047857)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.95rem' }}>
              {user?.username?.[0]?.toUpperCase() || 'N'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary, #111827)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.username}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>NGO Partner</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.35rem 0', fontWeight: 600, fontSize: '0.84rem' }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Operations Content */}
      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
        <div style={{ padding: '2rem 2.5rem', maxWidth: '1200px', margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>

      {/* Floating Annamitra AI Trigger Button & Modal */}
      {!showAi && (
        <button
          onClick={() => setShowAi(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            padding: '0.85rem 1.4rem',
            fontWeight: 800,
            fontSize: '0.92rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            boxShadow: '0 8px 24px rgba(16,185,129,0.4)',
            cursor: 'pointer',
            zIndex: 999,
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Bot size={20} />
          <span>Annamitra AI</span>
          <Sparkles size={15} color="#fef08a" />
        </button>
      )}

      {/* Annamitra Assistant Modal */}
      <AnnamitraNgoAssistant isOpen={showAi} onClose={() => setShowAi(false)} />
    </div>
  );
};

export default NgoDashboardLayout;
