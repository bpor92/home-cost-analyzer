<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto py-12 px-4">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Renovation Budget App
        </h1>
        <p class="text-xl text-gray-600 mb-8">
          Zarządzaj budżetem swojego remontu z łatwością
        </p>
        <div class="flex justify-center gap-4 mb-8">
          <NuxtLink to="/auth/login" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Zaloguj się
          </NuxtLink>
          <NuxtLink to="/auth/register" class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Zarejestruj się
          </NuxtLink>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink to="/dashboard" class="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div class="text-center">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              📊
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Dashboard</h3>
            <p class="text-gray-600">Przegląd projektów i budżetu</p>
          </div>
        </NuxtLink>
        
        <NuxtLink to="/projects" class="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div class="text-center">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              🏠
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Projekty</h3>
            <p class="text-gray-600">Zarządzaj projektami remontowymi</p>
          </div>
        </NuxtLink>
        
        <NuxtLink to="/planning" class="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div class="text-center">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              📅
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Planowanie</h3>
            <p class="text-gray-600">Planuj fazy remontu</p>
          </div>
        </NuxtLink>
        
        <NuxtLink to="/budget" class="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div class="text-center">
            <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              💰
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Budżet</h3>
            <p class="text-gray-600">Kategorie budżetowe</p>
          </div>
        </NuxtLink>
        
        <NuxtLink to="/expenses" class="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div class="text-center">
            <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              🧾
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Wydatki</h3>
            <p class="text-gray-600">Śledź wydatki</p>
          </div>
        </NuxtLink>
        
        <NuxtLink to="/reports" class="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div class="text-center">
            <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              📈
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Raporty</h3>
            <p class="text-gray-600">Analizy i wykresy</p>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// SEO meta tags
useSeoMeta({
  title: 'Renovation Budget App - Strona główna',
  description: 'Aplikacja do zarządzania budżetem remontu. Planuj, śledź wydatki i kontroluj koszty swojego remontu.'
})
</script>
