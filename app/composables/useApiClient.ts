import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

export const useApiClient = () => {
  const authStore = useAuthStore()
  const router = useRouter()

  const getAuthHeaders = () => {
    const token = authStore.user?.access_token
    return token ? { Authorization: `Bearer ${token}` } : undefined
  }

  const handleApiError = async (error: any, defaultMessage: string): Promise<string | null> => {
    if (error.statusCode === 401 || error.response?.status === 401) {
      console.log('401 Unauthorized - redirecting to login')
      await authStore.signOut()
      await router.push('/auth/login')
      return null // Don't return error message, just redirect
    }
    return error.statusMessage || error.message || defaultMessage
  }

  const apiCall = async <T>(url: string, options: any = {}): Promise<T> => {
    const headers = { ...getAuthHeaders(), ...options.headers }
    
    try {
      return await $fetch<T>(url, {
        ...options,
        headers
      })
    } catch (error: any) {
      const errorMessage = await handleApiError(error, 'API call failed')
      if (errorMessage) {
        throw new Error(errorMessage)
      }
      // If no error message (401 case), throw original error but it should be handled by redirect
      throw error
    }
  }

  // Helper for creating CRUD operations with common loading/error patterns
  const createCrudOperations = <T>(baseUrl: string) => {
    const loading = ref(false)
    const error = ref<string | null>(null)

    const withErrorHandling = async <R>(operation: () => Promise<R>): Promise<R | null> => {
      loading.value = true
      error.value = null
      
      try {
        const result = await operation()
        return result
      } catch (err: any) {
        // If it's a 401, the redirect will happen in handleApiError
        if (err.message && err.message !== 'API call failed') {
          error.value = err.message
        }
        return null
      } finally {
        loading.value = false
      }
    }

    const fetchAll = (params?: Record<string, any>) => 
      withErrorHandling(() => apiCall<{ data: T[] }>(baseUrl, { params }))

    const fetchOne = (id: string) => 
      withErrorHandling(() => apiCall<{ data: T }>(`${baseUrl}/${id}`))

    const create = (data: any) => 
      withErrorHandling(() => apiCall<{ data: T }>(baseUrl, {
        method: 'POST',
        body: data
      }))

    const update = (id: string, data: any) => 
      withErrorHandling(() => apiCall<{ data: T }>(`${baseUrl}/${id}`, {
        method: 'PUT',
        body: data
      }))

    const remove = (id: string) => 
      withErrorHandling(() => apiCall(`${baseUrl}/${id}`, {
        method: 'DELETE'
      }))

    return {
      loading,
      error,
      fetchAll,
      fetchOne,
      create,
      update,
      remove,
      withErrorHandling
    }
  }

  return {
    apiCall,
    getAuthHeaders,
    handleApiError,
    createCrudOperations
  }
}