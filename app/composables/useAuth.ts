import { ref, readonly } from 'vue'
import type { User } from '~/types'

const user = ref<User | null>(null)
const loading = ref(true)

export const useAuth = () => {
  const signIn = async (email: string, password: string) => {
    try {
      const response = await $fetch('/api/auth/signin', {
        method: 'POST',
        body: { email, password }
      })
      return { data: response.data, error: null }
    } catch (error: any) {
      return { data: null, error: { message: error.statusMessage || error.message || 'Sign in failed' } }
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const response = await $fetch('/api/auth/signup', {
        method: 'POST',
        body: { email, password }
      })
      return { data: response.data, error: null }
    } catch (error: any) {
      return { data: null, error: { message: error.statusMessage || error.message || 'Sign up failed' } }
    }
  }

  const signOut = async () => {
    try {
      await $fetch('/api/auth/signout', {
        method: 'POST'
      })
      return { error: null }
    } catch (error: any) {
      return { error: { message: error.statusMessage || error.message || 'Sign out failed' } }
    }
  }

  const initialize = async () => {
    try {
      const response = await $fetch('/api/auth/session')
      user.value = response.data?.user || null
    } catch (error) {
      user.value = null
    }
    loading.value = false

    return () => {}
  }

  return {
    user: readonly(user),
    loading: readonly(loading),
    signIn,
    signUp,
    signOut,
    initialize,
  }
}