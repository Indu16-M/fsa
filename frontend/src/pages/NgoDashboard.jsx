import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ClipboardList, CheckSquare, RefreshCw, Bell, Navigation, Package } from 'lucide-react';
import TrackingMap from '../components/TrackingMap';

const NgoDashboard = () => {
  const { user, token, getAuthHeaders, logout } = useAuth();
  const navigate = useNavigate();

  // Data states
  const [availableFood, setAvailableFood] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('browse'); 
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [foodTypeFilter, setFoodTypeFilter] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchAvailableDonations();
    fetchMyClaims();
    fetchNotifications();
  }, [token]);

  const fetchAvailableDonations = async () => {
    setLoading(true);
    try {
      // Use the claims endpoint to get available food with hidden exact location
      const res = await fetch('/api/claims/available', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        // Optional filtering by food type (could be handled frontend side)
        let filtered = data;
        if (foodTypeFilter) filtered = data.filter(d => d.food_type === foodTypeFilter);
        setAvailableFood(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyClaims = async () => {
    try {
      const res = await fetch('/api/claims/my-claims', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setMyClaims(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: getAuthHeaders()
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const claimFood = async (id) => {
    try {
      const res = await fetch(`/api/claims/${id}/claim`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Food Claimed Successfully! See 'Active Pickups' for location details.");
        fetchAvailableDonations();
        fetchMyClaims();
      } else {
        alert(data.message || "Failed to claim food");
      }
    } catch (err) {
      alert("Error claiming food.");
    }
  };

  const updateClaimStatus = async (claimId, status, vcode = '') => {
    try {
      const res = await fetch(`/api/claims/${claimId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ status, verification_code: vcode })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchMyClaims();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Error updating status.");
    }
  };

  const filteredFood = availableFood.filter(food => 
    food.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    food.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-container">
      {/* Navbar */}
      <header className="navbar">
        <div className="logo" style={{ fontWeight: 800 }}>🍲 ShareBite</div>

        <div className="nav-links">
          <span style={{ fontWeight: 600 }}>Hello, {user?.username} (NGO)</span>
          <button onClick={logout} className="btn btn-secondary" style={{ padding: '0.4rem 1rem' }}>Log Out</button>
        </div>
      </header>

      <div className="dashboard-layout">
        {/* Sidebar Nav */}
        <aside className="sidebar">
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>
            📌 SIDEBAR TABS
          </div>
          <div 
            className={`sidebar-menu-item ${activeTab === 'browse' ? 'active' : ''}`} 
            onClick={() => setActiveTab('browse')}
            style={{ fontWeight: 700, fontSize: '0.95rem' }}
          >
            <Search size={20} color="#10b981" /> Browse Available Food
          </div>
          <div 
            className={`sidebar-menu-item ${activeTab === 'pickups' ? 'active' : ''}`} 
            onClick={() => setActiveTab('pickups')}
            style={{ fontWeight: 700, fontSize: '0.95rem' }}
          >
            <CheckSquare size={20} color="#3b82f6" /> Active Pickups ({myClaims.filter(c => c.status !== 'COMPLETED' && c.status !== 'CANCELLED').length})
          </div>
          <div 
            className={`sidebar-menu-item ${activeTab === 'history' ? 'active' : ''}`} 
            onClick={() => setActiveTab('history')}
            style={{ fontWeight: 700, fontSize: '0.95rem' }}
          >
            <ClipboardList size={20} /> History
          </div>
          <div 
            className={`sidebar-menu-item ${activeTab === 'notifications' ? 'active' : ''}`} 
            onClick={() => setActiveTab('notifications')} 
            style={{ position: 'relative', fontWeight: 700, fontSize: '0.95rem' }}
          >
            <Bell size={20} /> Notifications
            {notifications.filter(n => !n.is_read).length > 0 && (
              <span className="notif-badge">{notifications.filter(n => !n.is_read).length}</span>
            )}
          </div>
        </aside>

        {/* Dashboard Main Content */}
        <main className="main-content">
          
          {/* BROWSE FOOD TAB */}
          {activeTab === 'browse' && (
            <div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Search food items..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    style={{ paddingLeft: '2.5rem' }} 
                  />
                  <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                </div>
                
                <select className="form-control" style={{ width: '200px' }} value={foodTypeFilter} onChange={e => { setFoodTypeFilter(e.target.value); fetchAvailableDonations(); }}>
                  <option value="">All Categories</option>
                  <option value="cooked">Cooked Meals</option>
                  <option value="produce">Fresh Produce</option>
                  <option value="dairy">Dairy Products</option>
                  <option value="raw_meat">Raw Meat</option>
                  <option value="bakery">Bakery Products</option>
                  <option value="packaged">Packaged Items</option>
                  <option value="dry">Dry Ration</option>
                </select>

                <button onClick={fetchAvailableDonations} className="btn btn-secondary">
                  <RefreshCw size={18} /> Refresh
                </button>
              </div>

              {loading ? <p>Loading...</p> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {filteredFood.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No surplus food matching filters found.</p> : 
                    filteredFood.map(don => (
                      <div key={don.id} className="food-card" style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                        <div className="food-card-img" style={{ backgroundImage: don.image_url ? `url(${don.image_url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', height: '140px' }}>
                          {!don.image_url && <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: '3rem' }}>🍲</div>}
                        </div>
                        <div className="food-card-body" style={{ padding: '1.25rem' }}>
                          <h4 className="food-card-title">{don.title}</h4>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{don.description}</p>
                          <p className="food-card-meta">
                            <MapPin size={14} /> Located at: {don.city} (Exact address hidden for privacy)
                          </p>

                          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', padding: '0.65rem 0.8rem', borderRadius: '8px', margin: '0.75rem 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 700 }}>Total Available:</span>
                              <strong style={{ fontSize: '1rem', color: '#10b981' }}>{don.quantity} {don.quantity_unit}</strong>
                            </div>
                          </div>
                          
                          <div style={{ marginTop: '1.25rem' }}>
                            <button 
                              className="btn btn-primary" 
                              style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', fontWeight: 700 }} 
                              onClick={() => claimFood(don.id)}
                            >
                              Claim Food & Get Location
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          )}

          {/* ACTIVE PICKUPS TAB */}
          {activeTab === 'pickups' && (
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Active Pickups</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {myClaims.filter(c => c.status !== 'COMPLETED' && c.status !== 'CANCELLED').length === 0 ? (
                  <p className="text-muted">No active pickups right now.</p>
                ) : (
                  myClaims.filter(c => c.status !== 'COMPLETED' && c.status !== 'CANCELLED').map(claim => (
                    <div key={claim.id} style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--primary-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{claim.donation_title}</h3>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Claimed At: {new Date(claim.claimed_at).toLocaleString()}</p>
                        </div>
                        <span style={{ padding: '0.4rem 0.8rem', backgroundColor: 'var(--primary-color)', color: 'white', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                          {claim.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <MapPin size={18} color="var(--danger)" />
                          <strong>Pickup Address:</strong> {claim.donor_address}
                        </div>
                        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                           <strong>Verification Code for Donor:</strong>
                           <span style={{ letterSpacing: '2px', fontWeight: 900, color: 'var(--primary-color)', padding: '0.2rem 0.5rem', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #ddd' }}>
                              {claim.verification_code}
                           </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {claim.status === 'CLAIMED' && (
                          <button className="btn btn-primary" onClick={() => updateClaimStatus(claim.id, 'ON_THE_WAY')}>
                            <Navigation size={16} /> Mark On the Way
                          </button>
                        )}
                        {claim.status === 'ON_THE_WAY' && (
                          <button className="btn btn-secondary" onClick={() => updateClaimStatus(claim.id, 'ARRIVED')}>
                            <MapPin size={16} /> Mark Arrived
                          </button>
                        )}
                        {claim.status === 'ARRIVED' && (
                          <button className="btn btn-primary" onClick={() => {
                             const code = prompt("Enter the verification code given by the donor (if any) or just your code to complete:");
                             if(code) updateClaimStatus(claim.id, 'FOOD_COLLECTED', code);
                          }}>
                            <Package size={16} /> Complete Handover
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Pickup History</h3>
              <div className="panel">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Claim ID</th>
                      <th>Food Item</th>
                      <th>Donor Name</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myClaims.filter(c => c.status === 'COMPLETED' || c.status === 'CANCELLED').length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No completed history.</td>
                      </tr>
                    ) : (
                      myClaims.filter(c => c.status === 'COMPLETED' || c.status === 'CANCELLED').map(claim => (
                        <tr key={claim.id}>
                          <td>#{claim.id}</td>
                          <td>{claim.donation_title}</td>
                          <td>{claim.donor_name}</td>
                          <td>{new Date(claim.claimed_at).toLocaleDateString()}</td>
                          <td style={{ fontWeight: 700, color: claim.status === 'COMPLETED' ? 'var(--safe)' : 'var(--danger)' }}>
                            {claim.status.toUpperCase()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Notification Center</h3>
                <button onClick={markAllNotificationsRead} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                  Mark all as read
                </button>
              </div>

              <div className="panel">
                {notifications.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>All caught up! No notifications yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {notifications.map(notif => (
                      <div key={notif.id} style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', borderLeft: notif.is_read ? 'none' : '4px solid var(--primary-color)', opacity: notif.is_read ? 0.7 : 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <strong style={{ fontSize: '1rem' }}>{notif.title}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(notif.created_at).toLocaleDateString()}</span>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{notif.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default NgoDashboard;
