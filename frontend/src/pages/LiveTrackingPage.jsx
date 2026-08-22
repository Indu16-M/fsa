import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, RefreshCw, Bike, MapPin, CheckCircle2, Phone, MessageSquare, AlertTriangle, ListChecks } from 'lucide-react';
import TrackingMap from '../components/TrackingMap';

const LiveTrackingPage = () => {
  const { user, getAuthHeaders } = useAuth();
  const navigate = useNavigate();

  const [deliveries, setDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [loading, setLoading] = useState(true);

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
          setDeliveries([]);
          setSelectedDelivery(null);
        }
      } else {
        setDeliveries([]);
        setSelectedDelivery(null);
      }
    } catch (err) {
      setDeliveries([]);
      setSelectedDelivery(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPickup = async () => {
    if (!selectedDelivery) return;
    try {
      // Opt: In real world, send OTP to backend.
      // We will locally mock the state transition to 'picked_up' for demonstration of phase 2.
      setSelectedDelivery(prev => ({ ...prev, tracking_status: 'picked_up' }));
      alert("Pickup Confirmed Successfully. Food is now moving to the recipient!");
    } catch (err) {
      alert("Failed to confirm pickup.");
    }
  };

  // Helper to map DB status to 8-step ShareByte Timeline
  const timelineSteps = [
    { key: 'available', label: 'Donation Posted', desc: 'Food donation successfully created.' },
    { key: 'assigned', label: 'Pickup Assigned', desc: 'A pickup partner has been assigned.' },
    { key: 'in_progress_pickup', label: 'On The Way', desc: 'Pickup person is travelling to donor.' },
    { key: 'arrived_at_pickup', label: 'Arrived at Pickup Location', desc: 'Pickup person has reached the donor.' },
    { key: 'picked_up', label: 'Food Collected', desc: 'Food has been collected successfully.' },
    { key: 'in_transit', label: 'On The Way to Recipient', desc: 'Food is travelling to the NGO/recipient.' },
    { key: 'delivered', label: 'Delivered', desc: 'Food has been handed over.' },
    { key: 'completed', label: 'Donation Completed', desc: 'Donation successfully completed and impact recorded.' }
  ];

  const getActiveStepIndex = (status) => {
    const statusMap = {
      'available': 0,
      'assigned': 1,
      'in_progress_pickup': 2,
      'arrived_at_pickup': 3,
      'picked_up': 4,
      'in_transit': 5,
      'delivered': 6,
      'completed': 7
    };
    return statusMap[status] ?? 1; 
  };

  const activeStep = selectedDelivery ? getActiveStepIndex(selectedDelivery.tracking_status) : 0;
  const isDriverArrived = selectedDelivery?.tracking_status === 'arrived_at_pickup';
  const isPhase1 = activeStep <= 3;

  return (
    <div className="app-container" style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Navigation Bar */}
      <header className="navbar" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            type="button" 
            onClick={() => navigate(-1)} 
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="logo" style={{ fontSize: '1.2rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ListChecks size={20} /> Food Pickup Tracking
          </div>
        </div>

        <div className="nav-links">
          <button onClick={fetchDeliveries} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none' }}>
            <RefreshCw size={14} className={loading ? 'spinning' : ''} /> Refresh
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div style={{ flex: 1, maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem', width: '100%' }}>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading active donations...
          </div>
        ) : !selectedDelivery ? (
           <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px' }}>
            <MapPin size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>No Active Tracking</h3>
            <p style={{ color: 'var(--text-secondary)' }}>You do not have any donations currently in transit.</p>
            <button className="btn btn-primary" onClick={() => navigate('/donor')} style={{ marginTop: '1rem' }}>
              Return to Dashboard
            </button>
          </div>
        ) : (
          <>
            {/* Header Context Message */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {isPhase1 ? 'Your donation is on its way to pickup' : 'Your donation is on the way to the recipient'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.5rem' }}>
                {isPhase1 
                  ? `${selectedDelivery.volunteer_name || 'Pickup partner'} is heading to your location.`
                  : `${selectedDelivery.volunteer_name || 'Pickup partner'} is carrying the donated food to the NGO.`}
              </p>
            </div>

            {/* Map Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
              
              {/* Left Column: Map & Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                <div className="panel" style={{ padding: '0', overflow: 'hidden' }}>
                  <TrackingMap delivery={selectedDelivery} />
                </div>

                {/* Vertical Timeline */}
                <div className="panel" style={{ padding: '1.5rem' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={20} style={{ color: 'var(--primary-color)' }} /> Donation Timeline
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
                    {/* Vertical line connecting steps */}
                    <div style={{ position: 'absolute', left: '11px', top: '24px', bottom: '24px', width: '2px', backgroundColor: 'var(--border-color)', zIndex: 0 }} />

                    {timelineSteps.map((step, idx) => {
                      const isDone = idx <= activeStep;
                      const isCurrent = idx === activeStep;
                      
                      return (
                        <div key={idx} style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1, opacity: isDone ? 1 : 0.4 }}>
                          <div style={{ 
                            width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                            backgroundColor: isDone ? 'var(--primary-color)' : 'var(--bg-tertiary)',
                            border: `2px solid ${isDone ? 'var(--primary-color)' : 'var(--border-color)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px',
                            boxShadow: isCurrent ? '0 0 0 4px rgba(16, 185, 129, 0.2)' : 'none'
                          }}>
                            {isDone && <CheckCircle2 size={14} color="#fff" />}
                          </div>
                          <div>
                            <div style={{ fontWeight: isCurrent ? 800 : 600, color: isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                              {step.label}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                              {step.desc}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Right Column: Donation Details & Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Arrival & Verification Card */}
                {isPhase1 && (
                  <div className="panel" style={{ padding: '1.5rem', backgroundColor: isDriverArrived ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-secondary)', border: isDriverArrived ? '1px solid var(--primary-color)' : '1px solid var(--border-color)' }}>
                    {isDriverArrived ? (
                       <div style={{ textAlign: 'center' }}>
                         <h3 style={{ color: 'var(--primary-color)', fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>Pickup Person Has Arrived</h3>
                         <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Please verify the pickup person and hand over the food.</p>
                         
                         <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                           <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Pickup Verification Code</div>
                           <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '4px', color: 'var(--text-primary)', margin: '0.5rem 0' }}>
                             {selectedDelivery.verification_code || '123456'}
                           </div>
                           <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Share this with the pickup partner</div>
                         </div>

                         <button className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }} onClick={handleConfirmPickup}>
                           Food Handed Over
                         </button>
                       </div>
                    ) : (
                      <>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>Pickup arriving soon</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Bike size={24} color="#64748b" />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700 }}>{selectedDelivery.volunteer_name || 'Ravi'}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Pickup Partner • Verified</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <button className="btn btn-secondary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                            <Phone size={16} /> Call Pickup Person
                          </button>
                          <button className="btn btn-secondary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                            <MessageSquare size={16} /> Message
                          </button>
                          <button className="btn btn-secondary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', color: '#ef4444', borderColor: '#ef4444' }}>
                            <AlertTriangle size={16} /> Report Issue
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Donation Information Panel */}
                <div className="panel" style={{ padding: '1.5rem' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                    Donation Details
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Food:</span>
                      <span style={{ fontWeight: 600, textAlign: 'right' }}>{selectedDelivery.donation_title}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Donation ID:</span>
                      <span style={{ fontWeight: 600, textAlign: 'right' }}>SB-{selectedDelivery.donation_id || '10294'}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Destination:</span>
                      <span style={{ fontWeight: 600, textAlign: 'right' }}>{selectedDelivery.ngo_name}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Current Status:</span>
                      <span style={{ fontWeight: 800, color: 'var(--primary-color)' }}>
                        {timelineSteps[activeStep]?.label || 'Active'}
                      </span>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LiveTrackingPage;
