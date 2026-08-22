import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, CheckCircle, Clock, AlertTriangle, Info, Package, Trash2 } from 'lucide-react';

const NgoNotifications = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {
      // Fallback
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'donation_claimed':
      case 'donation_completed': return <CheckCircle size={20} color="#10b981" />;
      case 'expiry_warning': return <AlertTriangle size={20} color="#f59e0b" />;
      case 'claimant_arrived': return <Package size={20} color="#3b82f6" />;
      default: return <Bell size={20} color="#6366f1" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '850px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--text-primary, #111827)', margin: '0 0 0.35rem 0' }}>
            Operational Notifications
          </h1>
          <p style={{ color: 'var(--text-secondary, #6b7280)', margin: 0, fontSize: '0.96rem' }}>
            Real-time alerts for newly posted donations, pickup confirmations, and platform updates.
          </p>
        </div>

        {notifications.some(n => !n.is_read) && (
          <button
            onClick={markAllRead}
            style={{ padding: '0.55rem 1.1rem', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '10px', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer', color: '#374151' }}
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {loading ? (
        <p style={{ color: '#6b7280' }}>Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <div style={{ backgroundColor: 'var(--bg-secondary, #ffffff)', padding: '4rem 2rem', borderRadius: '18px', border: '1px dashed var(--border-color, #e5e7eb)', textAlign: 'center' }}>
          <Bell size={44} color="#9ca3af" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', marginBottom: '0.35rem' }}>
            No notifications yet
          </h3>
          <p style={{ color: '#6b7280', fontSize: '0.88rem', margin: 0 }}>
            You will be alerted when new donations are posted near you or when pickup statuses change.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {notifications.map((notif) => (
            <div
              key={notif.id}
              style={{
                backgroundColor: notif.is_read ? 'var(--bg-secondary, #ffffff)' : 'rgba(16,185,129,0.04)',
                border: notif.is_read ? '1px solid var(--border-color, #e5e7eb)' : '1px solid #a7f3d0',
                borderRadius: '14px',
                padding: '1.25rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ padding: '0.6rem', backgroundColor: '#f3f4f6', borderRadius: '10px', flexShrink: 0 }}>
                {getIcon(notif.type)}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary, #111827)', margin: 0 }}>
                    {notif.title}
                  </h4>
                  <span style={{ fontSize: '0.76rem', color: '#9ca3af' }}>
                    {new Date(notif.created_at).toLocaleString()}
                  </span>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary, #4b5563)', margin: 0, lineHeight: 1.5 }}>
                  {notif.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default NgoNotifications;
