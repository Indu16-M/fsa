import React, { useState } from 'react';
import { Bell, ShieldAlert, CheckCircle2, Clock, MapPin, Sparkles } from 'lucide-react';

const NotificationsScreen = () => {
  const [filter, setFilter] = useState('all');

  const [notifications] = useState([
    {
      id: 1,
      type: 'new_donation',
      title: '🍲 New Food Donation Nearby',
      message: 'Grand Hotel Indiranagar posted 25 portions of Vegetable Biryani (1.2 km away).',
      time: '10 mins ago',
      read: false
    },
    {
      id: 2,
      type: 'donation_accepted',
      title: '✅ Donation Claim Accepted',
      message: 'Feed The Hungry NGO has accepted your claim for Organic Produce Crate.',
      time: '1 hour ago',
      read: false
    },
    {
      id: 3,
      type: 'expiring_alert',
      title: '⚠️ Expiring Food Alert',
      message: 'Paneer Butter Masala has 2 hours remaining before estimated shelf-life expiry.',
      time: '2 hours ago',
      read: true
    },
    {
      id: 4,
      type: 'delivery_completed',
      title: '🎉 Delivery Completed',
      message: 'Volunteer Alex completed delivery handoff to Hope Kitchen Shelter.',
      time: '5 hours ago',
      read: true
    }
  ]);

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  return (
    <div style={{ backgroundColor: '#f8fafc', color: '#0f172a', minHeight: '100vh', padding: '1.5rem 1rem 90px 1rem' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Notifications & Alerts
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Real-time updates on nearby food surplus, claims, and pickups
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#e2e8f0', padding: '4px', borderRadius: '12px' }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: filter === 'all' ? '#ffffff' : 'transparent',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: filter === 'unread' ? '#ffffff' : 'transparent',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              Unread
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredNotifs.map(n => (
            <div
              key={n.id}
              style={{
                backgroundColor: n.read ? '#ffffff' : '#f0fdf4',
                border: n.read ? '1px solid #e2e8f0' : '1px solid #a7f3d0',
                borderRadius: '16px',
                padding: '1.25rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: n.type === 'expiring_alert' ? '#fef3c7' : n.type === 'delivery_completed' ? '#ecfdf5' : '#e0f2fe',
                  color: n.type === 'expiring_alert' ? '#d97706' : n.type === 'delivery_completed' ? '#10b981' : '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {n.type === 'expiring_alert' ? <ShieldAlert size={22} /> : n.type === 'delivery_completed' ? <CheckCircle2 size={22} /> : <Bell size={22} />}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>{n.title}</h4>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{n.time}</span>
                </div>
                <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: '1.5' }}>{n.message}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default NotificationsScreen;
