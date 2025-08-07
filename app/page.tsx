'use client'

import { useState, useEffect } from 'react'
import { ProjectList } from '@/components/project/ProjectList'
import { UserAssignmentTable } from '@/components/user/UserAssignmentTable'
import { Project } from '@/lib/types'
import { projectService } from '@/lib/projectService'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Users, FolderOpen } from 'lucide-react'

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'projects' | 'assignments'>('projects')
  const router = useRouter()

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setIsLoading(true)
      const projectsData = await projectService.getProjects()
      setProjects(projectsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects')
    } finally {
      setIsLoading(false)
    }
  }

  const handleProjectSelect = (project: Project) => {
    router.push(`/projects/${project.id}`)
  }

  const handleUserManagement = () => {
    router.push('/users')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading your projects...</p>
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
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Todo App</h1>
            <p className="text-slate-600">Organize your tasks by projects and manage user assignments</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-4 mb-8">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'projects'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('projects')}
            >
              <FolderOpen className="h-4 w-4" />
              Projects
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'assignments'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('assignments')}
            >
              <Users className="h-4 w-4" />
              User Assignments
            </button>
            <Button
              variant="outline"
              onClick={handleUserManagement}
              className="ml-auto"
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
          </div>
          
          {activeTab === 'projects' ? (
            <ProjectList
              onProjectSelect={handleProjectSelect}
            />
          ) : (
            <UserAssignmentTable />
          )}
        </div>
      </div>
    </div>
  )
}
