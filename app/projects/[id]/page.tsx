'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TodoList } from '@/components/todo/TodoList'
import { Todo, Project, Priority, Status } from '@/lib/types'
import { todoService } from '@/lib/todoService'
import { projectService } from '@/lib/projectService'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function ProjectTodosPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  
  const [todos, setTodos] = useState<Todo[]>([])
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'priority' | 'due_date' | 'created_at' | 'status'>('created_at')

  useEffect(() => {
    if (projectId) {
      loadProjectData()
    }
  }, [projectId])

  const loadProjectData = async () => {
    try {
      setIsLoading(true)
      const [projectData, todosData] = await Promise.all([
        projectService.getProject(projectId),
        todoService.getTodosByProject(projectId)
      ])
      setProject(projectData)
      setTodos(todosData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTodo = async (formData: {
    project_id: string
    title: string
    description: string
    due_date: string
    priority: Priority
    status: Status
  }) => {
    try {
      const newTodo = await todoService.createTodo(formData)
      setTodos(prev => [newTodo, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create todo')
    }
  }

  const handleUpdateTodo = async (updatedTodo: Todo) => {
    try {
      const todo = await todoService.updateTodo(updatedTodo.id, updatedTodo)
      setTodos(prev => prev.map(t => t.id === todo.id ? todo : t))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo')
    }
  }

  const handleDeleteTodo = async (id: string) => {
    try {
      await todoService.deleteTodo(id)
      setTodos(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete todo')
    }
  }

  const handleSortChange = (newSortBy: 'priority' | 'due_date' | 'created_at' | 'status') => {
    setSortBy(newSortBy)
    const sortedTodos = [...todos].sort((a, b) => {
      switch (newSortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case 'due_date':
          if (!a.due_date && !b.due_date) return 0
          if (!a.due_date) return 1
          if (!b.due_date) return -1
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        case 'status':
          const statusOrder = { pending: 1, in_progress: 2, completed: 3 }
          return statusOrder[a.status] - statusOrder[b.status]
        case 'created_at':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })
    setTodos(sortedTodos)
  }

  const handleBackToProjects = () => {
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading project todos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error</div>
          <p className="text-slate-600">{error}</p>
          <Button onClick={handleBackToProjects} className="mt-4">
            Back to Projects
          </Button>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Project Not Found</div>
          <p className="text-slate-600">The project you're looking for doesn't exist.</p>
          <Button onClick={handleBackToProjects} className="mt-4">
            Back to Projects
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              onClick={handleBackToProjects}
              variant="ghost"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>
          </div>

          {/* Project Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: project.color }}
              />
              <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
            </div>
            {project.description && (
              <p className="text-slate-600 text-lg">{project.description}</p>
            )}
          </div>

          {/* Todo List */}
          <TodoList
            todos={todos}
            onUpdate={handleUpdateTodo}
            onDelete={handleDeleteTodo}
            onAdd={handleAddTodo}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            selectedProjectId={project.id}
            projectName={project.name}
          />
        </div>
      </div>
    </div>
  )
}
