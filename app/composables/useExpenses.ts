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
    if (!projectId.value) {
      expenses.value = []
      return
    }

    loading.value = true
    error.value = null

    const headers = getAuthHeaders()

    try {
      // @ts-ignore - Complex Nuxt route typing issue
      const response = await $fetch(`/api/expenses/${projectId.value}`, {
        headers
      }) as { data: ExpenseWithCategory[] }
      const data = response.data
      expenses.value = data || []
    } catch (err: any) {
      console.error('Error fetching expenses:', err)
      error.value = err.message || 'Failed to fetch expenses'
      expenses.value = []
    } finally {
      loading.value = false
    }
  }

  const addExpense = async (expenseData: Omit<Expense, 'id' | 'created_at'>) => {
    loading.value = true
    error.value = null

    try {
      // @ts-ignore - Complex Nuxt route typing issue
      const response = await $fetch('/api/expenses', {
        method: 'POST',
        body: expenseData,
        headers: getAuthHeaders()
      }) as { data: ExpenseWithCategory }
      const data = response.data
      
      if (data) {
        expenses.value.unshift(data)
      }
      
      return data
    } catch (err: any) {
      console.error('Error adding expense:', err)
      error.value = err.message || 'Failed to add expense'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    loading.value = true
    error.value = null

    try {
      // @ts-ignore - Complex Nuxt route typing issue
      const response = await $fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        body: updates,
        headers: getAuthHeaders()
      }) as { data: ExpenseWithCategory }
      const data = response.data
      
      if (data) {
        const index = expenses.value.findIndex(expense => expense.id === id)
        if (index !== -1) {
          expenses.value[index] = data
        }
      }
      
      return data
    } catch (err: any) {
      console.error('Error updating expense:', err)
      error.value = err.message || 'Failed to update expense'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteExpense = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      // @ts-ignore - Complex Nuxt route typing issue
      await $fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      
      expenses.value = expenses.value.filter(expense => expense.id !== id)
      return true
    } catch (err: any) {
      console.error('Error deleting expense:', err)
      error.value = err.message || 'Failed to delete expense'
      throw err
    } finally {
      loading.value = false
    }
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