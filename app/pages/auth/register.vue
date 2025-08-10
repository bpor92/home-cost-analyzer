<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Utwórz nowe konto
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Zacznij planować swój remont
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
            placeholder="Minimum 6 znaków"
            required
            autocomplete="new-password"
          />

          <UiInput
            v-model="confirmPassword"
            type="password"
            label="Potwierdź hasło"
            placeholder="Powtórz hasło"
            required
            autocomplete="new-password"
          />

          <div v-if="error" class="text-red-600 text-sm">
            {{ error }}
          </div>

          <div v-if="success" class="text-green-600 text-sm">
            {{ success }}
          </div>

          <div>
            <button
              type="submit"
              :disabled="loading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              <span v-if="loading">Rejestracja...</span>
              <span v-else>Zarejestruj się</span>
            </button>
          </div>

          <div class="text-center">
            <router-link
              to="/auth/login"
              class="text-primary-600 hover:text-primary-500 text-sm"
            >
              Masz już konto? Zaloguj się
            </router-link>
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
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

const handleSubmit = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  if (password.value !== confirmPassword.value) {
    error.value = 'Hasła nie są identyczne'
    loading.value = false
    return
  }

  try {
    const { error: authError } = await authStore.signUp(email.value, password.value)

    if (authError) {
      error.value = authError.message
    } else {
      success.value = 'Konto zostało utworzone! Sprawdź email w celu aktywacji.'
      setTimeout(() => {
        navigateTo('/auth/login')
      }, 3000)
    }
  } catch (e) {
    error.value = 'Wystąpił błąd podczas rejestracji'
  } finally {
    loading.value = false
  }
}
</script>
