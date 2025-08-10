<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Planowanie Etapów</h1>
      
      <div class="flex items-center gap-3">
        <!-- View Toggle -->
        <div class="flex bg-gray-100 rounded-lg p-1">
          <Button
            size="sm"
            :variant="viewMode === 'groups' ? 'primary' : 'ghost'"
            @click="viewMode = 'groups'"
          >
            Grupy
          </Button>
          <Button
            size="sm"
            :variant="viewMode === 'list' ? 'primary' : 'ghost'"
            @click="viewMode = 'list'"
          >
            Lista
          </Button>
        </div>
        
        <!-- Action Buttons -->
        <Button v-if="viewMode === 'groups'" variant="outline" @click="openAddGroupModal">
          <Plus class="h-4 w-4 mr-2" />
          Dodaj grupę
        </Button>
        <Button @click="openAddModal">
          <Plus class="h-4 w-4 mr-2" />
          Dodaj etap
        </Button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card class="p-4">
        <div class="flex items-center">
          <Clock class="h-8 w-8 text-blue-500" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Planowane</p>
            <p class="text-2xl font-bold text-gray-900">{{ phasesByStatus.planned.length }}</p>
          </div>
        </div>
      </Card>
      
      <Card class="p-4">
        <div class="flex items-center">
          <Play class="h-8 w-8 text-orange-500" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">W trakcie</p>
            <p class="text-2xl font-bold text-gray-900">{{ phasesByStatus.inProgress.length }}</p>
          </div>
        </div>
      </Card>
      
      <Card class="p-4">
        <div class="flex items-center">
          <CheckCircle class="h-8 w-8 text-green-500" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Zakończone</p>
            <p class="text-2xl font-bold text-gray-900">{{ phasesByStatus.completed.length }}</p>
          </div>
        </div>
      </Card>
    </div>

    <div class="flex flex-col md:flex-row gap-4 mb-6">
      <div class="flex-1">
        <Input
          v-model="searchTerm"
          placeholder="Szukaj etapów..."
          class="w-full"
        >
          <template #prefix>
            <Search class="h-4 w-4 text-gray-400" />
          </template>
        </Input>
      </div>
      
      <select
        v-model="statusFilter"
        class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Wszystkie statusy</option>
        <option value="planned">Planowane</option>
        <option value="in-progress">W trakcie</option>
        <option value="completed">Zakończone</option>
      </select>
      
      <select
        v-model="priorityFilter"
        class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Wszystkie priorytety</option>
        <option value="high">Wysoki</option>
        <option value="medium">Średni</option>
        <option value="low">Niski</option>
      </select>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-sm text-gray-600">Ładowanie etapów...</p>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <div class="text-red-600 mb-4">{{ error }}</div>
      <Button @click="loadPhases" variant="outline">Spróbuj ponownie</Button>
    </div>

    <div v-else-if="filteredPhases.length === 0" class="text-center py-12">
      <Calendar class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">Brak etapów</h3>
      <p class="mt-1 text-sm text-gray-600">
        {{ searchTerm || statusFilter || priorityFilter ? 'Nie znaleziono etapów spełniających kryteria' : 'Rozpocznij planowanie swojego remontu' }}
      </p>
    </div>

    <div v-else>
      <!-- Groups View -->
      <div v-if="viewMode === 'groups'">
        <div v-if="groupsLoading" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-2 text-sm text-gray-600">Ładowanie grup...</p>
        </div>
        
        <div v-else-if="groupsWithPhases.length === 0" class="text-center py-12">
          <Calendar class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">Brak grup etapów</h3>
          <p class="mt-1 text-sm text-gray-600">Stwórz pierwszą grupę aby uporządkować swoje etapy</p>
          <Button class="mt-4" @click="openAddGroupModal">
            <Plus class="h-4 w-4 mr-2" />
            Dodaj pierwszą grupę
          </Button>
        </div>
        
        <div v-else class="space-y-6">
          <PhaseGroupCard
            v-for="group in groupsWithPhases"
            :key="group.id"
            :group="group"
            :default-expanded="groupsWithPhases.length <= 2"
            @edit="editGroup"
            @delete="deleteGroupConfirm"
            @add-phase="addPhaseToGroup"
            @edit-phase="editPhase"
            @delete-phase="deletePhase"
          />
        </div>
      </div>
      
      <!-- List View -->
      <div v-else-if="viewMode === 'list'">
        <div class="mb-6">
          <PhaseTimeline :phases="phases" />
        </div>
        
        <div class="mb-6">
          <PhaseDragList
            :phases="filteredPhases"
            @edit="editPhase"
            @delete="deletePhase"
            @reorder="handlePhaseReorder"
          />
        </div>
      </div>
    </div>

    <Modal :open="showModal" @close="closeModal">
      <div class="p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          {{ editingPhase ? 'Edytuj etap' : 'Dodaj nowy etap' }}
        </h2>
        
        <PhaseForm
          :phase="editingPhase || undefined"
          :loading="formLoading"
          :available-groups="groups"
          :available-categories="categories"
          @submit="handleFormSubmit"
          @cancel="closeModal"
        />
      </div>
    </Modal>

    <Modal :open="showDeleteModal" @close="showDeleteModal = false">
      <div class="p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Usuń etap</h2>
        <p class="text-gray-600 mb-6">
          Czy na pewno chcesz usunąć etap "{{ phaseToDelete?.name }}"? 
          Ta operacja jest nieodwracalna.
        </p>
        
        <div class="flex gap-3">
          <Button
            @click="confirmDelete"
            variant="danger"
            :loading="formLoading"
            class="flex-1"
          >
            Usuń etap
          </Button>
          <Button
            @click="showDeleteModal = false"
            variant="outline"
            class="flex-1"
          >
            Anuluj
          </Button>
        </div>
      </div>
    </Modal>

    <!-- Group Modal -->
    <Modal :open="showGroupModal" @close="closeGroupModal">
      <div class="p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          {{ editingGroup ? 'Edytuj grupę' : 'Dodaj nową grupę' }}
        </h2>
        
        <PhaseGroupForm
          :group="editingGroup || undefined"
          :loading="formLoading"
          @submit="handleGroupFormSubmit"
          @cancel="closeGroupModal"
        />
      </div>
    </Modal>

    <!-- Group Delete Modal -->
    <Modal :open="showGroupDeleteModal" @close="showGroupDeleteModal = false">
      <div class="p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Usuń grupę</h2>
        <p class="text-gray-600 mb-4">
          Czy na pewno chcesz usunąć grupę "{{ groupToDelete?.name }}"?
        </p>
        <p class="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg mb-6">
          <strong>Uwaga:</strong> Etapy z tej grupy zostaną przeniesione do sekcji "Niezgrupowane etapy".
          Sama grupa zostanie permanentnie usunięta.
        </p>
        
        <div class="flex gap-3">
          <Button
            @click="confirmGroupDelete"
            variant="danger"
            :loading="formLoading"
            class="flex-1"
          >
            Usuń grupę
          </Button>
          <Button
            @click="showGroupDeleteModal = false"
            variant="outline"
            class="flex-1"
          >
            Anuluj
          </Button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Calendar, Plus, Clock, Play, CheckCircle, Search } from 'lucide-vue-next'
import { useRenovationPhases } from '@/composables/useRenovationPhases'
import { usePhaseGroups } from '@/composables/usePhaseGroups'
import { useBudgetCategories } from '@/composables/useBudgetCategories'
import { useProjectsStore } from '@/stores/projects'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Modal from '@/components/ui/Modal.vue'
import PhaseCard from '@/components/ui/PhaseCard.vue'
import PhaseForm from '@/components/forms/PhaseForm.vue'
import PhaseTimeline from '@/components/ui/PhaseTimeline.vue'
import PhaseDragList from '@/components/ui/PhaseDragList.vue'
import PhaseGroupCard from '@/components/ui/PhaseGroupCard.vue'
import PhaseGroupForm from '@/components/forms/PhaseGroupForm.vue'
import type { RenovationPhase, PhaseGroup, PhaseGroupWithPhases } from '@/types/database'

const projectsStore = useProjectsStore()
const {
  phases,
  phasesByStatus,
  totalBudget,
  loading,
  error,
  fetchPhases,
  createPhase,
  updatePhase,
  deletePhase: deletePhaseAction,
  bulkUpdatePhaseOrder
} = useRenovationPhases()

const {
  groups,
  loading: groupsLoading,
  error: groupsError,
  fetchGroups,
  fetchGroupsWithPhases,
  createGroup,
  updateGroup,
  deleteGroup,
  assignPhaseToGroup
} = usePhaseGroups()

const {
  categories,
  loading: categoriesLoading,
  error: categoriesError,
  fetchCategories
} = useBudgetCategories()

const showModal = ref(false)
const showDeleteModal = ref(false)
const showGroupModal = ref(false)
const showGroupDeleteModal = ref(false)
const editingPhase = ref<RenovationPhase | null>(null)
const editingGroup = ref<PhaseGroup | null>(null)
const phaseToDelete = ref<RenovationPhase | null>(null)
const groupToDelete = ref<PhaseGroupWithPhases | null>(null)
const formLoading = ref(false)

const viewMode = ref<'list' | 'groups'>('groups')
const groupsWithPhases = ref<PhaseGroupWithPhases[]>([])

const searchTerm = ref('')
const statusFilter = ref('')
const priorityFilter = ref('')

const filteredPhases = computed(() => {
  let filtered = phases.value

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(phase => 
      phase.name.toLowerCase().includes(search) ||
      phase.notes?.toLowerCase().includes(search)
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(phase => phase.status === statusFilter.value)
  }

  if (priorityFilter.value) {
    filtered = filtered.filter(phase => phase.priority === priorityFilter.value)
  }

  return filtered
})

function openAddModal() {
  editingPhase.value = null
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingPhase.value = null
}

function openAddGroupModal() {
  editingGroup.value = null
  showGroupModal.value = true
}

function closeGroupModal() {
  showGroupModal.value = false
  editingGroup.value = null
}

function editPhase(phase: RenovationPhase) {
  editingPhase.value = phase
  showModal.value = true
}

function deletePhase(phase: RenovationPhase) {
  phaseToDelete.value = phase
  showDeleteModal.value = true
}

function editGroup(group: PhaseGroupWithPhases) {
  editingGroup.value = group
  showGroupModal.value = true
}

function deleteGroupConfirm(group: PhaseGroupWithPhases) {
  groupToDelete.value = group
  showGroupDeleteModal.value = true
}

function addPhaseToGroup(group: PhaseGroupWithPhases) {
  // Store the target group and open phase modal
  editingPhase.value = null
  // We'll handle group assignment in the phase form
  showModal.value = true
}

async function handleFormSubmit(formData: any) {
  if (!projectsStore.currentProject) return

  formLoading.value = true
  try {
    // Convert empty IDs to null
    const phaseData = {
      ...formData,
      group_id: formData.group_id || null,
      category_id: formData.category_id || null
    }
    
    if (editingPhase.value) {
      await updatePhase(editingPhase.value.id, phaseData)
    } else {
      await createPhase(projectsStore.currentProject.id, phaseData)
    }
    
    closeModal()
    
    // Refresh appropriate data based on current view
    if (viewMode.value === 'groups') {
      await loadGroupsWithPhases()
    } else {
      await loadPhases()
    }
  } catch (err) {
    console.error('Error saving phase:', err)
  } finally {
    formLoading.value = false
  }
}

async function confirmDelete() {
  if (!phaseToDelete.value) return

  formLoading.value = true
  try {
    await deletePhaseAction(phaseToDelete.value.id)
    showDeleteModal.value = false
    phaseToDelete.value = null
    
    // Refresh groups data if in groups view
    if (viewMode.value === 'groups') {
      await loadGroupsWithPhases()
    }
  } catch (err) {
    console.error('Error deleting phase:', err)
  } finally {
    formLoading.value = false
  }
}

async function handleGroupFormSubmit(formData: any) {
  if (!projectsStore.currentProject) return

  formLoading.value = true
  try {
    if (editingGroup.value) {
      await updateGroup(editingGroup.value.id, formData)
    } else {
      await createGroup(projectsStore.currentProject.id, formData)
    }
    closeGroupModal()
    await loadGroupsWithPhases()
  } catch (err) {
    console.error('Error saving group:', err)
  } finally {
    formLoading.value = false
  }
}

async function confirmGroupDelete() {
  if (!groupToDelete.value || groupToDelete.value.id === 'ungrouped') return

  formLoading.value = true
  try {
    await deleteGroup(groupToDelete.value.id)
    showGroupDeleteModal.value = false
    groupToDelete.value = null
    await loadGroupsWithPhases()
  } catch (err) {
    console.error('Error deleting group:', err)
  } finally {
    formLoading.value = false
  }
}

async function loadPhases() {
  if (projectsStore.currentProject) {
    await fetchPhases(projectsStore.currentProject.id)
  }
}

async function loadGroupsWithPhases() {
  if (projectsStore.currentProject) {
    const data = await fetchGroupsWithPhases(projectsStore.currentProject.id)
    groupsWithPhases.value = data
  }
}

async function handlePhaseReorder(reorderedPhases: RenovationPhase[]) {
  const updates = reorderedPhases.map((phase, index) => ({
    id: phase.id,
    order_index: index
  }))
  
  try {
    await bulkUpdatePhaseOrder(updates)
  } catch (err) {
    console.error('Error reordering phases:', err)
    await loadPhases()
  }
}

watch(() => projectsStore.currentProject, () => {
  loadPhases()
  loadGroupsWithPhases()
  
  // Also load groups and categories for the form dropdowns
  if (projectsStore.currentProject) {
    fetchGroups(projectsStore.currentProject.id)
    fetchCategories(projectsStore.currentProject.id)
  }
}, { immediate: true })

// Watch view mode to load appropriate data
watch(viewMode, (newMode) => {
  if (newMode === 'groups') {
    loadGroupsWithPhases()
  }
})
</script>