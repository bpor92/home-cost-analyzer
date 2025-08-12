import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import type { PhaseGroup, PhaseGroupWithPhases } from '~/types/database'

export function usePhaseGroups() {
  const authStore = useAuthStore()
  const groups = ref<PhaseGroup[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getAuthHeaders = () => {
    const token = authStore.user?.access_token
    return token ? { Authorization: `Bearer ${token}` } : undefined
  }

  const sortedGroups = computed(() => {
    return [...groups.value].sort((a, b) => a.order_index - b.order_index)
  })

  async function fetchGroups(projectId: string) {
    groups.value = []
  }

  async function fetchGroupsWithPhases(projectId: string): Promise<PhaseGroupWithPhases[]> {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch(`/api/phase-groups/with-phases/${projectId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      return response.data?.groups || []
    } catch (err: any) {
      error.value = err.statusMessage || err.message || 'Błąd podczas pobierania grup z etapami'
      console.error('Error fetching groups with phases:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  async function createGroup(projectId: string, groupData: Omit<PhaseGroup, 'id' | 'project_id' | 'created_at' | 'updated_at'>) {
    return null
  }

  async function updateGroup(groupId: string, updates: Partial<PhaseGroup>) {
    return null
  }

  async function deleteGroup(groupId: string) {
    return false
  }

  async function bulkUpdateGroupOrder(groupUpdates: { id: string; order_index: number }[]) {
    return false
  }

  async function assignPhaseToGroup(phaseId: string, groupId: string | null) {
    return false
  }

  function clearError() {
    error.value = null
  }

  return {
    groups: sortedGroups,
    loading,
    error,
    fetchGroups,
    fetchGroupsWithPhases,
    createGroup,
    updateGroup,
    deleteGroup,
    bulkUpdateGroupOrder,
    assignPhaseToGroup,
    clearError
  }
}