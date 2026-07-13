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
