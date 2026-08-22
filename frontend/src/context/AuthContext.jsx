import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    // 1. Restore local session
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing saved user session', e);
      }
    }

    // 2. Supabase Auth Session Listener
    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session && session.user) {
          setToken(session.access_token);
          fetchSupabaseProfile(session.user.id, session.access_token);
        } else {
          setLoading(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session && session.user) {
          setToken(session.access_token);
          localStorage.setItem('token', session.access_token);
          await fetchSupabaseProfile(session.user.id, session.access_token);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setLoading(false);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch Supabase user profile from PostgreSQL `profiles` table
  const fetchSupabaseProfile = async (userId, sessionToken) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && profile) {
        // NEVER default role to 'donor'. Role MUST come from the database.
        const dbRole = profile.role ? profile.role.toLowerCase() : null;
        if (!dbRole) {
          console.error('Supabase profile has no role field — cannot determine access level.');
          setLoading(false);
          return;
        }
        const fullUserData = {
          id: profile.id,
          email: profile.email,
          username: profile.full_name || profile.email,
          role: dbRole,
          status: profile.account_status ? profile.account_status.toLowerCase() : 'active',
          is_email_verified: profile.email_verified,
          created_at: profile.created_at
        };
        setUser(fullUserData);
        localStorage.setItem('user', JSON.stringify(fullUserData));
      }
    } catch (err) {
      console.error('Error fetching Supabase user profile:', err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    // Update theme DOM attribute
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const login = async (username, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    } catch (err) {
      throw err;
    }
  };

  const registerUser = async (registrationData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      return data;
    } catch (err) {
      throw err;
    }
  };

  const handleJsonResponse = async (response, defaultErrorMsg) => {
    let data = {};
    const text = await response.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { message: text };
      }
    }
    if (!response.ok) {
      throw new Error(data.message || defaultErrorMsg || `Server error (${response.status})`);
    }
    return data;
  };

  const sendOtp = async (email, purpose = 'registration') => {
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose })
      });
      return await handleJsonResponse(response, 'Failed to send verification code');
    } catch (err) {
      throw err;
    }
  };

  const verifyOtp = async (email, otpCode, purpose = 'registration') => {
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp_code: otpCode, purpose })
      });
      return await handleJsonResponse(response, 'Verification failed');
    } catch (err) {
      throw err;
    }
  };

  const requestRoleEmailOtp = async (email, role) => {
    try {
      const response = await fetch('/api/auth/login-role-email-otp-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role })
      });
      return await handleJsonResponse(response, 'Role email lookup failed');
    } catch (err) {
      throw err;
    }
  };

  const verifyRoleEmailOtp = async (email, role, otpCode) => {
    try {
      const response = await fetch('/api/auth/login-role-email-otp-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, otp_code: otpCode })
      });
      const data = await handleJsonResponse(response, 'OTP verification failed');

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    } catch (err) {
      throw err;
    }
  };

  const requestEmailOtp = async (email) => {
    try {
      const response = await fetch('/api/auth/login-email-otp-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      return await handleJsonResponse(response, 'Email lookup failed');
    } catch (err) {
      throw err;
    }
  };

  const verifyEmailOtp = async (email, otpCode) => {
    try {
      const response = await fetch('/api/auth/login-email-otp-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp_code: otpCode })
      });
      const data = await handleJsonResponse(response, 'OTP verification failed');

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    } catch (err) {
      throw err;
    }
  };



  const requestLoginOtp = async (username, password, role) => {
    try {
      const response = await fetch('/api/auth/login-request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login credentials invalid');
      }
      return data;
    } catch (err) {
      throw err;
    }
  };

  const verifyLoginOtp = async (username, password, otpCode, role) => {
    try {
      const response = await fetch('/api/auth/login-verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, otp_code: otpCode, role })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    } catch (err) {
      throw err;
    }
  };


  // Direct Supabase Auth OTP Request
  const requestSupabaseOtp = async (email) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase client not configured in environment.');
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    });
    if (error) throw error;
    return { success: true, message: `OTP sent to ${email} via Supabase Auth` };
  };

  // Direct Supabase Auth OTP Verification
  const verifySupabaseOtp = async (email, tokenInput, selectedRole) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase client not configured in environment.');
    }
    const { data: authData, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: tokenInput,
      type: 'email'
    });

    if (verifyError) throw verifyError;

    // Fetch user profile from Supabase PostgreSQL `profiles`
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileErr || !profile) {
      throw new Error('User profile record not found. Please complete registration.');
    }

    // NEVER default role to 'donor'. Role MUST come from the database.
    const fetchedRole = profile.role ? profile.role.toLowerCase() : null;
    if (!fetchedRole) {
      throw new Error('Unable to determine your account role. Please contact support.');
    }
    const fetchedStatus = profile.account_status ? profile.account_status.toLowerCase() : 'active';

    // Verify role matches selected role card (admin and ngo are privileged — exact match required)
    if (selectedRole) {
      const sel = selectedRole.toLowerCase();
      const isNormalSel = sel === 'donor' || sel === 'receiver';
      const isNormalFetched = fetchedRole === 'donor' || fetchedRole === 'receiver';
      const mismatch = isNormalSel && isNormalFetched ? false : fetchedRole !== sel;
      if (mismatch) {
        throw new Error(`Role mismatch: This email is registered as ${fetchedRole.toUpperCase()}, not ${sel.toUpperCase()}. Please select the ${fetchedRole.toUpperCase()} login card.`);
      }
    }

    const fullUserData = {
      id: profile.id,
      email: profile.email,
      username: profile.full_name || profile.email,
      role: fetchedRole,
      status: fetchedStatus,
      is_email_verified: profile.email_verified,
      created_at: profile.created_at
    };

    setUser(fullUserData);
    setToken(authData.session.access_token);
    localStorage.setItem('token', authData.session.access_token);
    localStorage.setItem('user', JSON.stringify(fullUserData));

    return fullUserData;
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error('Supabase signOut error', e);
      }
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Helper function to get authenticated fetch options
  const getAuthHeaders = (extraHeaders = {}) => {
    return {
      'Authorization': `Bearer ${token}`,
      ...extraHeaders
    };
  };

  const loginWithGoogle = async (email, role) => {
    try {
      const response = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role })
      });
      const data = await handleJsonResponse(response, 'Google authentication failed');

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    } catch (err) {
      throw err;
    }
  };

  const loginWithPassword = async (email, password, role) => {
    const response = await fetch('/api/auth/password-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role })
    });
    const data = await handleJsonResponse(response, 'Login failed');
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
  };

  const value = {
    user,
    token,
    loading,
    theme,
    toggleTheme,
    login,
    registerUser,
    sendOtp,
    verifyOtp,
    requestLoginOtp,
    verifyLoginOtp,
    requestEmailOtp,
    verifyEmailOtp,
    requestRoleEmailOtp,
    verifyRoleEmailOtp,
    requestSupabaseOtp,
    verifySupabaseOtp,
    loginWithGoogle,
    loginWithPassword,
    logout,
    getAuthHeaders,
    setUser
  };






  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
export default AuthContext;
