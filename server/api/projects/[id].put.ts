import { supabaseAdmin } from '../../lib/supabase'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(
  requireAuth(async (event, user) => {
    try {
      const id = getRouterParam(event, 'id')
      const body = await readBody(event)
      
      const { data, error } = await supabaseAdmin
        .from('projects')
        .update({ 
          ...body, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .eq('user_id', user.id) // Ensure user owns the project
        .select()
        .single()

      if (error) {
        throw createError({
          statusCode: 500,
          statusMessage: error.message
        })
      }

      if (!data) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Project not found'
        })
      }

      return { data }
    } catch (error: any) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message || 'Failed to update project'
      })
    }
  })
)