
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Todo, Priority } from '@/lib/types'
import { Edit, Trash2, Plus, Filter, Search } from 'lucide-react'
import { TodoModal } from './TodoModal'

interface TodoTableProps {
  todos: Todo[]
  onUpdate: (todo: Todo) => void
  onDelete: (id: string) => void
  onAdd: (formData: {
    title: string
    description: string
    due_date: string
    priority: Priority
  }) => void
  sortBy: 'priority' | 'due_date' | 'created_at'
  onSortChange: (sortBy: 'priority' | 'due_date' | 'created_at') => void
}

export function TodoTable({ 
  todos, 
  onUpdate, 
  onDelete, 
  onAdd, 
  sortBy, 
  onSortChange 
}: TodoTableProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const getPriorityBadge = (priority: Priority) => {
    const priorityMap = {
      high: 'destructive' as const,
      medium: 'default' as const,
      low: 'secondary' as const,
    }
    
    return (
      <Badge variant={priorityMap[priority]}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    )
  }

  const getStatusBadge = (dueDate: string | null) => {
    if (!dueDate) {
      return <Badge variant="outline">No due date</Badge>
    }
    
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return <Badge variant="destructive">Overdue</Badge>
    } else if (diffDays === 0) {
      return <Badge variant="default">Due today</Badge>
    } else if (diffDays <= 3) {
      return <Badge variant="secondary">Due soon</Badge>
    } else {
      return <Badge variant="outline">On track</Badge>
    }
  }

  const filteredTodos = todos.filter(todo =>
    todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    todo.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortOptions = [
    { value: 'created_at', label: 'Latest First' },
    { value: 'priority', label: 'By Priority' },
    { value: 'due_date', label: 'By Due Date' },
  ] as const

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Todo Management</h1>
          <p className="text-muted-foreground">Manage your tasks efficiently with our modern interface</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Todo
        </Button>
      </div>

      {/* Search and Sort Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search todos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              {sortOptions.map((option) => (
                <Button
                  key={option.value}
                  onClick={() => onSortChange(option.value)}
                  variant={sortBy === option.value ? "default" : "outline"}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Todo Modals */}
      <TodoModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={onAdd}
        mode="add"
      />
      
      <TodoModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingTodo(null)
        }}
        onSubmit={(formData) => {
          if (editingTodo) {
            onUpdate({ ...editingTodo, ...formData })
          }
          setShowEditModal(false)
          setEditingTodo(null)
        }}
        mode="edit"
        initialData={editingTodo ? {
          title: editingTodo.title,
          description: editingTodo.description || '',
          due_date: editingTodo.due_date || '',
          priority: editingTodo.priority
        } : undefined}
      />

      {/* Todo Table */}
      <Card>
        <CardHeader>
          <CardTitle>Todos</CardTitle>
          <CardDescription>A list of your todos with their current status.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead className="text-center">Priority</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Due Date</TableHead>
                <TableHead className="text-center">Created</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTodos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center">
                      <div className="bg-muted rounded-full w-20 h-20 flex items-center justify-center mb-4">
                        <Search className="w-10 h-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        {searchTerm ? 'No todos found' : 'No todos yet'}
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first todo item.'}
                      </p>
                      {!searchTerm && (
                        <Button
                          onClick={() => setShowAddModal(true)}
                        >
                          Create Your First Todo
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTodos.map((todo) => (
                  <TableRow key={todo.id}>
                    <TableCell>
                      {editingTodo?.id === todo.id ? (
                        <div className="text-sm text-muted-foreground">
                          Editing...
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="font-medium">{todo.title}</div>
                          {todo.description && (
                            <div className="text-sm text-muted-foreground max-w-md">
                              {todo.description}
                            </div>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {getPriorityBadge(todo.priority)}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(todo.due_date)}
                    </TableCell>
                    <TableCell className="text-center">
                      {todo.due_date ? new Date(todo.due_date).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      {new Date(todo.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingTodo(todo)
                            setShowEditModal(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(todo.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
