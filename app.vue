<template>
  <div id="app">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

onMounted(async () => {
  await authStore.initialize()
})

// Global configuration for the app
useSeoMeta({
  title: 'Renovation Budget App',
  ogTitle: 'Renovation Budget App',
  description: 'Plan and track your home renovation budget with ease',
  ogDescription: 'Plan and track your home renovation budget with ease'
})
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app {
  height: 100vh;
}
</style>