import { ref, readonly, watch, computed } from 'vue'
import type { Ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import type { BudgetCategory, BorrowedFund, BudgetSummary, CategoryWithSpent } from '~/types'

export const useBudget = (projectId: Ref<string | null>) => {
  const authStore = useAuthStore()
  const categories = ref<BudgetCategory[]>([])
  const borrowedFunds = ref<BorrowedFund[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getAuthHeaders = () => {
    const token = authStore.user?.access_token
    return token ? { Authorization: `Bearer ${token}` } : undefined
  }

  const defaultCategories = [
    'Instalacje (elektryka, hydraulika, gaz)',
    'Wykończenie podłóg',
    'Malowanie i tynki',
    'Łazienka',
    'Kuchnia',
    'Drzwi i okna',
    'Inne/Nieprzewidziane'
  ]

  const fetchBudgetData = async () => {
    if (!projectId.value) return
    
    loading.value = true
    error.value = null
    
    try {
      // Fetch budget categories
      const categoriesResponse = await $fetch(`/api/budget-categories/${projectId.value}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      categories.value = categoriesResponse.data || []

      // TODO: Add borrowed funds API endpoint
      // For now, initialize as empty array
      borrowedFunds.value = []

    } catch (err: any) {
      error.value = err.statusMessage || err.message || 'Failed to fetch budget data'
      console.error('Error fetching budget data:', err)
    } finally {
      loading.value = false
    }
  }

  const initializeDefaultCategories = async () => {
    if (!projectId.value) return

    try {
      // Create default categories via API
      for (const name of defaultCategories) {
        await $fetch('/api/budget-categories', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: {
            project_id: projectId.value,
            name,
            planned_amount: 0,
            spent_amount: 0
          }
        })
      }

      await fetchBudgetData()
    } catch (err: any) {
      error.value = err.statusMessage || err.message || 'Failed to initialize default categories'
      console.error('Error initializing categories:', err)
    }
  }

  const addBudgetCategory = async (categoryData: Omit<BudgetCategory, 'id' | 'project_id' | 'created_at'>) => {
    if (!projectId.value) return null

    try {
      const response = await $fetch('/api/budget-categories', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: {
          ...categoryData,
          project_id: projectId.value
        }
      })

      const newCategory = response.data
      categories.value.push(newCategory)
      return newCategory
    } catch (err: any) {
      error.value = err.statusMessage || err.message || 'Failed to add budget category'
      console.error('Error adding category:', err)
      return null
    }
  }

  // Simplified functions for now - TODO: implement API endpoints
  const updateBudgetCategory = async (id: string, updates: Partial<BudgetCategory>) => {
    return null
  }

  const deleteBudgetCategory = async (id: string) => {
    return false
  }

  const addBorrowedFund = async (fundData: Omit<BorrowedFund, 'id' | 'project_id' | 'created_at'>) => {
    return null
  }

  const updateBorrowedFund = async (id: string, updates: Partial<BorrowedFund>) => {
    return null
  }

  const deleteBorrowedFund = async (id: string) => {
    return false
  }

  // Computed properties
  const totalPlannedBudget = computed(() => {
    return categories.value.reduce((sum, category) => sum + category.planned_amount, 0)
  })

  const totalSpentBudget = computed(() => {
    return categories.value.reduce((sum, category) => sum + category.spent_amount, 0)
  })

  const totalBorrowedAmount = computed(() => {
    return borrowedFunds.value.reduce((sum, fund) => sum + fund.amount, 0)
  })

  const budgetSummary = computed<BudgetSummary>(() => {
    const totalBudget = totalPlannedBudget.value + totalBorrowedAmount.value
    const totalSpent = totalSpentBudget.value
    const remainingBudget = totalBudget - totalSpent
    const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

    return {
      totalBudget,
      ownBudget: totalPlannedBudget.value,
      borrowedTotal: totalBorrowedAmount.value,
      totalSpent,
      remainingBudget,
      spentPercentage
    }
  })

  const categoriesWithProgress = computed<CategoryWithSpent[]>(() => {
    return categories.value.map(category => ({
      ...category,
      expenses: [], // TODO: fetch expenses
      spentPercentage: category.planned_amount > 0 ? (category.spent_amount / category.planned_amount) * 100 : 0
    }))
  })

  // Watch for project changes and fetch data
  watch(projectId, (newProjectId) => {
    if (newProjectId) {
      fetchBudgetData()
    }
  }, { immediate: true })

  return {
    categories: readonly(categories),
    borrowedFunds: readonly(borrowedFunds),
    loading: readonly(loading),
    error: readonly(error),
    totalPlannedBudget,
    totalSpentBudget,
    totalBorrowedAmount,
    budgetSummary,
    categoriesWithProgress,
    fetchBudgetData,
    initializeDefaultCategories: initializeDefaultCategories,
    addBudgetCategory,
    updateBudgetCategory,
    deleteBudgetCategory,
    addBorrowedFund,
    updateBorrowedFund,
    deleteBorrowedFund
  }
}