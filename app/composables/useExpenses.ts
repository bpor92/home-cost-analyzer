import { ref, readonly, watch, computed } from 'vue'
import type { Ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import type { Expense, ExpenseWithCategory, FilterOptions } from '~/types'

export const useExpenses = (projectId: Ref<string | null>) => {
  const authStore = useAuthStore()
  const expenses = ref<ExpenseWithCategory[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getAuthHeaders = () => {
    const token = authStore.user?.access_token
    return token ? { Authorization: `Bearer ${token}` } : undefined
  }

  const fetchExpenses = async () => {
    console.log('fetchExpenses not yet implemented via API', { projectId: projectId.value })
    expenses.value = []
  }

  const addExpense = async (expenseData: Omit<Expense, 'id' | 'created_at'>) => {
    console.log('addExpense not yet implemented via API', { expenseData })
    return null
  }

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    console.log('updateExpense not yet implemented via API', { id, updates })
    return null
  }

  const deleteExpense = async (id: string) => {
    console.log('deleteExpense not yet implemented via API', { id })
    return false
  }

  const filterExpenses = (filters: FilterOptions) => {
    return computed(() => {
      let filtered = expenses.value

      if (filters.dateFrom) {
        filtered = filtered.filter(e => e.expense_date >= filters.dateFrom!)
      }

      if (filters.dateTo) {
        filtered = filtered.filter(e => e.expense_date <= filters.dateTo!)
      }

      if (filters.category) {
        filtered = filtered.filter(e => e.category_id === filters.category)
      }

      if (filters.minAmount !== undefined) {
        filtered = filtered.filter(e => e.amount >= filters.minAmount!)
      }

      if (filters.maxAmount !== undefined) {
        filtered = filtered.filter(e => e.amount <= filters.maxAmount!)
      }

      return filtered
    })
  }

  const totalSpent = computed(() => {
    return expenses.value.reduce((sum, expense) => sum + expense.amount, 0)
  })

  const expensesByCategory = computed(() => {
    const categories = new Map<string, { name: string, total: number, count: number }>()
    
    expenses.value.forEach(expense => {
      const categoryName = expense.budget_categories?.name || 'Bez kategorii'
      const existing = categories.get(categoryName)
      
      if (existing) {
        existing.total += expense.amount
        existing.count += 1
      } else {
        categories.set(categoryName, {
          name: categoryName,
          total: expense.amount,
          count: 1
        })
      }
    })
    
    return Array.from(categories.values())
  })

  // Watch for project changes
  watch(projectId, () => {
    if (projectId.value) {
      fetchExpenses()
    } else {
      expenses.value = []
    }
  }, { immediate: true })

  const getExpensesForPhase = (phaseId: string) => {
    return computed(() => expenses.value.filter(expense => expense.phase_id === phaseId))
  }

  const getPhaseExpenseTotal = (phaseId: string) => {
    return computed(() => {
      return expenses.value
        .filter(expense => expense.phase_id === phaseId)
        .reduce((sum, expense) => sum + expense.amount, 0)
    })
  }

  return {
    expenses: readonly(expenses),
    loading: readonly(loading),
    error: readonly(error),
    totalSpent,
    expensesByCategory,
    fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    filterExpenses,
    getExpensesForPhase,
    getPhaseExpenseTotal
  }
}