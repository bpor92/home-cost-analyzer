import { supabaseAdmin } from '../../lib/supabase'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(
  requireAuth(async (event, user) => {
    try {
      const body = await readBody(event)
      const { project_id, ...expenseData } = body
      
      // Verify user owns the project
      const { data: project } = await supabaseAdmin
        .from('projects')
        .select('id')
        .eq('id', project_id)
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
        .insert({
          ...expenseData,
          project_id
        })
        .select(`
          *,
          budget_categories (
            name
          ),
          renovation_phases (
            name
          )
        `)
        .single()

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
        statusMessage: error.message || 'Failed to create expense'
      })
    }
  })
)