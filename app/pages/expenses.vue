<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Wydatki</h1>
      <div class="mt-4 sm:mt-0">
        <Button @click="openAddModal">
          <Plus class="mr-2 h-4 w-4" />
          Dodaj wydatek
        </Button>
      </div>
    </div>

    <!-- Filters -->
    <Card>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          v-model="filters.dateFrom"
          type="date"
          label="Data od"
        />
        <Input
          v-model="filters.dateTo"
          type="date"
          label="Data do"
        />
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Kategoria
          </label>
          <select
            v-model="filters.category"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-gray-900 bg-white"
          >
            <option value="">Wszystkie kategorie</option>
            <option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </div>
        <div class="flex items-end">
          <Button
            type="button"
            variant="outline"
            @click="clearFilters"
            size="md"
            class="w-full"
          >
            Wyczyść filtry
          </Button>
        </div>
      </div>
    </Card>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <DollarSign class="h-8 w-8 text-green-600" />
          </div>
          <div class="ml-5">
            <div class="text-sm font-medium text-gray-600">Łączne wydatki</div>
            <div class="text-2xl font-bold text-gray-900">
              {{ formatCurrency(totalExpenseAmount) }}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <Receipt class="h-8 w-8 text-blue-600" />
          </div>
          <div class="ml-5">
            <div class="text-sm font-medium text-gray-600">Liczba wydatków</div>
            <div class="text-2xl font-bold text-gray-900">
              {{ filteredExpenses.length }}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <TrendingUp class="h-8 w-8 text-purple-600" />
          </div>
          <div class="ml-5">
            <div class="text-sm font-medium text-gray-600">Średni wydatek</div>
            <div class="text-2xl font-bold text-gray-900">
              {{ formatCurrency(averageExpense) }}
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- Expenses List -->
    <Card>
      <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table class="min-w-full divide-y divide-gray-300">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Wydatek
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Kategoria / Etap
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Kwota
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Data
              </th>
              <th class="relative px-6 py-3">
                <span class="sr-only">Akcje</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="expense in paginatedExpenses"
              :key="expense.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ expense.name }}
                  </div>
                  <div v-if="expense.description" class="text-sm text-gray-600">
                    {{ expense.description }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="space-y-1">
                  <span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                    {{ expense.budget_categories?.name || 'Bez kategorii' }}
                  </span>
                  <div v-if="expense.renovation_phases?.name" class="text-xs text-blue-600">
                    Etap: {{ expense.renovation_phases.name }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ formatCurrency(expense.amount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ formatDate(expense.expense_date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="editExpense(expense)"
                  class="text-primary-600 hover:text-primary-900 mr-4"
                >
                  Edytuj
                </button>
                <button
                  @click="deleteExpenseItem(expense.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  Usuń
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="filteredExpenses.length === 0" class="text-center py-12">
          <Receipt class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">Brak wydatków</h3>
          <p class="mt-1 text-sm text-gray-600">Zacznij od dodania pierwszego wydatku</p>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div class="flex flex-1 justify-between sm:hidden">
          <Button
            variant="outline"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            Poprzednia
          </Button>
          <Button
            variant="outline"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            Następna
          </Button>
        </div>
        <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Wyniki
              <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span>
              -
              <span class="font-medium">{{ Math.min(currentPage * pageSize, filteredExpenses.length) }}</span>
              z
              <span class="font-medium">{{ filteredExpenses.length }}</span>
            </p>
          </div>
          <div>
            <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm">
              <button
                :disabled="currentPage === 1"
                @click="currentPage--"
                class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
              >
                <ChevronLeft class="h-5 w-5" />
              </button>
              <button
                v-for="page in visiblePages"
                :key="page"
                :class="[
                  'relative inline-flex items-center px-4 py-2 text-sm font-semibold',
                  page === currentPage
                    ? 'z-10 bg-primary-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                ]"
                @click="currentPage = page"
              >
                {{ page }}
              </button>
              <button
                :disabled="currentPage === totalPages"
                @click="currentPage++"
                class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
              >
                <ChevronRight class="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </Card>

    <!-- Add Expense Modal -->
    <div v-if="showAddExpenseModal || !!editingExpense" class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center" @click="closeExpenseModal">
      <div class="bg-white p-6 rounded-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto" @click.stop>
        <h2 class="text-xl font-bold mb-4">
          {{ editingExpense ? 'Edytuj wydatek' : 'Dodaj nowy wydatek' }}
        </h2>
        
        <form @submit.prevent="saveExpense" class="space-y-4">
          <Input
            v-model="expenseForm.name"
            label="Nazwa wydatku"
            placeholder="np. Zakup płytek do łazienki"
            required
          />
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Etap (opcjonalnie)
            </label>
            <select
              v-model="expenseForm.phase_id"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-gray-900 bg-white"
              @change="onPhaseChange"
            >
              <option value="">Bez etapu</option>
              <option
                v-for="phase in phases"
                :key="phase.id"
                :value="phase.id"
              >
                {{ phase.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Kategoria
            </label>
            <select
              v-model="expenseForm.category_id"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-gray-900 bg-white"
              :disabled="!!expenseForm.phase_id && !!selectedPhaseCategory"
            >
              <option value="">Bez kategorii</option>
              <option
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
            <p v-if="expenseForm.phase_id && selectedPhaseCategory" class="text-xs text-blue-600 mt-1">
              Automatycznie ustawiono kategorię z etapu: {{ selectedPhaseCategory.name }}
            </p>
          </div>

          <Input
            v-model="expenseForm.amount"
            type="number"
            label="Kwota (PLN)"
            placeholder="0.00"
            min="0"
            step="0.01"
            required
          />

          <Input
            v-model="expenseForm.expense_date"
            type="date"
            label="Data wydatku"
            required
          />

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Opis (opcjonalnie)
            </label>
            <textarea
              v-model="expenseForm.description"
              rows="3"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Dodatkowe informacje o wydatku..."
            />
          </div>
        </form>

        <div class="mt-6 flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            @click="closeExpenseModal"
          >
            Anuluj
          </Button>
          <Button type="button" @click="saveExpense" :disabled="!canSaveExpense">
            {{ editingExpense ? 'Zapisz' : 'Dodaj wydatek' }}
          </Button>
        </div>
        
        <div class="text-xs text-gray-500 mt-2">
          Debug: canSave={{ canSaveExpense }}, projectId={{ currentProjectId }},
          name="{{ expenseForm.name }}", amount="{{ expenseForm.amount }}", date="{{ expenseForm.expense_date }}"
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, watchEffect } from 'vue'
import { 
  Plus, DollarSign, Receipt, TrendingUp,
  ChevronLeft, ChevronRight
} from 'lucide-vue-next'
import { useProjectsStore } from '~/stores/projects'
import { useAuthStore } from '~/stores/auth'
import { useExpenses } from '~/composables/useExpenses'
import { useBudget } from '~/composables/useBudget'
import { useRenovationPhases } from '~/composables/useRenovationPhases'
import Button from '~/components/ui/Button.vue'
import Card from '~/components/ui/Card.vue'
import Input from '~/components/ui/Input.vue'
import type { ExpenseWithCategory } from '~/types'

const projectsStore = useProjectsStore()
const currentProjectId = computed(() => projectsStore.currentProject?.id || null)

const { 
  expenses, 
  addExpense, 
  updateExpense, 
  deleteExpense 
} = useExpenses(currentProjectId)

const { categories } = useBudget(currentProjectId)
const { phases, fetchPhases } = useRenovationPhases()

// Modal states
const showAddExpenseModal = ref(false)
const editingExpense = ref<ExpenseWithCategory | null>(null)

// Form data
const expenseForm = ref({
  name: '',
  category_id: '',
  phase_id: '',
  amount: '',
  expense_date: '' as string,
  description: ''
})

// Filters
const filters = ref({
  dateFrom: '',
  dateTo: '',
  category: ''
})

// Pagination
const currentPage = ref(1)
const pageSize = ref(10)

// Computed properties
const filteredExpenses = computed(() => {
  let filtered = [...expenses.value]

  if (filters.value.dateFrom) {
    filtered = filtered.filter(e => e.expense_date >= filters.value.dateFrom)
  }

  if (filters.value.dateTo) {
    filtered = filtered.filter(e => e.expense_date <= filters.value.dateTo)
  }

  if (filters.value.category) {
    filtered = filtered.filter(e => e.category_id === filters.value.category)
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredExpenses.value.length / pageSize.value))

const paginatedExpenses = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredExpenses.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  const end = Math.min(totalPages.value, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

const totalExpenseAmount = computed(() => {
  return filteredExpenses.value.reduce((sum, expense) => sum + expense.amount, 0)
})

const averageExpense = computed(() => {
  return filteredExpenses.value.length > 0 
    ? totalExpenseAmount.value / filteredExpenses.value.length 
    : 0
})

const selectedPhase = computed(() => {
  if (!expenseForm.value.phase_id) return null
  return phases.value.find(phase => phase.id === expenseForm.value.phase_id)
})

const selectedPhaseCategory = computed(() => {
  if (!selectedPhase.value?.category_id) return null
  return categories.value.find(category => category.id === selectedPhase.value?.category_id)
})

const canSaveExpense = computed(() => {
  return expenseForm.value.name && 
         expenseForm.value.amount && 
         expenseForm.value.expense_date
})

// Methods
const openAddModal = () => {
  console.log('🔵 Opening add expense modal')
  showAddExpenseModal.value = true
}

const clearFilters = () => {
  filters.value = {
    dateFrom: '',
    dateTo: '',
    category: ''
  }
  currentPage.value = 1
}

const editExpense = (expense: ExpenseWithCategory) => {
  editingExpense.value = expense
  expenseForm.value = {
    name: expense.name,
    category_id: expense.category_id || '',
    phase_id: expense.phase_id || '',
    amount: expense.amount.toString(),
    expense_date: expense.expense_date,
    description: expense.description || ''
  }
}

const onPhaseChange = () => {
  // Auto-set category when phase is selected
  if (selectedPhaseCategory.value) {
    expenseForm.value.category_id = selectedPhaseCategory.value.id
  }
}

const closeExpenseModal = () => {
  showAddExpenseModal.value = false
  editingExpense.value = null
  expenseForm.value = {
    name: '',
    category_id: '',
    phase_id: '',
    amount: '',
    expense_date: '',
    description: ''
  }
}

const saveExpense = async () => {
  console.log('=== saveExpense function called ===')
  console.log('canSaveExpense:', canSaveExpense.value)
  console.log('currentProjectId:', currentProjectId.value)
  console.log('expenseForm:', expenseForm.value)
  
  if (!canSaveExpense.value) {
    console.log('❌ Cannot save - form validation failed')
    return
  }
  
  if (!currentProjectId.value) {
    console.log('❌ Cannot save - no current project')
    return
  }

  const expenseData = {
    project_id: currentProjectId.value,
    name: expenseForm.value.name,
    category_id: expenseForm.value.category_id || null,
    phase_id: expenseForm.value.phase_id || null,
    amount: parseFloat(expenseForm.value.amount),
    expense_date: expenseForm.value.expense_date,
    description: expenseForm.value.description || null,
    receipt_photo_url: null
  }

  console.log('💾 Saving expense data:', expenseData)

  try {
    if (editingExpense.value) {
      console.log('📝 Updating existing expense')
      await updateExpense(editingExpense.value.id, expenseData)
    } else {
      console.log('➕ Adding new expense')
      await addExpense(expenseData)
    }
    console.log('✅ Expense saved successfully')
    closeExpenseModal()
  } catch (error) {
    console.error('❌ Error saving expense:', error)
  }
}

const deleteExpenseItem = async (id: string) => {
  if (confirm('Czy na pewno chcesz usunąć ten wydatek?')) {
    await deleteExpense(id)
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

// Watch for filter changes to reset pagination
watch(filters, () => {
  currentPage.value = 1
}, { deep: true })

// Set default date to today when adding new expense
watch(showAddExpenseModal, (show) => {
  if (show && !editingExpense.value) {
    expenseForm.value.expense_date = new Date().toISOString().split('T')[0] || ''
  }
})

// Check auth and load data on mount
const authStore = useAuthStore()

// Add auth check
watchEffect(() => {
  if (!authStore.loading && !authStore.user) {
    navigateTo('/auth/login')
    return
  }
})

// Load data on mount
projectsStore.loadCurrentProject()

// Load phases when project changes
watch(() => projectsStore.currentProject, () => {
  if (projectsStore.currentProject) {
    fetchPhases(projectsStore.currentProject.id)
  }
}, { immediate: true })
</script>