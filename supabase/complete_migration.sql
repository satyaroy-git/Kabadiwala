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
-- Row Level Security Policies
-- Ensures users can only access their own data

-- Enable RLS on all tables
ALTER TABLE household_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kabadiwala_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrap_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_rejections ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HOUSEHOLD PROFILES
-- ============================================

CREATE POLICY "Users can view own household profile"
  ON household_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own household profile"
  ON household_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own household profile"
  ON household_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Kabadiwalas can view household info for accepted bookings
CREATE POLICY "Kabadiwalas can view household for bookings"
  ON household_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.household_id = household_profiles.user_id
      AND bookings.kabadiwala_id = auth.uid()
      AND bookings.status NOT IN ('cancelled', 'no_show')
    )
  );

-- ============================================
-- KABADIWALA PROFILES
-- ============================================

CREATE POLICY "Users can view own kabadiwala profile"
  ON kabadiwala_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own kabadiwala profile"
  ON kabadiwala_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own kabadiwala profile"
  ON kabadiwala_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Households can view kabadiwala info for their bookings
CREATE POLICY "Households can view assigned kabadiwala"
  ON kabadiwala_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.kabadiwala_id = kabadiwala_profiles.user_id
      AND bookings.household_id = auth.uid()
    )
  );

-- ============================================
-- ADDRESSES
-- ============================================

CREATE POLICY "Users can view own addresses"
  ON addresses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own addresses"
  ON addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
  ON addresses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
  ON addresses FOR DELETE
  USING (auth.uid() = user_id);

-- Kabadiwala can view address for accepted bookings
CREATE POLICY "Kabadiwalas can view booking addresses"
  ON addresses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.address_id = addresses.id
      AND bookings.kabadiwala_id = auth.uid()
      AND bookings.status NOT IN ('pending', 'cancelled')
    )
  );

-- ============================================
-- SCRAP CATEGORIES & RATE CARDS (Public read)
-- ============================================

CREATE POLICY "Anyone can view active categories"
  ON scrap_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view active rate cards"
  ON rate_cards FOR SELECT
  USING (is_active = true);

-- ============================================
-- BOOKINGS
-- ============================================

CREATE POLICY "Households can view own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = household_id);

CREATE POLICY "Households can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = household_id);

CREATE POLICY "Households can cancel own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = household_id);

-- Kabadiwalas can view pending bookings in their area
CREATE POLICY "Kabadiwalas can view available bookings"
  ON bookings FOR SELECT
  USING (
    status = 'pending'
    OR kabadiwala_id = auth.uid()
  );

CREATE POLICY "Kabadiwalas can update assigned bookings"
  ON bookings FOR UPDATE
  USING (kabadiwala_id = auth.uid() OR status = 'pending');

-- ============================================
-- BOOKING REJECTIONS
-- ============================================

CREATE POLICY "Kabadiwalas can create rejections"
  ON booking_rejections FOR INSERT
  WITH CHECK (auth.uid() = kabadiwala_id);

-- ============================================
-- TRANSACTIONS
-- ============================================

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = household_id OR auth.uid() = kabadiwala_id);

CREATE POLICY "System can create transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = kabadiwala_id);

-- ============================================
-- TRANSACTION ITEMS
-- ============================================

CREATE POLICY "Users can view own transaction items"
  ON transaction_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM transactions
      WHERE transactions.id = transaction_items.transaction_id
      AND (transactions.household_id = auth.uid() OR transactions.kabadiwala_id = auth.uid())
    )
  );

-- ============================================
-- LOCATION UPDATES
-- ============================================

CREATE POLICY "Kabadiwalas can insert location updates"
  ON location_updates FOR INSERT
  WITH CHECK (auth.uid() = kabadiwala_id);

-- Households can view location for their bookings
CREATE POLICY "Households can view tracking for their bookings"
  ON location_updates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = location_updates.booking_id
      AND bookings.household_id = auth.uid()
    )
  );

-- ============================================
-- RATINGS
-- ============================================

CREATE POLICY "Households can create ratings"
  ON ratings FOR INSERT
  WITH CHECK (auth.uid() = household_id);

CREATE POLICY "Users can view relevant ratings"
  ON ratings FOR SELECT
  USING (auth.uid() = household_id OR auth.uid() = kabadiwala_id);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- PUSH TOKENS
-- ============================================

CREATE POLICY "Users can manage own push tokens"
  ON push_tokens FOR ALL
  USING (auth.uid() = user_id);
-- Database Functions for Business Logic

-- ============================================
-- CREATE BOOKING (with rate locking)
-- ============================================

CREATE OR REPLACE FUNCTION create_booking(
  p_household_id UUID,
  p_scrap_items JSONB,
  p_address_id UUID,
  p_scheduled_date DATE,
  p_time_slot_id TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_booking_id UUID;
  v_address JSONB;
  v_locked_rates JSONB := '[]'::JSONB;
  v_scrap_items JSONB := '[]'::JSONB;
  v_total_amount NUMERIC := 0;
  v_item JSONB;
  v_rate NUMERIC;
  v_category_name TEXT;
  v_category_icon TEXT;
  v_estimated_amount NUMERIC;
  v_time_slot JSONB;
BEGIN
  -- Get address
  SELECT json_build_object(
    'id', id, 'label', label, 'full_address', full_address,
    'landmark', landmark, 'pincode', pincode, 'city', city,
    'state', state, 'lat', lat, 'lng', lng
  )::JSONB INTO v_address
  FROM addresses
  WHERE id = p_address_id AND user_id = p_household_id;

  IF v_address IS NULL THEN
    RAISE EXCEPTION 'Address not found';
  END IF;

  -- Build time slot
  v_time_slot := CASE p_time_slot_id
    WHEN '09:00' THEN '{"start":"09:00","end":"12:00","label":"Morning (9 AM - 12 PM)"}'::JSONB
    WHEN '12:00' THEN '{"start":"12:00","end":"15:00","label":"Afternoon (12 PM - 3 PM)"}'::JSONB
    WHEN '15:00' THEN '{"start":"15:00","end":"18:00","label":"Evening (3 PM - 6 PM)"}'::JSONB
    WHEN '18:00' THEN '{"start":"18:00","end":"20:00","label":"Late Evening (6 PM - 8 PM)"}'::JSONB
    ELSE '{"start":"09:00","end":"12:00","label":"Morning (9 AM - 12 PM)"}'::JSONB
  END;

  -- Lock current rates and build items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_scrap_items)
  LOOP
    -- Get current rate for this category
    SELECT rc.rate_per_kg, rc.category_name, rc.category_icon
    INTO v_rate, v_category_name, v_category_icon
    FROM rate_cards rc
    WHERE rc.category_id = v_item->>'category_id'
    AND rc.is_active = true
    ORDER BY rc.effective_from DESC
    LIMIT 1;

    IF v_rate IS NULL THEN
      v_rate := 0;
      v_category_name := v_item->>'category_id';
      v_category_icon := '📦';
    END IF;

    v_estimated_amount := (v_item->>'estimated_weight_kg')::NUMERIC * v_rate;
    v_total_amount := v_total_amount + v_estimated_amount;

    -- Build scrap item with locked rate
    v_scrap_items := v_scrap_items || jsonb_build_object(
      'category_id', v_item->>'category_id',
      'category_name', v_category_name,
      'estimated_weight_kg', (v_item->>'estimated_weight_kg')::NUMERIC,
      'actual_weight_kg', NULL,
      'locked_rate_per_kg', v_rate,
      'estimated_amount', v_estimated_amount,
      'actual_amount', NULL
    );

    -- Build locked rates record
    v_locked_rates := v_locked_rates || jsonb_build_object(
      'category_id', v_item->>'category_id',
      'category_name', v_category_name,
      'rate_per_kg', v_rate,
      'locked_at', NOW()
    );
  END LOOP;

  -- Create booking
  INSERT INTO bookings (
    household_id, status, scrap_items, address, address_id,
    scheduled_date, time_slot, locked_rates, total_estimated_amount, notes
  ) VALUES (
    p_household_id, 'pending', v_scrap_items, v_address, p_address_id,
    p_scheduled_date, v_time_slot, v_locked_rates, v_total_amount, p_notes
  )
  RETURNING id INTO v_booking_id;

  -- Return the created booking
  RETURN jsonb_build_object(
    'id', v_booking_id,
    'status', 'pending',
    'total_estimated_amount', v_total_amount,
    'scheduled_date', p_scheduled_date,
    'created', true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SUBMIT WEIGHT ENTRY (Auto-bill generation)
-- ============================================

CREATE OR REPLACE FUNCTION submit_weight_entry(
  p_booking_id UUID,
  p_items JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_booking bookings%ROWTYPE;
  v_total_amount NUMERIC := 0;
  v_commission NUMERIC;
  v_kabadiwala_payout NUMERIC;
  v_transaction_id UUID;
  v_item JSONB;
  v_weight NUMERIC;
  v_rate NUMERIC;
  v_item_amount NUMERIC;
  v_category_name TEXT;
  v_result_items JSONB := '[]'::JSONB;
  v_receipt_number TEXT;
BEGIN
  -- Get booking
  SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id;
  
  IF v_booking IS NULL THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  IF v_booking.status != 'weighing' AND v_booking.status != 'arrived' THEN
    RAISE EXCEPTION 'Booking is not in weighing state';
  END IF;

  -- Calculate amounts for each item
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_weight := (v_item->>'actual_weight_kg')::NUMERIC;
    
    -- Get locked rate from booking
    SELECT (elem->>'locked_rate_per_kg')::NUMERIC, elem->>'category_name'
    INTO v_rate, v_category_name
    FROM jsonb_array_elements(v_booking.scrap_items) AS elem
    WHERE elem->>'category_id' = v_item->>'category_id'
    LIMIT 1;

    IF v_rate IS NULL THEN v_rate := 0; END IF;
    IF v_category_name IS NULL THEN v_category_name := v_item->>'category_id'; END IF;

    v_item_amount := v_weight * v_rate;
    v_total_amount := v_total_amount + v_item_amount;

    v_result_items := v_result_items || jsonb_build_object(
      'category_id', v_item->>'category_id',
      'category_name', v_category_name,
      'weight_kg', v_weight,
      'rate_per_kg', v_rate,
      'amount', v_item_amount
    );
  END LOOP;

  -- Calculate commission (10%, minimum Rs 5)
  v_commission := GREATEST(v_total_amount * 0.10, 5);
  v_kabadiwala_payout := v_total_amount - v_commission;

  -- Generate receipt number
  v_receipt_number := 'KBD-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));

  -- Create transaction
  INSERT INTO transactions (
    booking_id, household_id, kabadiwala_id,
    total_amount, commission_amount, kabadiwala_payout,
    household_payment, payment_method, payment_status, receipt_number
  ) VALUES (
    p_booking_id, v_booking.household_id, v_booking.kabadiwala_id,
    v_total_amount, v_commission, v_kabadiwala_payout,
    v_total_amount, 'upi', 'pending', v_receipt_number
  )
  RETURNING id INTO v_transaction_id;

  -- Create transaction items
  FOR v_item IN SELECT * FROM jsonb_array_elements(v_result_items)
  LOOP
    INSERT INTO transaction_items (
      transaction_id, category_id, category_name, weight_kg, rate_per_kg, amount
    ) VALUES (
      v_transaction_id,
      v_item->>'category_id',
      v_item->>'category_name',
      (v_item->>'weight_kg')::NUMERIC,
      (v_item->>'rate_per_kg')::NUMERIC,
      (v_item->>'amount')::NUMERIC
    );
  END LOOP;

  -- Update booking status
  UPDATE bookings
  SET status = 'payment_pending',
      actual_amount = v_total_amount,
      completed_at = NOW()
  WHERE id = p_booking_id;

  -- Update kabadiwala earnings
  UPDATE kabadiwala_profiles
  SET total_earnings = total_earnings + v_kabadiwala_payout
  WHERE user_id = v_booking.kabadiwala_id;

  -- Update household recycled kg
  UPDATE household_profiles
  SET total_recycled_kg = total_recycled_kg + (
    SELECT SUM((elem->>'weight_kg')::NUMERIC) FROM jsonb_array_elements(v_result_items) AS elem
  )
  WHERE user_id = v_booking.household_id;

  -- Return transaction details
  RETURN jsonb_build_object(
    'transaction_id', v_transaction_id,
    'booking_id', p_booking_id,
    'total_amount', v_total_amount,
    'commission_amount', v_commission,
    'kabadiwala_payout', v_kabadiwala_payout,
    'items', v_result_items,
    'receipt_number', v_receipt_number
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GET EARNINGS SUMMARY
-- ============================================

CREATE OR REPLACE FUNCTION get_earnings_summary(p_kabadiwala_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_today NUMERIC;
  v_week NUMERIC;
  v_month NUMERIC;
  v_total NUMERIC;
  v_total_pickups INTEGER;
  v_total_commission NUMERIC;
  v_pending NUMERIC;
BEGIN
  -- Today
  SELECT COALESCE(SUM(kabadiwala_payout), 0) INTO v_today
  FROM transactions
  WHERE kabadiwala_id = p_kabadiwala_id
  AND payment_status = 'completed'
  AND created_at >= CURRENT_DATE;

  -- This week
  SELECT COALESCE(SUM(kabadiwala_payout), 0) INTO v_week
  FROM transactions
  WHERE kabadiwala_id = p_kabadiwala_id
  AND payment_status = 'completed'
  AND created_at >= DATE_TRUNC('week', CURRENT_DATE);

  -- This month
  SELECT COALESCE(SUM(kabadiwala_payout), 0) INTO v_month
  FROM transactions
  WHERE kabadiwala_id = p_kabadiwala_id
  AND payment_status = 'completed'
  AND created_at >= DATE_TRUNC('month', CURRENT_DATE);

  -- Total
  SELECT COALESCE(SUM(kabadiwala_payout), 0) INTO v_total
  FROM transactions
  WHERE kabadiwala_id = p_kabadiwala_id
  AND payment_status = 'completed';

  -- Total pickups
  SELECT COUNT(*) INTO v_total_pickups
  FROM transactions
  WHERE kabadiwala_id = p_kabadiwala_id
  AND payment_status = 'completed';

  -- Total commission
  SELECT COALESCE(SUM(commission_amount), 0) INTO v_total_commission
  FROM transactions
  WHERE kabadiwala_id = p_kabadiwala_id
  AND payment_status = 'completed';

  -- Pending payout
  SELECT COALESCE(SUM(kabadiwala_payout), 0) INTO v_pending
  FROM transactions
  WHERE kabadiwala_id = p_kabadiwala_id
  AND payment_status = 'pending';

  RETURN jsonb_build_object(
    'today', v_today,
    'this_week', v_week,
    'this_month', v_month,
    'total', v_total,
    'total_pickups', v_total_pickups,
    'total_commission_paid', v_total_commission,
    'pending_payout', v_pending
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FIND NEAREST KABADIWALA (Matching Algorithm)
-- ============================================

CREATE OR REPLACE FUNCTION find_nearest_kabadiwala(
  p_pincode TEXT,
  p_lat NUMERIC,
  p_lng NUMERIC,
  p_booking_id UUID DEFAULT NULL
)
RETURNS TABLE (
  kabadiwala_id UUID,
  name TEXT,
  distance_km NUMERIC,
  rating NUMERIC,
  matching_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    kp.user_id AS kabadiwala_id,
    kp.name,
    -- Haversine distance in km
    (6371 * ACOS(
      COS(RADIANS(p_lat)) * COS(RADIANS(kp.current_lat)) *
      COS(RADIANS(kp.current_lng) - RADIANS(p_lng)) +
      SIN(RADIANS(p_lat)) * SIN(RADIANS(kp.current_lat))
    ))::NUMERIC(10,2) AS distance_km,
    kp.rating,
    -- Matching score: closer + higher rated = better
    (
      (1.0 / NULLIF(6371 * ACOS(
        COS(RADIANS(p_lat)) * COS(RADIANS(kp.current_lat)) *
        COS(RADIANS(kp.current_lng) - RADIANS(p_lng)) +
        SIN(RADIANS(p_lat)) * SIN(RADIANS(kp.current_lat))
      ) + 0.1, 0)) * 0.5
      + (kp.rating / 5.0) * 0.3
      + (LEAST(kp.total_pickups, 100)::NUMERIC / 100.0) * 0.2
    )::NUMERIC(10,4) AS matching_score
  FROM kabadiwala_profiles kp
  WHERE kp.is_online = true
    AND kp.status = 'verified'
    AND p_pincode = ANY(kp.service_pincodes)
    AND kp.current_lat IS NOT NULL
    AND kp.current_lng IS NOT NULL
    -- Exclude kabadiwalas who rejected this booking
    AND (p_booking_id IS NULL OR NOT EXISTS (
      SELECT 1 FROM booking_rejections br
      WHERE br.booking_id = p_booking_id
      AND br.kabadiwala_id = kp.user_id
    ))
    -- Max 5km radius
    AND (6371 * ACOS(
      COS(RADIANS(p_lat)) * COS(RADIANS(kp.current_lat)) *
      COS(RADIANS(kp.current_lng) - RADIANS(p_lng)) +
      SIN(RADIANS(p_lat)) * SIN(RADIANS(kp.current_lat))
    )) <= 5
  ORDER BY matching_score DESC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Seed Data: Scrap Categories and Initial Rate Cards

-- ============================================
-- SCRAP CATEGORIES
-- ============================================

INSERT INTO scrap_categories (id, name, name_hindi, icon, parent_id, description, unit, sort_order) VALUES
-- Paper & Cardboard
('paper-newspaper', 'Newspaper', 'अखबार', '📰', 'paper', 'Old newspapers and magazines', 'kg', 1),
('paper-cardboard', 'Cardboard', 'गत्ता', '📦', 'paper', 'Cardboard boxes and packaging', 'kg', 2),
('paper-books', 'Books / Copies', 'किताबें / कॉपी', '📚', 'paper', 'Old books, notebooks, and copies', 'kg', 3),
-- Metals
('metal-iron', 'Iron', 'लोहा', '🔩', 'metal', 'Iron and steel items', 'kg', 4),
('metal-aluminium', 'Aluminium', 'एल्युमिनियम', '🥫', 'metal', 'Aluminium cans, foil, and items', 'kg', 5),
('metal-copper', 'Copper', 'तांबा', '🔌', 'metal', 'Copper wires and items', 'kg', 6),
('metal-brass', 'Brass', 'पीतल', '🔔', 'metal', 'Brass utensils and items', 'kg', 7),
-- Plastic
('plastic-bottles', 'Plastic Bottles', 'प्लास्टिक बोतल', '🧴', 'plastic', 'PET bottles and containers', 'kg', 8),
('plastic-hard', 'Hard Plastic', 'कड़ा प्लास्टिक', '🪣', 'plastic', 'Buckets, chairs, and hard plastic', 'kg', 9),
('plastic-soft', 'Soft Plastic / Covers', 'पॉलीथीन', '🛍️', 'plastic', 'Polythene bags and soft plastic', 'kg', 10),
-- Glass
('glass-bottles', 'Glass Bottles', 'कांच की बोतलें', '🍾', 'glass', 'Glass bottles and jars', 'kg', 11),
-- E-waste
('ewaste-mobile', 'Old Mobile Phones', 'पुराना मोबाइल', '📱', 'ewaste', 'Old or broken mobile phones', 'piece', 12),
('ewaste-laptop', 'Laptops / Computers', 'लैपटॉप / कंप्यूटर', '💻', 'ewaste', 'Old laptops, desktops, and parts', 'piece', 13),
('ewaste-appliances', 'Small Appliances', 'छोटे उपकरण', '🔌', 'ewaste', 'Mixers, irons, fans, etc.', 'piece', 14),
('ewaste-batteries', 'Batteries', 'बैटरी', '🔋', 'ewaste', 'All types of batteries', 'kg', 15),
-- Miscellaneous
('misc-clothes', 'Old Clothes', 'पुराने कपड़े', '👕', 'misc', 'Old clothes and fabric', 'kg', 16),
('misc-tyres', 'Rubber / Tyres', 'रबर / टायर', '🛞', 'misc', 'Old tyres and rubber items', 'kg', 17);

-- ============================================
-- INITIAL RATE CARDS (INR per kg/piece)
-- ============================================

INSERT INTO rate_cards (category_id, category_name, category_icon, rate_per_kg, sort_order) VALUES
('paper-newspaper', 'Newspaper', '📰', 14.00, 1),
('paper-cardboard', 'Cardboard', '📦', 8.00, 2),
('paper-books', 'Books / Copies', '📚', 12.00, 3),
('metal-iron', 'Iron', '🔩', 28.00, 4),
('metal-aluminium', 'Aluminium', '🥫', 105.00, 5),
('metal-copper', 'Copper', '🔌', 425.00, 6),
('metal-brass', 'Brass', '🔔', 305.00, 7),
('plastic-bottles', 'Plastic Bottles', '🧴', 10.00, 8),
('plastic-hard', 'Hard Plastic', '🪣', 15.00, 9),
('plastic-soft', 'Soft Plastic / Covers', '🛍️', 5.00, 10),
('glass-bottles', 'Glass Bottles', '🍾', 3.00, 11),
('ewaste-mobile', 'Old Mobile Phones', '📱', 50.00, 12),
('ewaste-laptop', 'Laptops / Computers', '💻', 200.00, 13),
('ewaste-appliances', 'Small Appliances', '🔌', 25.00, 14),
('ewaste-batteries', 'Batteries', '🔋', 60.00, 15),
('misc-clothes', 'Old Clothes', '👕', 2.00, 16),
('misc-tyres', 'Rubber / Tyres', '🛞', 8.00, 17);
-- Enable Realtime for specific tables

-- Location updates (for live tracking)
ALTER PUBLICATION supabase_realtime ADD TABLE location_updates;

-- Bookings (for status change notifications)
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;

-- Notifications (for push notification display)
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
