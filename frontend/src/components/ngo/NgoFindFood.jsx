import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Clock, Package, Utensils, Leaf, Flame, ArrowRight, X, AlertCircle } from 'lucide-react';

const NgoFindFood = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All'); // All, Veg, Non-Veg
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showExpiringSoon, setShowExpiringSoon] = useState(searchParams.get('filter') === 'expiring_soon');
  const [sortBy, setSortBy] = useState('newest'); // newest, expiring_soon, quantity, distance

  useEffect(() => {
    fetchFood();
    const interval = setInterval(() => fetchFood(true), 12000);
    return () => clearInterval(interval);
  }, []);

  const fetchFood = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/ngo/find-food', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDonations(data);
      }
    } catch (err) {
      console.error('Error fetching food:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'Cooked', 'Bakery', 'Raw Ingredients', 'Packaged', 'Fruits & Vegetables'];

  const filteredDonations = useMemo(() => {
    let result = [...donations];

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(d => 
        (d.title || '').toLowerCase().includes(q) || 
        (d.description || '').toLowerCase().includes(q) ||
        (d.food_type || '').toLowerCase().includes(q) ||
        (d.donor_city || '').toLowerCase().includes(q)
      );
    }

    // Veg / Non-Veg
    if (typeFilter === 'Veg') {
      result = result.filter(d => {
        const ft = (d.food_type || '').toLowerCase();
        return !['non', 'chicken', 'meat', 'fish', 'egg'].some(k => ft.includes(k));
      });
    } else if (typeFilter === 'Non-Veg') {
      result = result.filter(d => {
        const ft = (d.food_type || '').toLowerCase();
        return ['non', 'chicken', 'meat', 'fish', 'egg'].some(k => ft.includes(k));
      });
    }

    // Category filter
    if (categoryFilter !== 'All') {
      result = result.filter(d => (d.food_type || '').toLowerCase().includes(categoryFilter.toLowerCase()));
    }

    // Expiring soon (< 3 hours)
    if (showExpiringSoon) {
      const now = new Date();
      result = result.filter(d => {
        const hours = (new Date(d.estimated_expiry) - now) / 3600000;
        return hours > 0 && hours <= 3;
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'expiring_soon') return new Date(a.estimated_expiry) - new Date(b.estimated_expiry);
      if (sortBy === 'quantity') return (b.quantity || 0) - (a.quantity || 0);
      if (sortBy === 'distance') return (a.approx_distance_km || 0) - (b.approx_distance_km || 0);
      return new Date(b.created_at) - new Date(a.created_at); // default newest
    });

    return result;
  }, [donations, searchTerm, typeFilter, categoryFilter, showExpiringSoon, sortBy]);

  const getHoursRemaining = (expiry) => {
    return Math.max(0, (new Date(expiry) - new Date()) / 3600000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--text-primary, #111827)', margin: '0 0 0.4rem 0' }}>
          Find Surplus Food for NGO Recovery
        </h1>
        <p style={{ color: 'var(--text-secondary, #6b7280)', margin: 0, fontSize: '0.96rem' }}>
          Discover available food donations from verified donors. Claim food to support your beneficiary communities.{' '}
          <span style={{ color: '#10b981', fontWeight: 700 }}>● {donations.length} items live</span>
        </p>
      </div>

      {/* Search bar */}
      <div style={{ position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
        <input
          type="text"
          placeholder="Search by food name, category, city area..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.8rem', borderRadius: '14px', border: '1px solid var(--border-color, #e5e7eb)', backgroundColor: 'var(--bg-secondary, #ffffff)', fontSize: '0.94rem', outline: 'none', boxSizing: 'border-box', color: 'var(--text-primary, #111827)' }}
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '1.1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' }}>
        {['All', 'Veg', 'Non-Veg'].map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 1rem',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: typeFilter === t ? '#10b981' : 'var(--border-color, #e5e7eb)',
              backgroundColor: typeFilter === t ? '#10b981' : 'var(--bg-secondary, #ffffff)',
              color: typeFilter === t ? 'white' : 'var(--text-primary, #374151)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {t === 'Veg' ? <Leaf size={13} /> : t === 'Non-Veg' ? <Flame size={13} /> : <Utensils size={13} />}
            {t}
          </button>
        ))}

        <div style={{ width: '1px', height: '22px', backgroundColor: '#e5e7eb' }} />

        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategoryFilter(c)}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: categoryFilter === c ? '#3b82f6' : 'var(--border-color, #e5e7eb)',
              backgroundColor: categoryFilter === c ? 'rgba(59,130,246,0.1)' : 'var(--bg-secondary, #ffffff)',
              color: categoryFilter === c ? '#3b82f6' : 'var(--text-primary, #374151)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {c}
          </button>
        ))}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <button
            onClick={() => setShowExpiringSoon(!showExpiringSoon)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.95rem',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: showExpiringSoon ? '#f59e0b' : 'var(--border-color, #e5e7eb)',
              backgroundColor: showExpiringSoon ? 'rgba(245,158,11,0.12)' : 'var(--bg-secondary, #ffffff)',
              color: showExpiringSoon ? '#b45309' : 'var(--text-primary, #374151)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Clock size={13} /> Expiring Soon
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '0.45rem 0.85rem', borderRadius: '20px', border: '1px solid var(--border-color, #e5e7eb)', backgroundColor: 'var(--bg-secondary, #ffffff)', color: 'var(--text-primary, #111827)', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
          >
            <option value="newest">Newest First</option>
            <option value="expiring_soon">Expiring Soonest</option>
            <option value="quantity">Largest Quantity</option>
            <option value="distance">Nearest to NGO</option>
          </select>
        </div>
      </div>

      {/* Grid of Food Cards */}
      {loading ? (
        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #e5e7eb', borderTop: '3px solid #10b981', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: '#6b7280' }}>Loading available food...</p>
        </div>
      ) : filteredDonations.length === 0 ? (
        <div style={{ backgroundColor: 'var(--bg-secondary, #ffffff)', padding: '4rem 2rem', borderRadius: '18px', border: '1px dashed var(--border-color, #e5e7eb)', textAlign: 'center' }}>
          <Search size={44} color="#9ca3af" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827', marginBottom: '0.35rem' }}>
            {searchTerm ? 'No matching food found' : 'No surplus food available right now'}
          </h3>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {searchTerm ? 'Try adjusting your search terms or filters.' : 'Donors post surplus food throughout the day. Check back soon or post a requirement!'}
          </p>
          {searchTerm && (
            <button onClick={() => { setSearchTerm(''); setTypeFilter('All'); setCategoryFilter('All'); setShowExpiringSoon(false); }} style={{ padding: '0.6rem 1.2rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.4rem' }}>
          {filteredDonations.map((food) => {
            const hours = getHoursRemaining(food.estimated_expiry);
            const isUrgent = hours < 2;
            return (
              <div
                key={food.id}
                style={{
                  backgroundColor: 'var(--bg-secondary, #ffffff)',
                  borderRadius: '18px',
                  border: '1px solid var(--border-color, #e5e7eb)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
                }}
              >
                {/* Food Image */}
                <div style={{ position: 'relative', height: '180px', backgroundColor: '#f3f4f6' }}>
                  {food.image_url ? (
                    <img src={food.image_url} alt={food.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Utensils size={44} color="#9ca3af" />
                    </div>
                  )}

                  {/* Urgent / Expiry Badge */}
                  {isUrgent ? (
                    <div style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: '#ef4444', color: 'white', padding: '0.25rem 0.65rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 800, boxShadow: '0 2px 6px rgba(239,68,68,0.4)' }}>
                      ⚠️ URGENT · {Math.floor(hours * 60)}m left
                    </div>
                  ) : (
                    <div style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', padding: '0.25rem 0.65rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700 }}>
                      Expires in {hours.toFixed(1)}h
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary, #111827)', margin: '0 0 0.4rem 0' }}>
                    {food.title}
                  </h3>

                  {/* Badges */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
                    <span style={{ padding: '0.2rem 0.6rem', backgroundColor: 'rgba(16,185,129,0.1)', color: '#047857', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 800 }}>
                      {food.quantity} {food.quantity_unit} (~{food.estimated_meals || 10} meals)
                    </span>
                    <span style={{ padding: '0.2rem 0.6rem', backgroundColor: '#f3f4f6', color: '#4b5563', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700 }}>
                      {food.food_type}
                    </span>
                  </div>

                  {/* Location Privacy & Distance */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.25rem', flex: 1, fontSize: '0.85rem', color: '#6b7280' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={14} color="#10b981" />
                      <span>General Area: <strong>{food.donor_city || 'Nearby Locality'}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#9ca3af' }}>
                      <span>📏 ~{food.approx_distance_km || 2.5} km away · Exact address unlocked upon claim</span>
                    </div>
                  </div>

                  {/* Action CTA */}
                  <button
                    onClick={() => navigate(`/ngo/food/${food.id}`)}
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      transition: 'background-color 0.15s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#059669')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#10b981')}
                  >
                    VIEW FOOD DETAILS <ArrowRight size={16} />
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

export default NgoFindFood;
