import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useProjectsStore } from '~/stores/projects'
import type { Project } from '~/types'

export const useProjects = () => {
  const authStore = useAuthStore()
  const projectsStore = useProjectsStore()
  const loading = ref(false)
  const error = ref<string | null>(null)
  const router = useRouter()

  const getAuthHeaders = () => {
    const token = authStore.user?.access_token
    return token ? { Authorization: `Bearer ${token}` } : undefined
  }

  const handle401Error = async () => {
    await authStore.signOut()
    await router.push('/auth/login')
  }

  const fetchProjects = async () => {
    if (!authStore.user) {
      return
    }
    
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch('/api/projects', {
        method: 'GET',
        headers: getAuthHeaders()
      })

      projectsStore.setProjects(response.data || [])
    } catch (err: any) {
      if (err.statusCode === 401 || err.response?.status === 401) {
        await handle401Error()
        return
      }
      error.value = err.statusMessage || err.message || 'Failed to fetch projects'
      console.error('Error fetching projects:', err)
    } finally {
      loading.value = false
    }
  }

  const createProject = async (projectData: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!authStore.user) return null

    try {
      const response = await $fetch('/api/projects', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: projectData
      })

      const newProject = response.data
      projectsStore.addProject(newProject)
      return newProject
    } catch (err: any) {
      if (err.statusCode === 401 || err.response?.status === 401) {
        await handle401Error()
        return null
      }
      error.value = err.statusMessage || err.message || 'Failed to create project'
      console.error('Error creating project:', err)
      return null
    }
  }

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const response = await $fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: updates
      })

      const updatedProject = response.data
      projectsStore.updateProject(updatedProject)
      return updatedProject
    } catch (err: any) {
      if (err.statusCode === 401 || err.response?.status === 401) {
        await handle401Error()
        return null
      }
      error.value = err.statusMessage || err.message || 'Failed to update project'
      console.error('Error updating project:', err)
      return null
    }
  }

  const deleteProject = async (id: string) => {
    try {
      await $fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      projectsStore.removeProject(id)
      return true
    } catch (err: any) {
      if (err.statusCode === 401 || err.response?.status === 401) {
        await handle401Error()
        return false
      }
      error.value = err.statusMessage || err.message || 'Failed to delete project'
      console.error('Error deleting project:', err)
      return false
    }
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