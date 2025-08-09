<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Mobile sidebar -->
    <Transition
      enter-active-class="transition-opacity ease-linear duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity ease-linear duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showMobileSidebar" class="fixed inset-0 flex z-40 md:hidden">
        <div class="fixed inset-0 bg-gray-600 bg-opacity-75" @click="showMobileSidebar = false" />
        <div class="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div class="absolute top-0 right-0 -mr-12 pt-2">
            <button
              @click="showMobileSidebar = false"
              class="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <X class="h-6 w-6 text-white" />
            </button>
          </div>
          <AppSidebar />
        </div>
      </div>
    </Transition>

    <!-- Desktop sidebar -->
    <div class="hidden md:flex md:w-64 md:flex-col">
      <div class="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
        <div class="flex items-center h-16 flex-shrink-0 px-4 bg-white border-b border-gray-200">
          <div class="flex items-center">
            <div class="h-8 w-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <Home class="h-5 w-5 text-white" />
            </div>
            <span class="ml-2 text-xl font-semibold text-gray-900">
              Remont App
            </span>
          </div>
        </div>
        <AppSidebar />
      </div>
    </div>

    <!-- Main content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <AppHeader @toggle-sidebar="showMobileSidebar = true" />
      
      <main class="flex-1 relative overflow-y-auto focus:outline-none">
        <div class="py-6">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <router-view />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Home, X } from 'lucide-vue-next'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'

const showMobileSidebar = ref(false)
</script>