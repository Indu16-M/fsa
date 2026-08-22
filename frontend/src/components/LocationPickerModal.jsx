import React, { useEffect, useRef, useState } from 'react';
import { MapPin, X, Check, Search, Navigation } from 'lucide-react';

const LocationPickerModal = ({ isOpen, onClose, initialLat = 12.9716, initialLon = 77.5946, onSelectLocation }) => {
  const mapContainerRef = useRef(null);
  const leafletMap = useRef(null);
  const markerRef = useRef(null);

  const [selectedLat, setSelectedLat] = useState(initialLat);
  const [selectedLon, setSelectedLon] = useState(initialLon);
  const [addressInput, setAddressInput] = useState('');

  // Popular Bangalore location presets for instant testing
  const presets = [
    { name: 'Koramangala', lat: 12.9352, lon: 77.6245 },
    { name: 'Indiranagar', lat: 12.9784, lon: 77.6408 },
    { name: 'HSR Layout', lat: 12.9121, lon: 77.6446 },
    { name: 'MG Road', lat: 12.9756, lon: 77.6012 },
    { name: 'Whitefield', lat: 12.9698, lon: 77.7500 }
  ];

  const fetchAddress = async (lat, lon) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          setAddressInput(data.display_name);
        } else {
          setAddressInput(`Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`);
        }
      }
    } catch (err) {
      console.error("Reverse geocoding failed", err);
    }
  };

  useEffect(() => {
    if (!isOpen || !window.L || !mapContainerRef.current) return;

    // Destroy prior map instance if existing
    if (leafletMap.current) {
      leafletMap.current.remove();
      leafletMap.current = null;
    }

    const map = window.L.map(mapContainerRef.current).setView([selectedLat, selectedLon], 14);
    leafletMap.current = map;

    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    // Draggable pin icon
    const pinIcon = window.L.divIcon({
      html: `<div style="background-color: #ef4444; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(239,68,68,0.5); font-size: 20px;">📍</div>`,
      className: 'custom-pin-icon',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const marker = window.L.marker([selectedLat, selectedLon], {
      icon: pinIcon,
      draggable: true
    }).addTo(map);

    markerRef.current = marker;

    // Drag marker event
    marker.on('dragend', () => {
      const position = marker.getLatLng();
      setSelectedLat(position.lat);
      setSelectedLon(position.lng);
      fetchAddress(position.lat, position.lng);
    });

    // Map click event
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      setSelectedLat(lat);
      setSelectedLon(lng);
      marker.setLatLng([lat, lng]);
      fetchAddress(lat, lng);
    });

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [isOpen]);

  const handleSelectPreset = (preset) => {
    setSelectedLat(preset.lat);
    setSelectedLon(preset.lon);
    setAddressInput(`${preset.name}, Bengaluru`);

    if (leafletMap.current && markerRef.current) {
      leafletMap.current.setView([preset.lat, preset.lon], 15);
      markerRef.current.setLatLng([preset.lat, preset.lon]);
    }
  };

  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      setAddressInput("Locating...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setSelectedLat(lat);
          setSelectedLon(lon);
          
          if (leafletMap.current && markerRef.current) {
            leafletMap.current.setView([lat, lon], 16);
            markerRef.current.setLatLng([lat, lon]);
          }
          
          fetchAddress(lat, lon);
        },
        (error) => {
          console.error("Error getting location: ", error);
          alert("Unable to retrieve your location. Please check your browser permissions.");
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleConfirm = () => {
    if (onSelectLocation) {
      onSelectLocation({
        latitude: selectedLat,
        longitude: selectedLon,
        address: addressInput || `Lat: ${selectedLat.toFixed(4)}, Lon: ${selectedLon.toFixed(4)}`
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-primary, #ffffff)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '650px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color, #e2e8f0)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={22} style={{ color: 'var(--primary-color, #3b82f6)' }} />
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Select Location on Map</h3>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '50%' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Preset Buttons & Locate Me */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Quick Presets</span>
              <button 
                type="button" 
                onClick={handleLocateMe}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'var(--primary-color)',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <Navigation size={12} /> Locate Me
              </button>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {presets.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-tertiary)',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  📍 {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Map canvas */}
          <div 
            ref={mapContainerRef}
            style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden' }} 
          />

          {/* Location details input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Address / Landmark Details:</label>
            <input 
              type="text" 
              className="form-control"
              placeholder="e.g. Flat 302, Green Valley Apartments, Koramangala"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Navigation size={12} /> Selected Coordinates: <code>{selectedLat.toFixed(6)}, {selectedLon.toFixed(6)}</code>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border-color, #e2e8f0)',
          display: 'flex',
          justify: 'flex-end',
          gap: '0.75rem',
          backgroundColor: 'var(--bg-tertiary)'
        }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={handleConfirm}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#10b981', borderColor: '#10b981', color: '#fff' }}
          >
            <Check size={16} /> Confirm Location Pin
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerModal;
