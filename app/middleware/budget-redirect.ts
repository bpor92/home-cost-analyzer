export default defineNuxtRouteMiddleware((to) => {
  // Redirect old budget and planning routes to the new unified page
  if (to.path === '/budget' || to.path === '/planning') {
    return navigateTo('/project-management')
  }
})