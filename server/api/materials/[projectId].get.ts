import { supabaseAdmin } from '../../lib/supabase'
import { requireAuth } from '../../utils/auth'
import type { MaterialWithRoom } from '~/types/database'

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

      const { data: materials, error } = await supabaseAdmin
        .from('materials')
        .select(`
          *,
          rooms (
            name
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching materials:', error)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to fetch materials'
        })
      }

      return {
        data: materials as MaterialWithRoom[]
      }
    } catch (error) {
      console.error('Materials API error:', error)
      throw error
    }
  })
)