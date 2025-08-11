import { supabaseClient } from '../lib/supabase'
import type { H3Event } from 'h3'

export async function getUserFromSession(event: H3Event) {
  const authHeader = getHeader(event, 'authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - No token provided'
    })
  }

  const token = authHeader.substring(7) // Remove 'Bearer ' prefix

  try {
    const { data: { user }, error } = await supabaseClient.auth.getUser(token)
    
    if (error || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - Invalid token'
      })
    }

    return user
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - Token verification failed'
    })
  }
}

export function requireAuth(handler: (event: H3Event, user: any) => any) {
  return async (event: H3Event) => {
    const user = await getUserFromSession(event)
    return handler(event, user)
  }
}