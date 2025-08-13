import { ref, computed, watch, readonly } from 'vue'
import { useLocalStorage } from '@vueuse/core'

export const useDarkMode = () => {
  const isDark = useLocalStorage('dark-mode', false)
  
  const toggle = () => {
    isDark.value = !isDark.value
  }
  
  const enable = () => {
    isDark.value = true
  }
  
  const disable = () => {
    isDark.value = false
  }
  
  watch(isDark, (value) => {
    if (process.client) {
      if (value) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, { immediate: true })
  
  return {
    isDark: readonly(isDark),
    toggle,
    enable,
    disable
  }
}