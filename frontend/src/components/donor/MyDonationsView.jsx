import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PackageOpen } from 'lucide-react';

const MyDonationsView = () => {
  const { getAuthHeaders } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const res = await fetch('/api/donations/history', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setDonations(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDonations = donations.filter(d => {
    if (filter === 'active') return ['AVAILABLE', 'CLAIMED', 'ON_THE_WAY', 'ARRIVED'].includes(d.status);
    if (filter === 'completed') return d.status === 'COMPLETED';
    if (filter === 'cancelled') return d.status === 'CANCELLED' || d.status === 'EXPIRED';
    return true;
  });

  return (
    <div className="my-donations-view fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>My Donations History</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('all')}>All</button>
          <button className={`btn ${filter === 'active' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('active')}>Active</button>
          <button className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('completed')}>Completed</button>
        </div>
      </div>

      {loading ? (
        <p>Loading history...</p>
      ) : filteredDonations.length === 0 ? (
        <div className="empty-state panel text-center">
          <PackageOpen size={48} style={{ color: 'var(--text-muted)', margin: '0 auto', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>No donations found for this filter.</p>
        </div>
      ) : (
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Food Item</th>
              <th>Quantity</th>
              <th>Category</th>
              <th>Date Posted</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredDonations.map(don => (
              <tr key={don.id}>
                <td>#{don.id}</td>
                <td style={{ fontWeight: 600 }}>{don.title}</td>
                <td>{don.quantity} {don.quantity_unit}</td>
                <td>{don.food_type}</td>
                <td>{new Date(don.created_at).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge status-${don.status}`}>
                    {don.status.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyDonationsView;
