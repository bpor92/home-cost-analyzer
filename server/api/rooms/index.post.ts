import { supabaseAdmin } from '../../lib/supabase'
import { requireAuth } from '../../utils/auth'
import type { Room } from '~/types/database'

export default defineEventHandler(
  requireAuth(async (event, user) => {
    try {
      const body = await readBody(event)
      
      if (!body.project_id || !body.name) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Project ID and name are required'
        })
      }

      const { data: room, error } = await supabaseAdmin
        .from('rooms')
        .insert({
          project_id: body.project_id,
          name: body.name
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating room:', error)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to create room'
        })
      }

      return {
        data: room as Room
      }
    } catch (error) {
      console.error('Room creation API error:', error)
      throw error
    }
  })
)