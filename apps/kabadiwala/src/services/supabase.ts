import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://pxasglfdgpdskqfiauxs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4YXNnbGZkZ3Bkc2txZmlhdXhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5MzM3ODYsImV4cCI6MjA5OTUwOTc4Nn0.IukV_j1nMIi9bh-QycVhhZ2ntvrxrlD4K7TcwrGMqvs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
