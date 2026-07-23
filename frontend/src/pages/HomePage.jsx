import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Utensils, 
  Apple, 
  Milk, 
  Cake, 
  Package, 
  MapPin, 
  ArrowRight, 
  Sparkles, 
  Bike, 
  Smartphone, 
  Search, 
  ShieldAlert, 
  CheckCircle2, 
  Clock,
  LogIn,
  UserPlus
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDonations, setActiveDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  // 5 Main Interactive Food Category Squares
  const foodCategories = [
    {
      id: 'cooked',
      name: 'Cooked Meals',
      icon: <Utensils size={32} />,
      color: '#3b82f6',
      bgGradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
      count: '14 Active Items',
      desc: 'Hot biryani, curries, rice bowls, soups & cooked catering surplus'
    },
    {
      id: 'produce',
      name: 'Fresh Produce',
      icon: <Apple size={32} />,
      color: '#10b981',
      bgGradient: 'linear-gradient(135deg, #064e3b 0%, #10b981 100%)',
      count: '9 Active Items',
      desc: 'Fresh farm fruits, green vegetables, salads & organic produce'
    },
    {
      id: 'dairy',
      name: 'Dairy & Milk',
      icon: <Milk size={32} />,
      color: '#f59e0b',
      bgGradient: 'linear-gradient(135deg, #78350f 0%, #f59e0b 100%)',
      count: '6 Active Items',
      desc: 'Fresh milk, cottage cheese (paneer), yoghurt, butter & cream'
    },
    {
      id: 'bakery',
      name: 'Bakery & Bread',
      icon: <Cake size={32} />,
      color: '#ec4899',
      bgGradient: 'linear-gradient(135deg, #831843 0%, #ec4899 100%)',
      count: '8 Active Items',
      desc: 'Freshly baked artisan bread, buns, pastries, muffins & rolls'
    },
    {
      id: 'packaged',
      name: 'Packaged & Rations',
      icon: <Package size={32} />,
      color: '#8b5cf6',
      bgGradient: 'linear-gradient(135deg, #4c1d95 0%, #8b5cf6 100%)',
      count: '12 Active Items',
      desc: 'Canned foods, dry rice, lentils, grains & sealed ration kits'
    }
  ];

  // Default featured food surplus listings
  const initialFoodItems = [
    {
      id: 1,
      title: 'Vegetable Biryani & Raita (25 Portions)',
      category: 'cooked',
      quantity: '25 portions',
      donor_name: 'Grand Hotel Indiranagar',
      address: 'Indiranagar 100ft Road, Bengaluru',
      risk_level: 'Safe',
      remaining_hours: 6,
      image_emoji: '🍲',
      description: 'Hygiene packed vegetable biryani made 2 hours ago. Stored in hot containers.'
    },
    {
      id: 2,
      title: 'Paneer Butter Masala & Tandoori Roti',
      category: 'cooked',
      quantity: '15 kg',
      donor_name: 'Anna Kitchen Whitefield',
      address: 'Whitefield Main Road, Bengaluru',
      risk_level: 'Safe',
      remaining_hours: 8,
      image_emoji: '🥘',
      description: 'Fresh North Indian gravy and rotis from evening catering buffet.'
    },
    {
      id: 3,
      title: 'Organic Farm Tomatoes & Apples Crate',
      category: 'produce',
      quantity: '30 kg',
      donor_name: 'SuperMart Fresh Market',
      address: 'Koramangala 4th Block, Bengaluru',
      risk_level: 'Safe',
      remaining_hours: 48,
      image_emoji: '🍎',
      description: 'Crisp fresh red apples and ripe tomatoes surplus crate.'
    },
    {
      id: 4,
      title: 'Fresh Milk & Cottage Cheese (Paneer)',
      category: 'dairy',
      quantity: '12 Liters',
      donor_name: 'Mother Dairy Outlet',
      address: 'HSR Layout 5th Sector, Bengaluru',
      risk_level: 'Medium Risk',
      remaining_hours: 12,
      image_emoji: '🥛',
      description: 'Chilled pasteurized milk pouches & fresh cottage cheese.'
    },
    {
      id: 5,
      title: 'Artisan Whole Wheat Bread & Buns',
      category: 'bakery',
      quantity: '40 Packets',
      donor_name: 'The French Loaf Bakery',
      address: 'MG Road, Bengaluru',
      risk_level: 'Safe',
      remaining_hours: 24,
      image_emoji: '🍞',
      description: 'Daily fresh baked sandwich bread loaves, burger buns & muffins.'
    },
    {
      id: 6,
      title: 'Sealed Basmati Rice & Dal Ration Bags',
      category: 'packaged',
      quantity: '50 kg',
      donor_name: 'Reliance Wholesale Mart',
      address: 'Rajajinagar, Bengaluru',
      risk_level: 'Safe',
      remaining_hours: 720,
      image_emoji: '📦',
      description: 'Premium quality sealed dry rice and yellow lentils ration packets.'
    }
  ];

  useEffect(() => {
    fetchActiveDonations();
  }, []);

  const fetchActiveDonations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/donations');
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setActiveDonations(data);
        } else {
          setActiveDonations(initialFoodItems);
        }
      } else {
        setActiveDonations(initialFoodItems);
      }
    } catch (err) {
      setActiveDonations(initialFoodItems);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = activeDonations.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.food_type === selectedCategory || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCategoryClick = (catId) => {
    setSelectedCategory(catId);
    // Smooth scroll down to food listings section
    const el = document.getElementById('food-listings-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleItemClick = (item) => {
    if (token) {
      if (user?.role === 'ngo') {
        navigate('/ngo');
      } else if (user?.role === 'donor') {
        navigate('/donor');
      } else {
        navigate('/admin');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="app-container" style={{ backgroundColor: 'var(--bg-primary, #0f172a)', color: 'var(--text-primary, #f8fafc)', minHeight: '100vh' }}>
      
      {/* NAVBAR */}
      <header className="navbar" style={{ background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #1e293b' }}>
        <div className="logo" style={{ fontSize: '1.4rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🍲 FoodShare AI
        </div>

        <div className="nav-links" style={{ gap: '1rem' }}>
          <button 
            onClick={() => navigate('/tracking')} 
            className="btn btn-primary" 
            style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#3b82f6', borderColor: '#3b82f6', borderRadius: '10px' }}
          >
            🗺️ Live Delivery Map
          </button>

          <button 
            onClick={() => navigate('/mobile')} 
            className="btn btn-secondary" 
            style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid #334155', borderRadius: '10px' }}
          >
            📱 Mobile App
          </button>

          {token ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button onClick={() => navigate(user?.role === 'donor' ? '/donor' : user?.role === 'ngo' ? '/ngo' : '/admin')} className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', borderRadius: '10px' }}>
                Dashboard ({user?.username})
              </button>
              <button onClick={logout} className="btn btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', borderRadius: '10px' }}>
                Log Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '10px' }}>
                <LogIn size={15} /> Log In
              </button>
              <button onClick={() => navigate('/register')} className="btn btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '10px' }}>
                <UserPlus size={15} /> Register
              </button>
            </div>
          )}
        </div>
      </header>

      {/* HERO BANNER */}
      <div style={{
        background: 'radial-gradient(circle at 50% 20%, rgba(16, 185, 129, 0.15) 0%, transparent 60%), radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.15) 0%, transparent 60%), #0f172a',
        padding: '4rem 1.5rem 3rem 1.5rem',
        textAlign: 'center',
        borderBottom: '1px solid #1e293b'
      }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', padding: '0.35rem 0.9rem', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            <Sparkles size={16} /> AI-Powered Food Waste Reduction & Live Dispatch Platform
          </div>

          <h1 style={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.03em', marginBottom: '1rem', color: '#f8fafc' }}>
            Zero Food Waste. <span style={{ color: '#10b981' }}>Real-Time Food Sharing.</span>
          </h1>

          <p style={{ fontSize: '1.1rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '700px', margin: '0 auto 2rem auto' }}>
            Connecting hotels, restaurants & households with NGOs and food shelters using ML shelf-life predictions, interactive map coordinates, and live delivery tracking.
          </p>

          {/* Quick Action Badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/tracking')}
              style={{
                backgroundColor: '#3b82f6',
                color: '#fff',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.95rem',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
              }}
            >
              🗺️ Open Live Delivery Map <ArrowRight size={16} />
            </button>

            <button 
              onClick={() => navigate('/register')}
              style={{
                backgroundColor: '#10b981',
                color: '#fff',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.95rem',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
              }}
            >
              📍 Pin Location & Register <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 5 MAIN INTERACTIVE FOOD CATEGORY SQUARES */}
      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>
            Explore Food Categories
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Click on any food category square to filter available surplus food items & AI predictions
          </p>
        </div>

        {/* 5 Squares Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem'
        }}>
          {foodCategories.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                style={{
                  background: cat.bgGradient,
                  borderRadius: '20px',
                  padding: '1.75rem 1.25rem',
                  color: '#ffffff',
                  cursor: 'pointer',
                  border: isSelected ? '3px solid #ffffff' : '1px solid rgba(255,255,255,0.15)',
                  boxShadow: isSelected ? `0 12px 30px ${cat.color}66` : '0 6px 20px rgba(0,0,0,0.3)',
                  transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  minHeight: '220px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Background Icon Aura */}
                <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.15 }}>
                  {cat.icon}
                </div>

                <div>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    marginBottom: '1rem',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                  }}>
                    {cat.icon}
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>
                    {cat.name}
                  </h3>

                  <div style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.15rem 0.5rem', borderRadius: '6px', display: 'inline-block', marginBottom: '0.5rem' }}>
                    {cat.count}
                  </div>

                  <p style={{ fontSize: '0.8rem', opacity: 0.9, lineHeight: 1.4 }}>
                    {cat.desc}
                  </p>
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700 }}>
                  <span>View Items</span> <ArrowRight size={14} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Category reset pill */}
        {selectedCategory !== 'all' && (
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button 
              onClick={() => setSelectedCategory('all')}
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '1px solid #475569',
                color: '#fff',
                padding: '0.4rem 1rem',
                borderRadius: '20px',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Showing category: <strong>{foodCategories.find(c => c.id === selectedCategory)?.name}</strong> (Click to view all)
            </button>
          </div>
        )}
      </div>

      {/* FEATURED FOOD SURPLUS LISTINGS GRID */}
      <div id="food-listings-section" style={{ maxWidth: '1300px', margin: '0 auto', padding: '1rem 1.5rem 4rem 1.5rem' }}>
        
        {/* Search & Filter Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>
              Available Food Surplus Items
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              Click any item card to request food, view AI shelf-life, or track live map
            </p>
          </div>

          <div style={{ position: 'relative', width: '320px' }}>
            <input 
              type="text" 
              placeholder="Search surplus meals, bakery, fruits..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.5rem',
                borderRadius: '12px',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                color: '#fff',
                fontSize: '0.85rem'
              }}
            />
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
          </div>
        </div>

        {/* Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredItems.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#94a3b8', backgroundColor: '#1e293b', borderRadius: '16px' }}>
              No surplus food found matching search query. Try selecting a different category square above.
            </div>
          ) : (
            filteredItems.map(item => (
              <div 
                key={item.id}
                onClick={() => handleItemClick(item)}
                style={{
                  backgroundColor: '#1e293b',
                  borderRadius: '18px',
                  border: '1px solid #334155',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {/* Header Banner */}
                <div style={{
                  height: '140px',
                  backgroundColor: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  fontSize: '4rem',
                  position: 'relative',
                  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
                }}>
                  {item.image_emoji || '🍲'}

                  {/* Risk Badge */}
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '99px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    backgroundColor: item.risk_level === 'High Risk' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    color: item.risk_level === 'High Risk' ? '#ef4444' : '#10b981',
                    border: `1px solid ${item.risk_level === 'High Risk' ? '#ef4444' : '#10b981'}`
                  }}>
                    {item.risk_level || 'Safe'}
                  </span>
                </div>

                {/* Body Content */}
                <div style={{ padding: '1.25rem' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.4rem' }}>
                    {item.title}
                  </h4>

                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                    {item.description}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={14} style={{ color: '#ef4444' }} /> {item.donor_name || item.address}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#f59e0b' }}>
                      <Clock size={14} /> AI Remaining Shelf Life: ~{item.remaining_hours || item.remaining_shelf_life_hours || 12} Hours
                    </div>
                  </div>

                  {/* Action Footer Button */}
                  <button 
                    type="button"
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      backgroundColor: '#10b981',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    View Food Details & Claim <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#090d16', borderTop: '1px solid #1e293b', padding: '2rem 1.5rem', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
        <div>🍲 <strong>FoodShare AI Platform</strong> — AI-Powered Food Waste Reduction & Live Dispatch System</div>
      </footer>

    </div>
  );
};

export default HomePage;
