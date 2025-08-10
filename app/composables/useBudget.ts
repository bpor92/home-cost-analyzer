import { ref, readonly, watch, computed } from 'vue'
import type { Ref } from 'vue'
import { supabase } from '~/lib/supabase'
import type { BudgetCategory, BorrowedFund, BudgetSummary, CategoryWithSpent } from '~/types'

export const useBudget = (projectId: Ref<string | null>) => {
  const categories = ref<BudgetCategory[]>([])
  const borrowedFunds = ref<BorrowedFund[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

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
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('project_id', projectId.value)
        .order('created_at')

      if (categoriesError) throw categoriesError
      categories.value = categoriesData || []

      // Fetch borrowed funds
      const { data: borrowedData, error: borrowedError } = await supabase
        .from('borrowed_funds')
        .select('*')
        .eq('project_id', projectId.value)
        .order('created_at')

      if (borrowedError) throw borrowedError
      borrowedFunds.value = borrowedData || []

    } catch (err: any) {
      error.value = err.message || 'Failed to fetch budget data'
      console.error('Error fetching budget data:', err)
    } finally {
      loading.value = false
    }
  }

  const initializeDefaultCategories = async () => {
    if (!projectId.value) return

    try {
      const categoryInserts = defaultCategories.map(name => ({
        project_id: projectId.value!,
        name,
        planned_amount: 0,
        spent_amount: 0
      }))

      const { error: insertError } = await supabase
        .from('budget_categories')
        .insert(categoryInserts)

      if (insertError) throw insertError
      
      await fetchBudgetData()
    } catch (err: any) {
      error.value = err.message || 'Failed to initialize categories'
      console.error('Error initializing categories:', err)
    }
  }

  const addBudgetCategory = async (name: string, plannedAmount: number = 0) => {
    if (!projectId.value) return null

    try {
      const { data, error: supabaseError } = await supabase
        .from('budget_categories')
        .insert({
          project_id: projectId.value,
          name,
          planned_amount: plannedAmount,
          spent_amount: 0
        })
        .select()
        .single()

      if (supabaseError) throw supabaseError

      categories.value.push(data)
      return data
    } catch (err: any) {
      error.value = err.message || 'Failed to add category'
      console.error('Error adding category:', err)
      return null
    }
  }

  const updateBudgetCategory = async (id: string, updates: Partial<BudgetCategory>) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('budget_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (supabaseError) throw supabaseError

      const index = categories.value.findIndex(c => c.id === id)
      if (index !== -1) {
        categories.value[index] = data
      }

      return data
    } catch (err: any) {
      error.value = err.message || 'Failed to update category'
      console.error('Error updating category:', err)
      return null
    }
  }

  const deleteBudgetCategory = async (id: string) => {
    try {
      const { error: supabaseError } = await supabase
        .from('budget_categories')
        .delete()
        .eq('id', id)

      if (supabaseError) throw supabaseError

      categories.value = categories.value.filter(c => c.id !== id)
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to delete category'
      console.error('Error deleting category:', err)
      return false
    }
  }

  const addBorrowedFund = async (fundData: Omit<BorrowedFund, 'id' | 'created_at'>) => {
    if (!projectId.value) return null

    try {
      const { data, error: supabaseError } = await supabase
        .from('borrowed_funds')
        .insert({
          ...fundData,
          project_id: projectId.value
        })
        .select()
        .single()

      if (supabaseError) throw supabaseError

      borrowedFunds.value.push(data)
      return data
    } catch (err: any) {
      error.value = err.message || 'Failed to add borrowed fund'
      console.error('Error adding borrowed fund:', err)
      return null
    }
  }

  const updateBorrowedFund = async (id: string, updates: Partial<BorrowedFund>) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('borrowed_funds')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (supabaseError) throw supabaseError

      const index = borrowedFunds.value.findIndex(f => f.id === id)
      if (index !== -1) {
        borrowedFunds.value[index] = data
      }

      return data
    } catch (err: any) {
      error.value = err.message || 'Failed to update borrowed fund'
      console.error('Error updating borrowed fund:', err)
      return null
    }
  }

  const deleteBorrowedFund = async (id: string) => {
    try {
      const { error: supabaseError } = await supabase
        .from('borrowed_funds')
        .delete()
        .eq('id', id)

      if (supabaseError) throw supabaseError

      borrowedFunds.value = borrowedFunds.value.filter(f => f.id !== id)
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to delete borrowed fund'
      console.error('Error deleting borrowed fund:', err)
      return false
    }
  }

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
    const totalBudget = totalPlannedBudget.value
    const borrowedTotal = totalBorrowedAmount.value
    const ownBudget = totalBudget - borrowedTotal
    const totalSpent = totalSpentBudget.value
    const remainingBudget = totalBudget - totalSpent
    const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

    return {
      totalBudget,
      ownBudget,
      borrowedTotal,
      totalSpent,
      remainingBudget,
      spentPercentage
    }
  })

  const categoriesWithProgress = computed<CategoryWithSpent[]>(() => {
    return categories.value.map(category => ({
      ...category,
      expenses: [], // This would be populated separately if needed
      spentPercentage: category.planned_amount > 0 
        ? (category.spent_amount / category.planned_amount) * 100 
        : 0
    }))
  })

  // Watch for project changes
  watch(projectId, () => {
    if (projectId.value) {
      fetchBudgetData()
    } else {
      categories.value = []
      borrowedFunds.value = []
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
    initializeDefaultCategories,
    addBudgetCategory,
    updateBudgetCategory,
    deleteBudgetCategory,
    addBorrowedFund,
    updateBorrowedFund,
    deleteBorrowedFund
  }
}