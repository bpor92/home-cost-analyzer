<template>
  <div class="flex flex-col h-full">
    <!-- Project Selector for Mobile -->
    <div class="px-2 py-4 border-b border-gray-200 md:hidden">
      <ProjectSelector />
    </div>
    
    <nav class="flex-1 px-2 py-4 space-y-1">
      <NuxtLink
        v-for="item in menuItems"
        :key="item.name"
        :to="item.path"
        :class="[
          'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
          $route.path === item.path
            ? 'bg-blue-100 text-blue-900'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        ]"
      >
        <component
          :is="getIcon(item.icon)"
          :class="[
            'mr-3 h-5 w-5',
            $route.path === item.path
              ? 'text-blue-500'
              : 'text-gray-400 group-hover:text-gray-600'
          ]"
        />
        {{ item.name }}
        <span
          v-if="item.badge"
          class="ml-auto inline-block py-0.5 px-2 text-xs bg-gray-100 rounded-full"
        >
          {{ item.badge }}
        </span>
      </NuxtLink>
    </nav>

    <div class="px-2 py-4 border-t border-gray-200">
      <div class="flex items-center px-2 py-2 text-sm text-gray-600">
        <HelpCircle class="mr-3 h-5 w-5" />
        Pomoc i wsparcie
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
// Nuxt auto-imports useRoute
import {
  Home,
  Receipt,
  BarChart3,
  Settings,
  HelpCircle,
  FolderOpen,
  LayoutDashboard,
  Package
} from 'lucide-vue-next'
import type { MenuItem } from '~/types'
import ProjectSelector from '~/components/ui/ProjectSelector.vue'

const route = useRoute()

const menuItems = computed<MenuItem[]>(() => [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: 'Home'
  },
  {
    name: 'Projekty',
    path: '/projects',
    icon: 'FolderOpen'
  },
  {
    name: 'Zarządzanie',
    path: '/project-management',
    icon: 'LayoutDashboard'
  },
  {
    name: 'Wydatki',
    path: '/expenses',
    icon: 'Receipt'
  },
  {
    name: 'Materiały',
    path: '/materials',
    icon: 'Package'
  },
  {
    name: 'Raporty',
    path: '/reports',
    icon: 'BarChart3'
  },
  {
    name: 'Ustawienia',
    path: '/settings',
    icon: 'Settings'
  }
])

const getIcon = (iconName: string) => {
  const icons = {
    Home,
    FolderOpen,
    LayoutDashboard,
    Receipt,
    Package,
    BarChart3,
    Settings,
    HelpCircle
  }
  return icons[iconName as keyof typeof icons] || Home
}
</script>