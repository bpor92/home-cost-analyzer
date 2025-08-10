<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Projekty remontowe</h1>
        <p class="text-sm text-gray-600 mt-1">Zarządzaj swoimi projektami remontowymi i ich budżetami</p>
      </div>
      <Button @click="showCreateModal = true" class="flex items-center gap-2">
        <Plus class="h-4 w-4" />
        Nowy projekt
      </Button>
    </div>

    <!-- Current Project -->
    <Card v-if="projectsStore.hasCurrentProject" class="border-blue-200 bg-blue-50">
      <div class="flex items-start justify-between">
        <div>
          <h3 class="font-medium text-gray-900">Aktualny projekt</h3>
          <h2 class="text-xl font-semibold text-blue-900 mt-1">
            {{ projectsStore.currentProject?.name }}
          </h2>
          <div class="flex gap-4 mt-3 text-sm">
            <div>
              <span class="text-blue-700">Całkowity budżet:</span>
              <span class="font-medium text-blue-900 ml-1">
                {{ formatCurrency(projectsStore.currentProject?.total_budget || 0) }}
              </span>
            </div>
            <div>
              <span class="text-blue-700">Własny budżet:</span>
              <span class="font-medium text-blue-900 ml-1">
                {{ formatCurrency(projectsStore.currentProject?.own_budget || 0) }}
              </span>
            </div>
          </div>
        </div>
        <div class="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            @click="editProject(projectsStore.currentProject!)"
          >
            <Edit class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>

    <!-- Projects List -->
    <Card>
      <div class="p-6">
        <h3 class="text-lg font-medium mb-4 text-gray-900">Wszystkie projekty</h3>

        <div v-if="loading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>

        <div v-else-if="error" class="text-red-600 text-center py-8">
          {{ error }}
        </div>

        <div v-else-if="projects.length === 0" class="text-center py-8 text-gray-600">
          Nie masz jeszcze żadnych projektów. Stwórz pierwszy projekt!
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="project in projects"
            :key="project.id"
            :class="[
              'flex items-center justify-between p-4 border rounded-lg transition-colors hover:bg-gray-50',
              projectsStore.currentProject?.id === project.id ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
            ]"
          >
            <div class="flex-1">
              <div class="flex items-center gap-3 ">
                <h4 class="font-medium text-gray-600">{{ project.name }}</h4>
                <span
                  v-if="projectsStore.currentProject?.id === project.id"
                  class="px-2 py-1 text-xs bg-blue-600 text-white font-medium rounded-full"
                >
                  Aktualny
                </span>
              </div>
              <div class="flex gap-4 mt-2 text-sm text-gray-600">
                <span>Budżet: {{ formatCurrency(project.total_budget) }}</span>
                <span>Utworzono: {{ formatDate(project.created_at) }}</span>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <Button
                v-if="projectsStore.currentProject?.id !== project.id"
                variant="outline"
                size="sm"
                @click="setCurrentProject(project)"
              >
                Wybierz
              </Button>
              <Button
                variant="outline"
                size="sm"
                @click="editProject(project)"
              >
                <Edit class="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                @click="confirmDelete(project)"
                class="text-red-600 hover:text-red-700"
              >
                <Trash2 class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <!-- Create/Edit Modal -->
    <Modal v-model:open="showCreateModal">
      <div class="p-6">
        <h3 class="text-lg font-medium mb-4">
          {{ editingProject ? 'Edytuj projekt' : 'Nowy projekt' }}
        </h3>

        <form @submit.prevent="saveProject" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Nazwa projektu
            </label>
            <Input
              v-model="projectForm.name"
              placeholder="np. Remont kuchni"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Całkowity budżet (zł)
            </label>
            <Input
              v-model.number="projectForm.total_budget"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Własny budżet (zł)
            </label>
            <Input
              v-model.number="projectForm.own_budget"
              type="number"
              min="0"
              :max="projectForm.total_budget"
              step="0.01"
              placeholder="0.00"
              required
            />
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              @click="cancelEdit"
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              :disabled="saving"
            >
              {{ saving ? 'Zapisywanie...' : (editingProject ? 'Zapisz zmiany' : 'Utwórz projekt') }}
            </Button>
          </div>
        </form>
      </div>
    </Modal>

    <!-- Delete Confirmation Modal -->
    <Modal v-model:open="showDeleteModal">
      <div class="p-6">
        <h3 class="text-lg font-medium mb-4 text-red-800">Usuń projekt</h3>
        <p class="text-sm text-gray-600 mb-6">
          Czy na pewno chcesz usunąć projekt "{{ projectToDelete?.name }}"?
          Ta operacja jest nieodwracalna i usunie wszystkie powiązane dane.
        </p>

        <div class="flex justify-end gap-3">
          <Button
            variant="outline"
            @click="showDeleteModal = false"
          >
            Anuluj
          </Button>
          <Button
            @click="deleteProject"
            :disabled="deleting"
            class="bg-red-600 hover:bg-red-700"
          >
            {{ deleting ? 'Usuwanie...' : 'Usuń projekt' }}
          </Button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useProjects } from '~/composables/useProjects'
import { useProjectsStore } from '~/stores/projects'
import type { Project } from '~/types'
import Button from '~/components/ui/Button.vue'
import Card from '~/components/ui/Card.vue'
import Input from '~/components/ui/Input.vue'
import Modal from '~/components/ui/Modal.vue'
import { Plus, Edit, Trash2 } from 'lucide-vue-next'

const { projects, loading, error, fetchProjects, createProject, updateProject, deleteProject: deleteProjectApi } = useProjects()
const projectsStore = useProjectsStore()

// Modal states
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const editingProject = ref<Project | null>(null)
const projectToDelete = ref<Project | null>(null)
const saving = ref(false)
const deleting = ref(false)

// Form data
const projectForm = reactive({
  name: '',
  total_budget: 0,
  own_budget: 0
})

const resetForm = () => {
  projectForm.name = ''
  projectForm.total_budget = 0
  projectForm.own_budget = 0
  editingProject.value = null
}

const editProject = (project: Project) => {
  editingProject.value = project
  projectForm.name = project.name
  projectForm.total_budget = project.total_budget
  projectForm.own_budget = project.own_budget
  showCreateModal.value = true
}

const cancelEdit = () => {
  showCreateModal.value = false
  resetForm()
}

const saveProject = async () => {
  saving.value = true

  try {
    if (editingProject.value) {
      // Update existing project
      const updated = await updateProject(editingProject.value.id, {
        name: projectForm.name,
        total_budget: projectForm.total_budget,
        own_budget: projectForm.own_budget
      })

      if (updated) {
        projectsStore.updateProject(updated)
      }
    } else {
      // Create new project
      const newProject = await createProject({
        name: projectForm.name,
        total_budget: projectForm.total_budget,
        own_budget: projectForm.own_budget
      })

      if (newProject) {
        projectsStore.addProject(newProject)
        // Set as current project if it's the first one
        if (!projectsStore.hasCurrentProject) {
          projectsStore.setCurrentProject(newProject)
        }
      }
    }

    showCreateModal.value = false
    resetForm()
  } finally {
    saving.value = false
  }
}

const setCurrentProject = (project: Project) => {
  projectsStore.setCurrentProject(project)
}

const confirmDelete = (project: Project) => {
  projectToDelete.value = project
  showDeleteModal.value = true
}

const deleteProject = async () => {
  if (!projectToDelete.value) return

  deleting.value = true

  try {
    const success = await deleteProjectApi(projectToDelete.value.id)
    if (success) {
      projectsStore.removeProject(projectToDelete.value.id)
    }

    showDeleteModal.value = false
    projectToDelete.value = null
  } finally {
    deleting.value = false
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN'
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  fetchProjects()
  projectsStore.loadCurrentProject()
})
</script>
