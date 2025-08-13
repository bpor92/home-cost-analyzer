<template>
  <Teleport to="body">
    <Transition
      enter-active-class="duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click="handleBackdropClick"
      >
        <div class="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

          <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

          <Transition
            enter-active-class="duration-300 ease-out"
            enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to-class="opacity-100 translate-y-0 sm:scale-100"
            leave-active-class="duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0 sm:scale-100"
            leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div
              v-if="isOpen"
              :class="modalClasses"
              @click.stop
            >
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 v-if="title" class="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {{ title }}
                  </h3>
                  <div class="mt-2">
                    <slot />
                  </div>
                </div>
              </div>
              <div v-if="$slots.footer" class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <slot name="footer" />
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: boolean
  open?: boolean
  show?: boolean
  title?: string
  closeOnBackdrop?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  closeOnBackdrop: true,
  open: false,
  show: false,
  modelValue: false,
  size: 'md'
})

const emit = defineEmits<{
  close: []
  'update:open': [value: boolean]
  'update:modelValue': [value: boolean]
}>()

const isOpen = computed(() => {
  // Use logical OR instead of nullish coalescing to properly handle boolean false
  return props.modelValue || props.open || props.show
})

const modalClasses = computed(() => {
  const baseClasses = 'inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:p-6'
  
  const sizeClasses = {
    sm: 'sm:max-w-sm sm:w-full',
    md: 'sm:max-w-lg sm:w-full',
    lg: 'sm:max-w-4xl sm:w-full',
    xl: 'sm:max-w-6xl sm:w-full'
  }
  
  return `${baseClasses} ${sizeClasses[props.size]}`
})

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    emit('close')
    emit('update:open', false)
    emit('update:modelValue', false)
  }
}
</script>