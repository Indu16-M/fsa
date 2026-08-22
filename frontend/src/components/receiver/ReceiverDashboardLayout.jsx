import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Package, Bell, User, LayoutDashboard, LogOut, HeartHandshake, History, BarChart3 } from 'lucide-react';

const ReceiverDashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/receiver/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Find Food', path: '/receiver/find-food', icon: <MapPin size={20} /> },
    { name: 'My Claims', path: '/receiver/claims', icon: <Package size={20} /> },
    { name: 'Request Food', path: '/receiver/requests', icon: <HeartHandshake size={20} /> },
    { name: 'Food History', path: '/receiver/history', icon: <History size={20} /> },
    { name: 'My Impact', path: '/receiver/impact', icon: <BarChart3 size={20} /> },
    { name: 'Notifications', path: '/receiver/notifications', icon: <Bell size={20} /> },
    { name: 'Profile', path: '/receiver/profile', icon: <User size={20} /> },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-color)' }}>ShareBite</h2>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Receiver Portal</span>
        </div>

        <nav style={{ padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                backgroundColor: isActive ? 'var(--primary-color)' : 'transparent',
                color: isActive ? 'white' : 'var(--text-primary)',
                border: 'none',
                borderRadius: '10px',
                textDecoration: 'none',
                padding: '0.75rem 1rem',
                fontWeight: 600,
                fontSize: '0.9rem',
                transition: 'all 0.15s',
              })}
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1rem' }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user?.username}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Receiver</div>
            </div>
          </div>
          <button onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem 0', fontWeight: 600, fontSize: '0.9rem' }}>
            <LogOut size={17} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '2.5rem', maxWidth: '1100px', margin: '0 auto', paddingBottom: '100px' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ReceiverDashboardLayout;
