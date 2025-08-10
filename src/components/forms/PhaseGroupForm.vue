<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
        Nazwa grupy *
      </label>
      <Input
        id="name"
        v-model="formData.name"
        required
        placeholder="np. Przygotowanie, Wykończenie, Instalacje"
        :error="errors.name"
      />
    </div>

    <div>
      <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
        Opis grupy
      </label>
      <textarea
        id="description"
        v-model="formData.description"
        rows="3"
        placeholder="Krótki opis tego co zawiera grupa etapów..."
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
      ></textarea>
    </div>

    <div>
      <label for="color" class="block text-sm font-medium text-gray-700 mb-1">
        Kolor grupy
      </label>
      <div class="flex items-center gap-4">
        <input
          id="color"
          v-model="formData.color"
          type="color"
          class="h-10 w-16 rounded-md border border-gray-300 cursor-pointer"
        />
        <div class="flex gap-2">
          <button
            v-for="color in predefinedColors"
            :key="color"
            type="button"
            @click="formData.color = color"
            class="w-6 h-6 rounded-full border-2 border-gray-300 hover:scale-110 transition-transform"
            :class="{ 'ring-2 ring-blue-500 ring-offset-2': formData.color === color }"
            :style="{ backgroundColor: color }"
          ></button>
        </div>
      </div>
      <p class="text-xs text-gray-500 mt-1">Wybierz kolor, który będzie reprezentować tę grupę</p>
    </div>

    <!-- Preview -->
    <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <h4 class="text-sm font-medium text-gray-700 mb-2">Podgląd</h4>
      <div 
        class="flex items-center gap-2 p-3 bg-white rounded-lg border-t-4"
        :style="{ borderTopColor: formData.color }"
      >
        <div 
          class="w-3 h-3 rounded-full"
          :style="{ backgroundColor: formData.color }"
        ></div>
        <div>
          <h5 class="font-medium text-gray-900">{{ formData.name || 'Nazwa grupy' }}</h5>
          <p v-if="formData.description" class="text-sm text-gray-600">
            {{ formData.description }}
          </p>
        </div>
      </div>
    </div>

    <div class="flex gap-3 pt-4">
      <Button type="submit" :loading="loading" class="flex-1">
        {{ editMode ? 'Zaktualizuj grupę' : 'Utwórz grupę' }}
      </Button>
      <Button type="button" variant="outline" @click="$emit('cancel')">
        Anuluj
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import type { PhaseGroup } from '@/types/database'

interface GroupFormData {
  name: string
  description: string
  color: string
}

interface Props {
  group?: PhaseGroup
  loading?: boolean
}

interface Emits {
  (e: 'submit', data: GroupFormData): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

const editMode = computed(() => !!props.group)

const predefinedColors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#14B8A6', // Teal
  '#F43F5E'  // Rose
]

const formData = reactive<GroupFormData>({
  name: '',
  description: '',
  color: '#3B82F6'
})

const errors = ref<Record<string, string>>({})

watch(() => props.group, (newGroup) => {
  if (newGroup) {
    formData.name = newGroup.name
    formData.description = newGroup.description || ''
    formData.color = newGroup.color
  } else {
    // Reset form when no group is provided
    formData.name = ''
    formData.description = ''
    formData.color = '#3B82F6'
  }
}, { immediate: true })

function validateForm(): boolean {
  errors.value = {}
  
  if (!formData.name.trim()) {
    errors.value.name = 'Nazwa grupy jest wymagana'
  }
  
  // Validate hex color
  if (!/^#[0-9A-Fa-f]{6}$/.test(formData.color)) {
    errors.value.color = 'Nieprawidłowy format koloru'
  }
  
  return Object.keys(errors.value).length === 0
}

function handleSubmit() {
  if (validateForm()) {
    emit('submit', { ...formData })
  }
}
</script>