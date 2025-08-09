import { ref, readonly } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import type { Project } from '@/types'

export const useProjects = () => {
  const authStore = useAuthStore()
  const projects = ref<Project[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchProjects = async () => {
    if (!authStore.user) return
    
    loading.value = true
    error.value = null
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', authStore.user.id)
        .order('created_at', { ascending: false })

      if (supabaseError) throw supabaseError
      projects.value = data || []
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch projects'
      console.error('Error fetching projects:', err)
    } finally {
      loading.value = false
    }
  }

  const createProject = async (projectData: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!authStore.user) return null

    try {
      const { data, error: supabaseError } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          user_id: authStore.user.id
        })
        .select()
        .single()

      if (supabaseError) throw supabaseError

      projects.value.unshift(data)
      return data
    } catch (err: any) {
      error.value = err.message || 'Failed to create project'
      console.error('Error creating project:', err)
      return null
    }
  }

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('projects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (supabaseError) throw supabaseError

      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value[index] = data
      }

      return data
    } catch (err: any) {
      error.value = err.message || 'Failed to update project'
      console.error('Error updating project:', err)
      return null
    }
  }

  const deleteProject = async (id: string) => {
    try {
      const { error: supabaseError } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (supabaseError) throw supabaseError

      projects.value = projects.value.filter(p => p.id !== id)
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to delete project'
      console.error('Error deleting project:', err)
      return false
    }
  }

  return {
    projects: readonly(projects),
    loading: readonly(loading),
    error: readonly(error),
    fetchProjects,
    createProject,
    updateProject,
    deleteProject
  }
}