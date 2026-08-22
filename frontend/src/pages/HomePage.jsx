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

  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState('cooked');
  const [postQuantity, setPostQuantity] = useState('50');
  const [postUnit, setPostUnit] = useState('plates');
  const [postDesc, setPostDesc] = useState('');
  const [postSuccessMsg, setPostSuccessMsg] = useState('');

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

  // Live surplus post submit handler
  const handleAddNewPost = (e) => {
    e.preventDefault();
    if (!postTitle || !postQuantity) return;

    const newPost = {
      id: Date.now(),
      title: postTitle,
      category: postCategory,
      food_type: postCategory,
      quantity: `${postQuantity} ${postUnit}`,
      quantity_raw: parseFloat(postQuantity),
      quantity_unit: postUnit,
      donor_name: user?.username ? `${user.username} (You)` : 'Grand Hotel Indiranagar (You)',
      address: 'Indiranagar 100ft Road, Bengaluru',
      risk_level: 'Safe',
      remaining_hours: 12,
      image_emoji: postCategory === 'cooked' ? '🍲' : postCategory === 'produce' ? '🍎' : postCategory === 'dairy' ? '🥛' : postCategory === 'bakery' ? '🎂' : '📦',
      description: postDesc || `Freshly prepared ${postTitle} surplus items.`
    };

    setActiveDonations(prev => [newPost, ...prev]);
    setPostSuccessMsg('Food surplus posted successfully! Redirecting to Tab 2 Active Posts...');
    
    setTimeout(() => {
      setPostTitle('');
      setPostDesc('');
      setPostQuantity('50');
      setPostSuccessMsg('');
      setSelectedCategory('all'); // Switch to Tab 2
    }, 600);
  };

  const handleAcceptItemOnHome = (itemId, neededQty) => {
    setActiveDonations(prevList => 
      prevList.map(don => {
        if (don.id === itemId) {
          const currentTotal = don.quantity_raw !== undefined ? don.quantity_raw : (parseFloat(don.quantity) || 50);
          const remaining = Math.max(0, currentTotal - neededQty);
          return {
            ...don,
            quantity_raw: remaining,
            quantity: `${remaining} ${don.quantity_unit || 'plates'}`
          };
        }
        return don;
      })
    );
    alert(`Accepted ${neededQty} plates! Post remaining capacity updated.`);
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
        <div className="logo" style={{ fontSize: '1.4rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
          🍲 ShareBite AI
        </div>


        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Explicit Role Dashboard Links */}
          <button 
            onClick={() => navigate(token && user?.role === 'donor' ? '/donor' : '/login')} 
            className="btn btn-secondary" 
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', fontWeight: 700 }}
          >
            🏨 Donor Dashboard
          </button>

          <button 
            onClick={() => navigate(token && user?.role === 'ngo' ? '/ngo' : '/login')} 
            className="btn btn-secondary" 
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '10px', fontWeight: 700 }}
          >
            🍲 NGO Dashboard
          </button>

          <button 
            onClick={() => navigate(token && user?.role === 'admin' ? '/admin' : '/login')} 
            className="btn btn-secondary" 
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', fontWeight: 700 }}
          >
            🛡️ Admin Dashboard
          </button>

          <button 
            onClick={() => navigate('/tracking')} 
            className="btn btn-primary" 
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#3b82f6', borderColor: '#3b82f6', borderRadius: '10px' }}
          >
            🗺️ Live Map
          </button>

          {token ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button onClick={() => navigate(user?.role === 'donor' ? '/donor' : user?.role === 'ngo' ? '/ngo' : '/admin')} className="btn btn-primary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', borderRadius: '10px' }}>
                My Profile ({user?.username})
              </button>
              <button onClick={logout} className="btn btn-secondary" style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem', borderRadius: '10px' }}>
                Log Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '10px' }}>
                <LogIn size={15} /> Log In
              </button>
              <button onClick={() => navigate('/register')} className="btn btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '10px' }}>
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



      {/* SIDEBAR TABS & MAIN DASHBOARD SECTION (FULL SCREEN) */}
      <div id="food-listings-section" style={{ width: '100%', maxWidth: '100%', padding: '1.5rem', minHeight: 'calc(100vh - 70px)' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', minHeight: 'calc(100vh - 120px)', width: '100%' }}>
          
          {/* SIDEBAR NAV */}
          <aside style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', height: 'fit-content' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.5rem' }}>
              📌 SIDEBAR TABS
            </div>

            <div 
              onClick={() => setSelectedCategory('post')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                backgroundColor: selectedCategory === 'post' ? '#10b981' : 'rgba(255,255,255,0.05)',
                color: selectedCategory === 'post' ? '#ffffff' : '#cbd5e1',
                border: '1px solid #334155'
              }}
            >
              <Utensils size={20} color={selectedCategory === 'post' ? '#fff' : '#10b981'} /> Tab 1: Post Food Surplus
            </div>

            <div 
              onClick={() => setSelectedCategory('all')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                backgroundColor: selectedCategory !== 'post' ? '#3b82f6' : 'rgba(255,255,255,0.05)',
                color: selectedCategory !== 'post' ? '#ffffff' : '#cbd5e1',
                border: '1px solid #334155'
              }}
            >
              <Package size={20} color={selectedCategory !== 'post' ? '#fff' : '#3b82f6'} /> Tab 2: View Active Posts ({filteredItems.length})
            </div>

            <div 
              onClick={() => navigate('/tracking')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: '#cbd5e1',
                border: '1px solid #334155'
              }}
            >
              <MapPin size={20} color="#f59e0b" /> Tab 3: Live Delivery Map
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '2rem' }}>
            
            {/* TAB 1: POST FOOD SURPLUS */}
            {selectedCategory === 'post' ? (
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>
                  ➕ Tab 1: List Surplus Food
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Fill out the surplus details below to make food available for NGOs and food shelters.
                </p>

                {postSuccessMsg && (
                  <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontWeight: 700 }}>
                    ✓ {postSuccessMsg}
                  </div>
                )}

                <form onSubmit={handleAddNewPost} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>Food Title / Item Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 50 Plates Rice & Curry" 
                      required 
                      value={postTitle}
                      onChange={e => setPostTitle(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} 
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>Food Category</label>
                    <select 
                      value={postCategory}
                      onChange={e => setPostCategory(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                    >
                      <option value="cooked">Cooked Meals</option>
                      <option value="produce">Fresh Produce</option>
                      <option value="dairy">Dairy & Milk</option>
                      <option value="bakery">Bakery & Bread</option>
                      <option value="packaged">Packaged Goods</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>Capacity Available (Plates/kg)</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="number" 
                        value={postQuantity}
                        onChange={e => setPostQuantity(e.target.value)}
                        required 
                        style={{ flex: 1, padding: '0.75rem', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} 
                      />
                      <select 
                        value={postUnit}
                        onChange={e => setPostUnit(e.target.value)}
                        style={{ padding: '0.75rem', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                      >
                        <option value="plates">plates</option>
                        <option value="kg">kg</option>
                        <option value="portions">portions</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>Surplus Description</label>
                    <textarea 
                      placeholder="e.g. Freshly cooked biryani and raita, prepared 1 hour ago."
                      value={postDesc}
                      onChange={e => setPostDesc(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', height: '80px' }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <button type="submit" style={{ width: '100%', padding: '0.85rem', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' }}>
                      Publish Food Surplus to Platform
                    </button>
                  </div>
                </form>
              </div>
            ) : (

              /* TAB 2: ACTIVE POSTS (Y ROWS x 2 COLUMNS GRID) */
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>
                      📦 Tab 2: Active Surplus Posts ({filteredItems.length})
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                      Displaying in <strong>Y (Unlimited Rows) × 2 Columns Layout</strong> with Accept / Reject buttons
                    </p>
                  </div>

                  <input 
                    type="text" 
                    placeholder="Search surplus meals..." 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)} 
                    style={{ padding: '0.6rem 1rem', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', width: '240px' }} 
                  />
                </div>

                {/* Y x 2 COLUMNS GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                  {filteredItems.map(item => (
                    <div 
                      key={item.id} 
                      style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>{item.title}</h4>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '99px', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid #10b981' }}>
                            {item.risk_level || 'Safe'}
                          </span>
                        </div>

                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.75rem' }}>{item.description}</p>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.75rem' }}>
                          <MapPin size={14} style={{ color: '#ef4444' }} /> {item.donor_name || item.address}
                        </div>

                        {/* Interactive Quantity Needed & Available Capacity Box */}
                        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.65rem 0.8rem', borderRadius: '8px', margin: '0.75rem 0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 700 }}>📦 Total Available:</span>
                            <strong style={{ fontSize: '1rem', color: '#10b981' }}>{item.quantity}</strong>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px dashed rgba(16, 185, 129, 0.3)', paddingTop: '0.4rem', marginTop: '0.4rem' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1' }}>Quantity Needed:</label>
                            <input 
                              id={`qty-input-${item.id}`}
                              type="number" 
                              defaultValue="20" 
                              min="1" 
                              style={{ width: '70px', padding: '0.2rem 0.4rem', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#fff', textAlign: 'center', fontWeight: 700 }} 
                            />
                          </div>
                        </div>
                      </div>

                      {/* Accept and Reject Action Buttons */}
                      <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #334155', display: 'flex', gap: '0.75rem' }}>
                        <button 
                          type="button" 
                          onClick={() => {
                            const inputEl = document.getElementById(`qty-input-${item.id}`);
                            const qty = inputEl ? parseFloat(inputEl.value) || 20 : 20;
                            handleAcceptItemOnHome(item.id, qty);
                          }}
                          style={{ flex: 1, backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '0.6rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          ✓ Accept
                        </button>
                        <button 
                          type="button" 
                          onClick={() => {
                            setActiveDonations(prev => prev.filter(d => d.id !== item.id));
                            alert('Post rejected/dismissed.');
                          }}
                          style={{ flex: 1, backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '0.6rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </main>
        </div>

      </div>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#090d16', borderTop: '1px solid #1e293b', padding: '2rem 1.5rem', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
        <div>🍲 <strong>ShareBite AI Platform</strong> — AI-Powered Food Waste Reduction & Live Dispatch System</div>
      </footer>


    </div>
  );
};

export default HomePage;
