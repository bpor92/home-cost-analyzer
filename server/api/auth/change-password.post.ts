import { createClient } from '@supabase/supabase-js'
import { getUserFromSession } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Current password and new password are required'
      })
    }

    if (newPassword.length < 6) {
      throw createError({
        statusCode: 400,
        statusMessage: 'New password must be at least 6 characters long'
      })
    }

    // Get authenticated user
    const user = await getUserFromSession(event)

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    // First verify current password by attempting to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword
    })

    if (signInError || !signInData.user) {
      return {
        error: 'Aktualne hasło jest nieprawidłowe'
      }
    }

    // Update password using admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    )

    if (updateError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update password'
      })
    }

    return {
      success: true,
      message: 'Password updated successfully'
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
})