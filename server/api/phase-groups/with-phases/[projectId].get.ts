import { supabaseAdmin } from '../../../lib/supabase'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(
  requireAuth(async (event, user) => {
    try {
      const projectId = getRouterParam(event, 'projectId')
      
      // Verify user owns the project
      const { data: project } = await supabaseAdmin
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single()

      if (!project) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Access denied'
        })
      }

      // Fetch groups
      const { data: groupsData, error: groupsError } = await supabaseAdmin
        .from('phase_groups')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true })

      if (groupsError) {
        throw createError({
          statusCode: 500,
          statusMessage: groupsError.message
        })
      }

      // Fetch phases with relations
      const { data: phasesData, error: phasesError } = await supabaseAdmin
        .from('renovation_phases')
        .select(`
          *,
          budget_categories (
            name
          ),
          phase_groups (
            name,
            color
          )
        `)
        .eq('project_id', projectId)
        .order('order_index', { ascending: true })

      if (phasesError) {
        throw createError({
          statusCode: 500,
          statusMessage: phasesError.message
        })
      }

      // Group phases by group_id
      const phasesByGroup: Record<string, any[]> = {}
      const ungroupedPhases: any[] = []

      phasesData?.forEach(phase => {
        if (phase.group_id) {
          if (!phasesByGroup[phase.group_id]) {
            phasesByGroup[phase.group_id] = []
          }
          phasesByGroup[phase.group_id]!.push(phase)
        } else {
          ungroupedPhases.push(phase)
        }
      })

      // Create groups with phases and summaries
      const groupsWithPhases = (groupsData || []).map(group => {
        const phases = phasesByGroup[group.id] || []
        const totalBudget = phases.reduce((sum, phase) => {
          const budget = parseFloat(phase.budget) || 0
          console.log('Phase budget:', phase.name, phase.budget, '-> parsed:', budget)
          return sum + budget
        }, 0)
        const totalProgress = phases.length > 0 
          ? phases.reduce((sum, phase) => sum + (phase.progress || 0), 0) / phases.length 
          : 0
        const completedPhases = phases.filter(phase => phase.status === 'completed').length

        console.log('Group:', group.name, 'phases:', phases.length, 'totalBudget:', totalBudget)

        return {
          ...group,
          phases,
          totalBudget,
          totalProgress,
          phaseCount: phases.length,
          completedPhases
        }
      })

      return { 
        data: {
          groups: groupsWithPhases,
          ungroupedPhases
        }
      }
    } catch (error: any) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message || 'Failed to fetch phase groups with phases'
      })
    }
  })
)