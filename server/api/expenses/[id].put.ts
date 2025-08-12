import { supabaseAdmin } from '../../lib/supabase'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(
  requireAuth(async (event, user) => {
    try {
      const expenseId = getRouterParam(event, 'id')
      const body = await readBody(event)
      
      // First verify user owns the expense through the project
      const { data: expense } = await supabaseAdmin
        .from('expenses')
        .select(`
          id,
          projects!inner(
            user_id
          )
        `)
        .eq('id', expenseId)
        .single()

      if (!expense || (expense.projects as any).user_id !== user.id) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Access denied'
        })
      }

      const { data, error } = await supabaseAdmin
        .from('expenses')
        .update(body)
        .eq('id', expenseId)
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
        statusMessage: error.message || 'Failed to update expense'
      })
    }
  })
)