import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LocationPickerModal from '../components/LocationPickerModal';
import { PlusCircle, Sparkles, MapPin, Upload, ShieldCheck, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const DonateFoodScreen = () => {
  const navigate = useNavigate();
  const { user, getAuthHeaders } = useAuth();

  // Form values
  const [foodName, setFoodName] = useState('');
  const [category, setCategory] = useState('cooked');
  const [isVeg, setIsVeg] = useState(true);
  const [quantity, setQuantity] = useState('');
  const [quantityUnit, setQuantityUnit] = useState('kg');
  const [numMeals, setNumMeals] = useState('');
  const [cookingTime, setCookingTime] = useState(new Date().toISOString().slice(0, 16));
  const [bestBefore, setBestBefore] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupTime, setPickupTime] = useState('Immediate / Within 2 Hours');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [latitude, setLatitude] = useState('12.9716');
  const [longitude, setLongitude] = useState('77.5946');
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  // AI Quality Check state
  const [aiPreview, setAiPreview] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 🤖 AI Food Check Handler
  const handleAiCheck = async () => {
    setAiLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ai/predict-expiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          food_type: category,
          storage_condition: 'refrigerated',
          temperature_celsius: 4.0,
          prep_time: new Date(cookingTime).toISOString()
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAiPreview(data);
      } else {
        setError('Failed to compute AI quality score');
      }
    } catch (err) {
      setError('AI quality check error: ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!foodName || !quantity) {
      setError('Food Name and Quantity are required.');
      return;
    }

    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('title', foodName);
    formData.append('food_type', category);
    formData.append('is_veg', isVeg ? 'true' : 'false');
    formData.append('quantity', quantity);
    formData.append('quantity_unit', quantityUnit);
    formData.append('num_meals', numMeals);
    formData.append('storage_condition', 'refrigerated');
    formData.append('temperature_celsius', '4.0');
    formData.append('prep_time', new Date(cookingTime).toISOString());
    formData.append('description', specialInstructions || `${numMeals || quantity} meals - ${isVeg ? 'Vegetarian' : 'Non-Vegetarian'}`);
    if (imageFile) formData.append('image', imageFile);

    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Donation submission failed');
      }

      setSuccess('Food donation published successfully! AI QR tracking pass generated.');
      setTimeout(() => {
        navigate('/nearby');
      }, 1800);
    } catch (err) {
      setError(err.message || 'Donation posting failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', color: '#0f172a', minHeight: '100vh', padding: '1.5rem 1rem 90px 1rem' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto' }}>
            <PlusCircle size={32} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Donate Surplus Food
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Share surplus meals with nearby NGOs & distribution networks
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '0.75rem 1rem', borderRadius: '12px', marginBottom: '1.25rem', fontSize: '0.88rem', fontWeight: 600 }}>
            <AlertCircle size={16} style={{ display: 'inline', marginRight: '0.4rem' }} /> {error}
          </div>
        )}

        {success && (
          <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '0.75rem 1rem', borderRadius: '12px', marginBottom: '1.25rem', fontSize: '0.88rem', fontWeight: 700 }}>
            <CheckCircle2 size={16} style={{ display: 'inline', marginRight: '0.4rem' }} /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* Food Name */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>Food Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Fresh Vegetable Biryani"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>

          {/* Category & Veg/Non-Veg */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label className="form-label" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>Category</label>
              <select
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}
              >
                <option value="cooked">Cooked Meals</option>
                <option value="produce">Fresh Produce</option>
                <option value="dairy">Dairy & Milk</option>
                <option value="bakery">Bakery & Breads</option>
                <option value="packaged">Packaged Ration</option>
              </select>
            </div>

            <div>
              <label className="form-label" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>Food Type</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsVeg(true)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '12px',
                    border: isVeg ? '2px solid #10b981' : '1px solid #cbd5e1',
                    backgroundColor: isVeg ? '#ecfdf5' : '#fff',
                    color: isVeg ? '#047857' : '#64748b',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  🟢 Veg
                </button>
                <button
                  type="button"
                  onClick={() => setIsVeg(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '12px',
                    border: !isVeg ? '2px solid #ef4444' : '1px solid #cbd5e1',
                    backgroundColor: !isVeg ? '#fef2f2' : '#fff',
                    color: !isVeg ? '#b91c1c' : '#64748b',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  🔴 Non-Veg
                </button>
              </div>
            </div>
          </div>

          {/* Quantity & Meals Count */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label className="form-label" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>Quantity *</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  placeholder="e.g. 15"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}
                />
                <select
                  value={quantityUnit}
                  onChange={(e) => setQuantityUnit(e.target.value)}
                  style={{ padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}
                >
                  <option value="kg">kg</option>
                  <option value="portions">portions</option>
                  <option value="liters">liters</option>
                  <option value="boxes">boxes</option>
                </select>
              </div>
            </div>

            <div>
              <label className="form-label" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>Number of Meals Served</label>
              <input
                type="number"
                placeholder="e.g. 30 People"
                value={numMeals}
                onChange={(e) => setNumMeals(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          {/* Cooking Time & Expiry Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label className="form-label" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>Cooking / Prep Time</label>
              <input
                type="datetime-local"
                value={cookingTime}
                onChange={(e) => setCookingTime(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label className="form-label" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>Pickup Time Window</label>
              <select
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}
              >
                <option value="Immediate">Immediate / Within 1 Hour</option>
                <option value="Within 2 Hours">Within 2 Hours</option>
                <option value="Evening Slot">Evening Slot (6 PM - 8 PM)</option>
              </select>
            </div>
          </div>

          {/* Pickup Address & Location Picker */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>Pickup Address</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Street address, landmark, city"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}
              />
              <button
                type="button"
                onClick={() => setIsMapModalOpen(true)}
                style={{ backgroundColor: '#ecfdf5', color: '#10b981', border: '1px solid #a7f3d0', padding: '0.75rem 1rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <MapPin size={16} /> Map Pin
              </button>
            </div>
          </div>

          {/* Special Instructions */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>Special Instructions / Allergens</label>
            <textarea
              rows={3}
              placeholder="e.g. Packed in disposable aluminum foil boxes. Keep hot."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>

          {/* AI QUALITY PREVIEW CARD */}
          {aiPreview && (
            <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#047857', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                <ShieldCheck size={18} /> AI Quality Verification Result
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#065f46' }}>
                Predicted Remaining Shelf Life: {aiPreview.predicted_remaining_shelf_life_hours} Hours ({aiPreview.risk_level})
              </div>
            </div>
          )}

          {/* ACTION BUTTONS: AI FOOD CHECK & SUBMIT */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              onClick={handleAiCheck}
              disabled={aiLoading}
              style={{
                flex: 1,
                padding: '0.85rem',
                borderRadius: '14px',
                border: '1px solid #3b82f6',
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}
            >
              <Sparkles size={18} /> {aiLoading ? 'Analyzing...' : 'AI Quality Check'}
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1.5,
                padding: '0.85rem',
                borderRadius: '14px',
                border: 'none',
                backgroundColor: '#10b981',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '1.05rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}
            >
              <PlusCircle size={20} /> {loading ? 'Publishing...' : 'Submit Donation'}
            </button>
          </div>

        </form>

        <LocationPickerModal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          initialLat={12.9716}
          initialLon={77.5946}
          onSelectLocation={(loc) => {
            setLatitude(loc.latitude.toString());
            setLongitude(loc.longitude.toString());
            if (loc.address) setPickupAddress(loc.address);
          }}
        />

      </div>
    </div>
  );
};

export default DonateFoodScreen;
