import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Navigation, CheckCircle, ArrowLeft, AlertTriangle, Clock, ShieldCheck, UserCheck } from 'lucide-react';

const NgoPickupMap = () => {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const mapDivRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ngoMemberPos, setNgoMemberPos] = useState(null);
  const [resolvedDonorCoords, setResolvedDonorCoords] = useState(null);
  const [locationMsg, setLocationMsg] = useState('');
  const [mapReady, setMapReady] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Fallback city coordinates
  const getCityCoordsFallback = (address) => {
    if (!address) return { lat: 13.0827, lon: 80.2707 };
    const addr = address.toLowerCase();
    if (addr.includes('poonamale') || addr.includes('poonamallee')) return { lat: 13.0404, lon: 80.1296 };
    if (addr.includes('chennai') || addr.includes('tamilnadu') || addr.includes('tamil nadu')) return { lat: 13.0827, lon: 80.2707 };
    if (addr.includes('bengaluru') || addr.includes('bangalore') || addr.includes('indiranagar') || addr.includes('koramangala')) return { lat: 12.9716, lon: 77.5946 };
    if (addr.includes('hyderabad')) return { lat: 17.3850, lon: 78.4867 };
    if (addr.includes('mumbai')) return { lat: 19.0760, lon: 72.8777 };
    if (addr.includes('delhi')) return { lat: 28.6139, lon: 77.2090 };
    return { lat: 13.0404, lon: 80.1296 };
  };

  // Step 1: Fetch Claim Details
  useEffect(() => {
    const fetchClaim = async () => {
      try {
        const res = await fetch(`/api/ngo/claims/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setClaim(data);
          const lat = parseFloat(data.donor_latitude);
          const lon = parseFloat(data.donor_longitude);
          if (!isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0) {
            setResolvedDonorCoords({ lat, lon });
          } else {
            const fallback = getCityCoordsFallback(data.donor_address);
            setResolvedDonorCoords(fallback);
          }
        } else {
          setError(data.message || 'Could not load claim details.');
        }
      } catch {
        setError('Network error loading pickup details.');
      } finally {
        setLoading(false);
      }
    };
    fetchClaim();
  }, [id, token]);

  // Step 2: Get NGO Member location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationMsg('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNgoMemberPos({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => {
        setLocationMsg('Location access not granted. Allow location to display real-time route.');
      },
      { timeout: 8000 }
    );
  }, []);

  // Step 3: Initialize in-app Leaflet map
  useEffect(() => {
    if (!mapReady || !resolvedDonorCoords || !mapDivRef.current) return;
    if (!window.L) {
      setLocationMsg('Map library loading error.');
      return;
    }

    const donorLat = resolvedDonorCoords.lat;
    const donorLon = resolvedDonorCoords.lon;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const centerLat = ngoMemberPos ? (ngoMemberPos.lat + donorLat) / 2 : donorLat;
    const centerLon = ngoMemberPos ? (ngoMemberPos.lon + donorLon) / 2 : donorLon;

    const map = window.L.map(mapDivRef.current, {
      center: [centerLat, centerLon],
      zoom: 14,
      zoomControl: true,
      scrollWheelZoom: false
    });
    mapInstanceRef.current = map;

    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    // Donor pickup pin (Green)
    const donorIcon = window.L.divIcon({
      html: `<div style="background:linear-gradient(135deg,#10b981,#047857);width:46px;height:46px;border-radius:50%;border:3px solid white;box-shadow:0 6px 16px rgba(16,185,129,0.5);display:flex;align-items:center;justify-content:center;font-size:22px;">📍</div>`,
      className: '',
      iconSize: [46, 46],
      iconAnchor: [23, 23]
    });
    window.L.marker([donorLat, donorLon], { icon: donorIcon })
      .addTo(map)
      .bindPopup(`
        <div style="font-family: Inter, sans-serif; padding: 2px;">
          <b style="font-size: 14px; color: #111827;">Donor Pickup Spot</b><br/>
          <span style="font-size: 12px; color: #6b7280; display: block; margin-top: 2px; margin-bottom: 6px;">${claim?.donor_address || claim?.donation_title || 'Pickup Spot'}</span>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${donorLat},${donorLon}${ngoMemberPos ? `&origin=${ngoMemberPos.lat},${ngoMemberPos.lon}` : ''}" target="_blank" rel="noopener noreferrer" style="background-color: #10b981; color: white !important; font-weight: 700; text-decoration: none; padding: 4px 8px; border-radius: 6px; font-size: 11px; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 4px rgba(16,185,129,0.2);">🚗 Get Directions</a>
        </div>
      `)
      .openPopup();

    // NGO Member pin (Blue)
    if (ngoMemberPos) {
      const ngoIcon = window.L.divIcon({
        html: `<div style="background:linear-gradient(135deg,#3b82f6,#1d4ed8);width:44px;height:44px;border-radius:50%;border:3px solid white;box-shadow:0 6px 16px rgba(59,130,246,0.5);display:flex;align-items:center;justify-content:center;font-size:20px;">🏢</div>`,
        className: '',
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });
      window.L.marker([ngoMemberPos.lat, ngoMemberPos.lon], { icon: ngoIcon })
        .addTo(map)
        .bindPopup(`<b>NGO Member Location</b><br/>${user?.username || 'Authorized Member'}`);

      // Route polyline
      window.L.polyline(
        [[ngoMemberPos.lat, ngoMemberPos.lon], [donorLat, donorLon]],
        { color: '#3b82f6', weight: 5, opacity: 0.85, dashArray: '8 6', lineCap: 'round' }
      ).addTo(map);

      map.fitBounds(
        [[ngoMemberPos.lat, ngoMemberPos.lon], [donorLat, donorLon]],
        { padding: [60, 60] }
      );
    } else {
      map.setView([donorLat, donorLon], 15);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapReady, resolvedDonorCoords, ngoMemberPos, claim, user]);

  const handleUpdateStatus = async (status) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/ngo/claims/${id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (res.ok) {
        setClaim(prev => ({ ...prev, status: data.claim.status }));
      } else {
        alert(data.message || 'Update failed.');
      }
    } catch {
      alert('Error updating status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleFoodCollected = async () => {
    const code = prompt(`Enter the Handover Verification Code (${claim.verification_code ? 'shown below: ' + claim.verification_code : 'from donor'}):`);
    if (!code) return;
    setCompleting(true);
    try {
      const res = await fetch(`/api/ngo/claims/${id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'FOOD_COLLECTED', verification_code: code })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Food successfully collected! You can now record the distribution.');
        navigate('/ngo/distribution');
      } else {
        alert(data.message || 'Invalid verification code.');
      }
    } catch {
      alert('Error processing handover.');
    } finally {
      setCompleting(false);
    }
  };

  const calcDistance = () => {
    if (!ngoMemberPos || !resolvedDonorCoords) return null;
    const R = 6371;
    const lat1 = ngoMemberPos.lat, lon1 = ngoMemberPos.lon;
    const lat2 = resolvedDonorCoords.lat, lon2 = resolvedDonorCoords.lon;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };
  const distKm = calcDistance();
  const etaMins = distKm ? Math.round(distKm / 0.333) : null;

  if (loading) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{ width: '42px', height: '42px', border: '4px solid #e5e7eb', borderTop: '4px solid #10b981', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: '#6b7280' }}>Loading in-app pickup map...</p>
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div style={{ backgroundColor: 'var(--bg-secondary, #ffffff)', padding: '3rem', borderRadius: '18px', border: '1px solid var(--border-color, #e5e7eb)', textAlign: 'center' }}>
        <AlertTriangle size={40} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
        <p style={{ color: '#ef4444', fontWeight: 700 }}>{error || 'Claim Not Found'}</p>
        <button onClick={() => navigate('/ngo/claims')} style={{ marginTop: '1rem', padding: '0.6rem 1.4rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
          Back to My Claims
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header */}
      <button
        onClick={() => navigate('/ngo/claims')}
        style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#6b7280', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', alignSelf: 'flex-start' }}
      >
        <ArrowLeft size={17} /> Back to My Claims
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary, #111827)', margin: '0 0 0.3rem 0' }}>
            In-App Food Recovery Pickup
          </h1>
          <p style={{ color: 'var(--text-secondary, #6b7280)', margin: 0, fontSize: '0.95rem' }}>
            {claim.donation_title} &nbsp;·&nbsp; Operational Status:{' '}
            <strong style={{ color: '#10b981' }}>{(claim.status || '').replace(/_/g, ' ')}</strong>
          </p>
        </div>
        <div style={{ padding: '0.5rem 1rem', backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#047857', fontWeight: 700, fontSize: '0.85rem' }}>
          <UserCheck size={16} /> Authorized NGO Collection
        </div>
      </div>

      {/* Location warning */}
      {locationMsg && (
        <div style={{ padding: '0.9rem 1.25rem', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', display: 'flex', gap: '0.6rem', alignItems: 'center', color: '#b45309', fontSize: '0.88rem' }}>
          <AlertTriangle size={17} color="#f59e0b" style={{ flexShrink: 0 }} />
          <span>{locationMsg}</span>
        </div>
      )}

      {/* In-App Map Card */}
      <div style={{ backgroundColor: 'var(--bg-secondary, #ffffff)', border: '1px solid var(--border-color, #e5e7eb)', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        
        <div
          ref={(el) => { mapDivRef.current = el; if (el && !mapReady) setMapReady(true); }}
          style={{ height: '440px', width: '100%' }}
        />

        {/* Legend & Stats bar */}
        <div style={{ padding: '1.1rem 1.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center', borderTop: '1px solid var(--border-color, #e5e7eb)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.86rem', color: '#374151' }}>
            <span>📍</span> <span style={{ fontWeight: 700 }}>Donor Pickup Location</span>
          </div>
          {ngoMemberPos && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.86rem', color: '#374151' }}>
              <span>🏢</span> <span style={{ fontWeight: 700 }}>NGO Member Live Location</span>
            </div>
          )}
          {distKm !== null && (
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '1.75rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase' }}>Distance</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#10b981' }}>{distKm.toFixed(1)} km</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase' }}>ETA</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#3b82f6' }}>{etaMins} min</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Exact Unlocked Pickup Address */}
      <div style={{ padding: '1.3rem 1.6rem', backgroundColor: 'var(--bg-secondary, #ffffff)', border: '1px solid var(--border-color, #e5e7eb)', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.9rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem', flex: 1 }}>
          <MapPin size={22} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
              Exact Donor Pickup Address
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary, #111827)' }}>
              {claim.donor_address || 'Address provided upon assignment'}
            </div>
          </div>
        </div>
        <button 
          onClick={() => {
            const destLat = resolvedDonorCoords?.lat || claim?.donor_latitude || 12.9716;
            const destLon = resolvedDonorCoords?.lon || claim?.donor_longitude || 77.5946;
            let url = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLon}`;
            if (ngoMemberPos) {
              url += `&origin=${ngoMemberPos.lat},${ngoMemberPos.lon}`;
            }
            window.open(url, '_blank');
          }}
          style={{ 
            backgroundColor: '#10b981', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            padding: '0.6rem 1rem', 
            fontSize: '0.85rem', 
            fontWeight: 700, 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: '0 4px 6px rgba(16, 185, 129, 0.15)'
          }}
        >
          <Navigation size={15} style={{ transform: 'rotate(45deg)' }} /> Get Directions
        </button>
      </div>

      {/* Handover Verification Code */}
      <div style={{ padding: '1.1rem 1.4rem', backgroundColor: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '14px', display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
        <CheckCircle size={22} color="#10b981" style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#065f46' }}>
            Handover Verification Code:{' '}
            <code style={{ fontSize: '1.05rem', letterSpacing: '0.08em', backgroundColor: 'rgba(16,185,129,0.2)', padding: '0.15rem 0.65rem', borderRadius: '6px', marginLeft: '0.4rem' }}>
              {claim.verification_code || '—'}
            </code>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#047857', marginTop: '0.15rem' }}>
            Provide this code to the donor at the pickup location to authorize the food handover.
          </div>
        </div>
      </div>

      {/* Status Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        {claim.status === 'CLAIMED' && (
          <button
            onClick={() => handleUpdateStatus('ON_THE_WAY')}
            disabled={updatingStatus}
            style={{ width: '100%', padding: '1.1rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 900, fontSize: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem', opacity: updatingStatus ? 0.7 : 1 }}
          >
            <Navigation size={20} /> {updatingStatus ? 'Updating...' : "I'M ON MY WAY FOR PICKUP"}
          </button>
        )}

        {claim.status === 'ON_THE_WAY' && (
          <button
            onClick={() => handleUpdateStatus('ARRIVED')}
            disabled={updatingStatus}
            style={{ width: '100%', padding: '1.1rem', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 900, fontSize: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem', opacity: updatingStatus ? 0.7 : 1 }}
          >
            <MapPin size={20} /> {updatingStatus ? 'Updating...' : "I'VE ARRIVED AT DONOR LOCATION"}
          </button>
        )}

        {['CLAIMED', 'ON_THE_WAY', 'ARRIVED'].includes(claim.status) && (
          <button
            onClick={handleFoodCollected}
            disabled={completing}
            style={{ width: '100%', padding: '1.1rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 900, fontSize: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem', opacity: completing ? 0.7 : 1 }}
          >
            <CheckCircle size={20} /> {completing ? 'Confirming...' : 'FOOD COLLECTED (ENTER CODE) ✓'}
          </button>
        )}

        {claim.status === 'FOOD_COLLECTED' && (
          <div style={{ padding: '1.5rem', backgroundColor: '#ecfdf5', borderRadius: '14px', border: '1px solid #10b981', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle size={26} color="#10b981" />
              <div>
                <div style={{ fontWeight: 800, color: '#065f46', fontSize: '1.05rem' }}>Food Collected Successfully!</div>
                <div style={{ fontSize: '0.86rem', color: '#047857' }}>Ready to distribute to your beneficiary groups.</div>
              </div>
            </div>
            <button
              onClick={() => navigate('/ngo/distribution')}
              style={{ padding: '0.7rem 1.3rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer' }}
            >
              Record Distribution →
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default NgoPickupMap;
