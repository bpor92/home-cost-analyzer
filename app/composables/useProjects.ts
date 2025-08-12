import { useProjectsStore } from '~/stores/projects'
import { useAuthStore } from '~/stores/auth'
import { useApiClient } from './useApiClient'
import type { Project } from '~/types'

export const useProjects = () => {
  const authStore = useAuthStore()
  const projectsStore = useProjectsStore()
  const { apiCall, createCrudOperations } = useApiClient()
  
  const { loading, error, withErrorHandling } = createCrudOperations<Project>('/api/projects')

  const fetchProjects = async () => {
    if (!authStore.user) {
      return
    }
    
    const result = await withErrorHandling(async () => {
      return await apiCall<{ data: Project[] }>('/api/projects', { method: 'GET' })
    })

    if (result) {
      projectsStore.setProjects(result.data || [])
    }
  }

  const createProject = async (projectData: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!authStore.user) return null

    const result = await withErrorHandling(async () => {
      return await apiCall<{ data: Project }>('/api/projects', {
        method: 'POST',
        body: projectData
      })
    })

    if (result) {
      const newProject = result.data
      projectsStore.addProject(newProject)
      return newProject
    }
    return null
  }

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const result = await withErrorHandling(async () => {
      return await apiCall<{ data: Project }>(`/api/projects/${id}`, {
        method: 'PUT',
        body: updates
      })
    })

    if (result) {
      const updatedProject = result.data
      projectsStore.updateProject(updatedProject)
      return updatedProject
    }
    return null
  }

  const deleteProject = async (id: string) => {
    const result = await withErrorHandling(async () => {
      return await apiCall(`/api/projects/${id}`, {
        method: 'DELETE'
      })
    })

    if (result !== null) {
      projectsStore.removeProject(id)
      return true
    }
    return false
  }

  return {
    projects: projectsStore.projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject
  }
}