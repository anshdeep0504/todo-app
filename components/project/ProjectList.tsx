'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Project } from '@/lib/types'
import { projectService } from '@/lib/projectService'
import { ProjectForm } from './ProjectForm'
import { todoService } from '@/lib/todoService'

interface ProjectListProps {
  onProjectSelect?: (project: Project) => void
}

export function ProjectList({ onProjectSelect }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [projectTodoCounts, setProjectTodoCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setIsLoading(true)
      const projectsData = await projectService.getProjects()
      setProjects(projectsData)
      
      // Load todo counts for each project
      const counts: Record<string, number> = {}
      for (const project of projectsData) {
        const todos = await todoService.getTodosByProject(project.id)
        counts[project.id] = todos.length
      }
      setProjectTodoCounts(counts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects')
    } finally {
      setIsLoading(false)
    }
  }

  const handleProjectCreated = (project: Project) => {
    setProjects(prev => [project, ...prev])
    setShowCreateForm(false)
    loadProjects() // Reload to get updated todo counts
  }

  const handleProjectDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? All todos in this project will also be deleted.')) {
      return
    }

    try {
      await projectService.deleteProject(projectId)
      setProjects(prev => prev.filter(p => p.id !== projectId))
      loadProjects() // Reload to get updated todo counts
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project')
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading projects...</div>
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Projects</h2>
        <Button onClick={() => setShowCreateForm(true)}>
          Create Project
        </Button>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <ProjectForm
              onProjectCreated={handleProjectCreated}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {projects.map((project) => (
          <Card
            key={project.id}
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 duration-200"
            onClick={() => onProjectSelect?.(project)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <CardTitle className="text-lg line-clamp-1">{project.name}</CardTitle>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {projectTodoCounts[project.id] || 0}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {project.description || 'No description'}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onProjectSelect?.(project)
                  }}
                  className="flex-1"
                >
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleProjectDelete(project.id)
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No projects yet. Create your first project to get started!
        </div>
      )}
    </div>
  )
}
