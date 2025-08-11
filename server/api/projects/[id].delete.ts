import { supabaseAdmin } from '../../lib/supabase'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(
  requireAuth(async (event, user) => {
    try {
      const id = getRouterParam(event, 'id')
      
      const { error } = await supabaseAdmin
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id) // Ensure user owns the project

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
        statusMessage: error.message || 'Failed to delete project'
      })
    }
  })
)