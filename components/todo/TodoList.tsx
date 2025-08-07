'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { TodoItem } from './TodoItem'
import { TodoModal } from './TodoModal'
import { Todo, Priority, Status, TodoWithAssignments } from '@/lib/types'
import { Plus, CheckSquare } from 'lucide-react'
import { todoService } from '@/lib/todoService'

interface TodoListProps {
  todos: Todo[]
  onUpdate: (todo: Todo) => void
  onDelete: (id: string) => void
  onAdd: (formData: {
    project_id: string
    title: string
    description: string
    due_date: string
    priority: Priority
    status: Status
    assignedUserIds?: string[]
  }) => Promise<Todo>
  sortBy: 'priority' | 'due_date' | 'created_at' | 'status'
  onSortChange: (sortBy: 'priority' | 'due_date' | 'created_at' | 'status') => void
  selectedProjectId?: string
  projectName?: string
}

export function TodoList({ 
  todos, 
  onUpdate, 
  onDelete, 
  onAdd, 
  sortBy, 
  onSortChange,
  selectedProjectId,
  projectName
}: TodoListProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [todosWithAssignments, setTodosWithAssignments] = useState<TodoWithAssignments[]>([])

  useEffect(() => {
    loadTodosWithAssignments()
  }, [todos])

  const loadTodosWithAssignments = async () => {
    try {
      const todosWithAssignments = await todoService.getTodosWithAssignments()
      // Filter by current project if selectedProjectId is provided
      const filteredTodos = selectedProjectId 
        ? todosWithAssignments.filter(todo => todo.project_id === selectedProjectId)
        : todosWithAssignments
      setTodosWithAssignments(filteredTodos)
    } catch (error) {
      console.error('Error loading todos with assignments:', error)
    }
  }

  const handleAssignmentChange = async (todoId: string, userIds: string[]) => {
    // Reload assignments after change
    await loadTodosWithAssignments()
  }

  const sortOptions = [
    { value: 'created_at', label: 'Latest First' },
    { value: 'priority', label: 'By Priority' },
    { value: 'status', label: 'By Status' },
    { value: 'due_date', label: 'By Due Date' },
  ] as const

  // Replace onAdd with a local handler
  const handleAdd = async (formData: {
    project_id: string
    title: string
    description: string
    due_date: string
    priority: Priority
    status: Status
    assignedUserIds?: string[]
  }) => {
    // Remove assignedUserIds before creating todo
    const { assignedUserIds, ...todoData } = formData
    const todo = await todoService.createTodo(todoData)
    await loadTodosWithAssignments()
    return todo
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {projectName ? `${projectName} - Todos` : 'Todo Management'}
            </h1>
            <p className="text-slate-600 mt-2">
              {projectName 
                ? `Manage todos for ${projectName}` 
                : 'Manage your tasks efficiently with our modern interface'
              }
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            variant="default"
            size="lg"
            className="inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Todo
          </Button>
        </div>

        {/* Sort Controls */}
        <div className="flex gap-3">
          {sortOptions.map((option) => (
            <Button
              key={option.value}
              onClick={() => onSortChange(option.value)}
              variant={sortBy === option.value ? "default" : "outline"}
              size="sm"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Todo Modal */}
      <TodoModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAdd}
        mode="add"
        selectedProjectId={selectedProjectId}
        onAssignmentsSaved={loadTodosWithAssignments}
      />

      {/* Todo Items */}
      <div className="space-y-4">
        {todosWithAssignments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <CheckSquare className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No todos yet</h3>
            <p className="text-slate-600 mb-6">
              {projectName 
                ? `Get started by creating your first todo in ${projectName}.`
                : 'Get started by creating your first todo item.'
              }
            </p>
            <Button
              onClick={() => setShowAddModal(true)}
              variant="default"
              size="lg"
            >
              Create Your First Todo
            </Button>
          </div>
        ) : (
          todosWithAssignments.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              assignedUsers={todo.assigned_users}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onAssignmentChange={(userIds) => handleAssignmentChange(todo.id, userIds)}
            />
          ))
        )}
      </div>
    </div>
  )
}
