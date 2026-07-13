-- Kabadiwala App - Initial Database Schema
-- Phase 1 MVP

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================
-- ENUM TYPES
-- ============================================

CREATE TYPE user_role AS ENUM ('household', 'kabadiwala', 'admin');
CREATE TYPE booking_status AS ENUM (
  'pending', 'assigned', 'accepted', 'en_route', 
  'arrived', 'weighing', 'payment_pending', 
  'completed', 'cancelled', 'no_show'
);
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('upi', 'cash', 'bank_transfer');
CREATE TYPE kabadiwala_status AS ENUM ('pending_verification', 'verified', 'suspended', 'inactive');
CREATE TYPE vehicle_type AS ENUM ('bicycle', 'cart', 'auto_rickshaw', 'mini_truck', 'truck');

-- ============================================
-- USERS & PROFILES
-- ============================================

-- Household Profiles
CREATE TABLE household_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  avatar_url TEXT,
  total_pickups INTEGER DEFAULT 0,
  total_recycled_kg NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kabadiwala Profiles
CREATE TABLE kabadiwala_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  aadhaar_verified BOOLEAN DEFAULT FALSE,
  aadhaar_number_masked TEXT, -- Last 4 digits only
  selfie_url TEXT,
  vehicle_photo_url TEXT,
  vehicle_type vehicle_type DEFAULT 'cart',
  service_pincodes TEXT[] DEFAULT '{}',
  availability JSONB DEFAULT '{}',
  rating NUMERIC(3,2) DEFAULT 0,
  total_pickups INTEGER DEFAULT 0,
  total_earnings NUMERIC(12,2) DEFAULT 0,
  status kabadiwala_status DEFAULT 'pending_verification',
  is_online BOOLEAN DEFAULT FALSE,
  current_lat NUMERIC(10,7),
  current_lng NUMERIC(10,7),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Addresses
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL DEFAULT 'Home',
  full_address TEXT NOT NULL,
  landmark TEXT,
  pincode TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  lat NUMERIC(10,7) NOT NULL,
  lng NUMERIC(10,7) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SCRAP CATEGORIES & RATE CARD
-- ============================================

CREATE TABLE scrap_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_hindi TEXT,
  icon TEXT,
  parent_id TEXT,
  description TEXT,
  unit TEXT DEFAULT 'kg',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rate_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id TEXT REFERENCES scrap_categories(id) NOT NULL,
  category_name TEXT NOT NULL,
  category_icon TEXT,
  rate_per_kg NUMERIC(10,2) NOT NULL,
  previous_rate NUMERIC(10,2),
  rate_change NUMERIC(5,2),
  is_active BOOLEAN DEFAULT TRUE,
  effective_from TIMESTAMPTZ DEFAULT NOW(),
  effective_to TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BOOKINGS
-- ============================================

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID REFERENCES auth.users(id) NOT NULL,
  kabadiwala_id UUID REFERENCES auth.users(id),
  status booking_status DEFAULT 'pending',
  scrap_items JSONB NOT NULL DEFAULT '[]',
  address JSONB,
  address_id UUID REFERENCES addresses(id),
  scheduled_date DATE NOT NULL,
  time_slot JSONB NOT NULL,
  locked_rates JSONB DEFAULT '[]',
  total_estimated_amount NUMERIC(10,2) DEFAULT 0,
  actual_amount NUMERIC(10,2),
  notes TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  arrived_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booking rejections (for matching algorithm)
CREATE TABLE booking_rejections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) NOT NULL,
  kabadiwala_id UUID REFERENCES auth.users(id),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRANSACTIONS & PAYMENTS
-- ============================================

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) UNIQUE NOT NULL,
  household_id UUID REFERENCES auth.users(id) NOT NULL,
  kabadiwala_id UUID REFERENCES auth.users(id) NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  commission_amount NUMERIC(10,2) NOT NULL,
  kabadiwala_payout NUMERIC(10,2) NOT NULL,
  household_payment NUMERIC(10,2) NOT NULL,
  payment_method payment_method DEFAULT 'upi',
  payment_status payment_status DEFAULT 'pending',
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  receipt_url TEXT,
  receipt_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE transaction_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE NOT NULL,
  category_id TEXT REFERENCES scrap_categories(id) NOT NULL,
  category_name TEXT NOT NULL,
  weight_kg NUMERIC(10,3) NOT NULL,
  rate_per_kg NUMERIC(10,2) NOT NULL,
  amount NUMERIC(10,2) NOT NULL
);

-- ============================================
-- LOCATION TRACKING
-- ============================================

CREATE TABLE location_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) NOT NULL,
  kabadiwala_id UUID REFERENCES auth.users(id) NOT NULL,
  lat NUMERIC(10,7) NOT NULL,
  lng NUMERIC(10,7) NOT NULL,
  heading NUMERIC(5,2),
  speed NUMERIC(5,2),
  accuracy NUMERIC(5,2),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RATINGS
-- ============================================

CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) UNIQUE NOT NULL,
  household_id UUID REFERENCES auth.users(id) NOT NULL,
  kabadiwala_id UUID REFERENCES auth.users(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Push notification tokens
CREATE TABLE push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token TEXT NOT NULL,
  platform TEXT DEFAULT 'android',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, token)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_household_profiles_user_id ON household_profiles(user_id);
CREATE INDEX idx_kabadiwala_profiles_user_id ON kabadiwala_profiles(user_id);
CREATE INDEX idx_kabadiwala_profiles_pincodes ON kabadiwala_profiles USING GIN(service_pincodes);
CREATE INDEX idx_kabadiwala_profiles_online ON kabadiwala_profiles(is_online, status);
CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_addresses_pincode ON addresses(pincode);
CREATE INDEX idx_bookings_household_id ON bookings(household_id);
CREATE INDEX idx_bookings_kabadiwala_id ON bookings(kabadiwala_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_scheduled_date ON bookings(scheduled_date);
CREATE INDEX idx_transactions_booking_id ON transactions(booking_id);
CREATE INDEX idx_transactions_kabadiwala_id ON transactions(kabadiwala_id);
CREATE INDEX idx_location_updates_booking ON location_updates(booking_id, timestamp DESC);
CREATE INDEX idx_ratings_kabadiwala ON ratings(kabadiwala_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_rate_cards_active ON rate_cards(is_active, category_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update `updated_at` timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_household_profiles_updated_at
  BEFORE UPDATE ON household_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_kabadiwala_profiles_updated_at
  BEFORE UPDATE ON kabadiwala_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update kabadiwala rating after new rating
CREATE OR REPLACE FUNCTION update_kabadiwala_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE kabadiwala_profiles
  SET rating = (
    SELECT AVG(rating)::NUMERIC(3,2)
    FROM ratings
    WHERE kabadiwala_id = NEW.kabadiwala_id
  )
  WHERE user_id = NEW.kabadiwala_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_kabadiwala_rating
  AFTER INSERT ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_kabadiwala_rating();

-- Update pickup counts after booking completion
CREATE OR REPLACE FUNCTION update_pickup_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Update household stats
    UPDATE household_profiles
    SET total_pickups = total_pickups + 1
    WHERE user_id = NEW.household_id;

    -- Update kabadiwala stats
    UPDATE kabadiwala_profiles
    SET total_pickups = total_pickups + 1
    WHERE user_id = NEW.kabadiwala_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pickup_counts
  AFTER UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_pickup_counts();
