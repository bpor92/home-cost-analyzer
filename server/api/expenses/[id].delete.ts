import { supabaseAdmin } from '../../lib/supabase'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(
  requireAuth(async (event, user) => {
    try {
      const expenseId = getRouterParam(event, 'id')
      
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

      const { error } = await supabaseAdmin
        .from('expenses')
        .delete()
        .eq('id', expenseId)

      if (error) {
        throw createError({
          statusCode: 500,
          statusMessage: error.message
        })
      }

      return { success: true }
    } catch (error: any) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message || 'Failed to delete expense'
      })
    }
  })
)