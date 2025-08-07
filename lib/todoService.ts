import { supabase } from './supabaseClient'
import { Todo, TodoWithAssignments } from './types'

export const todoService = {
  // Fetch all todos
  async getTodos(): Promise<Todo[]> {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Fetch todos by project
  async getTodosByProject(projectId: string): Promise<Todo[]> {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Fetch todos with assignments
  async getTodosWithAssignments(): Promise<TodoWithAssignments[]> {
    const { data, error } = await supabase
      .from('todos')
      .select(`
        *,
        assignments:todo_assignments(
          id,
          user_id,
          assigned_at
        ),
        assigned_users:todo_assignments(
          user:users(
            id,
            name,
            email,
            avatar_url
          )
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return (data || []).map(todo => ({
      ...todo,
      assignments: todo.assignments || [],
      assigned_users: (todo.assigned_users || []).map((assignment: any) => assignment.user)
    }))
  },

  // Create a new todo
  async createTodo(todo: Omit<Todo, 'id' | 'created_at' | 'updated_at'>): Promise<Todo> {
    const { data, error } = await supabase
      .from('todos')
      .insert([todo])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update a todo
  async updateTodo(id: string, updates: Partial<Todo>): Promise<Todo> {
    const { data, error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete a todo
  async deleteTodo(id: string): Promise<void> {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}
