import { supabaseClient } from '../../lib/supabase'

export default defineEventHandler(async (event) => {
  try {
    const authHeader = getHeader(event, 'authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { data: { session: null, user: null } }
    }

    const token = authHeader.substring(7)

    const { data, error } = await supabaseClient.auth.getUser(token)

    if (error || !data.user) {
      return { data: { session: null, user: null } }
    }

    return { 
      data: { 
        user: data.user,
        session: { access_token: token }
      }
    }
  } catch (error: any) {
    return { data: { session: null, user: null } }
  }
})