-- Chat Messages table for in-app messaging between Household and Kabadiwala

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) NOT NULL,
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_chat_messages_booking ON chat_messages(booking_id, created_at);
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id);

-- RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages for their bookings
CREATE POLICY "Users can view chat for their bookings"
  ON chat_messages FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = chat_messages.booking_id
      AND (bookings.household_id = auth.uid() OR bookings.kabadiwala_id = auth.uid())
    )
  );

-- Users can send messages for their bookings
CREATE POLICY "Users can send chat messages"
  ON chat_messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_id
      AND (bookings.household_id = auth.uid() OR bookings.kabadiwala_id = auth.uid())
    )
  );

-- Enable Realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
