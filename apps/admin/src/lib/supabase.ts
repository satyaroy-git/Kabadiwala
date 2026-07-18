import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pxasglfdgpdskqfiauxs.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4YXNnbGZkZ3Bkc2txZmlhdXhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzkzMzc4NiwiZXhwIjoyMDk5NTA5Nzg2fQ.FOOPSBb6uzm9g1TbfVSXc9199Jsa_QHpL_b5yVN_GHc';

export const supabase = createClient(supabaseUrl, supabaseKey);
