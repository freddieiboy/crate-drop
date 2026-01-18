import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://nvuahdzwnykzklwlskjh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52dWFoZHp3bnlremtsd2xza2poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MTk3MjAsImV4cCI6MjA4NDI5NTcyMH0.6bTUr_OYIKFFivO-f9xJXThJ9YDDupMhfke72jdiKjo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
