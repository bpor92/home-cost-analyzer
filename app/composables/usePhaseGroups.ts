import { ref, computed } from 'vue'
import { supabase } from '~/lib/supabase'
import type { PhaseGroup, PhaseGroupWithPhases, RenovationPhase } from '~/types/database'

export function usePhaseGroups() {
  const groups = ref<PhaseGroup[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const sortedGroups = computed(() => {
    return [...groups.value].sort((a, b) => a.order_index - b.order_index)
  })

  async function fetchGroups(projectId: string) {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await supabase
        .from('phase_groups')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true })

      if (fetchError) throw fetchError
      groups.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Błąd podczas pobierania grup'
      console.error('Error fetching groups:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchGroupsWithPhases(projectId: string): Promise<PhaseGroupWithPhases[]> {
    loading.value = true
    error.value = null
    
    try {
      // Fetch groups
      const { data: groupsData, error: groupsError } = await supabase
        .from('phase_groups')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true })

      if (groupsError) throw groupsError

      // Fetch phases for each group
      const { data: phasesData, error: phasesError } = await supabase
        .from('renovation_phases')
        .select(`
          *,
          budget_categories (
            name
          )
        `)
        .eq('project_id', projectId)
        .order('order_index', { ascending: true })

      if (phasesError) throw phasesError

      // Group phases by group_id
      const phasesByGroup: Record<string, RenovationPhase[]> = {}
      const ungroupedPhases: RenovationPhase[] = []

      phasesData?.forEach(phase => {
        if (phase.group_id) {
          if (!phasesByGroup[phase.group_id]) {
            phasesByGroup[phase.group_id] = []
          }
          phasesByGroup[phase.group_id].push(phase)
        } else {
          ungroupedPhases.push(phase)
        }
      })

      // Create groups with phases and summaries
      const groupsWithPhases: PhaseGroupWithPhases[] = (groupsData || []).map(group => {
        const groupPhases = phasesByGroup[group.id] || []
        const totalBudget = groupPhases.reduce((sum, phase) => sum + (phase.budget || 0), 0)
        const totalProgress = groupPhases.length > 0 
          ? Math.round(groupPhases.reduce((sum, phase) => sum + phase.progress, 0) / groupPhases.length)
          : 0
        const completedPhases = groupPhases.filter(phase => phase.status === 'completed').length

        return {
          ...group,
          phases: groupPhases,
          totalBudget,
          totalProgress,
          phaseCount: groupPhases.length,
          completedPhases
        }
      })

      // Add ungrouped phases as a special group if any exist
      if (ungroupedPhases.length > 0) {
        const totalBudget = ungroupedPhases.reduce((sum, phase) => sum + (phase.budget || 0), 0)
        const totalProgress = ungroupedPhases.length > 0 
          ? Math.round(ungroupedPhases.reduce((sum, phase) => sum + phase.progress, 0) / ungroupedPhases.length)
          : 0
        const completedPhases = ungroupedPhases.filter(phase => phase.status === 'completed').length

        groupsWithPhases.push({
          id: 'ungrouped',
          project_id: projectId,
          name: 'Niezgrupowane etapy',
          description: 'Etapy nie przypisane do żadnej grupy',
          color: '#6B7280',
          order_index: 999,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          phases: ungroupedPhases,
          totalBudget,
          totalProgress,
          phaseCount: ungroupedPhases.length,
          completedPhases
        })
      }

      return groupsWithPhases
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Błąd podczas pobierania grup z etapami'
      console.error('Error fetching groups with phases:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  async function createGroup(projectId: string, groupData: Omit<PhaseGroup, 'id' | 'project_id' | 'created_at' | 'updated_at'>) {
    loading.value = true
    error.value = null

    try {
      const nextOrderIndex = Math.max(...groups.value.map(g => g.order_index), -1) + 1
      
      const { data, error: createError } = await supabase
        .from('phase_groups')
        .insert([{
          project_id: projectId,
          ...groupData,
          order_index: nextOrderIndex
        }])
        .select()
        .single()

      if (createError) throw createError
      if (data) {
        groups.value.push(data)
      }
      
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Błąd podczas tworzenia grupy'
      console.error('Error creating group:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateGroup(groupId: string, updates: Partial<PhaseGroup>) {
    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('phase_groups')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', groupId)
        .select()
        .single()

      if (updateError) throw updateError
      
      if (data) {
        const index = groups.value.findIndex(g => g.id === groupId)
        if (index !== -1) {
          groups.value[index] = data
        }
      }
      
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Błąd podczas aktualizacji grupy'
      console.error('Error updating group:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteGroup(groupId: string) {
    loading.value = true
    error.value = null

    try {
      // First, unassign phases from this group
      const { error: unassignError } = await supabase
        .from('renovation_phases')
        .update({ group_id: null })
        .eq('group_id', groupId)

      if (unassignError) throw unassignError

      // Then delete the group
      const { error: deleteError } = await supabase
        .from('phase_groups')
        .delete()
        .eq('id', groupId)

      if (deleteError) throw deleteError
      
      groups.value = groups.value.filter(g => g.id !== groupId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Błąd podczas usuwania grupy'
      console.error('Error deleting group:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function bulkUpdateGroupOrder(groupUpdates: { id: string; order_index: number }[]) {
    loading.value = true
    error.value = null

    try {
      const updates = groupUpdates.map(update => 
        supabase
          .from('phase_groups')
          .update({ 
            order_index: update.order_index,
            updated_at: new Date().toISOString()
          })
          .eq('id', update.id)
      )

      await Promise.all(updates)
      
      groupUpdates.forEach(update => {
        const group = groups.value.find(g => g.id === update.id)
        if (group) {
          group.order_index = update.order_index
        }
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Błąd podczas aktualizacji kolejności grup'
      console.error('Error updating groups order:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function assignPhaseToGroup(phaseId: string, groupId: string | null) {
    try {
      const { error: assignError } = await supabase
        .from('renovation_phases')
        .update({ group_id: groupId })
        .eq('id', phaseId)

      if (assignError) throw assignError
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Błąd podczas przypisywania etapu do grupy'
      console.error('Error assigning phase to group:', err)
      throw err
    }
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