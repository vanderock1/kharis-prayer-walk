import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// URL polyfill is not needed in this environment
// Expo handles this internally

const SUPABASE_URL = 'https://tkkvmltjlgeddykvzyrj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRra3ZtbHRqbGdlZGR5a3Z6eXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4NDc3ODksImV4cCI6MjA1ODQyMzc4OX0.BeFX3S50CsE0fPqwdqzFW1y2wuOOOD9yRWs8MnxMdVY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});