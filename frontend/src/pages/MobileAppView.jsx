import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, ArrowLeft, Bike, ShieldCheck, Brain, PlusCircle, CheckCircle2 } from 'lucide-react';
import TrackingMap from '../components/TrackingMap';

const MobileAppView = () => {
  const navigate = useNavigate();
  const [mobileTab, setMobileTab] = useState('donor'); // 'donor', 'ngo', 'map'
  
  // Mobile donor form state
  const [foodTitle, setFoodTitle] = useState('');
  const [foodQty, setFoodQty] = useState('');
  const [foodType, setFoodType] = useState('cooked');
  const [aiResult, setAiResult] = useState(null);
  const [otpCode, setOtpCode] = useState('');
  const [otpSuccess, setOtpSuccess] = useState(false);

  const mockDelivery = {
    id: 99,
    donation_title: 'Vegetable Biryani Surplus (15 Portions)',
    donor_address: 'Koramangala 5th Block, Bengaluru',
    donor_latitude: 12.9352,
    donor_longitude: 77.6245,
    ngo_name: 'Akshaya Care Foundation',
    ngo_address: 'Indiranagar 100ft Road, Bengaluru',
    ngo_latitude: 12.9784,
    ngo_longitude: 77.6408,
    current_latitude: 12.9550,
    current_longitude: 77.6320,
    tracking_status: 'in_transit',
    volunteer_name: 'Rahul Sharma (Mobile Courier)',
    volunteer_phone: '+91 9876543210',
    verification_code: 'VRFY-8492',
    distance_km: 1.8,
    eta_minutes: 6
  };

  const handleMobilePredict = () => {
    let hrs = 24;
    let risk = 'Safe';
    if (foodType === 'cooked') {
      hrs = 4;
      risk = 'High Risk';
    } else if (foodType === 'dairy') {
      hrs = 12;
      risk = 'Medium Risk';
    }
    setAiResult({ hours: hrs, risk });
  };

  const handleVerifyOtp = () => {
    if (otpCode.trim().toUpperCase() === 'VRFY-8492' || otpCode.trim() === '8492' || otpCode.trim() === '1234') {
      setOtpSuccess(true);
    } else {
      alert('Invalid Verification OTP Code. Try VRFY-8492');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', padding: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Top Header */}
      <div style={{ maxWidth: '1100px', margin: '0 auto 1.5rem auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          onClick={() => navigate('/')} 
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <ArrowLeft size={16} /> Back to Web Dashboard
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>
          <Smartphone size={22} /> FoodShare AI Mobile Simulator
        </div>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 420px', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Explanation Panel */}
        <div style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '20px', border: '1px solid #334155' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', color: '#38bdf8' }}>
            📱 Cross-Platform Web & Mobile App Ecosystem
          </h2>
          <p style={{ color: '#94a3b8', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            Both the <strong>Web Platform (React + Vite)</strong> and the <strong>Mobile Native Application (React Native)</strong> connect to the same backend API microservices (`/api/auth`, `/api/donations`, `/api/ngo/deliveries`, `/api/ai`).
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
              <strong style={{ color: '#10b981' }}>1. Food Surplus Listing & AI Expiry:</strong>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
                Donors can post surplus meals on mobile or web and get instant ML shelf-life predictions.
              </div>
            </div>

            <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #38bdf8' }}>
              <strong style={{ color: '#38bdf8' }}>2. Real-Time Live Delivery Tracking Map:</strong>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
                Track volunteer driver movement in real-time with dynamic ETA, route polylines, and distance calculations.
              </div>
            </div>

            <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
              <strong style={{ color: '#f59e0b' }}>3. OTP Handoff Verification:</strong>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
                NGO volunteers enter the OTP verification key at pickup/dropoff to confirm handoff completion.
              </div>
            </div>
          </div>
        </div>

        {/* Right Interactive Phone Frame */}
        <div style={{
          width: '380px',
          height: '740px',
          backgroundColor: '#000',
          borderRadius: '48px',
          border: '12px solid #334155',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
          margin: '0 auto',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Phone Notch */}
          <div style={{ height: '28px', backgroundColor: '#000', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '120px', height: '18px', backgroundColor: '#1e293b', borderRadius: '0 0 12px 12px' }} />
          </div>

          {/* Mobile Screen Header */}
          <div style={{ backgroundColor: '#111827', padding: '0.75rem 1rem', borderBottom: '1px solid #1f2937', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#10b981' }}>🍲 FoodShare Mobile</span>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              {['donor', 'ngo', 'map'].map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setMobileTab(tab)}
                  style={{
                    border: 'none',
                    backgroundColor: mobileTab === tab ? '#10b981' : '#1f2937',
                    color: mobileTab === tab ? '#fff' : '#94a3b8',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Screen Body */}
          <div style={{ flex: 1, backgroundColor: '#090d16', padding: '1rem', overflowY: 'auto' }}>
            
            {/* DONOR TAB */}
            {mobileTab === 'donor' && (
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.75rem', color: '#f8fafc' }}>
                  List Surplus Food (Mobile)
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Food Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Veg Biryani Tray"
                      value={foodTitle}
                      onChange={e => setFoodTitle(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '8px', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Quantity (kg)</label>
                    <input 
                      type="number" 
                      placeholder="10"
                      value={foodQty}
                      onChange={e => setFoodQty(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '8px', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Category</label>
                    <select 
                      value={foodType}
                      onChange={e => setFoodType(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '8px', fontSize: '0.85rem' }}
                    >
                      <option value="cooked">Cooked Meals</option>
                      <option value="dairy">Dairy Products</option>
                      <option value="produce">Produce</option>
                    </select>
                  </div>

                  <button 
                    type="button" 
                    onClick={handleMobilePredict}
                    style={{ backgroundColor: 'transparent', border: '1px solid #10b981', color: '#10b981', padding: '0.5rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    ⚡ Run Mobile AI Expiry Check
                  </button>

                  {aiResult && (
                    <div style={{ backgroundColor: '#1f2937', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                      <div>AI Remaining: <strong>{aiResult.hours} Hours</strong></div>
                      <div style={{ color: aiResult.risk === 'High Risk' ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                        Risk Status: {aiResult.risk}
                      </div>
                    </div>
                  )}

                  <button 
                    type="button"
                    style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '0.65rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
                    onClick={() => alert('Food donation published to FoodShare platform!')}
                  >
                    Publish Donation
                  </button>
                </div>
              </div>
            )}

            {/* NGO TAB */}
            {mobileTab === 'ngo' && (
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.75rem', color: '#f8fafc' }}>
                  Mobile OTP Verification Scan
                </h4>

                <div style={{ backgroundColor: '#111827', padding: '0.9rem', borderRadius: '12px', border: '1px solid #1f2937', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}>Active Pickup Delivery</div>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.2rem' }}>Biryani Surplus (15 Portions)</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>From: Grand Hotel | Koramangala</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Enter Handoff OTP Code</label>
                  <input 
                    type="text" 
                    placeholder="VRFY-8492"
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700 }}
                  />

                  <button 
                    type="button" 
                    onClick={handleVerifyOtp}
                    style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '0.65rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    Verify & Complete Delivery
                  </button>

                  {otpSuccess && (
                    <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CheckCircle2 size={16} /> Delivery Verified & Logged!
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MAP TAB */}
            {mobileTab === 'map' && (
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.5rem', color: '#f8fafc' }}>
                  Mobile Live Swiggy Tracking
                </h4>

                <TrackingMap 
                  delivery={mockDelivery}
                  isEditable={false}
                />
              </div>
            )}

          </div>

          {/* Phone Bottom Home Indicator Bar */}
          <div style={{ height: '24px', backgroundColor: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '120px', height: '4px', backgroundColor: '#475569', borderRadius: '2px' }} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default MobileAppView;
