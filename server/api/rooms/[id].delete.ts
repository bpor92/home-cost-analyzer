import { supabaseAdmin } from '../../lib/supabase'
import { requireAuth } from '../../utils/auth'

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

      // Check if room has materials
      const { data: materials, error: materialsError } = await supabaseAdmin
        .from('materials')
        .select('id')
        .eq('room_id', roomId)
        .limit(1)

      if (materialsError) {
        console.error('Error checking room materials:', materialsError)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to check room materials'
        })
      }

      if (materials && materials.length > 0) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Cannot delete room with materials. Remove all materials first.'
        })
      }

      const { error } = await supabaseAdmin
        .from('rooms')
        .delete()
        .eq('id', roomId)

      if (error) {
        console.error('Error deleting room:', error)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to delete room'
        })
      }

      return {
        success: true
      }
    } catch (error) {
      console.error('Room deletion API error:', error)
      throw error
    }
  })
)