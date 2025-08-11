export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  
  // Initialize auth store on client side
  await authStore.initialize()
})