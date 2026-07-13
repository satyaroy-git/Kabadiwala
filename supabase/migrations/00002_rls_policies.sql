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
