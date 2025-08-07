export interface Project {
  id: string
  name: string
  description: string | null
  color: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  name: string
  email: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Todo {
  id: string
  project_id: string
  title: string
  description: string | null
  due_date: string | null
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'completed'
  created_at: string
  updated_at: string
}

export interface TodoAssignment {
  id: string
  todo_id: string
  user_id: string
  assigned_at: string
}

export interface TodoWithAssignments extends Todo {
  assignments: TodoAssignment[]
  assigned_users: User[]
}

export interface UserWithTodos extends User {
  todos: Todo[]
}

export type Priority = 'low' | 'medium' | 'high'
export type Status = 'pending' | 'in_progress' | 'completed'
