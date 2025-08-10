<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
        Nazwa etapu *
      </label>
      <Input
        id="name"
        v-model="formData.name"
        required
        placeholder="np. Przygotowanie podłoża"
        :error="errors.name"
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="start_date" class="block text-sm font-medium text-gray-700 mb-1">
          Data rozpoczęcia
        </label>
        <Input
          id="start_date"
          v-model="formData.start_date"
          type="date"
          :error="errors.start_date"
        />
      </div>
      
      <div>
        <label for="end_date" class="block text-sm font-medium text-gray-700 mb-1">
          Data zakończenia
        </label>
        <Input
          id="end_date"
          v-model="formData.end_date"
          type="date"
          :error="errors.end_date"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="budget" class="block text-sm font-medium text-gray-700 mb-1">
          Budżet (PLN)
        </label>
        <Input
          id="budget"
          v-model.number="formData.budget"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          :error="errors.budget"
        />
      </div>

      <div>
        <label for="priority" class="block text-sm font-medium text-gray-700 mb-1">
          Priorytet
        </label>
        <select
          id="priority"
          v-model="formData.priority"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="low">Niski</option>
          <option value="medium">Średni</option>
          <option value="high">Wysoki</option>
        </select>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="status" class="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          id="status"
          v-model="formData.status"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="planned">Planowany</option>
          <option value="in-progress">W trakcie</option>
          <option value="completed">Zakończony</option>
        </select>
      </div>

      <div>
        <label for="progress" class="block text-sm font-medium text-gray-700 mb-1">
          Postęp (%)
        </label>
        <input
          id="progress"
          v-model.number="formData.progress"
          type="range"
          min="0"
          max="100"
          step="1"
          class="w-full accent-blue-600"
        />
        <div class="text-center text-sm text-gray-600 mt-1">{{ formData.progress }}%</div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Group Selection -->
      <div v-if="availableGroups && availableGroups.length > 0">
        <label for="group" class="block text-sm font-medium text-gray-700 mb-1">
          Grupa etapów
        </label>
        <select
          id="group"
          v-model="formData.group_id"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Brak grupy</option>
          <option
            v-for="group in availableGroups"
            :key="group.id"
            :value="group.id"
          >
            • {{ group.name }}
          </option>
        </select>
        <p class="text-xs text-gray-500 mt-1">Grupa do organizacji etapów</p>
      </div>

      <!-- Category Selection -->
      <div v-if="availableCategories && availableCategories.length > 0">
        <label for="category" class="block text-sm font-medium text-gray-700 mb-1">
          Kategoria budżetu
        </label>
        <select
          id="category"
          v-model="formData.category_id"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Brak kategorii</option>
          <option
            v-for="category in availableCategories"
            :key="category.id"
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>
        <p class="text-xs text-gray-500 mt-1">Kategoria do śledzenia kosztów</p>
      </div>
    </div>

    <div>
      <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">
        Notatki
      </label>
      <textarea
        id="notes"
        v-model="formData.notes"
        rows="3"
        placeholder="Dodatkowe informacje o etapie..."
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
      ></textarea>
    </div>

    <div class="flex gap-3 pt-4">
      <Button type="submit" :loading="loading" class="flex-1">
        {{ editMode ? 'Zaktualizuj etap' : 'Dodaj etap' }}
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
import type { RenovationPhase } from '@/types/database'

interface PhaseFormData {
  name: string
  start_date: string
  end_date: string
  status: 'planned' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  progress: number
  budget: number
  notes: string
  group_id: string
  category_id: string
}

interface Props {
  phase?: RenovationPhase
  loading?: boolean
  availableGroups?: Array<{
    id: string
    name: string
    color: string
  }>
  availableCategories?: Array<{
    id: string
    name: string
  }>
}

interface Emits {
  (e: 'submit', data: PhaseFormData): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

const editMode = computed(() => !!props.phase)

const formData = reactive<PhaseFormData>({
  name: '',
  start_date: '',
  end_date: '',
  status: 'planned',
  priority: 'medium',
  progress: 0,
  budget: 0,
  notes: '',
  group_id: '',
  category_id: ''
})

const errors = ref<Record<string, string>>({})

watch(() => props.phase, (newPhase) => {
  if (newPhase) {
    formData.name = newPhase.name
    formData.start_date = newPhase.start_date || ''
    formData.end_date = newPhase.end_date || ''
    formData.status = newPhase.status
    formData.priority = newPhase.priority
    formData.progress = newPhase.progress
    formData.budget = newPhase.budget || 0
    formData.notes = newPhase.notes || ''
    formData.group_id = newPhase.group_id || ''
    formData.category_id = newPhase.category_id || ''
  } else {
    // Reset form when no phase is provided
    formData.name = ''
    formData.start_date = ''
    formData.end_date = ''
    formData.status = 'planned'
    formData.priority = 'medium'
    formData.progress = 0
    formData.budget = 0
    formData.notes = ''
    formData.group_id = ''
    formData.category_id = ''
  }
}, { immediate: true })

function validateForm(): boolean {
  errors.value = {}
  
  if (!formData.name.trim()) {
    errors.value.name = 'Nazwa etapu jest wymagana'
  }
  
  if (formData.start_date && formData.end_date) {
    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      errors.value.end_date = 'Data zakończenia musi być późniejsza niż data rozpoczęcia'
    }
  }
  
  if (formData.budget < 0) {
    errors.value.budget = 'Budżet nie może być ujemny'
  }
  
  return Object.keys(errors.value).length === 0
}

function handleSubmit() {
  if (validateForm()) {
    emit('submit', { ...formData })
  }
}
</script>