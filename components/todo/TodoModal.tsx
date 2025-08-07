'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TodoForm } from './TodoForm'
import { UserAssignment } from './UserAssignment'
import { Priority, Status, User, Todo } from '@/lib/types'
import { X } from 'lucide-react'
import { userService } from '@/lib/userService'

interface TodoModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: {
    project_id: string
    title: string
    description: string
    due_date: string
    priority: Priority
    status: Status
  }) => Promise<Todo>
  mode: 'add' | 'edit'
  initialData?: {
    project_id: string
    title: string
    description: string
    due_date: string
    priority: Priority
    status: Status
  }
  selectedProjectId?: string
  todoId?: string
  assignedUsers?: User[]
  onAssignmentChange?: (userIds: string[]) => void
  onAssignmentsSaved?: () => void // <-- add this
}

export function TodoModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  mode, 
  initialData, 
  selectedProjectId,
  todoId: propTodoId,
  assignedUsers = [],
  onAssignmentChange,
  onAssignmentsSaved
}: TodoModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'assignments'>('details')
  const [createdTodoId, setCreatedTodoId] = useState<string | undefined>(propTodoId)
  const [localAssignedUsers, setLocalAssignedUsers] = useState<User[]>(assignedUsers)
  const [showModal, setShowModal] = useState(isOpen)

  // Fetch latest assigned users when opening assignments tab or modal
  useEffect(() => {
    const fetchAssignedUsers = async () => {
      if (createdTodoId) {
        const assignments = await userService.getTodoAssignments(createdTodoId)
        if (assignments.length > 0) {
          // Fetch user details for assigned users
          const allUsers = await userService.getUsers()
          const assigned = allUsers.filter(u => assignments.some(a => a.user_id === u.id))
          setLocalAssignedUsers(assigned)
        } else {
          setLocalAssignedUsers([])
        }
      }
    }
    if ((activeTab === 'assignments' && createdTodoId) || (isOpen && mode === 'edit' && createdTodoId)) {
      fetchAssignedUsers()
    }
  }, [activeTab, isOpen, createdTodoId, mode])

  useEffect(() => {
    if (propTodoId) setCreatedTodoId(propTodoId)
  }, [propTodoId])

  useEffect(() => {
    setShowModal(isOpen)
    if (!isOpen) {
      setActiveTab('details')
      setCreatedTodoId(propTodoId)
    }
  }, [isOpen, propTodoId])

  if (!showModal) return null

  const handleSubmit = async (formData: {
    project_id: string
    title: string
    description: string
    due_date: string
    priority: Priority
    status: Status
  }) => {
    if (mode === 'add') {
      const todo = await onSubmit(formData)
      setCreatedTodoId(todo.id)
      setActiveTab('assignments')
    } else {
      await onSubmit(formData)
      onClose()
    }
  }

  // This will be called by UserAssignment after saving assignments
  const handleAssignmentSaveAndClose = async (userIds: string[]) => {
    if (createdTodoId) {
      await userService.assignUsersToTodo(createdTodoId, userIds)
      // Fetch updated assigned users
      const allUsers = await userService.getUsers()
      const assigned = allUsers.filter(u => userIds.includes(u.id))
      setLocalAssignedUsers(assigned)
    }
    if (onAssignmentsSaved) onAssignmentsSaved();
    setShowModal(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <Card className="relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>
              {mode === 'add' && !createdTodoId ? 'Add New Todo' : 'Edit Todo'}
            </CardTitle>
            <CardDescription>
              {mode === 'add' && !createdTodoId
                ? 'Create a new todo item with all the necessary details.'
                : 'Update the todo item details or assign users.'}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        {/* Tab Navigation */}
        <div className="flex border-b px-6">
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('details')}
            disabled={mode === 'add' && !!createdTodoId}
          >
            Details
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'assignments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('assignments')}
            disabled={mode === 'add' && !createdTodoId}
          >
            Assignments
          </button>
        </div>
        <CardContent className="pb-6">
          {activeTab === 'details' ? (
            <TodoForm
              mode={createdTodoId ? 'edit' : mode}
              initialData={initialData}
              onSubmit={handleSubmit}
              onCancel={onClose}
              selectedProjectId={selectedProjectId}
            />
          ) : (
            createdTodoId && (
              <UserAssignment
                todoId={createdTodoId}
                assignedUsers={localAssignedUsers}
                onAssignmentChange={handleAssignmentSaveAndClose}
              />
            )
          )}
        </CardContent>
      </Card>
    </div>
  )
}
