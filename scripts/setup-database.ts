import { createClient } from '@supabase/supabase-js'

console.log('Environment variables loaded:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET')
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  console.error('Please check your .env.local file contains:')
  console.error('NEXT_PUBLIC_SUPABASE_URL=your_project_url')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupDatabase() {
  try {
    console.log('Setting up database schema...')
    
    // First, let's check if the projects table already exists
    const { data: existingProjects, error: checkProjectsError } = await supabase
      .from('projects')
      .select('count')
      .limit(1)
    
    if (checkProjectsError && checkProjectsError.code === 'PGRST116') {
      console.log('Projects table does not exist. You need to create it manually in your Supabase dashboard.')
      console.log('Please run the following SQL in your Supabase SQL Editor:')
      console.log(`
-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create todos table with project reference
CREATE TABLE IF NOT EXISTS todos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create todo_assignments table for many-to-many relationship
CREATE TABLE IF NOT EXISTS todo_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    todo_id UUID NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(todo_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_todos_project_id ON todos(project_id);
CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority);
CREATE INDEX IF NOT EXISTS idx_todos_status ON todos(status);
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);
CREATE INDEX IF NOT EXISTS idx_todo_assignments_todo_id ON todo_assignments(todo_id);
CREATE INDEX IF NOT EXISTS idx_todo_assignments_user_id ON todo_assignments(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies that allow all operations (you can modify this based on your auth requirements)
CREATE POLICY "Allow all operations on projects" ON projects
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on todos" ON todos
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on users" ON users
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on todo_assignments" ON todo_assignments
    FOR ALL USING (true);

-- Insert a default project
INSERT INTO projects (id, name, description, color) 
VALUES ('00000000-0000-0000-0000-000000000000', 'Default Project', 'Your default project', '#3B82F6')
ON CONFLICT (id) DO NOTHING;

-- Insert some default users
INSERT INTO users (id, name, email) VALUES
    ('11111111-1111-1111-1111-111111111111', 'John Doe', 'john@example.com'),
    ('22222222-2222-2222-2222-222222222222', 'Jane Smith', 'jane@example.com'),
    ('33333333-3333-3333-3333-333333333333', 'Mike Johnson', 'mike@example.com')
ON CONFLICT (id) DO NOTHING;
      `)
      return
    }
    
    console.log('Projects table exists! Checking for new tables...')
    
    // Check if users table exists
    const { data: existingUsers, error: checkUsersError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (checkUsersError && checkUsersError.code === 'PGRST116') {
      console.log('Users table does not exist. You need to create it manually in your Supabase dashboard.')
      console.log('Please run the following SQL in your Supabase SQL Editor:')
      console.log(`
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create todo_assignments table for many-to-many relationship
CREATE TABLE IF NOT EXISTS todo_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    todo_id UUID NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(todo_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_todo_assignments_todo_id ON todo_assignments(todo_id);
CREATE INDEX IF NOT EXISTS idx_todo_assignments_user_id ON todo_assignments(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies that allow all operations (you can modify this based on your auth requirements)
CREATE POLICY "Allow all operations on users" ON users
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on todo_assignments" ON todo_assignments
    FOR ALL USING (true);

-- Insert some default users
INSERT INTO users (id, name, email) VALUES
    ('11111111-1111-1111-1111-111111111111', 'John Doe', 'john@example.com'),
    ('22222222-2222-2222-2222-222222222222', 'Jane Smith', 'jane@example.com'),
    ('33333333-3333-3333-3333-333333333333', 'Mike Johnson', 'mike@example.com')
ON CONFLICT (id) DO NOTHING;
      `)
      return
    }
    
    console.log('All tables exist! Inserting sample data...')
    
    // First, ensure the default project exists
    const { data: defaultProject, error: defaultProjectError } = await supabase
      .from('projects')
      .upsert({
        id: '00000000-0000-0000-0000-000000000000',
        name: 'Default Project',
        description: 'Your default project',
        color: '#3B82F6'
      }, { onConflict: 'id' })
      .select()
      .single()
    
    if (defaultProjectError) {
      console.error('Error creating default project:', defaultProjectError)
      return
    }
    
    console.log('Default project created/updated successfully!')
    
    // Insert additional sample projects (without specifying ID to let database generate them)
    const additionalProjects = [
      {
        name: 'Work Tasks',
        description: 'Tasks related to work and professional development',
        color: '#10B981'
      },
      {
        name: 'Personal Goals',
        description: 'Personal goals and self-improvement tasks',
        color: '#F59E0B'
      },
      {
        name: 'Home Projects',
        description: 'Tasks around the house and home improvement',
        color: '#EF4444'
      }
    ]
    
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .insert(additionalProjects)
      .select()
    
    if (projectsError) {
      console.error('Error inserting additional projects:', projectsError)
      return
    }
    
    console.log('Additional sample projects inserted successfully!')
    
    // Insert sample todos
    const sampleTodos = [
      {
        project_id: '00000000-0000-0000-0000-000000000000',
        title: 'Complete project setup',
        description: 'Set up the Next.js project with Supabase integration',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'high',
        status: 'in_progress'
      },
      {
        project_id: '00000000-0000-0000-0000-000000000000',
        title: 'Review documentation',
        description: 'Go through the project documentation and make improvements',
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'medium',
        status: 'pending'
      },
      {
        project_id: '00000000-0000-0000-0000-000000000000',
        title: 'Write tests',
        description: 'Add unit tests for the todo functionality',
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'low',
        status: 'pending'
      }
    ]
    
    const { data: todosData, error: todosError } = await supabase
      .from('todos')
      .insert(sampleTodos)
      .select()
    
    if (todosError) {
      console.error('Error inserting sample todos:', todosError)
      return
    }
    
    console.log('Sample todos inserted successfully!')
    console.log('You can now visit the app to see your projects and todos.')
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

setupDatabase()
