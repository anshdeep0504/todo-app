import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zdzhihekhvquncmjkyve.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkemhpaGVraHZxdW5jbWpreXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczOTQ0NzQsImV4cCI6MjA3Mjk3MDQ3NH0.DtBC735n6zr_iEvUqoaMSYFSAyQ9Xd2-LSGdj02ALJA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


