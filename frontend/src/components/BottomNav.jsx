import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, PlusCircle, Bell, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const activePath = location.pathname;

  if (activePath.startsWith('/ngo') || activePath.startsWith('/donor') || activePath.startsWith('/receiver') || activePath.startsWith('/admin')) {
    return null;
  }

  return (
    <nav className="bottom-nav-bar">
      {/* 🏠 Home */}
      <button
        type="button"
        onClick={() => navigate('/')}
        className={`bottom-nav-item ${activePath === '/' ? 'active' : ''}`}
        style={{ border: 'none', background: 'none', cursor: 'pointer' }}
      >
        <Home size={22} />
        <span>Home</span>
      </button>

      {/* 🔍 Search / Nearby */}
      <button
        type="button"
        onClick={() => navigate('/nearby')}
        className={`bottom-nav-item ${activePath === '/nearby' ? 'active' : ''}`}
        style={{ border: 'none', background: 'none', cursor: 'pointer' }}
      >
        <Search size={22} />
        <span>Search</span>
      </button>

      {/* ➕ Central Floating Action Button */}
      <button
        type="button"
        onClick={() => {
          if (!user) {
            navigate('/login');
          } else if (user.role === 'donor') {
            navigate('/donor/dashboard');
          } else if (user.role === 'receiver') {
            navigate('/receiver/dashboard');
          } else if (user.role === 'ngo') {
            navigate('/ngo/dashboard');
          } else {
            navigate('/admin/dashboard');
          }
        }}
        className="bottom-nav-donate-btn"
        aria-label="Main Action"
        style={{ cursor: 'pointer' }}
      >
        <PlusCircle size={28} />
      </button>

      {/* 🔔 Notifications */}
      <button
        type="button"
        onClick={() => navigate('/notifications')}
        className={`bottom-nav-item ${activePath === '/notifications' ? 'active' : ''}`}
        style={{ border: 'none', background: 'none', cursor: 'pointer' }}
      >
        <Bell size={22} />
        <span>Notifications</span>
      </button>

      {/* 👤 Profile */}
      <button
        type="button"
        onClick={() => navigate('/profile')}
        className={`bottom-nav-item ${activePath === '/profile' ? 'active' : ''}`}
        style={{ border: 'none', background: 'none', cursor: 'pointer' }}
      >
        <User size={22} />
        <span>Profile</span>
      </button>
    </nav>
  );
};

export default BottomNav;
