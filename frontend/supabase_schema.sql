-- ============================================================================
-- SHAREBITE PRODUCTION SUPABASE DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- Copy and run this script in your Supabase SQL Editor: https://app.supabase.com
-- ============================================================================

-- 1. Profiles Table (Linked to Supabase auth.users ID)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT DEFAULT '',
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'NGO', 'DONOR')),
    account_status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (account_status IN ('ACTIVE', 'PENDING_APPROVAL', 'REJECTED', 'SUSPENDED')),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. NGO Profiles Table
CREATE TABLE IF NOT EXISTS public.ngo_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    ngo_name TEXT NOT NULL,
    registration_number TEXT NOT NULL,
    ngo_type TEXT DEFAULT 'Shelter',
    description TEXT DEFAULT '',
    established_year TEXT DEFAULT '',
    contact_person TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    address TEXT DEFAULT '',
    city TEXT DEFAULT '',
    state TEXT DEFAULT '',
    pincode TEXT DEFAULT '',
    registration_document_url TEXT DEFAULT '',
    id_document_url TEXT DEFAULT '',
    logo_url TEXT DEFAULT '',
    approval_status TEXT DEFAULT 'PENDING' CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    rejection_reason TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Donor Profiles Table
CREATE TABLE IF NOT EXISTS public.donor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    donor_type TEXT DEFAULT 'Restaurant',
    organization_name TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    address TEXT DEFAULT '',
    city TEXT DEFAULT '',
    state TEXT DEFAULT '',
    pincode TEXT DEFAULT '',
    latitude NUMERIC(10,7) DEFAULT 12.9716,
    longitude NUMERIC(10,7) DEFAULT 77.5946,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Food Donations Table
CREATE TABLE IF NOT EXISTS public.food_donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Cooked Meals',
    is_veg BOOLEAN DEFAULT true,
    quantity TEXT NOT NULL,
    meals_count INT DEFAULT 10,
    cooking_time TIMESTAMP WITH TIME ZONE,
    expiry_time TIMESTAMP WITH TIME ZONE,
    image_url TEXT,
    pickup_address TEXT NOT NULL,
    pickup_time TEXT,
    special_instructions TEXT,
    ai_safety_assessment TEXT DEFAULT 'Suitable for food sharing within 3-4 hours.',
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'claimed', 'picked_up', 'completed', 'expired', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Enable Real-Time Publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.food_donations;

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ngo_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_donations ENABLE ROW LEVEL SECURITY;

-- 7. RLS Security Policies for public.profiles
CREATE POLICY "Users can read own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "Users can update own non-security details" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Admins have full profile access" 
ON public.profiles FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- 8. RLS Security Policies for public.ngo_profiles
CREATE POLICY "NGO read access" 
ON public.ngo_profiles FOR SELECT USING (true);

CREATE POLICY "NGO update own profile" 
ON public.ngo_profiles FOR UPDATE 
USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- 9. RLS Security Policies for public.food_donations
CREATE POLICY "Public read food_donations" 
ON public.food_donations FOR SELECT USING (true);

CREATE POLICY "Donors insert food_donations" 
ON public.food_donations FOR INSERT WITH CHECK (donor_id = auth.uid());

CREATE POLICY "Donors update own donations" 
ON public.food_donations FOR UPDATE USING (donor_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));
