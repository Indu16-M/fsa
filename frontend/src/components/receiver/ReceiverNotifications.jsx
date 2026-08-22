import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, CheckCircle, Clock, MapPin, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReceiverNotifications = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'new_donation': return <MapPin size={24} color="#3b82f6" />;
      case 'claim_success': return <CheckCircle size={24} color="#10b981" />;
      case 'expiry_warning': return <Clock size={24} color="#f59e0b" />;
      default: return <Bell size={24} color="var(--text-muted)" />;
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.is_read) {
      markAsRead(notif.id);
    }
    // Navigate based on type
    if (notif.type === 'new_donation') navigate('/receiver/find-food');
    if (notif.type === 'claim_success') navigate('/receiver/claims');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Notifications</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Stay updated on nearby food and your claims.</p>
      </header>

      {loading ? (
        <div style={{ padding: '2rem' }}>Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
          <Bell size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Notifications</h3>
          <p style={{ color: 'var(--text-secondary)' }}>You're all caught up!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notifications.map(notif => (
            <div 
              key={notif.id} 
              onClick={() => handleNotificationClick(notif)}
              style={{ 
                display: 'flex', 
                gap: '1.5rem', 
                padding: '1.5rem', 
                backgroundColor: notif.is_read ? 'var(--bg-secondary)' : 'var(--bg-primary)', 
                borderRadius: '12px', 
                border: '1px solid',
                borderColor: notif.is_read ? 'var(--border-color)' : 'var(--primary-color)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: notif.is_read ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.1)'
              }}
            >
              <div style={{ 
                width: '48px', height: '48px', 
                borderRadius: '50%', 
                backgroundColor: notif.is_read ? 'var(--bg-tertiary)' : 'var(--primary-color-10)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                {getIcon(notif.type)}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{notif.title}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(notif.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                  {notif.message}
                </p>
              </div>
              
              {!notif.is_read && (
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', alignSelf: 'center' }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReceiverNotifications;
