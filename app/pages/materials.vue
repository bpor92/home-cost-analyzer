<template>
  <div class="space-y-6">
    <div class="md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Materiały
        </h2>
        <p class="mt-1 text-sm text-gray-500">
          Zarządzaj pokojami i materiałami do remontu
        </p>
      </div>
      <div class="mt-4 flex md:ml-4 md:mt-0 space-x-3">
        <Button @click="showAddRoomModal = true">
          <Plus class="h-4 w-4 mr-2" />
          Dodaj pokój
        </Button>
        <Button @click="openAddMaterialModal()" :disabled="!projectsStore.currentProject || rooms.length === 0">
          <Package class="h-4 w-4 mr-2" />
          Dodaj materiał
        </Button>
      </div>
    </div>


    <!-- Rooms and Materials -->
    <div v-if="projectsStore.currentProject" class="space-y-6">
      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-gray-500">Ładowanie pokoi...</p>
      </div>
      
      <div v-else-if="rooms.length === 0" class="text-center py-8 text-gray-500 bg-white shadow rounded-lg">
        <div class="p-8">
          <Package class="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">Brak pokoi</h3>
          <p class="text-gray-500">Dodaj pierwszy pokój aby rozpocząć organizowanie materiałów</p>
        </div>
      </div>
      
      <!-- Rooms with their materials -->
      <div v-else class="space-y-6">
        <div
          v-for="room in rooms"
          :key="room.id"
          class="bg-white shadow rounded-lg"
        >
          <!-- Room header -->
          <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 class="text-lg font-medium text-gray-900">{{ room.name }}</h3>
              <p class="text-sm text-gray-500">
                {{ getRoomMaterialsCount(room.id) }} materiałów
              </p>
            </div>
            <div class="flex items-center space-x-2">
              <Button 
                size="sm" 
                variant="outline"
                @click="openAddMaterialModal(room.id)"
              >
                <Plus class="h-4 w-4 mr-2" />
                Dodaj materiał
              </Button>
              <div class="relative">
                <Button 
                  size="sm" 
                  variant="outline"
                  @click="toggleRoomDropdown(room.id)"
                >
                  <MoreVertical class="h-4 w-4" />
                </Button>
                <div 
                  v-if="activeDropdown === room.id"
                  class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                >
                  <div class="py-1">
                    <button
                      @click="openEditRoomModal(room)"
                      class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Edit class="h-4 w-4 mr-2" />
                      Edytuj pokój
                    </button>
                    <button
                      @click="openDeleteRoomModal(room)"
                      class="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      <Trash2 class="h-4 w-4 mr-2" />
                      Usuń pokój
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Room materials -->
          <div class="p-6">
            <div v-if="materialsLoading" class="text-center py-4">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p class="mt-2 text-sm text-gray-500">Ładowanie materiałów...</p>
            </div>
            
            <div v-else-if="getRoomMaterials(room.id).length === 0" class="text-center py-8 text-gray-500">
              <Package class="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p class="text-sm">Brak materiałów w tym pokoju</p>
              <Button 
                size="sm" 
                variant="outline" 
                class="mt-3"
                @click="openAddMaterialModal(room.id)"
              >
                Dodaj pierwszy materiał
              </Button>
            </div>
            
            <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div
                v-for="material in getRoomMaterials(room.id)"
                :key="material.id"
                class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900">{{ material.name }}</h4>
                    <p v-if="material.description" class="text-sm text-gray-600 mt-1">
                      {{ material.description }}
                    </p>
                    
                    <div class="mt-3 flex flex-wrap gap-2">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {{ getTypeLabel(material.type) }}
                      </span>
                      <span v-if="material.price" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {{ material.price }} zł
                      </span>
                      <span v-if="material.quantity" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {{ material.quantity }} {{ material.unit }}
                      </span>
                    </div>

                    <div v-if="material.width && material.height" class="mt-2 text-sm text-gray-600">
                      <span class="font-medium">Wymiary:</span> {{ material.width }}cm × {{ material.height }}cm
                      <span v-if="material.area_per_unit" class="block">
                        <span class="font-medium">Powierzchnia:</span> {{ material.area_per_unit }} m²/szt.
                      </span>
                    </div>
                  </div>
                  
                  <div class="ml-4 flex flex-col gap-2">
                    <a
                      v-if="material.product_url"
                      :href="material.product_url"
                      target="_blank"
                      class="text-blue-600 hover:text-blue-500 p-1"
                      title="Otwórz link do produktu"
                    >
                      <ExternalLink class="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8 text-gray-500">
      Wybierz projekt aby wyświetlić materiały
    </div>

    <!-- Add Room Modal -->
    <Modal v-model="showAddRoomModal" title="Dodaj pokój">
      <form @submit.prevent="handleAddRoom" class="space-y-4">
        <div>
          <label for="roomName" class="block text-sm font-medium text-gray-700">
            Nazwa pokoju
          </label>
          <Input
            id="roomName"
            v-model="newRoomName"
            placeholder="np. Łazienka, Salon, Kuchnia"
            required
          />
        </div>
        <div class="flex justify-end space-x-3">
          <Button type="button" variant="secondary" @click="showAddRoomModal = false">
            Anuluj
          </Button>
          <Button type="submit" :disabled="!newRoomName.trim()">
            Dodaj pokój
          </Button>
        </div>
      </form>
    </Modal>

    <!-- Add Material Modal -->
    <Modal v-model="showAddMaterialModal" title="Dodaj materiał">
      <form @submit.prevent="handleAddMaterial" class="space-y-4">
        <div>
          <label for="materialRoom" class="block text-sm font-medium text-gray-700">
            Pokój
          </label>
          <select
            id="materialRoom"
            v-model="newMaterial.room_id"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            :class="{ 'bg-gray-100': !!newMaterial.room_id }"
            :disabled="!!newMaterial.room_id"
            required
          >
            <option value="">Wybierz pokój</option>
            <option v-for="room in rooms" :key="room.id" :value="room.id">
              {{ room.name }}
            </option>
          </select>
          <p v-if="newMaterial.room_id" class="mt-1 text-xs text-gray-500">
            Pokój został automatycznie wybrany
          </p>
        </div>

        <div>
          <label for="materialName" class="block text-sm font-medium text-gray-700">
            Nazwa materiału
          </label>
          <Input
            id="materialName"
            v-model="newMaterial.name"
            placeholder="np. Płytki ceramiczne, Panele podłogowe"
            required
          />
        </div>

        <div>
          <label for="materialDescription" class="block text-sm font-medium text-gray-700">
            Opis (opcjonalnie)
          </label>
          <textarea
            id="materialDescription"
            v-model="newMaterial.description"
            rows="2"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Dodatkowe informacje o materiale"
          />
        </div>

        <div>
          <label for="materialType" class="block text-sm font-medium text-gray-700">
            Typ materiału
          </label>
          <select
            id="materialType"
            v-model="newMaterial.type"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="tiles">Płytki</option>
            <option value="flooring">Podłogi</option>
            <option value="paint">Farba</option>
            <option value="other">Inne</option>
          </select>
        </div>

        <div>
          <label for="materialUrl" class="block text-sm font-medium text-gray-700">
            Link do produktu (opcjonalnie)
          </label>
          <Input
            id="materialUrl"
            v-model="newMaterial.product_url"
            type="url"
            placeholder="https://..."
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="materialPrice" class="block text-sm font-medium text-gray-700">
              Cena (zł)
            </label>
            <Input
              id="materialPrice"
              :model-value="newMaterial.price?.toString() ?? ''"
              @update:model-value="newMaterial.price = $event ? Number($event) : null"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
            />
          </div>
          <div>
            <label for="materialQuantity" class="block text-sm font-medium text-gray-700">
              Ilość
            </label>
            <Input
              id="materialQuantity"
              :model-value="newMaterial.quantity?.toString() ?? ''"
              @update:model-value="newMaterial.quantity = $event ? Number($event) : null"
              type="number"
              min="0"
              placeholder="1"
            />
          </div>
        </div>

        <div>
          <label for="materialUnit" class="block text-sm font-medium text-gray-700">
            Jednostka
          </label>
          <Input
            id="materialUnit"
            v-model="newMaterial.unit"
            placeholder="np. szt., m², l"
          />
        </div>

        <div v-if="newMaterial.type === 'tiles' || newMaterial.type === 'flooring'" class="space-y-4">
          <h4 class="text-sm font-medium text-gray-900">Wymiary (dla kalkulatora)</h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="materialWidth" class="block text-sm font-medium text-gray-700">
                Szerokość (cm)
              </label>
              <Input
                id="materialWidth"
                :model-value="newMaterial.width?.toString() ?? ''"
                @update:model-value="newMaterial.width = $event ? Number($event) : null"
                type="number"
                step="0.1"
                min="0"
                placeholder="30"
              />
            </div>
            <div>
              <label for="materialHeight" class="block text-sm font-medium text-gray-700">
                Wysokość (cm)
              </label>
              <Input
                id="materialHeight"
                :model-value="newMaterial.height?.toString() ?? ''"
                @update:model-value="newMaterial.height = $event ? Number($event) : null"
                type="number"
                step="0.1"
                min="0"
                placeholder="30"
              />
            </div>
          </div>
          <div>
            <label for="materialAreaPerUnit" class="block text-sm font-medium text-gray-700">
              Powierzchnia na jednostkę (m²)
            </label>
            <Input
              id="materialAreaPerUnit"
              :model-value="newMaterial.area_per_unit?.toString() ?? ''"
              @update:model-value="newMaterial.area_per_unit = $event ? Number($event) : null"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.09"
            />
          </div>
        </div>

        <div class="flex justify-end space-x-3">
          <Button type="button" variant="secondary" @click="showAddMaterialModal = false">
            Anuluj
          </Button>
          <Button type="submit" :disabled="!newMaterial.name.trim() || !newMaterial.room_id">
            Dodaj materiał
          </Button>
        </div>
      </form>
    </Modal>

    <!-- Edit Room Modal -->
    <Modal v-model="showEditRoomModal" title="Edytuj pokój">
      <form @submit.prevent="handleEditRoom" class="space-y-4">
        <div>
          <label for="editRoomName" class="block text-sm font-medium text-gray-700">
            Nazwa pokoju
          </label>
          <Input
            id="editRoomName"
            v-model="newRoomName"
            placeholder="np. Łazienka, Salon, Kuchnia"
            required
          />
        </div>
        <div class="flex justify-end space-x-3">
          <Button type="button" variant="secondary" @click="showEditRoomModal = false">
            Anuluj
          </Button>
          <Button type="submit" :disabled="!newRoomName.trim()">
            Zapisz zmiany
          </Button>
        </div>
      </form>
    </Modal>

    <!-- Delete Room Modal -->
    <Modal v-model="showDeleteRoomModal" title="Usuń pokój">
      <div class="space-y-4">
        <p class="text-sm text-gray-600">
          Czy na pewno chcesz usunąć pokój <strong>{{ deletingRoom?.name }}</strong>?
        </p>
        <div v-if="deletingRoom && getRoomMaterialsCount(deletingRoom.id) > 0" class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <AlertTriangle class="h-5 w-5 text-yellow-400" />
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-yellow-800">
                Uwaga
              </h3>
              <div class="mt-2 text-sm text-yellow-700">
                <p>Ten pokój zawiera {{ getRoomMaterialsCount(deletingRoom.id) }} materiałów. Usunięcie pokoju jest niemożliwe dopóki nie usuniesz wszystkich materiałów z tego pokoju.</p>
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-end space-x-3">
          <Button type="button" variant="secondary" @click="showDeleteRoomModal = false">
            Anuluj
          </Button>
          <Button 
            type="button" 
            variant="danger" 
            @click="handleDeleteRoom"
            :disabled="!!(deletingRoom && getRoomMaterialsCount(deletingRoom.id) > 0)"
          >
            Usuń pokój
          </Button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Plus, Package, ExternalLink, MoreVertical, Edit, Trash2, AlertTriangle } from 'lucide-vue-next'
import { useRooms } from '~/composables/useRooms'
import { useMaterials } from '~/composables/useMaterials'
import { useProjectsStore } from '~/stores/projects'
import type { Room, MaterialWithRoom } from '~/types/database'
import Button from '~/components/ui/Button.vue'
import Input from '~/components/ui/Input.vue'
import Modal from '~/components/ui/Modal.vue'

definePageMeta({
  middleware: 'budget-redirect'
})

const { getRooms, createRoom, updateRoom, deleteRoom } = useRooms()
const { getMaterials, createMaterial } = useMaterials()
const projectsStore = useProjectsStore()

const loading = ref(false)
const materialsLoading = ref(false)
const rooms = ref<Room[]>([])
const materials = ref<MaterialWithRoom[]>([])

const showAddRoomModal = ref(false)
const showAddMaterialModal = ref(false)
const showEditRoomModal = ref(false)
const showDeleteRoomModal = ref(false)
const newRoomName = ref('')
const editingRoom = ref<Room | null>(null)
const deletingRoom = ref<Room | null>(null)

const newMaterial = ref({
  room_id: '',
  name: '',
  description: '',
  product_url: '',
  type: 'other' as 'tiles' | 'flooring' | 'paint' | 'other',
  price: null as number | null,
  quantity: null as number | null,
  unit: '',
  width: null as number | null,
  height: null as number | null,
  area_per_unit: null as number | null
})

const getRoomMaterialsCount = (roomId: string) => {
  return materials.value.filter(m => m.room_id === roomId).length
}

const getRoomMaterials = (roomId: string) => {
  return materials.value.filter(m => m.room_id === roomId)
}

const getTypeLabel = (type: string) => {
  const labels = {
    'tiles': 'Płytki',
    'flooring': 'Podłogi', 
    'paint': 'Farba',
    'other': 'Inne'
  }
  return labels[type as keyof typeof labels] || 'Inne'
}

const activeDropdown = ref<string | null>(null)

const toggleRoomDropdown = (roomId: string) => {
  activeDropdown.value = activeDropdown.value === roomId ? null : roomId
}

const openAddMaterialModal = (roomId?: string) => {
  if (roomId) {
    newMaterial.value.room_id = roomId
  } else {
    newMaterial.value.room_id = ''
  }
  showAddMaterialModal.value = true
  activeDropdown.value = null
}

const openEditRoomModal = (room: Room) => {
  editingRoom.value = room
  newRoomName.value = room.name
  showEditRoomModal.value = true
  activeDropdown.value = null
}

const openDeleteRoomModal = (room: Room) => {
  deletingRoom.value = room
  showDeleteRoomModal.value = true
  activeDropdown.value = null
}

const loadRooms = async () => {
  if (!projectsStore.currentProject?.id) return
  
  loading.value = true
  try {
    rooms.value = await getRooms(projectsStore.currentProject.id)
  } catch (error) {
    console.error('Error loading rooms:', error)
  } finally {
    loading.value = false
  }
}

const loadMaterials = async () => {
  if (!projectsStore.currentProject?.id) return
  
  materialsLoading.value = true
  try {
    materials.value = await getMaterials(projectsStore.currentProject.id)
  } catch (error) {
    console.error('Error loading materials:', error)
  } finally {
    materialsLoading.value = false
  }
}

const handleAddRoom = async () => {
  if (!projectsStore.currentProject?.id || !newRoomName.value.trim()) return
  
  try {
    const room = await createRoom(projectsStore.currentProject.id, newRoomName.value.trim())
    rooms.value.push(room)
    newRoomName.value = ''
    showAddRoomModal.value = false
  } catch (error) {
    console.error('Error adding room:', error)
  }
}

const handleEditRoom = async () => {
  if (!editingRoom.value || !newRoomName.value.trim()) return
  
  try {
    const updatedRoom = await updateRoom(editingRoom.value.id, newRoomName.value.trim())
    const index = rooms.value.findIndex(r => r.id === editingRoom.value!.id)
    if (index !== -1) {
      rooms.value[index] = updatedRoom
    }
    editingRoom.value = null
    newRoomName.value = ''
    showEditRoomModal.value = false
  } catch (error) {
    console.error('Error updating room:', error)
  }
}

const handleDeleteRoom = async () => {
  if (!deletingRoom.value) return
  
  try {
    await deleteRoom(deletingRoom.value.id)
    rooms.value = rooms.value.filter(r => r.id !== deletingRoom.value!.id)
    materials.value = materials.value.filter(m => m.room_id !== deletingRoom.value!.id)
    deletingRoom.value = null
    showDeleteRoomModal.value = false
  } catch (error) {
    console.error('Error deleting room:', error)
  }
}

const handleAddMaterial = async () => {
  if (!projectsStore.currentProject?.id || !newMaterial.value.name.trim() || !newMaterial.value.room_id) return
  
  try {
    await createMaterial({
      project_id: projectsStore.currentProject.id,
      ...newMaterial.value
    })
    
    // Reload materials
    await loadMaterials()
    
    // Reset form
    newMaterial.value = {
      room_id: '',
      name: '',
      description: '',
      product_url: '',
      type: 'other',
      price: null,
      quantity: null,
      unit: '',
      width: null,
      height: null,
      area_per_unit: null
    }
    showAddMaterialModal.value = false
  } catch (error) {
    console.error('Error adding material:', error)
  }
}

// Close dropdown when clicking outside
const closeDropdownOnClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    activeDropdown.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdownOnClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdownOnClickOutside)
})

watch(() => projectsStore.currentProject, async (newProject) => {
  if (newProject) {
    await Promise.all([loadRooms(), loadMaterials()])
  } else {
    rooms.value = []
    materials.value = []
  }
}, { immediate: true })
</script>