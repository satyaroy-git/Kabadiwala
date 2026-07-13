-- Enable Realtime for specific tables

-- Location updates (for live tracking)
ALTER PUBLICATION supabase_realtime ADD TABLE location_updates;

-- Bookings (for status change notifications)
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;

-- Notifications (for push notification display)
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
