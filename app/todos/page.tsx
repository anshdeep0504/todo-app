'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Todo } from '@/lib/types'

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTodos() {
      try {
        const { data, error } = await supabase
          .from('todos')
          .select('*')
          .order('created_at', { ascending: false })
          
        if (error) {
          throw error
        }

        setTodos(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchTodos()
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) return <div className="p-4">Loading todos...</div>
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Todos</h1>
      <div className="grid gap-4">
        {todos.map((todo) => (
          <div key={todo.id} className="border p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h2 className="font-semibold text-lg">{todo.title}</h2>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(todo.priority)}`}>
                {todo.priority}
              </span>
            </div>
            {todo.description && (
              <p className="text-gray-600 mb-2">{todo.description}</p>
            )}
            <div className="flex justify-between items-center text-sm text-gray-500">
              {todo.due_date && (
                <span>Due: {new Date(todo.due_date).toLocaleDateString()}</span>
              )}
              <span>Created: {new Date(todo.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        {todos.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No todos found. Create your first todo!
          </div>
        )}
      </div>
    </div>
  )
}
