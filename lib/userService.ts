import { supabase } from './supabaseClient'
import { User, TodoAssignment, TodoWithAssignments, UserWithTodos } from './types'

export const userService = {
  // Fetch all users
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  // Create a new user
  async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update a user
  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete a user
  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Assign users to a todo
  async assignUsersToTodo(todoId: string, userIds: string[]): Promise<void> {
    // First, remove all existing assignments for this todo
    const { error: deleteError } = await supabase
      .from('todo_assignments')
      .delete()
      .eq('todo_id', todoId)
    
    if (deleteError) throw deleteError

    // Then, create new assignments
    if (userIds.length > 0) {
      const assignments = userIds.map(userId => ({
        todo_id: todoId,
        user_id: userId
      }))

      const { error: insertError } = await supabase
        .from('todo_assignments')
        .insert(assignments)
      
      if (insertError) throw insertError
    }
  },

  // Get todos with their assignments
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

  // Get users with their assigned todos
  async getUsersWithTodos(): Promise<UserWithTodos[]> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        assignments:todo_assignments(
          todo:todos(
            id,
            title,
            description,
            due_date,
            priority,
            status,
            project_id
          )
        )
      `)
      .order('name', { ascending: true })
    
    if (error) throw error
    
    return (data || []).map(user => ({
      ...user,
      todos: (user.assignments || []).map((assignment: any) => assignment.todo)
    }))
  },

  // Get assignments for a specific todo
  async getTodoAssignments(todoId: string): Promise<TodoAssignment[]> {
    const { data, error } = await supabase
      .from('todo_assignments')
      .select('*')
      .eq('todo_id', todoId)
    
    if (error) throw error
    return data || []
  }
}
