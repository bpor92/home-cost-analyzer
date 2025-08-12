import { defineStore } from 'pinia'
import { ref, readonly, computed } from 'vue'
import type { Project } from '~/types'

export const useProjectsStore = defineStore('projects', () => {
  const currentProject = ref<Project | null>(null)
  const projects = ref<Project[]>([])

  const hasCurrentProject = computed(() => !!currentProject.value)
  
  const setCurrentProject = (project: Project) => {
    currentProject.value = project
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentProject', JSON.stringify(project))
    }
  }

  const addProject = (project: Project) => {
    projects.value.unshift(project)
  }

  const setProjects = (newProjects: Project[]) => {
    projects.value = newProjects
  }

  const updateProject = (updatedProject: Project) => {
    const index = projects.value.findIndex(p => p.id === updatedProject.id)
    if (index !== -1) {
      projects.value[index] = updatedProject
    }
    
    // Update current project if it's the same
    if (currentProject.value?.id === updatedProject.id) {
      currentProject.value = updatedProject
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentProject', JSON.stringify(updatedProject))
      }
    }
  }

  const removeProject = (projectId: string) => {
    projects.value = projects.value.filter(p => p.id !== projectId)
    
    // Clear current project if it's the deleted one
    if (currentProject.value?.id === projectId) {
      currentProject.value = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('currentProject')
      }
    }
  }

  const loadCurrentProject = () => {
    if (typeof window === 'undefined') return // Skip on server-side
    
    const stored = localStorage.getItem('currentProject')
    if (stored) {
      try {
        currentProject.value = JSON.parse(stored)
      } catch (error) {
        console.error('Error loading current project:', error)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('currentProject')
        }
      }
    }
  }

  return {
    currentProject: readonly(currentProject),
    projects: readonly(projects),
    hasCurrentProject,
    setCurrentProject,
    addProject,
    setProjects,
    updateProject,
    removeProject,
    loadCurrentProject
  }
})