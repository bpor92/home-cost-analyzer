import { supabaseAdmin } from '../../lib/supabase'
import { requireAuth } from '../../utils/auth'
import type { Room } from '~/types/database'

export default defineEventHandler(
  requireAuth(async (event, user) => {
    try {
      const roomId = getRouterParam(event, 'id')
      
      if (!roomId) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Room ID is required'
        })
      }

      const body = await readBody(event)
      
      if (!body.name) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Room name is required'
        })
      }

      const { data: room, error } = await supabaseAdmin
        .from('rooms')
        .update({
          name: body.name,
          updated_at: new Date().toISOString()
        })
        .eq('id', roomId)
        .select()
        .single()

      if (error) {
        console.error('Error updating room:', error)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to update room'
        })
      }

      return {
        data: room as Room
      }
    } catch (error) {
      console.error('Room update API error:', error)
      throw error
    }
  })
)