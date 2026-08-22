import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PlusCircle, Clock, MapPin, Search } from 'lucide-react';

const ReceiverRequests = () => {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    food_needed: '',
    category: 'Any',
    number_of_people: 1,
    meals_required: 1,
    urgency: 'Normal',
    needed_date: '',
    needed_time: '',
    location: '',
    additional_instructions: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/requests/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setRequests(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/requests/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowForm(false);
        fetchRequests();
        setFormData({
          food_needed: '', category: 'Any', number_of_people: 1, meals_required: 1, 
          urgency: 'Normal', needed_date: '', needed_time: '', location: '', additional_instructions: ''
        });
      }
    } catch (err) {
      console.error('Error submitting request:', err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Request Food</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Can't find what you need? Request food directly from Donors.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PlusCircle size={20} />
          {showForm ? 'Cancel Request' : 'New Request'}
        </button>
      </div>

      {showForm && (
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Submit a Food Request</h2>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Food Needed</label>
                <input type="text" name="food_needed" className="form-input" required value={formData.food_needed} onChange={handleInputChange} placeholder="e.g. 50 packets of rice" />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select name="category" className="form-input" value={formData.category} onChange={handleInputChange}>
                  <option value="Any">Any</option>
                  <option value="Cooked Meals">Cooked Meals</option>
                  <option value="Raw Ingredients">Raw Ingredients</option>
                  <option value="Packaged Food">Packaged Food</option>
                  <option value="Baked Goods">Baked Goods</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Number of People</label>
                <input type="number" name="number_of_people" className="form-input" min="1" value={formData.number_of_people} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Meals Required</label>
                <input type="number" name="meals_required" className="form-input" min="1" value={formData.meals_required} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Urgency</label>
                <select name="urgency" className="form-input" value={formData.urgency} onChange={handleInputChange}>
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Needed Date</label>
                <input type="date" name="needed_date" className="form-input" required value={formData.needed_date} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Needed Time</label>
                <input type="time" name="needed_time" className="form-input" required value={formData.needed_time} onChange={handleInputChange} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Location / Locality</label>
              <input type="text" name="location" className="form-input" required value={formData.location} onChange={handleInputChange} placeholder="e.g. Indiranagar, Bangalore" />
            </div>

            <div className="form-group">
              <label className="form-label">Additional Instructions</label>
              <textarea name="additional_instructions" className="form-input" rows="3" value={formData.additional_instructions} onChange={handleInputChange} placeholder="Any specific requirements..."></textarea>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>SUBMIT FOOD REQUEST</button>
          </form>
        </div>
      )}

      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>My Food Requests</h2>
        
        {loading ? (
          <p>Loading requests...</p>
        ) : requests.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
            <Search size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Requests Yet</h3>
            <p style={{ color: 'var(--text-secondary)' }}>You haven't submitted any custom food requests.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {requests.map(req => (
              <div key={req.id} style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{req.food_needed}</h3>
                  <span style={{ 
                    padding: '0.4rem 1rem', 
                    borderRadius: '20px', 
                    fontSize: '0.85rem', 
                    fontWeight: 600,
                    backgroundColor: req.status === 'PENDING' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: req.status === 'PENDING' ? '#f59e0b' : '#10b981'
                  }}>
                    {req.status}
                  </span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', fontSize: '0.9rem' }}>
                  <div><strong>Category:</strong> {req.category}</div>
                  <div><strong>People:</strong> {req.number_of_people}</div>
                  <div><strong>Urgency:</strong> {req.urgency}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={16} /> {req.needed_date} at {req.needed_time}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={16} /> {req.location}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiverRequests;
