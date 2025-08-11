import { defineStore } from 'pinia'
import { ref, readonly } from 'vue'
import type { User } from '~/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(true)

  const initialize = async () => {
    // Check for stored token
    const storedToken = localStorage.getItem('auth_token')
    
    if (storedToken) {
      try {
        const response = await $fetch('/api/auth/session', {
          headers: { Authorization: `Bearer ${storedToken}` }
        })
        
        if (response.data.user) {
          user.value = {
            id: response.data.user.id,
            email: response.data.user.email,
            access_token: storedToken
          }
        } else {
          localStorage.removeItem('auth_token')
        }
      } catch (error) {
        console.error('Session validation failed:', error)
        localStorage.removeItem('auth_token')
      }
    }
    
    loading.value = false
  }

  const signIn = async (email: string, password: string) => {
    try {
      const response = await $fetch('/api/auth/signin', {
        method: 'POST',
        body: { email, password }
      })

      if (response.data.user && response.data.session?.access_token) {
        const accessToken = response.data.session.access_token
        
        user.value = {
          id: response.data.user.id,
          email: response.data.user.email,
          access_token: accessToken
        }
        
        localStorage.setItem('auth_token', accessToken)
        return { data: response.data, error: null }
      }
      
      return { data: null, error: { message: 'Invalid response from server' } }
    } catch (error: any) {
      return { data: null, error: { message: error.statusMessage || 'Sign in failed' } }
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
      return { data: null, error: { message: error.statusMessage || 'Sign up failed' } }
    }
  }

  const signOut = async () => {
    try {
      await $fetch('/api/auth/signout', {
        method: 'POST'
      })

      user.value = null
      localStorage.removeItem('auth_token')
      return { error: null }
    } catch (error: any) {
      return { error: { message: error.statusMessage || 'Sign out failed' } }
    }
  }

  return {
    user: readonly(user),
    loading: readonly(loading),
    initialize,
    signIn,
    signUp,
    signOut
  }
})