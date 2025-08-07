'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User } from '@/lib/types'
import { userService } from '@/lib/userService'

interface UserAssignmentProps {
  todoId: string
  assignedUsers: User[]
  onAssignmentChange: (userIds: string[]) => void
}

export function UserAssignment({ todoId, assignedUsers, onAssignmentChange }: UserAssignmentProps) {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    setSelectedUsers(assignedUsers.map(user => user.id))
  }, [assignedUsers])

  const loadUsers = async () => {
    try {
      const data = await userService.getUsers()
      setUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const handleUserToggle = (userId: string) => {
    const newSelectedUsers = selectedUsers.includes(userId)
      ? selectedUsers.filter(id => id !== userId)
      : [...selectedUsers, userId]
    
    setSelectedUsers(newSelectedUsers)
    // Removed: onAssignmentChange(newSelectedUsers)
  }

  const handleSaveAssignments = async () => {
    setIsLoading(true)
    try {
      await userService.assignUsersToTodo(todoId, selectedUsers)
      alert('Assignments saved successfully!')
      onAssignmentChange(selectedUsers) // In edit mode, this should reload assignments; in add mode, it closes the modal
    } catch (error) {
      alert('Error saving assignments!')
      console.error('Error saving assignments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-medium">Assigned Users:</h4>
        {assignedUsers.length === 0 && (
          <Badge variant="secondary">No assignments</Badge>
        )}
      </div>

      {assignedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {assignedUsers.map((user) => (
            <Badge key={user.id} variant="default" className="flex items-center gap-1">
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.name}
                  className="w-4 h-4 rounded-full"
                />
              ) : (
                <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {user.name}
            </Badge>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Assign Users:</label>
        <div className="grid grid-cols-2 gap-2">
          {users.map((user) => (
            <div key={user.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`user-${user.id}`}
                checked={selectedUsers.includes(user.id)}
                onChange={() => handleUserToggle(user.id)}
                className="rounded"
              />
              <label htmlFor={`user-${user.id}`} className="text-sm flex items-center gap-2">
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.name}
                    className="w-4 h-4 rounded-full"
                  />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xs text-gray-600">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {user.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Button 
        onClick={handleSaveAssignments} 
        disabled={isLoading}
        size="sm"
      >
        {isLoading ? 'Saving...' : 'Save Assignments'}
      </Button>
    </div>
  )
}
