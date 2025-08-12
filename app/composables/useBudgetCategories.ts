import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useApiClient } from './useApiClient'
import type { BudgetCategory } from '~/types/database'

export function useBudgetCategories() {
  const authStore = useAuthStore()
  const { apiCall, createCrudOperations } = useApiClient()
  const categories = ref<BudgetCategory[]>([])
  
  const { loading, error, withErrorHandling } = createCrudOperations<BudgetCategory>('/api/budget-categories')

  const sortedCategories = computed(() => {
    return [...categories.value].sort((a, b) => a.name.localeCompare(b.name))
  })

  async function fetchCategories(projectId: string) {
    const result = await withErrorHandling(async () => {
      return await apiCall<{ data: BudgetCategory[] }>(`/api/budget-categories/${projectId}`, {
        method: 'GET'
      })
    })

    if (result) {
      categories.value = result.data || []
    }
  }

  async function createCategory(projectId: string, categoryData: Omit<BudgetCategory, 'id' | 'project_id' | 'created_at'>) {
    const result = await withErrorHandling(async () => {
      return await apiCall<{ data: BudgetCategory }>('/api/budget-categories', {
        method: 'POST',
        body: {
          project_id: projectId,
          ...categoryData
        }
      })
    })

    if (result) {
      const newCategory = result.data
      if (newCategory) {
        categories.value.push(newCategory)
      }
      return newCategory
    }
    throw new Error('Błąd podczas tworzenia kategorii')
  }

  async function updateCategory(categoryId: string, updates: Partial<BudgetCategory>) {
    return null
  }

  async function deleteCategory(categoryId: string) {
    return false
  }

  function clearError() {
    error.value = null
  }

  return {
    categories: sortedCategories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    clearError
  }
}