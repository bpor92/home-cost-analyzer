import { ref, watch, computed } from 'vue'
import type { Ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useApiClient } from './useApiClient'
import type { Expense, ExpenseWithCategory, FilterOptions } from '~/types'

export const useExpenses = (projectId: Ref<string | null>) => {
  const authStore = useAuthStore()
  const { apiCall, createCrudOperations } = useApiClient()
  const expenses = ref<ExpenseWithCategory[]>([])
  
  const { loading, error, withErrorHandling } = createCrudOperations<ExpenseWithCategory>('/api/expenses')

  const fetchExpenses = async () => {
    if (!projectId.value) {
      expenses.value = []
      return
    }

    const result = await withErrorHandling(async () => {
      return await apiCall<{ data: ExpenseWithCategory[] }>(`/api/expenses/${projectId.value}`)
    })

    if (result) {
      expenses.value = result.data || []
    } else {
      expenses.value = []
    }
  }

  const addExpense = async (expenseData: Omit<Expense, 'id' | 'created_at'>) => {
    const result = await withErrorHandling(async () => {
      return await apiCall<{ data: ExpenseWithCategory }>('/api/expenses', {
        method: 'POST',
        body: expenseData
      })
    })

    if (result) {
      const data = result.data
      if (data) {
        expenses.value.unshift(data)
      }
      return data
    }
    throw new Error('Failed to add expense')
  }

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    const result = await withErrorHandling(async () => {
      return await apiCall<{ data: ExpenseWithCategory }>(`/api/expenses/${id}`, {
        method: 'PUT',
        body: updates
      })
    })

    if (result) {
      const data = result.data
      if (data) {
        const index = expenses.value.findIndex(expense => expense.id === id)
        if (index !== -1) {
          expenses.value[index] = data
        }
      }
      return data
    }
    throw new Error('Failed to update expense')
  }

  const deleteExpense = async (id: string) => {
    const result = await withErrorHandling(async () => {
      return await apiCall(`/api/expenses/${id}`, {
        method: 'DELETE'
      })
    })

    if (result !== null) {
      expenses.value = expenses.value.filter(expense => expense.id !== id)
      return true
    }
    throw new Error('Failed to delete expense')
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
    expenses,
    loading,
    error,
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