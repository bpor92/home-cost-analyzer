import { supabaseClient } from '../../lib/supabase'

export default defineEventHandler(async (event) => {
  try {
    const { error } = await supabaseClient.auth.signOut()

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
      statusMessage: error.message || 'Sign out failed'
    })
  }
})