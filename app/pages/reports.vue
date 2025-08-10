<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900">Raporty i Wykresy</h1>
    
    <Card>
      <div class="text-center py-12">
        <BarChart3 class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">Funkcja w budowie</h3>
        <p class="mt-1 text-sm text-gray-600">Raporty i wykresy będą dostępne wkrótce</p>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { BarChart3 } from 'lucide-vue-next'
import Card from '~/components/ui/Card.vue'
</script>