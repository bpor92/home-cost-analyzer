import { useAuthStore } from '~/stores/auth'
import type { Material, MaterialWithRoom } from '~/types/database'
import type { ApiResponse } from '~/types'

interface CreateMaterialData {
  project_id: string
  room_id: string
  name: string
  description?: string | null
  product_url?: string | null
  type?: 'tiles' | 'flooring' | 'paint' | 'other'
  price?: number | null
  quantity?: number | null
  unit?: string | null
  width?: number | null
  height?: number | null
  area_per_unit?: number | null
}

export const useMaterials = () => {
  const authStore = useAuthStore()

  const getAuthHeaders = () => {
    const token = authStore.user?.access_token
    return token ? { Authorization: `Bearer ${token}` } : undefined
  }

  const getMaterials = async (projectId: string): Promise<MaterialWithRoom[]> => {
    try {
      const response = await $fetch<ApiResponse<MaterialWithRoom[]>>(`/api/materials/${projectId}`, {
        headers: getAuthHeaders()
      })
      return response.data || []
    } catch (error) {
      console.error('Error fetching materials:', error)
      throw error
    }
  }

  const createMaterial = async (data: CreateMaterialData): Promise<Material> => {
    try {
      const response = await $fetch<ApiResponse<Material>>('/api/materials', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: data
      })

      if (!response.data) {
        throw new Error('Failed to create material')
      }

      return response.data
    } catch (error) {
      console.error('Error creating material:', error)
      throw error
    }
  }

  const calculateTilesNeeded = (roomWidth: number, roomHeight: number, tileWidth: number, tileHeight: number): number => {
    const roomArea = roomWidth * roomHeight
    const tileArea = tileWidth * tileHeight
    const tilesNeeded = Math.ceil(roomArea / tileArea)
    return Math.ceil(tilesNeeded * 1.1) // Add 10% for waste
  }

  const calculateFlooringNeeded = (roomWidth: number, roomHeight: number, panelArea: number): number => {
    const roomArea = roomWidth * roomHeight
    const panelsNeeded = Math.ceil(roomArea / panelArea)
    return Math.ceil(panelsNeeded * 1.05) // Add 5% for waste
  }

  return {
    getMaterials,
    createMaterial,
    calculateTilesNeeded,
    calculateFlooringNeeded
  }
}