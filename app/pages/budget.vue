<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Zarządzanie Budżetem</h1>
        <p v-if="currentProject" class="text-sm text-gray-600 mt-1">
          Projekt: {{ currentProject.name }}
        </p>
      </div>
      <div class="mt-4 sm:mt-0 flex gap-3">
        <Button v-if="currentProject && categories.length === 0" @click="initializeCategories" :disabled="loading">
          <Plus class="mr-2 h-4 w-4" />
          Inicjalizuj kategorie
        </Button>
        <Button @click="showAddCategoryModal = true" :disabled="!currentProject">
          <Plus class="mr-2 h-4 w-4" />
          Dodaj kategorię
        </Button>
      </div>
    </div>

    <!-- No Project Selected -->
    <Card v-if="!currentProject" class="text-center py-12">
      <FolderOpen class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">Brak wybranego projektu</h3>
      <p class="mt-1 text-sm text-gray-600">Wybierz projekt aby zarządzać jego budżetem</p>
      <div class="mt-6">
        <router-link to="/projects">
          <Button>
            <FolderOpen class="mr-2 h-4 w-4" />
            Przejdź do projektów
          </Button>
        </router-link>
      </div>
    </Card>

    <!-- Budget Overview -->
    <div v-else-if="currentProject" class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
      <Card class="bg-blue-50 border-blue-200">
        <div class="p-5">
          <div class="flex items-center">
            <Target class="h-6 w-6 text-blue-600" />
            <div class="ml-3">
              <p class="text-sm font-medium text-blue-700">Całkowity budżet</p>
              <p class="text-xl font-semibold text-blue-900">
                {{ formatCurrency(currentProject.total_budget) }}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card class="bg-green-50 border-green-200">
        <div class="p-5">
          <div class="flex items-center">
            <Wallet class="h-6 w-6 text-green-600" />
            <div class="ml-3">
              <p class="text-sm font-medium text-green-700">Własny budżet</p>
              <p class="text-xl font-semibold text-green-900">
                {{ formatCurrency(currentProject.own_budget) }}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card class="bg-orange-50 border-orange-200">
        <div class="p-5">
          <div class="flex items-center">
            <TrendingUp class="h-6 w-6 text-orange-600" />
            <div class="ml-3">
              <p class="text-sm font-medium text-orange-700">Pożyczki</p>
              <p class="text-xl font-semibold text-orange-900">
                {{ formatCurrency(totalBorrowedAmount) }}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card class="bg-purple-50 border-purple-200">
        <div class="p-5">
          <div class="flex items-center">
            <DollarSign class="h-6 w-6 text-purple-600" />
            <div class="ml-3">
              <p class="text-sm font-medium text-purple-700">Wydano</p>
              <p class="text-xl font-semibold text-purple-900">
                {{ formatCurrency(totalSpentBudget) }}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card class="bg-indigo-50 border-indigo-200">
        <div class="p-5">
          <div class="flex items-center">
            <Calculator class="h-6 w-6 text-indigo-600" />
            <div class="ml-3">
              <p class="text-sm font-medium text-indigo-700">Zaplanowano</p>
              <p class="text-xl font-semibold text-indigo-900">
                {{ formatCurrency(totalPlannedBudget) }}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- Budget Categories -->
    <Card v-if="currentProject">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">Kategorie budżetowe</h3>
          <Button @click="showAddBorrowedModal = true" variant="outline" size="sm">
            <Plus class="mr-2 h-4 w-4" />
            Dodaj pożyczkę
          </Button>
        </div>
      </template>

      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <div v-else-if="categories.length === 0" class="text-center py-8">
        <Wallet class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">Brak kategorii budżetowych</h3>
        <p class="mt-1 text-sm text-gray-600">Zacznij od dodania pierwszej kategorii</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="category in categoriesWithProgress"
          :key="category.id"
          class="border border-gray-200 rounded-lg p-4"
        >
          <div class="flex items-center justify-between mb-3">
            <h4 class="font-medium text-gray-900">{{ category.name }}</h4>
            <div class="flex gap-2">
              <Button variant="outline" size="sm" @click="editCategory(category)">
                <Edit class="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" @click="confirmDeleteCategory(category)" class="text-red-600">
                <Trash2 class="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div class="grid grid-cols-3 gap-4 text-sm mb-3">
            <div>
              <span class="text-gray-600">Planowano:</span>
              <span class="font-medium ml-1 text-gray-900">{{ formatCurrency(category.planned_amount) }}</span>
            </div>
            <div>
              <span class="text-gray-600">Wydano:</span>
              <span class="font-medium ml-1 text-gray-900">{{ formatCurrency(category.spent_amount) }}</span>
            </div>
            <div>
              <span class="text-gray-600">Pozostało:</span>
              <span class="font-medium ml-1 text-gray-900">{{ formatCurrency(category.planned_amount - category.spent_amount) }}</span>
            </div>
          </div>
          
          <!-- Progress bar -->
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="h-2 rounded-full transition-all"
              :class="category.spentPercentage > 100 ? 'bg-red-500' : 'bg-blue-500'"
              :style="{ width: `${Math.min(category.spentPercentage, 100)}%` }"
            ></div>
          </div>
          <div class="text-xs text-gray-600 mt-1 text-right">
            {{ category.spentPercentage.toFixed(1) }}%
          </div>
        </div>
      </div>
    </Card>

    <!-- Borrowed Funds -->
    <Card v-if="currentProject && borrowedFunds.length > 0">
      <template #header>
        <h3 class="text-lg font-medium text-gray-900">Pożyczki</h3>
      </template>
      
      <div class="space-y-4">
        <div
          v-for="fund in borrowedFunds"
          :key="fund.id"
          class="border border-gray-200 rounded-lg p-4"
        >
          <div class="flex items-center justify-between mb-2">
            <h4 class="font-medium text-gray-900">{{ fund.source }}</h4>
            <div class="flex gap-2">
              <Button variant="outline" size="sm" @click="editBorrowedFund(fund)">
                <Edit class="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" @click="confirmDeleteBorrowedFund(fund)" class="text-red-600">
                <Trash2 class="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div class="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span class="text-gray-600">Kwota:</span>
              <span class="font-medium ml-1">{{ formatCurrency(fund.amount) }}</span>
            </div>
            <div>
              <span class="text-gray-600">Oprocentowanie:</span>
              <span class="font-medium ml-1">{{ fund.interest_rate }}%</span>
            </div>
            <div>
              <span class="text-gray-600">Termin spłaty:</span>
              <span class="font-medium ml-1">
                {{ fund.due_date ? formatDate(fund.due_date) : 'Brak' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <!-- Add Category Modal -->
    <Modal v-model:open="showAddCategoryModal">
      <div class="p-6">
        <h3 class="text-lg font-medium mb-4">
          {{ editingCategory ? 'Edytuj kategorię' : 'Dodaj kategorię budżetową' }}
        </h3>
        
        <form @submit.prevent="saveCategory" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Nazwa kategorii
            </label>
            <Input
              v-model="categoryForm.name"
              placeholder="np. Wykończenie podłóg"
              required
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Planowana kwota (zł)
            </label>
            <Input
              v-model.number="categoryForm.planned_amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              required
            />
          </div>
          
          <div class="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" @click="cancelCategoryEdit">
              Anuluj
            </Button>
            <Button type="submit" :disabled="saving">
              {{ saving ? 'Zapisywanie...' : (editingCategory ? 'Zapisz zmiany' : 'Dodaj kategorię') }}
            </Button>
          </div>
        </form>
      </div>
    </Modal>

    <!-- Add Borrowed Fund Modal -->
    <Modal v-model:open="showAddBorrowedModal">
      <div class="p-6">
        <h3 class="text-lg font-medium mb-4">
          {{ editingBorrowedFund ? 'Edytuj pożyczkę' : 'Dodaj pożyczkę' }}
        </h3>
        
        <form @submit.prevent="saveBorrowedFund" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Źródło pożyczki
            </label>
            <Input
              v-model="borrowedForm.source"
              placeholder="np. Bank ABC, Rodzice"
              required
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Kwota (zł)
            </label>
            <Input
              v-model.number="borrowedForm.amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              required
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Oprocentowanie (%)
            </label>
            <Input
              v-model.number="borrowedForm.interest_rate"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Termin spłaty
            </label>
            <Input
              v-model="borrowedForm.due_date"
              type="date"
            />
          </div>
          
          <div class="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" @click="cancelBorrowedEdit">
              Anuluj
            </Button>
            <Button type="submit" :disabled="saving">
              {{ saving ? 'Zapisywanie...' : (editingBorrowedFund ? 'Zapisz zmiany' : 'Dodaj pożyczkę') }}
            </Button>
          </div>
        </form>
      </div>
    </Modal>

    <!-- Delete Confirmation Modal -->
    <Modal v-model:open="showDeleteModal">
      <div class="p-6">
        <h3 class="text-lg font-medium mb-4 text-red-800">Potwierdź usunięcie</h3>
        <p class="text-sm text-gray-600 mb-6">
          {{ deleteConfirmText }}
        </p>
        
        <div class="flex justify-end gap-3">
          <Button variant="outline" @click="showDeleteModal = false">
            Anuluj
          </Button>
          <Button @click="confirmDelete" :disabled="deleting" class="bg-red-600 hover:bg-red-700">
            {{ deleting ? 'Usuwanie...' : 'Usuń' }}
          </Button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useProjectsStore } from '~/stores/projects'
import { useBudget } from '~/composables/useBudget'
import type { BudgetCategory, BorrowedFund } from '~/types'
import Button from '~/components/ui/Button.vue'
import Card from '~/components/ui/Card.vue'
import Input from '~/components/ui/Input.vue'
import Modal from '~/components/ui/Modal.vue'
import {
  Wallet,
  Plus,
  Target,
  TrendingUp,
  DollarSign,
  Edit,
  Trash2,
  FolderOpen,
  Calculator
} from 'lucide-vue-next'

const projectsStore = useProjectsStore()

const currentProject = computed(() => projectsStore.currentProject)
const currentProjectId = computed(() => projectsStore.currentProject?.id || null)

const {
  categories,
  borrowedFunds,
  loading,
  error,
  totalPlannedBudget,
  totalSpentBudget,
  totalBorrowedAmount,
  budgetSummary,
  categoriesWithProgress,
  fetchBudgetData,
  initializeDefaultCategories,
  addBudgetCategory,
  updateBudgetCategory,
  deleteBudgetCategory,
  addBorrowedFund,
  updateBorrowedFund,
  deleteBorrowedFund
} = useBudget(currentProjectId)

// Modal states
const showAddCategoryModal = ref(false)
const showAddBorrowedModal = ref(false)
const showDeleteModal = ref(false)
const saving = ref(false)
const deleting = ref(false)

// Form states
const editingCategory = ref<BudgetCategory | null>(null)
const editingBorrowedFund = ref<BorrowedFund | null>(null)
const itemToDelete = ref<{ type: 'category' | 'borrowed', item: any } | null>(null)

const categoryForm = reactive({
  name: '',
  planned_amount: 0
})

const borrowedForm = reactive({
  source: '',
  amount: 0,
  interest_rate: 0,
  due_date: ''
})

const deleteConfirmText = computed(() => {
  if (!itemToDelete.value) return ''
  
  if (itemToDelete.value.type === 'category') {
    return `Czy na pewno chcesz usunąć kategorię "${itemToDelete.value.item.name}"?`
  } else {
    return `Czy na pewno chcesz usunąć pożyczkę od "${itemToDelete.value.item.source}"?`
  }
})

const initializeCategories = async () => {
  await initializeDefaultCategories()
}

const resetCategoryForm = () => {
  categoryForm.name = ''
  categoryForm.planned_amount = 0
  editingCategory.value = null
}

const resetBorrowedForm = () => {
  borrowedForm.source = ''
  borrowedForm.amount = 0
  borrowedForm.interest_rate = 0
  borrowedForm.due_date = ''
  editingBorrowedFund.value = null
}

const editCategory = (category: BudgetCategory) => {
  editingCategory.value = category
  categoryForm.name = category.name
  categoryForm.planned_amount = category.planned_amount
  showAddCategoryModal.value = true
}

const editBorrowedFund = (fund: BorrowedFund) => {
  editingBorrowedFund.value = fund
  borrowedForm.source = fund.source
  borrowedForm.amount = fund.amount
  borrowedForm.interest_rate = fund.interest_rate
  borrowedForm.due_date = fund.due_date || ''
  showAddBorrowedModal.value = true
}

const cancelCategoryEdit = () => {
  showAddCategoryModal.value = false
  resetCategoryForm()
}

const cancelBorrowedEdit = () => {
  showAddBorrowedModal.value = false
  resetBorrowedForm()
}

const saveCategory = async () => {
  saving.value = true
  
  try {
    if (editingCategory.value) {
      await updateBudgetCategory(editingCategory.value.id, {
        name: categoryForm.name,
        planned_amount: categoryForm.planned_amount
      })
    } else {
      await addBudgetCategory({
        name: categoryForm.name,
        planned_amount: categoryForm.planned_amount,
        spent_amount: 0
      })
    }
    
    showAddCategoryModal.value = false
    resetCategoryForm()
  } finally {
    saving.value = false
  }
}

const saveBorrowedFund = async () => {
  saving.value = true
  
  try {
    const fundData = {
      source: borrowedForm.source,
      amount: borrowedForm.amount,
      interest_rate: borrowedForm.interest_rate,
      due_date: borrowedForm.due_date || null
    }
    
    if (editingBorrowedFund.value) {
      await updateBorrowedFund(editingBorrowedFund.value.id, fundData)
    } else {
      await addBorrowedFund(fundData)
    }
    
    showAddBorrowedModal.value = false
    resetBorrowedForm()
  } finally {
    saving.value = false
  }
}

const confirmDeleteCategory = (category: BudgetCategory) => {
  itemToDelete.value = { type: 'category', item: category }
  showDeleteModal.value = true
}

const confirmDeleteBorrowedFund = (fund: BorrowedFund) => {
  itemToDelete.value = { type: 'borrowed', item: fund }
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!itemToDelete.value) return
  
  deleting.value = true
  
  try {
    if (itemToDelete.value.type === 'category') {
      await deleteBudgetCategory(itemToDelete.value.item.id)
    } else {
      await deleteBorrowedFund(itemToDelete.value.item.id)
    }
    
    showDeleteModal.value = false
    itemToDelete.value = null
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
  projectsStore.loadCurrentProject()
})
</script>