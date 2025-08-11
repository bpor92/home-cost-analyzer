import { supabaseAdmin } from '../../lib/supabase'
import { requireAuth } from '../../utils/auth'

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

      const { data, error } = await supabaseAdmin
        .from('expenses')
        .select(`
          *,
          budget_categories (
            name
          ),
          renovation_phases (
            name
          )
        `)
        .eq('project_id', projectId)
        .order('expense_date', { ascending: false })

      if (error) {
        throw createError({
          statusCode: 500,
          statusMessage: error.message
        })
      }

      return { data }
    } catch (error: any) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message || 'Failed to fetch expenses'
      })
    }
  })
)