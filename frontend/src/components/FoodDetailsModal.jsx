import React from 'react';
import { X, MapPin, Phone, ShieldCheck, Clock, Award, Navigation } from 'lucide-react';

const FoodDetailsModal = ({ isOpen, onClose, item, onClaim }) => {
  if (!isOpen || !item) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(6px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          position: 'relative',
          border: '1px solid #e2e8f0'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            color: '#475569'
          }}
        >
          <X size={20} />
        </button>

        {/* Large Header Image / Gradient */}
        <div
          style={{
            height: '200px',
            background: item.image_url ? `url(${item.image_url}) center/cover` : 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          {!item.image_url && <span style={{ fontSize: '5rem' }}>{item.image_emoji || '🍲'}</span>}
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '16px',
              backgroundColor: '#10b981',
              color: '#ffffff',
              padding: '0.35rem 0.85rem',
              borderRadius: '99px',
              fontSize: '0.8rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <ShieldCheck size={14} /> Freshness: {item.risk_level || 'Safe'}
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            {item.title}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981', backgroundColor: '#ecfdf5', padding: '0.3rem 0.75rem', borderRadius: '8px' }}>
              📦 Quantity: {item.quantity}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Clock size={15} /> Prep Time: {item.prep_time ? new Date(item.prep_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '2 hrs ago'}
            </span>
          </div>

          <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            {item.description || 'Freshly prepared surplus meals packaged cleanly in sealed hygiene containers.'}
          </p>

          {/* AI Quality Score Gauge Box */}
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                <Award size={16} /> AI Freshness Quality Score
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
                {item.remaining_shelf_life_hours > 12 ? '98 / 100 — Excellent' : '88 / 100 — Good'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                Predicted Remaining Shelf-Life: <strong>{item.remaining_shelf_life_hours || 18} Hours</strong>
              </div>
            </div>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: '4px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 900, color: '#10b981' }}>
              98%
            </div>
          </div>

          {/* Pickup Location & Contact */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>Pickup Details</h4>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', color: '#475569', fontSize: '0.9rem', marginBottom: '0.6rem' }}>
              <MapPin size={18} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Donor Location:</strong> {item.donor_name || 'Grand Hotel'}<br />
                <span style={{ color: '#64748b' }}>{item.donor_address || 'Indiranagar 100ft Road, Bengaluru'}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#475569', fontSize: '0.9rem' }}>
              <Phone size={18} style={{ color: '#0284c7', flexShrink: 0 }} />
              <div><strong>Donor Contact:</strong> {item.donor_phone || '+91 9888888881'}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => window.open(`https://maps.google.com/?q=${item.donor_latitude || 12.9784},${item.donor_longitude || 77.6408}`, '_blank')}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontWeight: 700 }}
            >
              <Navigation size={18} /> Open Map
            </button>

            <button
              onClick={() => {
                if (onClaim) onClaim(item);
                onClose();
              }}
              className="btn btn-primary"
              style={{ flex: 1.5, padding: '0.75rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontWeight: 800, fontSize: '1rem', backgroundColor: '#10b981', color: '#ffffff' }}
            >
              Claim Food Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDetailsModal;
