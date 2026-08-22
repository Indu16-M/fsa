import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Navigation, CheckCircle, ArrowLeft, AlertTriangle } from 'lucide-react';

const ReceiverPickupMap = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const mapDivRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [receiverPos, setReceiverPos] = useState(null);
  const [resolvedDonorCoords, setResolvedDonorCoords] = useState(null);
  const [locationMsg, setLocationMsg] = useState('');
  const [mapReady, setMapReady] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Helper to resolve city coordinates from text
  const getCityCoordsFallback = (address) => {
    if (!address) return { lat: 13.0827, lon: 80.2707 }; // Default Chennai
    const addr = address.toLowerCase();
    if (addr.includes('poonamale') || addr.includes('poonamallee')) return { lat: 13.0404, lon: 80.1296 };
    if (addr.includes('chennai') || addr.includes('tamilnadu') || addr.includes('tamil nadu')) return { lat: 13.0827, lon: 80.2707 };
    if (addr.includes('bengaluru') || addr.includes('bangalore') || addr.includes('indiranagar') || addr.includes('koramangala')) return { lat: 12.9716, lon: 77.5946 };
    if (addr.includes('hyderabad')) return { lat: 17.3850, lon: 78.4867 };
    if (addr.includes('mumbai')) return { lat: 19.0760, lon: 72.8777 };
    if (addr.includes('delhi')) return { lat: 28.6139, lon: 77.2090 };
    return { lat: 13.0404, lon: 80.1296 };
  };

  // Step 1: Fetch claim
  useEffect(() => {
    const fetchClaim = async () => {
      try {
        const res = await fetch(`/api/claims/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setClaim(data);

          // Resolve donor coords
          const lat = parseFloat(data.donor_latitude);
          const lon = parseFloat(data.donor_longitude);
          if (!isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0) {
            setResolvedDonorCoords({ lat, lon });
          } else {
            // Forward geocode fallback
            const fallback = getCityCoordsFallback(data.donor_address);
            setResolvedDonorCoords(fallback);
            // Also attempt live Nominatim search async
            if (data.donor_address) {
              fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(data.donor_address)}`)
                .then(r => r.json())
                .then(items => {
                  if (items && items.length > 0) {
                    setResolvedDonorCoords({ lat: parseFloat(items[0].lat), lon: parseFloat(items[0].lon) });
                  }
                })
                .catch(() => {});
            }
          }
        } else {
          setError(data.message || 'Could not load claim details.');
        }
      } catch {
        setError('Network error. Please refresh.');
      } finally {
        setLoading(false);
      }
    };
    fetchClaim();
  }, [id, token]);

  // Step 2: Get receiver location (non-blocking)
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationMsg('Your browser does not support geolocation.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setReceiverPos({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => {
        setLocationMsg('Location access denied. Allow location to see your live position on the map.');
      },
      { timeout: 8000 }
    );
  }, []);

  // Step 3: Init Leaflet map
  useEffect(() => {
    if (!mapReady || !resolvedDonorCoords || !mapDivRef.current) return;
    if (!window.L) {
      setLocationMsg('Map library not loaded. Please refresh the page.');
      return;
    }

    const donorLat = resolvedDonorCoords.lat;
    const donorLon = resolvedDonorCoords.lon;

    // Destroy previous instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const centerLat = receiverPos ? (receiverPos.lat + donorLat) / 2 : donorLat;
    const centerLon = receiverPos ? (receiverPos.lon + donorLon) / 2 : donorLon;

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

    // Donor marker (green)
    const donorIcon = window.L.divIcon({
      html: `<div style="background:linear-gradient(135deg,#10b981,#047857);width:44px;height:44px;border-radius:50%;border:3px solid white;box-shadow:0 4px 12px rgba(16,185,129,0.5);display:flex;align-items:center;justify-content:center;font-size:20px;">📍</div>`,
      className: '',
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });
    window.L.marker([donorLat, donorLon], { icon: donorIcon })
      .addTo(map)
      .bindPopup(`<b>Donor Pickup Location</b><br/>${claim?.donor_address || claim?.donation_title || 'Pickup Spot'}`)
      .openPopup();

    // Receiver marker (blue) - only if we have receiver location
    if (receiverPos) {
      const youIcon = window.L.divIcon({
        html: `<div style="background:linear-gradient(135deg,#3b82f6,#1d4ed8);width:40px;height:40px;border-radius:50%;border:3px solid white;box-shadow:0 4px 12px rgba(59,130,246,0.5);display:flex;align-items:center;justify-content:center;font-size:18px;">🧑</div>`,
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });
      window.L.marker([receiverPos.lat, receiverPos.lon], { icon: youIcon })
        .addTo(map)
        .bindPopup('<b>Your Location</b>');

      // Route polyline
      window.L.polyline(
        [[receiverPos.lat, receiverPos.lon], [donorLat, donorLon]],
        { color: '#3b82f6', weight: 4, opacity: 0.8, dashArray: '8 6', lineCap: 'round' }
      ).addTo(map);

      // Fit both points
      map.fitBounds(
        [[receiverPos.lat, receiverPos.lon], [donorLat, donorLon]],
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
  }, [mapReady, resolvedDonorCoords, receiverPos, claim]);

  const handleUpdateStatus = async (status) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/claims/${id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (res.ok) setClaim(prev => ({ ...prev, status: data.claim.status }));
      else alert(data.message || 'Update failed.');
    } catch { alert('Error updating status.'); }
    finally { setUpdatingStatus(false); }
  };

  const handleFoodCollected = async () => {
    const code = prompt('Enter the Verification Code shown below (or from donor):');
    if (!code) return;
    setCompleting(true);
    try {
      const res = await fetch(`/api/claims/${id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'FOOD_COLLECTED', verification_code: code })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Food collected! Thank you for reducing food waste!');
        navigate('/receiver/claims');
      } else {
        alert(data.message || 'Invalid code.');
      }
    } catch { alert('Error.'); }
    finally { setCompleting(false); }
  };

  const calcDistance = () => {
    if (!receiverPos || !resolvedDonorCoords) return null;
    const R = 6371;
    const lat1 = receiverPos.lat, lon1 = receiverPos.lon;
    const lat2 = resolvedDonorCoords.lat, lon2 = resolvedDonorCoords.lon;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };
  const distKm = calcDistance();
  const etaMins = distKm ? Math.round(distKm / 0.333) : null;

  // --- RENDER ---
  if (loading) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{ width: '44px', height: '44px', border: '4px solid #e5e7eb', borderTop: '4px solid #10b981', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: '#6b7280' }}>Loading pickup details...</p>
        <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <AlertTriangle size={40} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
        <p style={{ color: '#ef4444', fontWeight: 600 }}>{error}</p>
        <button onClick={() => navigate('/receiver/claims')} style={{ marginTop: '1rem', padding: '0.6rem 1.2rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          Back to My Claims
        </button>
      </div>
    );
  }

  if (!claim) return null;

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Back button */}
      <button onClick={() => navigate('/receiver/claims')}
        style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-secondary, #6b7280)', marginBottom: '1.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
        <ArrowLeft size={17} /> Back to My Claims
      </button>

      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.35rem', color: 'var(--text-primary, #111827)' }}>
        Pick Up Your Food
      </h1>
      <p style={{ color: 'var(--text-secondary, #6b7280)', marginBottom: '2rem' }}>
        {claim.donation_title} &nbsp;·&nbsp; Status:{' '}
        <strong style={{ color: '#10b981' }}>{(claim.status || '').replace(/_/g, ' ')}</strong>
      </p>

      {/* Location message */}
      {locationMsg && (
        <div style={{ padding: '1rem 1.25rem', backgroundColor: 'rgba(245,158,11,0.1)', border: '1px solid #f59e0b', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <AlertTriangle size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{ color: '#92400e', fontSize: '0.9rem', margin: 0 }}>{locationMsg}</p>
        </div>
      )}

      {/* Map Section */}
      <div style={{ backgroundColor: 'var(--bg-secondary, #f9fafb)', border: '1px solid var(--border-color, #e5e7eb)', borderRadius: '16px', overflow: 'hidden', marginBottom: '1.5rem' }}>
        <div
          ref={(el) => { mapDivRef.current = el; if (el && !mapReady) setMapReady(true); }}
          style={{ height: '420px', width: '100%' }}
        />

        {/* Map legend & stats */}
        <div style={{ padding: '1rem 1.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center', borderTop: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#374151' }}>
            <span>📍</span> <span style={{ fontWeight: 600 }}>Donor Pickup Location</span>
          </div>
          {receiverPos && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#374151' }}>
              <span>🧑</span> <span style={{ fontWeight: 600 }}>Your Location</span>
            </div>
          )}
          {distKm !== null && (
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '1.5rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Distance</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>{distKm.toFixed(1)} km</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ETA</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#3b82f6' }}>{etaMins} min</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Exact Address */}
      <div style={{ padding: '1.25rem 1.5rem', backgroundColor: 'var(--bg-secondary, #f9fafb)', border: '1px solid var(--border-color, #e5e7eb)', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <MapPin size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Exact Pickup Address</div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary, #111827)' }}>{claim.donor_address || 'Address not set by donor'}</div>
        </div>
      </div>

      {/* Verification Code Info */}
      <div style={{ padding: '1rem 1.25rem', backgroundColor: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <p style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.2rem', color: '#065f46' }}>Verification Code: <code style={{ fontSize: '1rem', letterSpacing: '0.1em', backgroundColor: 'rgba(16,185,129,0.15)', padding: '0.1rem 0.5rem', borderRadius: '6px' }}>{claim.verification_code || '—'}</code></p>
          <p style={{ fontSize: '0.83rem', color: '#047857', margin: 0 }}>Give this code to the donor when collecting your food.</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {claim.status === 'CLAIMED' && (
          <button onClick={() => handleUpdateStatus('ON_THE_WAY')} disabled={updatingStatus}
            style={{ width: '100%', padding: '1rem', fontSize: '1rem', fontWeight: 700, borderRadius: '12px', border: 'none', cursor: 'pointer', backgroundColor: '#3b82f6', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem', opacity: updatingStatus ? 0.7 : 1 }}>
            <Navigation size={20} /> {updatingStatus ? 'Updating...' : "I'M ON MY WAY"}
          </button>
        )}

        {claim.status === 'ON_THE_WAY' && (
          <button onClick={() => handleUpdateStatus('ARRIVED')} disabled={updatingStatus}
            style={{ width: '100%', padding: '1rem', fontSize: '1rem', fontWeight: 700, borderRadius: '12px', border: 'none', cursor: 'pointer', backgroundColor: '#8b5cf6', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem', opacity: updatingStatus ? 0.7 : 1 }}>
            <MapPin size={20} /> {updatingStatus ? 'Updating...' : "I'VE ARRIVED"}
          </button>
        )}

        {['CLAIMED', 'ON_THE_WAY', 'ARRIVED'].includes(claim.status) && (
          <button onClick={handleFoodCollected} disabled={completing}
            style={{ width: '100%', padding: '1rem', fontSize: '1rem', fontWeight: 700, borderRadius: '12px', border: 'none', cursor: 'pointer', backgroundColor: '#10b981', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem', opacity: completing ? 0.7 : 1 }}>
            <CheckCircle size={20} /> {completing ? 'Completing...' : 'FOOD COLLECTED ✓'}
          </button>
        )}

        {claim.status === 'COMPLETED' && (
          <div style={{ padding: '1.5rem', backgroundColor: 'rgba(16,185,129,0.08)', borderRadius: '12px', border: '1px solid #10b981', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <CheckCircle size={28} color="#10b981" />
            <div>
              <div style={{ fontWeight: 800, color: '#10b981', fontSize: '1.05rem' }}>Pickup Completed!</div>
              <div style={{ fontSize: '0.88rem', color: '#047857' }}>Thank you for helping reduce food waste!</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiverPickupMap;
