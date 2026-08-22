import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FileText, PlusCircle, Sparkles, Clock, MapPin, CheckCircle, AlertCircle, ArrowRight, X } from 'lucide-react';

const NgoRequests = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [smartMatches, setSmartMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    food_needed: '',
    category: 'Cooked Meals',
    number_of_people: 50,
    meals_required: 50,
    urgency: 'Medium',
    needed_date: new Date().toISOString().split('T')[0],
    needed_time: '13:00',
    location: user?.address || 'City Center',
    additional_instructions: ''
  });

  useEffect(() => {
    fetchRequestsAndMatches();
  }, []);

  const fetchRequestsAndMatches = async () => {
    setLoading(true);
    try {
      const [resReqs, resMatches] = await Promise.all([
        fetch('/api/ngo/requests', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/ngo/smart-matches', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (resReqs.ok) setRequests(await resReqs.json());
      if (resMatches.ok) setSmartMatches(await resMatches.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.food_needed.trim()) {
      alert('Please specify the food needed.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/ngo/requests', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setShowModal(false);
        setFormData({
          food_needed: '',
          category: 'Cooked Meals',
          number_of_people: 50,
          meals_required: 50,
          urgency: 'Medium',
          needed_date: new Date().toISOString().split('T')[0],
          needed_time: '13:00',
          location: user?.address || 'City Center',
          additional_instructions: ''
        });
        fetchRequestsAndMatches();
      } else {
        alert(data.message || 'Failed to submit food requirement.');
      }
    } catch {
      alert('Network error submitting request.');
    } finally {
      setSubmitting(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'URGENT':
      case 'High': return { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' };
      case 'Medium': return { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' };
      default: return { color: '#10b981', bg: 'rgba(16,185,129,0.12)' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--text-primary, #111827)', margin: '0 0 0.35rem 0' }}>
            NGO Food Requirements & Matching
          </h1>
          <p style={{ color: 'var(--text-secondary, #6b7280)', margin: 0, fontSize: '0.96rem' }}>
            Post requirements for upcoming community distributions and view smart donation matches.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ padding: '0.75rem 1.4rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(16,185,129,0.25)' }}
        >
          <PlusCircle size={18} /> Post New Requirement
        </button>
      </div>

      {/* Smart Matching Section */}
      {smartMatches.length > 0 && (
        <section style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '18px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#15803d', fontWeight: 800, fontSize: '1.1rem' }}>
            <Sparkles size={20} color="#16a34a" />
            <span>Smart Food Matches Available Now</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.1rem' }}>
            {smartMatches.map((m, idx) => (
              <div key={idx} style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '1.25rem', border: '1px solid #dcfce7', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ padding: '0.2rem 0.55rem', backgroundColor: 'rgba(22,163,74,0.12)', color: '#15803d', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 800 }}>
                      ⭐ {m.match_score}% MATCH
                    </span>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', margin: '0.4rem 0 0 0' }}>
                      {m.donation.title}
                    </h4>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600 }}>
                    For: {m.request_food}
                  </span>
                </div>

                <div style={{ fontSize: '0.84rem', color: '#4b5563', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div>📦 Available: <strong>{m.donation.quantity} {m.donation.quantity_unit}</strong> (Req: {m.meals_required} meals)</div>
                  <div>📍 General Area: <strong>{m.donation.donor_city || 'Nearby Area'}</strong> (~{m.donation.distance_km || 2.5} km)</div>
                </div>

                <button
                  onClick={() => navigate(`/ngo/food/${m.donation.id}`)}
                  style={{ width: '100%', padding: '0.65rem', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 800, fontSize: '0.84rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', marginTop: 'auto' }}
                >
                  VIEW & CLAIM MATCH <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Existing Requests List */}
      <section>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary, #111827)', marginBottom: '1rem' }}>
          Your Submitted Requirements ({requests.length})
        </h2>

        {loading ? (
          <p style={{ color: '#6b7280' }}>Loading requirements...</p>
        ) : requests.length === 0 ? (
          <div style={{ backgroundColor: 'var(--bg-secondary, #ffffff)', padding: '3.5rem 2rem', borderRadius: '18px', border: '1px dashed var(--border-color, #e5e7eb)', textAlign: 'center' }}>
            <FileText size={44} color="#9ca3af" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', marginBottom: '0.35rem' }}>
              No food requirements posted
            </h3>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Submit a food request to alert nearby donors and receive smart matches.
            </p>
            <button onClick={() => setShowModal(true)} style={{ padding: '0.6rem 1.3rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
              Create Food Request
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.2rem' }}>
            {requests.map((req) => {
              const urgencyStyle = getUrgencyColor(req.urgency);
              return (
                <div key={req.id} style={{ backgroundColor: 'var(--bg-secondary, #ffffff)', borderRadius: '16px', border: '1px solid var(--border-color, #e5e7eb)', padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800, backgroundColor: urgencyStyle.bg, color: urgencyStyle.color }}>
                        {req.urgency.toUpperCase()}
                      </span>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#111827', margin: '0.4rem 0 0 0' }}>
                        {req.food_needed}
                      </h3>
                    </div>
                    <span style={{ padding: '0.2rem 0.6rem', backgroundColor: req.status === 'PENDING' ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)', color: req.status === 'PENDING' ? '#b45309' : '#047857', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 800 }}>
                      {req.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.86rem', color: '#6b7280', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <div>👥 Portions: <strong>{req.meals_required} meals</strong> for {req.number_of_people} people</div>
                    <div>📅 Needed: <strong>{req.needed_date} at {req.needed_time}</strong></div>
                    <div>📍 Location: <strong>{req.location}</strong></div>
                  </div>

                  {req.additional_instructions && (
                    <div style={{ fontSize: '0.82rem', color: '#4b5563', backgroundColor: '#f9fafb', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                      "{req.additional_instructions}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal: Create Food Requirement */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '540px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#111827', margin: 0 }}>
                Post Food Requirement
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>
                  Food Needed *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cooked Meals, Rice & Curry, Bread & Bakery"
                  required
                  value={formData.food_needed}
                  onChange={(e) => setFormData({ ...formData, food_needed: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.92rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>
                    Meals Required
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.meals_required}
                    onChange={(e) => setFormData({ ...formData, meals_required: parseInt(e.target.value) || 1, number_of_people: parseInt(e.target.value) || 1 })}
                    style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.92rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>
                    Urgency Level
                  </label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.92rem', boxSizing: 'border-box' }}
                  >
                    <option value="Low">Low (Scheduled)</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High Priority</option>
                    <option value="URGENT">URGENT (Immediate)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>
                    Needed Date
                  </label>
                  <input
                    type="date"
                    value={formData.needed_date}
                    onChange={(e) => setFormData({ ...formData, needed_date: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.92rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>
                    Needed Time
                  </label>
                  <input
                    type="time"
                    value={formData.needed_time}
                    onChange={(e) => setFormData({ ...formData, needed_time: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.92rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>
                  General Delivery Area / Community
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.92rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>
                  Additional Notes
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Vegetarian preferred, delivery packaging details..."
                  value={formData.additional_instructions}
                  onChange={(e) => setFormData({ ...formData, additional_instructions: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.92rem', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: '0.8rem', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ flex: 1, padding: '0.8rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
                >
                  {submitting ? 'Submitting...' : 'Submit Requirement'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default NgoRequests;
