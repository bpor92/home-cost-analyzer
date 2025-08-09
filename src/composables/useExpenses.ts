import { ref, readonly, watch, computed } from 'vue'
import type { Ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Expense, ExpenseWithCategory, FilterOptions } from '@/types'

export const useExpenses = (projectId: Ref<string | null>) => {
  const expenses = ref<ExpenseWithCategory[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchExpenses = async () => {
    if (!projectId.value) return
    
    loading.value = true
    error.value = null
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('expenses')
        .select(`
          *,
          budget_categories(name)
        `)
        .eq('project_id', projectId.value)
        .order('expense_date', { ascending: false })

      if (supabaseError) throw supabaseError
      expenses.value = data || []
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch expenses'
      console.error('Error fetching expenses:', err)
    } finally {
      loading.value = false
    }
  }

  const addExpense = async (expenseData: Omit<Expense, 'id' | 'created_at'>) => {
    if (!projectId.value) return null

    try {
      const { data, error: supabaseError } = await supabase
        .from('expenses')
        .insert({
          ...expenseData,
          project_id: projectId.value
        })
        .select(`
          *,
          budget_categories(name)
        `)
        .single()

      if (supabaseError) throw supabaseError

      expenses.value.unshift(data)
      return data
    } catch (err: any) {
      error.value = err.message || 'Failed to add expense'
      console.error('Error adding expense:', err)
      return null
    }
  }

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          budget_categories(name)
        `)
        .single()

      if (supabaseError) throw supabaseError

      const index = expenses.value.findIndex(e => e.id === id)
      if (index !== -1) {
        expenses.value[index] = data
      }

      return data
    } catch (err: any) {
      error.value = err.message || 'Failed to update expense'
      console.error('Error updating expense:', err)
      return null
    }
  }

  const deleteExpense = async (id: string) => {
    try {
      const { error: supabaseError } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)

      if (supabaseError) throw supabaseError

      expenses.value = expenses.value.filter(e => e.id !== id)
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to delete expense'
      console.error('Error deleting expense:', err)
      return false
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
    filterExpenses
  }
}