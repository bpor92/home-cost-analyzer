import { supabaseAdmin } from '../../lib/supabase'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(
  requireAuth(async (event, user) => {
    try {
      const body = await readBody(event)
      
      const { data, error } = await supabaseAdmin
        .from('projects')
        .insert({
          ...body,
          user_id: user.id
        })
        .select()
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
        statusMessage: error.message || 'Failed to create project'
      })
    }
  })
)