import { defineStore } from 'pinia'
import { ref, readonly } from 'vue'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(true)

  const initialize = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    user.value = session?.user ? { id: session.user.id, email: session.user.email } : null
    loading.value = false

    supabase.auth.onAuthStateChange((event, session) => {
      user.value = session?.user ? { id: session.user.id, email: session.user.email } : null
    })
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
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