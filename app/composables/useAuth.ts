import { ref, readonly, onMounted, onUnmounted } from 'vue'
import { supabase } from '~/lib/supabase'
import type { User } from '~/types'

const user = ref<User | null>(null)
const loading = ref(true)

export const useAuth = () => {
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

  const initialize = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    user.value = session?.user ? { id: session.user.id, email: session.user.email } : null
    loading.value = false

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        user.value = session?.user ? { id: session.user.id, email: session.user.email } : null
        loading.value = false
      }
    )

    return () => subscription.unsubscribe()
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