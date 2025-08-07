import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTables() {
  try {
    console.log('Creating missing tables...')
    
    // Create users table
    const { error: usersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          avatar_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (usersError) {
      console.log('Users table creation error:', usersError)
      console.log('Please run this SQL manually in your Supabase SQL Editor:')
      console.log(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          avatar_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `)
    } else {
      console.log('Users table created successfully!')
    }
    
    // Create todo_assignments table
    const { error: assignmentsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS todo_assignments (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          todo_id UUID NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(todo_id, user_id)
        );
      `
    })
    
    if (assignmentsError) {
      console.log('Todo assignments table creation error:', assignmentsError)
      console.log('Please run this SQL manually in your Supabase SQL Editor:')
      console.log(`
        CREATE TABLE IF NOT EXISTS todo_assignments (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          todo_id UUID NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(todo_id, user_id)
        );
      `)
    } else {
      console.log('Todo assignments table created successfully!')
    }
    
    // Create indexes
    const { error: indexesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_todo_assignments_todo_id ON todo_assignments(todo_id);
        CREATE INDEX IF NOT EXISTS idx_todo_assignments_user_id ON todo_assignments(user_id);
      `
    })
    
    if (indexesError) {
      console.log('Indexes creation error:', indexesError)
    } else {
      console.log('Indexes created successfully!')
    }
    
    // Enable RLS
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
        ALTER TABLE todo_assignments ENABLE ROW LEVEL SECURITY;
      `
    })
    
    if (rlsError) {
      console.log('RLS enable error:', rlsError)
    } else {
      console.log('RLS enabled successfully!')
    }
    
    // Create policies
    const { error: policiesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Allow all operations on users" ON users
          FOR ALL USING (true);
        
        CREATE POLICY "Allow all operations on todo_assignments" ON todo_assignments
          FOR ALL USING (true);
      `
    })
    
    if (policiesError) {
      console.log('Policies creation error:', policiesError)
    } else {
      console.log('Policies created successfully!')
    }
    
    // Insert default users
    const { error: insertUsersError } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO users (id, name, email) VALUES
          ('11111111-1111-1111-1111-111111111111', 'John Doe', 'john@example.com'),
          ('22222222-2222-2222-2222-222222222222', 'Jane Smith', 'jane@example.com'),
          ('33333333-3333-3333-3333-333333333333', 'Mike Johnson', 'mike@example.com')
        ON CONFLICT (id) DO NOTHING;
      `
    })
    
    if (insertUsersError) {
      console.log('Default users insertion error:', insertUsersError)
    } else {
      console.log('Default users inserted successfully!')
    }
    
    console.log('Table creation completed!')
    
  } catch (error) {
    console.error('Error creating tables:', error)
  }
}

createTables()
