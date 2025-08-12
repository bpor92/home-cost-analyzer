import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import type { PhaseWithGroupAndCategory } from '~/types/database'

export function useRenovationPhases() {
  const authStore = useAuthStore()
  const phases = ref<PhaseWithGroupAndCategory[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getAuthHeaders = () => {
    const token = authStore.user?.access_token
    return token ? { Authorization: `Bearer ${token}` } : undefined
  }

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
      const response = await $fetch(`/api/renovation-phases/${projectId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      phases.value = response.data || []
    } catch (err: any) {
      error.value = err.statusMessage || err.message || 'Błąd podczas pobierania etapów'
      console.error('Error fetching phases:', err)
    } finally {
      loading.value = false
    }
  }

  async function createPhase(projectId: string, phaseData: any) {
    return null
  }

  async function updatePhase(phaseId: string, updates: any) {
    return null
  }

  async function deletePhase(phaseId: string) {
    return false
  }

  async function updatePhaseOrder(phaseId: string, newOrderIndex: number) {
    return false
  }

  async function bulkUpdatePhaseOrder(phaseUpdates: { id: string; order_index: number }[]) {
    return false
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