import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LocationPickerModal from '../components/LocationPickerModal';
import { UserPlus, Sun, Moon, MapPin } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();

  // General fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('donor'); // 'donor', 'ngo'
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('12.9716');
  const [longitude, setLongitude] = useState('77.5946');
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // NGO Specific fields
  const [orgName, setOrgName] = useState('');
  const [regNum, setRegNum] = useState('');
  const [taxId, setTaxId] = useState('');
  const [capacity, setCapacity] = useState('100');
  const [preferredFood, setPreferredFood] = useState('cooked,bakery,produce,dry');
  const [website, setWebsite] = useState('');

  // OTP Email Verification states
  const { registerUser, sendOtp, verifyOtp, theme, toggleTheme } = useAuth();

  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Resend cooldown timer effect
  React.useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendOtp = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address first.');
      return;
    }
    setError('');
    setSuccess('');
    setOtpSending(true);

    try {
      const res = await sendOtp(email, 'registration');
      setIsOtpSent(true);
      setCooldown(60);
      setSuccess(res.message || 'Verification code sent to your real email inbox!');
    } catch (err) {
      setError(err.message || 'Failed to send verification code. Check email address.');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length < 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await verifyOtp(email, otpCode, 'registration');
      setIsOtpVerified(true);
      setSuccess(res.message || 'Email verified successfully! You can now submit registration.');
    } catch (err) {
      setError(err.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !address || !phone) {
      setError('Please fill in all general fields');
      return;
    }

    if (role === 'ngo' && (!orgName || !regNum)) {
      setError('NGO Organization Name and Registration Number are required.');
      return;
    }

    if (!isOtpVerified && !otpCode) {
      setError('Please request and enter your 6-digit email verification code.');
      return;
    }

    setError('');
    setLoading(true);

    const payload = {
      username,
      email,
      password,
      role,
      phone,
      address,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      otp_code: otpCode,
      ...(role === 'ngo' && {
        organization_name: orgName,
        registration_number: regNum,
        tax_id: taxId,
        capacity_people: parseInt(capacity),
        preferred_food_types: preferredFood,
        website: website
      })
    };

    try {
      const data = await registerUser(payload);
      setSuccess(data.message || 'Registration completed successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Try a different username or email.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="auth-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '120vh', padding: '2rem' }}>
      
      {/* Header theme toggle */}
      <div style={{ alignSelf: 'flex-end', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={toggleTheme} className="theme-toggle" style={{ width: '40px', height: '40px' }} aria-label="Toggle theme">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>

      <div className="auth-card" style={{ width: '100%', maxWidth: '640px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Create Account</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Connect to the AI food waste reduction engine</p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--safe)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            {success} Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. fresh_bakery"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                disabled={isOtpVerified}
              />
              {email.toLowerCase().includes('gamil.com') && (
                <div style={{ color: '#b45309', fontSize: '0.75rem', fontWeight: 650, marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  ⚠️ Did you mean <strong style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => setEmail(email.toLowerCase().replace('gamil.com', 'gmail.com'))}>gmail.com</strong>? Click to fix.
                </div>
              )}
            </div>
          </div>

          {/* REAL EMAIL OTP VERIFICATION BOX */}
          <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>📧 Real Email Verification</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>A 6-digit verification code will be delivered to your inbox</div>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', fontWeight: 700 }}
                onClick={handleSendOtp}
                disabled={otpSending || cooldown > 0 || isOtpVerified || !email}
              >
                {isOtpVerified ? '✅ Verified' : otpSending ? 'Sending...' : cooldown > 0 ? `Resend (${cooldown}s)` : isOtpSent ? 'Resend Code' : 'Send OTP'}
              </button>
            </div>

            {isOtpSent && !isOtpVerified && (
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="text"
                  maxLength={6}
                  className="form-control"
                  placeholder="Enter 6-digit code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  style={{ letterSpacing: '4px', fontWeight: 800, fontSize: '1.1rem', textAlign: 'center', width: '180px' }}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                  onClick={handleVerifyOtp}
                  disabled={loading || otpCode.length < 6}
                >
                  Verify Code
                </button>
              </div>
            )}

            {isOtpVerified && (
              <div style={{ color: 'var(--safe)', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.5rem' }}>
                ✓ Email verified successfully! You can complete account registration.
              </div>
            )}
          </div>


          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="role">Role Type</label>
              <select
                id="role"
                className="form-control"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="donor">Food Donor (Restaurant, Hotel, Household)</option>
                <option value="ngo">NGO (Organization)</option>
                <option value="receiver">Individual Food Receiver</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="text"
                className="form-control"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 XXXXXXXXXX"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="address">Full Address</label>
              <input
                id="address"
                type="text"
                className="form-control"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street name, City"
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem', backgroundColor: 'var(--bg-tertiary)', padding: '0.85rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Map Location Pin</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lat: {latitude}, Lon: {longitude}</div>
            </div>
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'var(--primary-color)', color: '#fff' }}
              onClick={() => setIsMapModalOpen(true)}
            >
              <MapPin size={14} /> Pick on Map
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="latitude">Latitude</label>
              <input
                id="latitude"
                type="text"
                className="form-control"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="e.g. 12.9716"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="longitude">Longitude</label>
              <input
                id="longitude"
                type="text"
                className="form-control"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="e.g. 77.5946"
              />
            </div>
          </div>

          <LocationPickerModal
            isOpen={isMapModalOpen}
            onClose={() => setIsMapModalOpen(false)}
            initialLat={parseFloat(latitude) || 12.9716}
            initialLon={parseFloat(longitude) || 77.5946}
            onSelectLocation={(loc) => {
              setLatitude(loc.latitude.toString());
              setLongitude(loc.longitude.toString());
              if (loc.address) setAddress(loc.address);
            }}
          />


          {/* NGO SPECIFIC SECTIONS */}
          {role === 'ngo' && (
            <fieldset style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1.25rem', marginTop: '1rem', marginBottom: '1rem' }}>
              <legend style={{ padding: '0 0.5rem', fontWeight: 700, color: 'var(--primary-color)' }}>NGO Profile Details</legend>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="orgName">Organization Name</label>
                  <input
                    id="orgName"
                    type="text"
                    className="form-control"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Feed The Needy"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="regNum">Govt Registration #</label>
                  <input
                    id="regNum"
                    type="text"
                    className="form-control"
                    value={regNum}
                    onChange={(e) => setRegNum(e.target.value)}
                    placeholder="REG-8923091"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="taxId">Tax identification ID</label>
                  <input
                    id="taxId"
                    type="text"
                    className="form-control"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="TAX-NGO-1923"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="capacity">Capacity (People served/day)</label>
                  <input
                    id="capacity"
                    type="number"
                    className="form-control"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="preferredFood">Preferred Food Types (comma-separated)</label>
                <input
                  id="preferredFood"
                  type="text"
                  className="form-control"
                  value={preferredFood}
                  onChange={(e) => setPreferredFood(e.target.value)}
                  placeholder="e.g. cooked,bakery,produce,dry"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="website">Website URL</label>
                <input
                  id="website"
                  type="url"
                  className="form-control"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourngo.org"
                />
              </div>
            </fieldset>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : (
              <>
                <UserPlus size={18} /> Register Account
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
