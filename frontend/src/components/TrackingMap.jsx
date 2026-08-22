import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, Copy, CheckCircle2 } from 'lucide-react';

const TrackingMap = ({ delivery, onLocationUpdate }) => {
  const mapContainerRef = useRef(null);
  const leafletMap = useRef(null);
  const markersRef = useRef({});
  const polylineActiveRef = useRef(null);
  
  const [copiedCode, setCopiedCode] = useState(false);

  // Extract coordinates with defaults
  const donorLat = delivery?.donor_latitude || 12.9352;
  const donorLon = delivery?.donor_longitude || 77.6245;
  const ngoLat = delivery?.ngo_latitude || 12.9784;
  const ngoLon = delivery?.ngo_longitude || 77.6408;
  const currentLat = delivery?.current_latitude ?? donorLat;
  const currentLon = delivery?.current_longitude ?? donorLon;

  const trackingStatus = delivery?.tracking_status || 'assigned';
  const verificationCode = delivery?.verification_code || 'VRFY-0000';
  const distanceKm = delivery?.distance_km ?? 2.4;
  const etaMinutes = delivery?.eta_minutes ?? 8;

  // Initialize Leaflet Map
  useEffect(() => {
    if (!window.L || !mapContainerRef.current) return;

    if (leafletMap.current) {
      leafletMap.current.remove();
      leafletMap.current = null;
    }

    const map = window.L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([donorLat, donorLon], 13);
    
    leafletMap.current = map;

    // CartoDB Voyager Tile Layer (Clean modern Swiggy/Zomato aesthetic)
    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    // Custom Styled Icons
    const donorIcon = window.L.divIcon({
      html: `
        <div style="position: relative; text-align: center;">
          <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); font-size: 18px; color: white;">
            🏬
          </div>
          <div style="position: absolute; bottom: -18px; left: 50%; transform: translateX(-50%); background: #1e293b; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
            PICKUP
          </div>
        </div>`,
      className: 'custom-map-icon',
      iconSize: [38, 38],
      iconAnchor: [19, 19]
    });

    const ngoIcon = window.L.divIcon({
      html: `
        <div style="position: relative; text-align: center;">
          <div style="background: linear-gradient(135deg, #10b981, #047857); width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4); font-size: 18px; color: white;">
            🍲
          </div>
          <div style="position: absolute; bottom: -18px; left: 50%; transform: translateX(-50%); background: #10b981; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
            RECIPIENT
          </div>
        </div>`,
      className: 'custom-map-icon',
      iconSize: [38, 38],
      iconAnchor: [19, 19]
    });

    const driverIcon = window.L.divIcon({
      html: `
        <div style="position: relative;">
          <div style="background: #ef4444; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 14px rgba(239, 68, 68, 0.6); font-size: 20px; animation: sonarPulse 1.8s infinite;">
            🛵
          </div>
        </div>`,
      className: 'custom-map-icon',
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    // Add Donor & NGO Markers
    markersRef.current.donor = window.L.marker([donorLat, donorLon], { icon: donorIcon })
      .addTo(map)
      .bindPopup(`<b>Your Pickup Location</b><br/>${delivery?.donation_title || 'Food Donation'}`);

    // Add Driver Marker
    markersRef.current.driver = window.L.marker([currentLat, currentLon], { icon: driverIcon })
      .addTo(map)
      .bindPopup(`<b>Pickup Partner</b><br/>${delivery?.volunteer_name || 'Assigned Partner'}`);

    markersRef.current.ngo = window.L.marker([ngoLat, ngoLon], { icon: ngoIcon })
      .addTo(map)
      .bindPopup(`<b>NGO / Recipient</b><br/>${delivery?.ngo_name || 'NGO Recipient'}`);

    const isPhase1 = ['assigned', 'arrived_at_pickup'].includes(trackingStatus);
    const targetLat = isPhase1 ? donorLat : ngoLat;
    const targetLon = isPhase1 ? donorLon : ngoLon;

    polylineActiveRef.current = window.L.polyline([[currentLat, currentLon], [targetLat, targetLon]], {
      color: '#3b82f6',
      weight: 5,
      opacity: 0.9,
      lineCap: 'round',
      dashArray: isPhase1 ? null : '6, 10'
    }).addTo(map);

    const bounds = window.L.latLngBounds([
      [donorLat, donorLon],
      [ngoLat, ngoLon],
      [currentLat, currentLon]
    ]);
    map.fitBounds(bounds, { padding: [60, 60] });

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Update Driver, Donor & NGO positions & polyline paths on props change
  useEffect(() => {
    if (leafletMap.current) {
      if (markersRef.current.donor) markersRef.current.donor.setLatLng([donorLat, donorLon]);
      if (markersRef.current.ngo) markersRef.current.ngo.setLatLng([ngoLat, ngoLon]);
      if (markersRef.current.driver) markersRef.current.driver.setLatLng([currentLat, currentLon]);

      const isPhase1 = ['assigned', 'arrived_at_pickup'].includes(trackingStatus);
      const targetLat = isPhase1 ? donorLat : ngoLat;
      const targetLon = isPhase1 ? donorLon : ngoLon;

      if (polylineActiveRef.current) {
        polylineActiveRef.current.setLatLngs([[currentLat, currentLon], [targetLat, targetLon]]);
        // change dash style if phase 2
        polylineActiveRef.current.setStyle({
           dashArray: isPhase1 ? null : '6, 10'
        });
      }

      if (markersRef.current.driver && markersRef.current.driver.getPopup()) {
        markersRef.current.driver.getPopup().setContent(
          `<b>Pickup Partner</b><br/>${delivery?.volunteer_name || 'Assigned Partner'}`
        );
      }

      const bounds = window.L.latLngBounds([
        [donorLat, donorLon],
        [ngoLat, ngoLon],
        [currentLat, currentLon]
      ]);
      leafletMap.current.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [donorLat, donorLon, ngoLat, ngoLon, currentLat, currentLon, trackingStatus, delivery?.volunteer_name]);

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(verificationCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Status Stepper Index (0 to 3)
  const getStepIndex = (status) => {
    switch (status) {
      case 'assigned': return 0;
      case 'picked_up': return 1;
      case 'in_transit': return 2;
      case 'delivered': return 3;
      default: return 0;
    }
  };
  const activeStep = getStepIndex(trackingStatus);

  const steps = [
    { label: 'Order Assigned', desc: 'Courier matching' },
    { label: 'Food Picked Up', desc: 'From Donor location' },
    { label: 'On The Way', desc: 'Live driver tracking' },
    { label: 'Delivered', desc: 'Handed over to NGO' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @keyframes sonarPulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 14px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .custom-map-icon {
          background: transparent !important;
          border: none !important;
        }
      `}</style>

      {/* Leaflet Map Canvas */}
      <div style={{ position: 'relative' }}>
        <div 
          ref={mapContainerRef} 
          style={{ 
            height: '360px', 
            width: '100%', 
            borderRadius: '16px', 
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-md)',
            zIndex: 1
          }} 
        />

        {/* Verification OTP Card Overlay (Bottom Left) */}
        {verificationCode && trackingStatus === 'arrived_at_pickup' && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            zIndex: 400,
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(10px)',
            color: '#fff',
            padding: '0.6rem 0.9rem',
            borderRadius: '12px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.8rem'
          }}>
            <ShieldCheck size={18} style={{ color: '#10b981' }} />
            <div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>Pickup Verification OTP</div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '1px', color: '#38bdf8' }}>{verificationCode}</div>
            </div>
            <button 
              type="button" 
              onClick={copyCodeToClipboard}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
              title="Copy Code"
            >
              {copiedCode ? <CheckCircle2 size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackingMap;
