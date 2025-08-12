<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      class="flex items-center justify-between w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      :class="{ 'border-blue-500 ring-2 ring-blue-500': isOpen }"
    >
      <div class="flex items-center min-w-0">
        <FolderOpen class="flex-shrink-0 h-4 w-4 text-gray-400 mr-2" />
        <div class="text-left min-w-0">
          <div 
            v-if="projectsStore.currentProject" 
            class="font-medium text-gray-900 truncate"
          >
            {{ projectsStore.currentProject.name }}
          </div>
          <div 
            v-else 
            class="text-gray-600 italic"
          >
            Wybierz projekt
          </div>
          <div 
            v-if="projectsStore.currentProject" 
            class="text-xs text-gray-600 truncate"
          >
            {{ formatCurrency(projectsStore.currentProject.total_budget) }}
          </div>
        </div>
      </div>
      <ChevronDown 
        class="flex-shrink-0 h-4 w-4 text-gray-400 transition-transform"
        :class="{ 'transform rotate-180': isOpen }"
      />
    </button>

    <!-- Dropdown -->
    <div
      v-if="isOpen"
      class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
    >
      <div class="p-2">
        <div class="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
          Dostępne projekty
        </div>
        
        <div v-if="loading" class="flex justify-center py-4">
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
        
        <div v-else-if="projectsStore.projects.length === 0" class="text-sm text-gray-600 text-center py-4">
          Brak projektów
        </div>
        
        <div v-else class="space-y-1">
          <button
            v-for="project in projectsStore.projects"
            :key="project.id"
            @click="selectProject(project)"
            class="w-full text-left px-2 py-2 text-sm rounded-md transition-colors hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
            :class="{
              'bg-blue-50 text-blue-900': projectsStore.currentProject?.id === project.id
            }"
          >
            <div class="font-medium">{{ project.name }}</div>
            <div class="text-xs text-gray-600">
              {{ formatCurrency(project.total_budget) }}
            </div>
          </button>
        </div>
        
        <div class="border-t border-gray-200 mt-2 pt-2">
          <router-link
            to="/projects"
            @click="isOpen = false"
            class="flex items-center w-full px-2 py-2 text-sm text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
          >
            <Plus class="h-4 w-4 mr-2" />
            Zarządzaj projektami
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useProjects } from '~/composables/useProjects'
import { useProjectsStore } from '~/stores/projects'
import type { Project } from '~/types'
import { FolderOpen, ChevronDown, Plus } from 'lucide-vue-next'

const { loading, fetchProjects } = useProjects()
const projectsStore = useProjectsStore()

const isOpen = ref(false)

const selectProject = (project: Project) => {
  projectsStore.setCurrentProject(project)
  isOpen.value = false
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    maximumFractionDigits: 0
  }).format(amount)
}

// Close dropdown when clicking outside
const closeOnOutsideClick = (event: MouseEvent) => {
  const target = event.target as Element
  if (!target.closest('.relative')) {
    isOpen.value = false
  }
}

onMounted(() => {
  fetchProjects()
  projectsStore.loadCurrentProject()
  document.addEventListener('click', closeOnOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', closeOnOutsideClick)
})
</script>