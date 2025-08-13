<template>
  <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center space-x-4">
          <button
            @click="$emit('toggleSidebar')"
            class="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700"
          >
            <Menu class="h-6 w-6" />
          </button>
          <h1 class="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
            {{ title }}
          </h1>

          <!-- Project Selector -->
          <div class="hidden md:block w-64">
            <ProjectSelector />
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <button
            @click="darkMode.toggle()"
            class="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700"
            :title="darkMode.isDark.value ? 'Przełącz na jasny motyw' : 'Przełącz na ciemny motyw'"
          >
            <Moon v-if="darkMode.isDark.value" class="h-6 w-6" />
            <Sun v-else class="h-6 w-6" />
          </button>
          
          <button
            class="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700 relative"
          >
            <Bell class="h-6 w-6" />
            <span
              v-if="notificationCount > 0"
              class="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
            >
              {{ notificationCount > 9 ? '9+' : notificationCount }}
            </span>
          </button>

          <div class="relative">
            <button
              @click="showUserMenu = !showUserMenu"
              class="flex items-center space-x-2 p-2 rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <div class="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center">
                <ClientOnly>
                  <span class="text-white font-medium text-sm">
                    {{ userInitial }}
                  </span>
                  <template #fallback>
                    <span class="text-white font-medium text-sm">?</span>
                  </template>
                </ClientOnly>
              </div>
              <ClientOnly>
                <span class="hidden md:block text-sm font-medium">{{ userEmail }}</span>
              </ClientOnly>
              <ChevronDown class="h-4 w-4" />
            </button>

            <Transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div
                v-if="showUserMenu"
                class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700"
                @click.outside="showUserMenu = false"
              >
                <NuxtLink
                  to="/settings"
                  @click="showUserMenu = false"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Ustawienia
                </NuxtLink>
                <button
                  @click="handleSignOut"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Wyloguj się
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Menu, Bell, ChevronDown, Sun, Moon } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useDarkMode } from '~/composables/useDarkMode'
import ProjectSelector from '~/components/ui/ProjectSelector.vue'

interface Props {
  title?: string
  notificationCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Budżet Remontu',
  notificationCount: 0
})

defineEmits<{
  toggleSidebar: []
}>()

const router = useRouter()
const authStore = useAuthStore()
const darkMode = useDarkMode()
const showUserMenu = ref(false)

const userEmail = computed(() => authStore.user?.email || '')
const userInitial = computed(() => {
  const email = authStore.user?.email
  return email ? email.charAt(0).toUpperCase() : '?'
})

const handleSignOut = async () => {
  await authStore.signOut()
  router.push('/auth/login')
}
</script>
