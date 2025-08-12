import { useAuthStore } from '~/stores/auth'
import type { Room } from '~/types/database'
import type { ApiResponse } from '~/types'

export const useRooms = () => {
  const authStore = useAuthStore()

  const getAuthHeaders = () => {
    const token = authStore.user?.access_token
    return token ? { Authorization: `Bearer ${token}` } : undefined
  }

  const getRooms = async (projectId: string): Promise<Room[]> => {
    try {
      const response = await $fetch<ApiResponse<Room[]>>(`/api/rooms/project/${projectId}`, {
        headers: getAuthHeaders()
      })
      return response.data || []
    } catch (error) {
      console.error('Error fetching rooms:', error)
      throw error
    }
  }

  const createRoom = async (projectId: string, name: string): Promise<Room> => {
    try {
      const response = await $fetch<ApiResponse<Room>>('/api/rooms', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: {
          project_id: projectId,
          name
        }
      })

      if (!response.data) {
        throw new Error('Failed to create room')
      }

      return response.data
    } catch (error) {
      console.error('Error creating room:', error)
      throw error
    }
  }

  const updateRoom = async (roomId: string, name: string): Promise<Room> => {
    try {
      const response = await $fetch<ApiResponse<Room>>(`/api/rooms/${roomId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: {
          name
        }
      })

      if (!response.data) {
        throw new Error('Failed to update room')
      }

      return response.data
    } catch (error) {
      console.error('Error updating room:', error)
      throw error
    }
  }

  const deleteRoom = async (roomId: string): Promise<void> => {
    try {
      await $fetch(`/api/rooms/${roomId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
    } catch (error) {
      console.error('Error deleting room:', error)
      throw error
    }
  }

  return {
    getRooms,
    createRoom,
    updateRoom,
    deleteRoom
  }
}