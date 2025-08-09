import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Auth/Login.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/Auth/Register.vue')
    },
    {
      path: '/app',
      component: () => import('@/components/layout/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/dashboard'
        },
        {
          path: '/dashboard',
          name: 'dashboard',
          component: () => import('@/views/Dashboard.vue')
        },
        {
          path: '/budget',
          name: 'budget',
          component: () => import('@/views/Budget.vue')
        },
        {
          path: '/expenses',
          name: 'expenses',
          component: () => import('@/views/Expenses.vue')
        },
        {
          path: '/planning',
          name: 'planning',
          component: () => import('@/views/Planning.vue')
        },
        {
          path: '/reports',
          name: 'reports',
          component: () => import('@/views/Reports.vue')
        },
        {
          path: '/settings',
          name: 'settings',
          component: () => import('@/views/Settings.vue')
        }
      ]
    }
  ],
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Initialize auth if not already done
  if (authStore.loading) {
    await authStore.initialize()
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = !!authStore.user

  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
