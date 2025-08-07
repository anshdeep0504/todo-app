'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Todo, Priority, Status, User } from '@/lib/types'
import { Edit, Trash2, Users } from 'lucide-react'
import { TodoModal } from './TodoModal'

interface TodoItemProps {
  todo: Todo
  assignedUsers?: User[]
  onUpdate: (todo: Todo) => void
  onDelete: (id: string) => void
  onAssignmentChange?: (userIds: string[]) => void
}

export function TodoItem({ todo, assignedUsers = [], onUpdate, onDelete, onAssignmentChange }: TodoItemProps) {
  const [showEditModal, setShowEditModal] = useState(false)

  const getPriorityBadge = (priority: Priority) => {
    const priorityMap = {
      high: 'destructive' as const,
      medium: 'default' as const,
      low: 'secondary' as const,
    }
    
    return (
      <Badge variant={priorityMap[priority]} className="px-2 py-1 text-xs font-medium">
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    )
  }

  const getStatusBadge = (status: Status) => {
    const statusMap = {
      pending: 'secondary' as const,
      in_progress: 'default' as const,
      completed: 'outline' as const,
    }
    
    return (
      <Badge variant={statusMap[status]} className="px-2 py-1 text-xs font-medium">
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
      </Badge>
    )
  }

  const getDueDateBadge = (dueDate: string | null) => {
    if (!dueDate) {
      return (
        <Badge variant="outline" className="px-2 py-1 text-xs font-medium">
          No due date
        </Badge>
      )
    }
    
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return (
        <Badge variant="destructive" className="px-2 py-1 text-xs font-medium">
          Overdue
        </Badge>
      )
    } else if (diffDays === 0) {
      return (
        <Badge variant="default" className="px-2 py-1 text-xs font-medium">
          Due today
        </Badge>
      )
    } else if (diffDays <= 3) {
      return (
        <Badge variant="secondary" className="px-2 py-1 text-xs font-medium">
          Due soon
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="px-2 py-1 text-xs font-medium">
          On track
        </Badge>
      )
    }
  }

  const handleUpdate = (formData: {
    project_id: string
    title: string
    description: string
    due_date: string
    priority: Priority
    status: Status
  }) => {
    onUpdate({ ...todo, ...formData })
    setShowEditModal(false)
  }

  return (
    <>
      <TodoModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdate}
        mode="edit"
        initialData={{
          project_id: todo.project_id,
          title: todo.title,
          description: todo.description || '',
          due_date: todo.due_date || '',
          priority: todo.priority,
          status: todo.status
        }}
        todoId={todo.id}
        assignedUsers={assignedUsers}
        onAssignmentChange={onAssignmentChange}
        onAssignmentsSaved={onAssignmentChange ? () => onAssignmentChange([]) : undefined} // This will trigger parent reload
      />
      
      <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-all duration-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-semibold text-slate-900 pr-4">{todo.title}</h3>
              <div className="flex gap-1 flex-shrink-0">
                {getPriorityBadge(todo.priority)}
                {getStatusBadge(todo.status)}
                {getDueDateBadge(todo.due_date)}
              </div>
            </div>
            
            {todo.description && (
              <p className="text-slate-600 mb-4 leading-relaxed">{todo.description}</p>
            )}

            {/* Assigned Users */}
            {assignedUsers.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Assigned to:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {assignedUsers.map((user) => (
                    <Badge key={user.id} variant="secondary" className="flex items-center gap-1">
                      {user.avatar_url ? (
                        <img 
                          src={user.avatar_url} 
                          alt={user.name}
                          className="w-3 h-3 rounded-full"
                        />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-slate-300 flex items-center justify-center">
                          <span className="text-xs text-slate-600">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      {user.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <div>
                <span className="font-medium">Due Date:</span>{' '}
                {todo.due_date ? new Date(todo.due_date).toLocaleDateString() : 'Not set'}
              </div>
              <div>
                <span className="font-medium">Created:</span>{' '}
                {new Date(todo.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <div className="flex gap-1 ml-4 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowEditModal(true)}
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(todo.id)}
              className="text-red-600 hover:text-red-800 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
