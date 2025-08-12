import { supabaseAdmin } from '../../lib/supabase'
import { requireAuth } from '../../utils/auth'
import type { Material } from '~/types/database'

export default defineEventHandler(
  requireAuth(async (event, user) => {
    try {
      const body = await readBody(event)
      
      if (!body.project_id || !body.room_id || !body.name) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Project ID, room ID and name are required'
        })
      }

      const materialData = {
        project_id: body.project_id,
        room_id: body.room_id,
        name: body.name,
        description: body.description || null,
        product_url: body.product_url || null,
        type: body.type || 'other',
        price: body.price || null,
        quantity: body.quantity || null,
        unit: body.unit || null,
        width: body.width || null,
        height: body.height || null,
        area_per_unit: body.area_per_unit || null
      }

      const { data: material, error } = await supabaseAdmin
        .from('materials')
        .insert(materialData)
        .select()
        .single()

      if (error) {
        console.error('Error creating material:', error)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to create material'
        })
      }

      return {
        data: material as Material
      }
    } catch (error) {
      console.error('Material creation API error:', error)
      throw error
    }
  })
)