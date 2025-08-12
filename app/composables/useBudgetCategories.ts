import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import type { BudgetCategory } from '~/types/database'

export function useBudgetCategories() {
  const authStore = useAuthStore()
  const categories = ref<BudgetCategory[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getAuthHeaders = () => {
    const token = authStore.user?.access_token
    return token ? { Authorization: `Bearer ${token}` } : undefined
  }

  const sortedCategories = computed(() => {
    return [...categories.value].sort((a, b) => a.name.localeCompare(b.name))
  })

  async function fetchCategories(projectId: string) {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch(`/api/budget-categories/${projectId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      categories.value = response.data || []
    } catch (err: any) {
      error.value = err.statusMessage || err.message || 'Błąd podczas pobierania kategorii'
      console.error('Error fetching categories:', err)
    } finally {
      loading.value = false
    }
  }

  async function createCategory(projectId: string, categoryData: Omit<BudgetCategory, 'id' | 'project_id' | 'created_at'>) {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/budget-categories', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: {
          project_id: projectId,
          ...categoryData
        }
      })

      const newCategory = response.data
      if (newCategory) {
        categories.value.push(newCategory)
      }
      
      return newCategory
    } catch (err: any) {
      error.value = err.statusMessage || err.message || 'Błąd podczas tworzenia kategorii'
      console.error('Error creating category:', err)
      throw err
    } finally {
      loading.value = false
    }
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