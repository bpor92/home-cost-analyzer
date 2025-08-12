<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <div class="mt-4 sm:mt-0">
        <Button v-if="!hasCurrentProject" @click="showProjectModal = true">
          <Plus class="mr-2 h-4 w-4" />
          Nowy projekt
        </Button>
      </div>
    </div>

    <!-- Project Selection -->
    <div v-if="!hasCurrentProject" class="text-center py-12">
      <Home class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">Brak aktywnego projektu</h3>
      <p class="mt-1 text-sm text-gray-600">Rozpocznij od utworzenia nowego projektu remontu</p>
      <div class="mt-6">
        <Button @click="showProjectModal = true">
          <Plus class="mr-2 h-4 w-4" />
          Utwórz pierwszy projekt
        </Button>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="space-y-6">
      <!-- Quick Stats -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card v-for="stat in quickStats" :key="stat.name" :padding="false">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <component :is="stat.icon" :class="`h-6 w-6 text-${stat.color}-600`" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-600 truncate">
                    {{ stat.name }}
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ stat.value }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div :class="`bg-${stat.color}-50 px-5 py-3`">
            <div class="text-sm">
              <span :class="`text-${stat.color}-700 font-medium`">
                {{ stat.change }}
              </span>
              <span class="text-gray-600"> {{ stat.changeText }}</span>
            </div>
          </div>
        </Card>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Budget Overview Chart -->
        <Card>
          <template #header>
            <h3 class="text-lg font-medium text-gray-900">Podział budżetu</h3>
          </template>
          <div class="h-64 flex items-center justify-center text-gray-600">
            <PieChart class="h-8 w-8 mr-2" />
            Wykres będzie tutaj
          </div>
        </Card>

        <!-- Expenses Timeline -->
        <Card>
          <template #header>
            <h3 class="text-lg font-medium text-gray-900">Wydatki w czasie</h3>
          </template>
          <div class="h-64 flex items-center justify-center text-gray-600">
            <TrendingUp class="h-8 w-8 mr-2" />
            Wykres będzie tutaj
          </div>
        </Card>
      </div>

      <!-- Recent Activity -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Recent Expenses -->
        <Card>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium text-gray-900">Ostatnie wydatki</h3>
              <NuxtLink
                to="/expenses"
                class="text-sm text-blue-600 hover:text-blue-500"
              >
                Zobacz wszystkie
              </NuxtLink>
            </div>
          </template>
          <div class="space-y-3">
            <div
              v-for="expense in recentExpenses"
              :key="expense.id"
              class="flex items-center justify-between py-2"
            >
              <div class="flex items-center">
                <div class="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <Receipt class="h-4 w-4 text-gray-600" />
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-900">{{ expense.name }}</p>
                  <p class="text-xs text-gray-600">
                    {{ formatDate(expense.expense_date) }}
                  </p>
                </div>
              </div>
              <span class="text-sm font-medium text-gray-900">
                {{ formatCurrency(expense.amount) }}
              </span>
            </div>
            <div v-if="recentExpenses.length === 0" class="text-center py-6 text-gray-600">
              Brak wydatków do wyświetlenia
            </div>
          </div>
        </Card>

        <!-- Upcoming Phases -->
        <Card>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium text-gray-900">Nadchodzące etapy</h3>
              <NuxtLink
                to="/planning"
                class="text-sm text-blue-600 hover:text-blue-500"
              >
                Zobacz wszystkie
              </NuxtLink>
            </div>
          </template>
          <div class="text-center py-6 text-gray-600">
            <Calendar class="mx-auto h-8 w-8 mb-2" />
            Funkcja planowania etapów będzie dostępna wkrótce
          </div>
        </Card>
      </div>
    </div>

    <!-- Project Modal -->
    <Modal :show="showProjectModal" title="Nowy projekt" @close="showProjectModal = false">
      <form @submit.prevent="createProject" class="space-y-4">
        <Input
          v-model="newProject.name"
          label="Nazwa projektu"
          placeholder="np. Remont mieszkania na Mokotowie"
          required
        />
        <Input
          v-model="newProject.total_budget"
          type="number"
          label="Całkowity budżet (PLN)"
          placeholder="0"
          min="0"
          step="0.01"
        />
        <Input
          v-model="newProject.own_budget"
          type="number"
          label="Budżet własny (PLN)"
          placeholder="0"
          min="0"
          step="0.01"
        />
      </form>
      
      <template #footer>
        <Button
          type="button"
          variant="outline"
          @click="showProjectModal = false"
          class="mr-3"
        >
          Anuluj
        </Button>
        <Button @click="createProject" :disabled="!newProject.name">
          Utwórz projekt
        </Button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  Plus, Home, Receipt, Calendar, PieChart, TrendingUp,
  Wallet, DollarSign, AlertTriangle, Target
} from 'lucide-vue-next'
import { useProjectsStore } from '~/stores/projects'
import { useProjects } from '~/composables/useProjects'
import { useExpenses } from '~/composables/useExpenses'
import { useBudget } from '~/composables/useBudget'
import Button from '~/components/ui/Button.vue'
import Card from '~/components/ui/Card.vue'
import Modal from '~/components/ui/Modal.vue'
import Input from '~/components/ui/Input.vue'
import type { Project } from '~/types'

const projectsStore = useProjectsStore()
const { projects, fetchProjects, createProject: createProjectApi } = useProjects()

const showProjectModal = ref(false)
const newProject = ref({
  name: '',
  total_budget: '',
  own_budget: ''
})

const hasCurrentProject = computed(() => projectsStore.hasCurrentProject)
const currentProjectId = computed(() => projectsStore.currentProject?.id || null)

// Initialize composables
const { expenses } = useExpenses(currentProjectId)
const { budgetSummary } = useBudget(currentProjectId)

const recentExpenses = computed(() => expenses.value.slice(0, 5))

const quickStats = computed(() => [
  {
    name: 'Całkowity budżet',
    value: formatCurrency(projectsStore.currentProject?.total_budget || 0),
    icon: Target,
    color: 'blue',
    change: '100%',
    changeText: 'całkowitego budżetu'
  },
  {
    name: 'Wykorzystano',
    value: formatCurrency(budgetSummary.value.totalSpent),
    icon: DollarSign,
    color: 'green',
    change: `${((projectsStore.currentProject?.total_budget || 0) > 0 ? (budgetSummary.value.totalSpent / (projectsStore.currentProject?.total_budget || 1) * 100) : 0).toFixed(1)}%`,
    changeText: 'budżetu'
  },
  {
    name: 'Pozostało',
    value: formatCurrency((projectsStore.currentProject?.total_budget || 0) - budgetSummary.value.totalSpent),
    icon: Wallet,
    color: 'purple',
    change: `${((projectsStore.currentProject?.total_budget || 0) > 0 ? ((((projectsStore.currentProject?.total_budget || 0) - budgetSummary.value.totalSpent) / (projectsStore.currentProject?.total_budget || 1)) * 100) : 0).toFixed(1)}%`,
    changeText: 'do wykorzystania'
  },
  {
    name: 'Pożyczki',
    value: formatCurrency(budgetSummary.value.borrowedTotal),
    icon: AlertTriangle,
    color: 'orange',
    change: '0%',
    changeText: 'oprocentowania'
  }
])

const createProject = async () => {
  if (!newProject.value.name) return

  const projectData: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
    name: newProject.value.name,
    total_budget: Number(newProject.value.total_budget) || 0,
    own_budget: Number(newProject.value.own_budget) || 0
  }

  const created = await createProjectApi(projectData)
  if (created) {
    projectsStore.setCurrentProject(created)
    showProjectModal.value = false
    newProject.value = { name: '', total_budget: '', own_budget: '' }
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN'
  }).format(amount)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}


onMounted(async () => {
  console.log('Dashboard onMounted - starting...')
  
  // Initialize auth first if not already done
  const authStore = useAuthStore()
  if (!authStore.user && authStore.loading) {
    console.log('Auth not initialized, waiting...')
    await authStore.initialize()
  }
  console.log('Auth user after init:', authStore.user)
  
  // Load current project from localStorage
  projectsStore.loadCurrentProject()
  console.log('Current project from localStorage:', projectsStore.currentProject)
  
  // If user is authenticated, fetch all projects from database
  if (authStore.user) {
    console.log('Fetching projects from database...')
    await fetchProjects()
    console.log('Projects fetched:', projectsStore.projects)
    
    // If no current project but user has projects, set the first one as current
    if (!projectsStore.hasCurrentProject && projectsStore.projects.length > 0) {
      const firstProject = projectsStore.projects[0]
      if (firstProject) {
        console.log('Setting first project as current:', firstProject)
        projectsStore.setCurrentProject(firstProject)
      }
    }
  } else {
    console.log('No user found, redirecting to login...')
    await navigateTo('/auth/login')
  }
  
  console.log('Dashboard initialization complete')
})
</script>