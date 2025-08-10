<template>
  <div>
    <!-- Przekierowanie do dashboard jeśli użytkownik jest zalogowany, inaczej do logowania -->
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

onMounted(async () => {
  // Sprawdź czy użytkownik jest zalogowany
  if (authStore.user) {
    // Jeśli jest zalogowany, przekieruj do dashboard
    await navigateTo('/dashboard')
  } else {
    // Jeśli nie jest zalogowany, przekieruj do logowania
    await navigateTo('/auth/login')
  }
})

// SEO meta tags
useSeoMeta({
  title: 'Renovation Budget App',
  description: 'Aplikacja do zarządzania budżetem remontu'
})
</script>
