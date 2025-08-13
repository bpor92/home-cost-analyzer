export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  
  // Wait for auth to initialize
  if (authStore.loading) {
    return
  }
  
  // Redirect to login if not authenticated
  if (!authStore.user) {
    return navigateTo('/auth/login')
  }
})