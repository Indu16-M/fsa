import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Package, Clock, MapPin, Search, ArrowRight, Utensils, Leaf, Flame, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReceiverHome = () => {
  const { token } = useAuth();
  const [allFood, setAllFood] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [showExpiringSoon, setShowExpiringSoon] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAvailableFood();
    const intervalId = setInterval(() => fetchAvailableFood(true), 10000);
    return () => clearInterval(intervalId);
  }, []);

  const fetchAvailableFood = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await fetch('/api/claims/available', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setAllFood(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filteredFood = useMemo(() => {
    let result = [...allFood];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(f => f.title?.toLowerCase().includes(q) || f.food_type?.toLowerCase().includes(q));
    }
    if (filterType === 'Veg') result = result.filter(f => !(f.food_type||'').toLowerCase().includes('non') && !(f.food_type||'').toLowerCase().includes('chicken') && !(f.food_type||'').toLowerCase().includes('meat') && !(f.food_type||'').toLowerCase().includes('fish'));
    if (filterType === 'Non-Veg') result = result.filter(f => ['non','meat','chicken','fish','egg'].some(k => (f.food_type||'').toLowerCase().includes(k)));
    if (filterCategory !== 'All') result = result.filter(f => (f.food_type||'').toLowerCase().includes(filterCategory.toLowerCase()));
    if (showExpiringSoon) {
      const now = new Date();
      result = result.filter(f => { const h = (new Date(f.estimated_expiry) - now) / 3600000; return h > 0 && h < 12; });
    }
    result.sort((a, b) => sortBy === 'newest' ? new Date(b.created_at) - new Date(a.created_at) : new Date(a.estimated_expiry) - new Date(b.estimated_expiry));
    return result;
  }, [allFood, searchTerm, filterType, filterCategory, sortBy, showExpiringSoon]);

  const getHoursLeft = (expiry) => Math.max(0, (new Date(expiry) - new Date()) / 3600000);
  const categories = ['All', 'Cooked', 'Bakery', 'Raw', 'Packaged', 'Fruits'];

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Find Food</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Browse available food from donors near you.{' '}
          <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>● Live — {allFood.length} available</span>
        </p>
      </header>

      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input type="text" placeholder="Search food by name, type..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.8rem', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', fontSize: '0.95rem', boxSizing: 'border-box', color: 'var(--text-primary)' }} />
        {searchTerm && <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16} /></button>}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        {['All', 'Veg', 'Non-Veg'].map(t => (
          <button key={t} onClick={() => setFilterType(t)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', borderRadius: '20px', border: '1px solid', borderColor: filterType === t ? 'var(--primary-color)' : 'var(--border-color)', backgroundColor: filterType === t ? 'var(--primary-color)' : 'var(--bg-secondary)', color: filterType === t ? 'white' : 'var(--text-primary)', fontSize: '0.83rem', fontWeight: 600, cursor: 'pointer' }}>
            {t === 'Veg' ? <Leaf size={13} /> : t === 'Non-Veg' ? <Flame size={13} /> : <Utensils size={13} />}{t}
          </button>
        ))}
        <div style={{ width: '1px', height: '22px', backgroundColor: 'var(--border-color)' }} />
        {categories.map(c => (
          <button key={c} onClick={() => setFilterCategory(c)}
            style={{ padding: '0.45rem 0.9rem', borderRadius: '20px', border: '1px solid', borderColor: filterCategory === c ? '#3b82f6' : 'var(--border-color)', backgroundColor: filterCategory === c ? 'rgba(59,130,246,0.1)' : 'var(--bg-secondary)', color: filterCategory === c ? '#3b82f6' : 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>{c}</button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setShowExpiringSoon(!showExpiringSoon)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.9rem', borderRadius: '20px', border: '1px solid', borderColor: showExpiringSoon ? '#f59e0b' : 'var(--border-color)', backgroundColor: showExpiringSoon ? 'rgba(245,158,11,0.1)' : 'var(--bg-secondary)', color: showExpiringSoon ? '#f59e0b' : 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
            <Clock size={12} /> Expiring Soon</button>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ padding: '0.45rem 0.75rem', borderRadius: '20px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
            <option value="newest">Newest First</option>
            <option value="expiring_soon">Expiring First</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        Showing <strong style={{ color: 'var(--text-primary)' }}>{filteredFood.length}</strong> of {allFood.length} available items
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}><p style={{ color: 'var(--text-secondary)' }}>Loading food...</p></div>
      ) : filteredFood.length === 0 ? (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
          <Search size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{searchTerm ? 'No results found' : 'No Food Currently Available'}</h3>
          <p style={{ color: 'var(--text-secondary)' }}>{searchTerm ? 'Try different terms or clear filters.' : 'Check back soon! Donors add new food frequently.'}</p>
          {(searchTerm || filterType !== 'All' || filterCategory !== 'All' || showExpiringSoon) && (
            <button onClick={() => { setSearchTerm(''); setFilterType('All'); setFilterCategory('All'); setShowExpiringSoon(false); }} className="btn" style={{ marginTop: '1rem', border: '1px solid var(--border-color)', backgroundColor: 'transparent' }}>Clear Filters</button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {filteredFood.map(food => {
            const h = getHoursLeft(food.estimated_expiry);
            const isUrgent = h < 6;
            return (
              <div key={food.id} style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ position: 'relative' }}>
                  {food.image_url ? (
                    <img src={food.image_url} alt={food.title} style={{ width: '100%', height: '175px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '175px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Utensils size={40} color="var(--text-muted)" />
                    </div>
                  )}
                  {isUrgent && <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#ef4444', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800 }}>🔥 URGENT</div>}
                </div>
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.5rem' }}>{food.title}</h3>
                  <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ padding: '0.2rem 0.6rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', fontSize: '0.73rem', fontWeight: 600 }}>{food.food_type}</span>
                    <span style={{ padding: '0.2rem 0.6rem', backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: '6px', fontSize: '0.73rem', fontWeight: 600, color: '#10b981' }}>{food.quantity} {food.quantity_unit}</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={12} /> 📍 {food.donor_city || 'Nearby'} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>· exact after claim</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: isUrgent ? '#ef4444' : h < 12 ? '#f59e0b' : 'var(--text-secondary)', fontWeight: isUrgent ? 700 : 400, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={12} /> {h < 1 ? `${Math.floor(h*60)}m left` : `${h.toFixed(1)}h remaining`}
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%', marginTop: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                    onClick={() => navigate(`/receiver/food/${food.id}`)}>
                    VIEW FOOD <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReceiverHome;
