import { supabaseClient } from '../../lib/supabase'

export default defineEventHandler(async (event) => {
  try {
    const { email, password } = await readBody(event)
    
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw createError({
        statusCode: 401,
        statusMessage: error.message
      })
    }

    return { 
      data: {
        user: data.user,
        session: data.session
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Sign in failed'
    })
  }
})