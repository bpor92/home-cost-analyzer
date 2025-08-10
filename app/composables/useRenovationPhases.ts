import { ref, computed } from 'vue'
import { supabase } from '~/lib/supabase'
import type { RenovationPhase } from '~/types/database'

export function useRenovationPhases() {
  const phases = ref<RenovationPhase[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const sortedPhases = computed(() => {
    return [...phases.value].sort((a, b) => a.order_index - b.order_index)
  })

  const phasesByStatus = computed(() => {
    return {
      planned: phases.value.filter(p => p.status === 'planned'),
      inProgress: phases.value.filter(p => p.status === 'in-progress'),
      completed: phases.value.filter(p => p.status === 'completed')
    }
  })

  const totalBudget = computed(() => {
    return phases.value.reduce((sum, phase) => sum + (phase.budget || 0), 0)
  })

  async function fetchPhases(projectId: string) {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await supabase
        .from('renovation_phases')
        .select(`
          *,
          budget_categories (
            name
          )
        `)
        .eq('project_id', projectId)
        .order('order_index', { ascending: true })

      if (fetchError) throw fetchError
      phases.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Błąd podczas pobierania etapów'
      console.error('Error fetching phases:', err)
    } finally {
      loading.value = false
    }
  }

  async function createPhase(projectId: string, phaseData: Omit<RenovationPhase, 'id' | 'project_id' | 'created_at'>) {
    loading.value = true
    error.value = null

    try {
      const nextOrderIndex = Math.max(...phases.value.map(p => p.order_index), -1) + 1
      
      const { data, error: createError } = await supabase
        .from('renovation_phases')
        .insert([{
          project_id: projectId,
          ...phaseData,
          order_index: nextOrderIndex
        }])
        .select()
        .single()

      if (createError) throw createError
      if (data) {
        phases.value.push(data)
      }
      
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Błąd podczas tworzenia etapu'
      console.error('Error creating phase:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updatePhase(phaseId: string, updates: Partial<RenovationPhase>) {
    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('renovation_phases')
        .update(updates)
        .eq('id', phaseId)
        .select()
        .single()

      if (updateError) throw updateError
      
      if (data) {
        const index = phases.value.findIndex(p => p.id === phaseId)
        if (index !== -1) {
          phases.value[index] = data
        }
      }
      
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Błąd podczas aktualizacji etapu'
      console.error('Error updating phase:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deletePhase(phaseId: string) {
    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('renovation_phases')
        .delete()
        .eq('id', phaseId)

      if (deleteError) throw deleteError
      
      phases.value = phases.value.filter(p => p.id !== phaseId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Błąd podczas usuwania etapu'
      console.error('Error deleting phase:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updatePhaseOrder(phaseId: string, newOrderIndex: number) {
    try {
      await updatePhase(phaseId, { order_index: newOrderIndex })
    } catch (err) {
      console.error('Error updating phase order:', err)
      throw err
    }
  }

  async function bulkUpdatePhaseOrder(phaseUpdates: { id: string; order_index: number }[]) {
    loading.value = true
    error.value = null

    try {
      const updates = phaseUpdates.map(update => 
        supabase
          .from('renovation_phases')
          .update({ order_index: update.order_index })
          .eq('id', update.id)
      )

      await Promise.all(updates)
      
      phaseUpdates.forEach(update => {
        const phase = phases.value.find(p => p.id === update.id)
        if (phase) {
          phase.order_index = update.order_index
        }
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Błąd podczas aktualizacji kolejności etapów'
      console.error('Error updating phases order:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    phases: sortedPhases,
    phasesByStatus,
    totalBudget,
    loading,
    error,
    fetchPhases,
    createPhase,
    updatePhase,
    deletePhase,
    updatePhaseOrder,
    bulkUpdatePhaseOrder,
    clearError
  }
}