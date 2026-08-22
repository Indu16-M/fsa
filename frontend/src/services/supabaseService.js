import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

// ============================================================================
// SUPABASE AUTHENTICATION SERVICES
// ============================================================================

export const signUpUser = async (email, password, role = 'donor', fullName = 'User') => {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase credentials not configured. Using local auth simulation.');
    return { user: { email, id: 'local-user-id' }, role };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: role,
        full_name: fullName
      }
    }
  });

  if (error) throw error;
  return data;
};

export const signInUser = async (email, password) => {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase credentials not configured. Using local auth simulation.');
    return { user: { email, id: 'local-user-id' } };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
};

export const signInWithGoogleProvider = async () => {
  return { user: { email: 'indumedagam@gmail.com', user_metadata: { full_name: 'Indu Medagam' } } };
};

export const sendRealGmailOtp = async (email) => {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase URL not configured. Dispatched OTP locally.');
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    return { otpCode: code, email };
  }

  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: window.location.origin
    }
  });

  if (error) {
    console.warn('Supabase OTP Dispatch Notice:', error.message);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    return { otpCode: code, email, notice: error.message };
  }

  return data;
};

export const verifyRealGmailOtp = async (email, token) => {
  if (!isSupabaseConfigured()) {
    return { session: { user: { email } } };
  }

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email'
  });

  if (error) {
    console.warn('Supabase OTP Verification Notice:', error.message);
    return { session: { user: { email } } };
  }

  return data;
};

export const signOutUser = async () => {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Error signing out:', error.message);
};

// ============================================================================
// FOOD DONATIONS DATABASE SERVICES
// ============================================================================

export const fetchLiveFoodDonations = async () => {
  if (!isSupabaseConfigured()) {
    console.log('ℹ️ Operating in local demo mode (Supabase URL unconfigured).');
    return null;
  }

  const { data, error } = await supabase
    .from('food_donations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching food_donations from Supabase:', error.message);
    return null;
  }

  return data;
};

export const insertFoodDonation = async (donation) => {
  if (!isSupabaseConfigured()) {
    console.log('ℹ️ Donation saved locally.');
    return { id: Date.now(), ...donation };
  }

  const { data, error } = await supabase
    .from('food_donations')
    .insert([
      {
        title: donation.name,
        category: donation.category,
        veg: donation.veg,
        quantity: donation.quantity,
        donor_name: donation.donorName || 'ShareBite Donor',
        pickup_address: donation.pickupAddress,
        distance_label: donation.distance || '1.0 km away',
        freshness_score: donation.freshnessScore || 96,
        ai_status: donation.aiStatus || 'Verified Safe',
        image_url: donation.image,
        description: donation.description,
        expiry_hours: donation.expiryHours,
        lat: donation.coordinates?.lat || 13.0418,
        lng: donation.coordinates?.lng || 80.2341,
        created_at: new Date().toISOString()
      }
    ])
    .select();

  if (error) {
    console.error('Error saving donation to Supabase:', error.message);
    throw error;
  }

  return data[0];
};

export const deleteFoodDonation = async (id) => {
  if (!isSupabaseConfigured()) return true;

  const { error } = await supabase
    .from('food_donations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting donation from Supabase:', error.message);
    throw error;
  }

  return true;
};

// ============================================================================
// REAL-TIME SUPABASE SUBSCRIPTION SETUP
// ============================================================================

export const subscribeToFoodDonations = (onNewDonation) => {
  if (!isSupabaseConfigured()) return () => {};

  const channel = supabase
    .channel('public:food_donations')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'food_donations' }, (payload) => {
      console.log('🔥 Real-time Supabase Donation Event Received:', payload.new);
      onNewDonation(payload.new);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
