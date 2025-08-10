<template>
  <div :class="cardClasses">
    <div v-if="$slots.header" class="px-4 py-5 border-b border-gray-200 sm:px-6">
      <slot name="header" />
    </div>
    <div :class="contentClasses">
      <slot />
    </div>
    <div v-if="$slots.footer" class="px-4 py-4 border-t border-gray-200 sm:px-6">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  padding?: boolean
  hover?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  padding: true,
  hover: false
})

const cardClasses = computed(() => {
  const baseClasses = 'bg-white rounded-lg shadow'
  const hoverClasses = props.hover ? 'hover:shadow-md transition-shadow' : ''
  
  return [baseClasses, hoverClasses].filter(Boolean).join(' ')
})

const contentClasses = computed(() => {
  return props.padding ? 'px-4 py-5 sm:p-6' : ''
})
</script>