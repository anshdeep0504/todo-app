'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { UserWithTodos, Todo } from '@/lib/types'
import { userService } from '@/lib/userService'

export function UserAssignmentTable() {
  const [usersWithTodos, setUsersWithTodos] = useState<UserWithTodos[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUsersWithTodos()
  }, [])

  const loadUsersWithTodos = async () => {
    try {
      const data = await userService.getUsersWithTodos()
      setUsersWithTodos(data)
    } catch (error) {
      console.error('Error loading users with todos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: 'secondary' as const,
      in_progress: 'default' as const,
      completed: 'outline' as const,
    }
    return (
      <Badge variant={statusMap[status as keyof typeof statusMap] || 'secondary'} className="px-2 py-1 text-xs font-medium">
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const priorityMap = {
      high: 'destructive' as const,
      medium: 'default' as const,
      low: 'secondary' as const,
    }
    return (
      <Badge variant={priorityMap[priority as keyof typeof priorityMap] || 'secondary'} className="px-2 py-1 text-xs font-medium">
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    )
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading user assignments...</div>
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold mb-4">User Task Assignments</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {usersWithTodos.map((user) => {
          const pendingTasks = user.todos.filter(todo => todo.status === 'pending')
          const inProgressTasks = user.todos.filter(todo => todo.status === 'in_progress')
          const completedTasks = user.todos.filter(todo => todo.status === 'completed')

          return (
            <div key={user.id} className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-4 border border-slate-100">
              <div className="flex items-center gap-4 mb-2">
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.name}
                    className="w-12 h-12 rounded-full border"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-semibold text-lg text-slate-900">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-lg font-bold">
                    {user.todos.length}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">Total Tasks</span>
                </div>
              </div>
              <div>
                <div className="font-medium text-slate-700 mb-1">Assigned Tasks:</div>
                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                  {user.todos.length === 0 ? (
                    <span className="text-sm text-gray-400">No tasks assigned</span>
                  ) : (
                    user.todos.map((todo) => (
                      <div key={todo.id} className="flex items-center gap-2 bg-slate-50 rounded px-3 py-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{todo.title}</div>
                          {todo.description && (
                            <div className="text-xs text-gray-500 truncate">{todo.description}</div>
                          )}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          {getPriorityBadge(todo.priority)}
                          {getStatusBadge(todo.status)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {pendingTasks.length} Pending
                </Badge>
                <Badge variant="default" className="text-xs">
                  {inProgressTasks.length} In Progress
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {completedTasks.length} Completed
                </Badge>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
