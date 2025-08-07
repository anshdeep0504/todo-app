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
