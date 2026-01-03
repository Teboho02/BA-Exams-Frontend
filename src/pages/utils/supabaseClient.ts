import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://fvtlhnrmnnnqgefpxdbu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2dGxobnJtbm5ucWdlZnB4ZGJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MjQ3OTAsImV4cCI6MjA3MDAwMDc5MH0.8eKQvkrkZsLUTRPAl-ODtq34Oo5PiEPs1-VZug7kcN4'
);
