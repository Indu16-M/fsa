import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, RefreshCw, Bike, MapPin, Navigation, ShieldCheck } from 'lucide-react';
import TrackingMap from '../components/TrackingMap';

const LiveTrackingPage = () => {
  const { user, getAuthHeaders, logout } = useAuth();
  const navigate = useNavigate();

  const [deliveries, setDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock demo delivery data if database doesn't have active deliveries yet
  const mockDeliveries = [
    {
      id: 101,
      donation_title: 'Surplus Fresh Biryani Bowls (25 Portions)',
      donor_address: 'Koramangala 5th Block, Bengaluru',
      donor_latitude: 12.9352,
      donor_longitude: 77.6245,
      ngo_name: 'Akshaya Care Foundation',
      ngo_address: 'Indiranagar 100ft Road, Bengaluru',
      ngo_latitude: 12.9784,
      ngo_longitude: 77.6408,
      current_latitude: 12.9560,
      current_longitude: 77.6320,
      tracking_status: 'in_transit',
      volunteer_name: 'Ramesh Kumar (Volunteer)',
      volunteer_phone: '+91 9876543210',
      verification_code: 'VRFY-8492',
      distance_km: 1.8,
      eta_minutes: 6
    },
    {
      id: 102,
      donation_title: 'Fresh Paneer Butter Masala & Rotis',
      donor_address: 'FreshMart Supermarket, Koramangala, Bengaluru',
      donor_latitude: 12.9345,
      donor_longitude: 77.6101,
      ngo_name: 'Feed The Hungry India',
      ngo_address: 'MG Road Center, Bengaluru',
      ngo_latitude: 12.9756,
      ngo_longitude: 77.6012,
      current_latitude: 12.9345,
      current_longitude: 77.6101,
      tracking_status: 'picked_up',
      volunteer_name: 'Priya Sharma (Volunteer)',
      volunteer_phone: '+91 9123456789',
      verification_code: 'VRFY-3109',
      distance_km: 4.2,
      eta_minutes: 10
    }
  ];

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ngo/deliveries', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setDeliveries(data);
          setSelectedDelivery(data[0]);
        } else {
          setDeliveries(mockDeliveries);
          setSelectedDelivery(mockDeliveries[0]);
        }
      } else {
        setDeliveries(mockDeliveries);
        setSelectedDelivery(mockDeliveries[0]);
      }
    } catch (err) {
      setDeliveries(mockDeliveries);
      setSelectedDelivery(mockDeliveries[0]);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationUpdate = (lat, lon) => {
    if (!selectedDelivery) return;
    setSelectedDelivery(prev => ({
      ...prev,
      current_latitude: lat,
      current_longitude: lon,
      tracking_status: prev.tracking_status === 'picked_up' ? 'in_transit' : prev.tracking_status
    }));
  };

  return (
    <div className="app-container" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Top Navigation Bar */}
      <header className="navbar" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            type="button" 
            onClick={() => navigate(-1)} 
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <div className="logo" style={{ fontSize: '1.3rem', color: '#fff' }}>
            🗺️ Real-Time Delivery Map
          </div>
        </div>

        <div className="nav-links">
          <button onClick={fetchDeliveries} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none' }}>
            <RefreshCw size={14} /> Refresh Live Map
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem', width: '100%' }}>
        
        {/* Header Alert */}
        <div style={{
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          color: '#3b82f6',
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Bike size={24} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Real-Time Live Delivery Map Active</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Simulating real-world driver movement, live route polylines, dynamic ETA, and OTP delivery handoff.</div>
            </div>
          </div>
        </div>

        {/* Order Selector Tabs */}
        {deliveries.length > 1 && (
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {deliveries.map(del => (
              <button
                key={del.id}
                type="button"
                onClick={() => setSelectedDelivery(del)}
                style={{
                  padding: '0.6rem 1.2rem',
                  borderRadius: '12px',
                  border: selectedDelivery?.id === del.id ? '2px solid #3b82f6' : '1px solid var(--border-color)',
                  backgroundColor: selectedDelivery?.id === del.id ? 'var(--primary-light)' : 'var(--bg-secondary)',
                  color: selectedDelivery?.id === del.id ? 'var(--primary-color)' : 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                📦 #{del.id} - {del.donation_title}
              </button>
            ))}
          </div>
        )}

        {/* Map Layout */}
        {selectedDelivery ? (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>
            {/* Map Canvas */}
            <div className="panel" style={{ padding: '1rem' }}>
              <TrackingMap 
                key={selectedDelivery.id}
                delivery={selectedDelivery}
                onLocationUpdate={handleLocationUpdate}
                isEditable={true}
              />
            </div>

            {/* Side Card Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Delivery Driver Info Card */}
              <div className="panel" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Bike size={18} /> Assigned Delivery Volunteer
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Volunteer Name:</span>
                    <strong>{selectedDelivery.volunteer_name || 'Ramesh Kumar'}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Phone Number:</span>
                    <strong>{selectedDelivery.volunteer_phone || '+91 9876543210'}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Current Status:</span>
                    <span style={{ color: '#10b981', fontWeight: 800, textTransform: 'uppercase' }}>
                      {selectedDelivery.tracking_status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.25rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Verification Code:</span>
                    <code style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 800, color: '#3b82f6' }}>
                      {selectedDelivery.verification_code}
                    </code>
                  </div>
                </div>
              </div>

              {/* Endpoints Card */}
              <div className="panel" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={18} style={{ color: '#ef4444' }} /> Pickup & Dropoff Route
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                  <div style={{ borderLeft: '3px solid #3b82f6', paddingLeft: '0.75rem' }}>
                    <div style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase' }}>Donor Pickup Point</div>
                    <div style={{ fontWeight: 700, margin: '0.2rem 0' }}>{selectedDelivery.donation_title}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{selectedDelivery.donor_address}</div>
                  </div>

                  <div style={{ borderLeft: '3px solid #10b981', paddingLeft: '0.75rem' }}>
                    <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase' }}>NGO Dropoff Point</div>
                    <div style={{ fontWeight: 700, margin: '0.2rem 0' }}>{selectedDelivery.ngo_name}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{selectedDelivery.ngo_address}</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading Swiggy Delivery Map...
          </div>
        )}

      </div>
    </div>
  );
};

export default LiveTrackingPage;
