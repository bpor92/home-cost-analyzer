import { supabaseAdmin } from '../../../lib/supabase'
import { requireAuth } from '../../../utils/auth'
import type { Room } from '~/types/database'

export default defineEventHandler(
  requireAuth(async (event, user) => {
    try {
      const projectId = getRouterParam(event, 'projectId')
      
      if (!projectId) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Project ID is required'
        })
      }

      const { data: rooms, error } = await supabaseAdmin
        .from('rooms')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching rooms:', error)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to fetch rooms'
        })
      }

      return {
        data: rooms as Room[]
      }
    } catch (error) {
      console.error('Rooms API error:', error)
      throw error
    }
  })
)