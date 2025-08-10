<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Zaloguj się do konta
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Zarządzaj budżetem swojego remontu
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <UiInput
            v-model="email"
            type="email"
            label="Email"
            placeholder="twoj@email.com"
            required
            autocomplete="email"
          />

          <UiInput
            v-model="password"
            type="password"
            label="Hasło"
            placeholder="Hasło"
            required
            autocomplete="current-password"
          />

          <div v-if="error" class="text-red-600 text-sm">
            {{ error }}
          </div>

          <div>
            <button
              type="submit"
              :disabled="loading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <span v-if="loading">Logowanie...</span>
              <span v-else>Zaloguj się</span>
            </button>
          </div>

          <div class="text-center">
            <NuxtLink
              to="/auth/register"
              class="text-blue-600 hover:text-blue-500 text-sm"
            >
              Nie masz konta? Zarejestruj się
            </NuxtLink>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

// Use auth layout (no sidebar)
definePageMeta({
  layout: 'auth'
})

const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    const { error: authError } = await authStore.signIn(email.value, password.value)
    
    if (authError) {
      error.value = authError.message
    } else {
      await navigateTo('/dashboard')
    }
  } catch (e) {
    error.value = 'Wystąpił błąd podczas logowania'
  } finally {
    loading.value = false
  }
}

// SEO
useSeoMeta({
  title: 'Logowanie - Renovation Budget App',
  description: 'Zaloguj się do aplikacji zarządzania budżetem remontu'
})
</script>