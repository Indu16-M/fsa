import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Eye, EyeOff, Sun, Moon } from 'lucide-react';

const Login = () => {
  const { login, theme, toggleTheme } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      const user = await login(username, password);
      // Redirect according to user role
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'donor') {
        navigate('/donor');
      } else {
        navigate('/ngo');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem' }}>
      
      {/* Header theme toggle */}
      <div style={{ alignSelf: 'flex-end', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={toggleTheme} className="theme-toggle" style={{ width: '40px', height: '40px' }} aria-label="Toggle theme">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>

      <div className="auth-card" style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Log in to share surplus or request fresh food</p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. grand_hotel"
            />
          </div>

          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ paddingRight: '2.5rem' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '10px', top: '35px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : (
              <>
                <LogIn size={18} /> Log In
              </>
            )}
          </button>
        </form>

        {/* 1-CLICK INSTANT AUTO LOGIN BUTTONS */}
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', textAlign: 'center' }}>
            ⚡ 1-Click Demo Auto Logins (No Typing Required)
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', fontWeight: 700 }}
              onClick={async () => {
                const u = await login('grand_hotel', 'password123');
                if (u) navigate('/donor');
              }}
            >
              🏨 Auto-Login as Food Donor (Grand Hotel)
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontWeight: 700 }}
              onClick={async () => {
                const u = await login('feed_the_hungry', 'password123');
                if (u) navigate('/ngo');
              }}
            >
              🍲 Auto-Login as NGO (Feed The Hungry)
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem' }}
              onClick={async () => {
                const u = await login('admin_user', 'password123');
                if (u) navigate('/admin');
              }}
            >
              🛡️ Auto-Login as System Admin
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
