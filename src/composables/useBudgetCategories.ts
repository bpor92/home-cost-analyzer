import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { BudgetCategory } from '@/types/database'

export function useBudgetCategories() {
  const categories = ref<BudgetCategory[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const sortedCategories = computed(() => {
    return [...categories.value].sort((a, b) => a.name.localeCompare(b.name))
  })

  async function fetchCategories(projectId: string) {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('project_id', projectId)
        .order('name', { ascending: true })

      if (fetchError) throw fetchError
      categories.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Błąd podczas pobierania kategorii'
      console.error('Error fetching categories:', err)
    } finally {
      loading.value = false
    }
  }

  async function createCategory(projectId: string, categoryData: Omit<BudgetCategory, 'id' | 'project_id' | 'created_at'>) {
    loading.value = true
    error.value = null

    try {
      const { data, error: createError } = await supabase
        .from('budget_categories')
        .insert([{
          project_id: projectId,
          ...categoryData
        }])
        .select()
        .single()

      if (createError) throw createError
      if (data) {
        categories.value.push(data)
      }
      
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Błąd podczas tworzenia kategorii'
      console.error('Error creating category:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateCategory(categoryId: string, updates: Partial<BudgetCategory>) {
    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('budget_categories')
        .update(updates)
        .eq('id', categoryId)
        .select()
        .single()

      if (updateError) throw updateError
      
      if (data) {
        const index = categories.value.findIndex(c => c.id === categoryId)
        if (index !== -1) {
          categories.value[index] = data
        }
      }
      
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Błąd podczas aktualizacji kategorii'
      console.error('Error updating category:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteCategory(categoryId: string) {
    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('budget_categories')
        .delete()
        .eq('id', categoryId)

      if (deleteError) throw deleteError
      
      categories.value = categories.value.filter(c => c.id !== categoryId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Błąd podczas usuwania kategorii'
      console.error('Error deleting category:', err)
      throw err
    } finally {
      loading.value = false
    }
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