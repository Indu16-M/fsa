import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Check, X, Clock } from 'lucide-react';

const DonationRequestsView = () => {
  const { getAuthHeaders } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/donations/requests', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      } else {
        throw new Error('Failed to load requests');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (reqId, status) => {
    try {
      const res = await fetch(`/api/donations/requests/${reqId}`, {
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        // refresh list
        fetchRequests();
      } else {
        const d = await res.json();
        alert(d.message || 'Error updating request');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
  };

  return (
    <div className="donation-requests-view fade-in max-w-4xl mx-auto">
      <h2 style={{ marginBottom: '2rem' }}>Incoming NGO Requests</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {loading ? (
        <p>Loading requests...</p>
      ) : requests.length === 0 ? (
        <div className="empty-state panel text-center">
          <p style={{ color: 'var(--text-muted)' }}>No requests from NGOs right now.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {requests.map(req => (
            <div key={req.id} className="panel request-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary-color)' }}>{req.ngo_name}</h4>
                <p style={{ margin: '0.25rem 0', fontWeight: 600 }}>Requested your donation: #{req.donation_id}</p>
                <small style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={14} /> {new Date(req.requested_at).toLocaleString()}
                </small>
              </div>
              
              <div>
                {req.status === 'pending' ? (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-primary" onClick={() => handleRequest(req.id, 'accepted')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Check size={16} /> Accept
                    </button>
                    <button className="btn btn-secondary" onClick={() => handleRequest(req.id, 'rejected')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                      <X size={16} /> Reject
                    </button>
                  </div>
                ) : (
                  <span className={`status-badge status-${req.status}`}>
                    {req.status.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonationRequestsView;
