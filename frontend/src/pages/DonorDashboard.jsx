import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, History, Inbox, Settings, LogOut, Menu, X, Bell, Sparkles } from 'lucide-react';

import DonorHomeView from '../components/donor/DonorHomeView';
import DonateFoodFlow from '../components/donor/DonateFoodFlow';
import DonationRequestsView from '../components/donor/DonationRequestsView';
import MyDonationsView from '../components/donor/MyDonationsView';
import DonorProfileView from '../components/donor/DonorProfileView';
import AiFoodScannerView from '../components/donor/AiFoodScannerView';

const DonorDashboard = () => {
  const { user, token, logout, getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      fetchUnreadCount();
    }
  }, [token, navigate]);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch('/api/notifications', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setUnreadNotifs(data.filter(n => !n.is_read).length);
      }
    } catch (err) {
      console.error("Failed to load notifs", err);
    }
  };

  const navItems = [
    { id: 'home', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'donate', label: 'Donate Food', icon: <PlusCircle size={20} /> },
    { id: 'requests', label: 'NGO Requests', icon: <Inbox size={20} /> },
    { id: 'history', label: 'My Donations', icon: <History size={20} /> },
    { id: 'profile', label: 'Profile Settings', icon: <Settings size={20} /> },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <DonorHomeView onChangeView={handleTabChange} />;
      case 'donate':
        return <DonateFoodFlow onComplete={() => handleTabChange('history')} onCancel={() => handleTabChange('home')} />;
      case 'requests':
        return <DonationRequestsView />;
      case 'history':
        return <MyDonationsView />;
      case 'profile':
        return <DonorProfileView />;
      default:
        return <DonorHomeView onChangeView={handleTabChange} />;
    }
  };

  return (
    <div className="dashboard-layout donor-dashboard">
      
      {/* Sidebar for Desktop */}
      <aside className="sidebar desktop-sidebar">
        <div className="sidebar-header">
          <div className="logo" style={{ fontWeight: 800, fontSize: '1.25rem' }}>🍲 ShareBite</div>
          <p className="sidebar-role-badge">DONOR PORTAL</p>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button 
              key={item.id}
              className={`sidebar-menu-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => handleTabChange(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.id === 'requests' && unreadNotifs > 0 && (
                <span className="badge notification-badge">{unreadNotifs}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-brief">
            <div className="avatar">{user?.username?.[0]?.toUpperCase()}</div>
            <div className="user-info">
              <strong>{user?.username}</strong>
              <small>Donor</small>
            </div>
          </div>
          <button onClick={logout} className="btn-logout">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile Top Navbar */}
      <header className="mobile-header">
        <div className="logo" style={{ fontWeight: 800, fontSize: '1.2rem' }}>🍲 ShareBite</div>
        <div className="mobile-actions">
          <button className="icon-btn" onClick={() => navigate('/notifications')}>
            <Bell size={24} />
            {unreadNotifs > 0 && <span className="notification-dot"></span>}
          </button>
          <button className="icon-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <nav className="mobile-nav-list">
            {navItems.map(item => (
              <button 
                key={item.id}
                className={`mobile-nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => handleTabChange(item.id)}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
            <button onClick={logout} className="mobile-nav-item text-danger">
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main className="dashboard-main-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default DonorDashboard;
