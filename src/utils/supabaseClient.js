import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tvotvvalqctfuyylkzrz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2b3R2dmFscWN0ZnV5eWxrenJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNTMyODAsImV4cCI6MjA5MDYyOTI4MH0.sHQYj-vXW-W1Lbm-sEgMZGFHoAM3y0hhAvN0Ic5O604'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
