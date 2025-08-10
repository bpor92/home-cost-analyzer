<template>
  <Card class="overflow-hidden hover:shadow-lg transition-shadow duration-200">
    <!-- Group Header -->
    <div class="p-4 border-b border-gray-200" :style="{ borderTopColor: group.color, borderTopWidth: '4px' }">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <div 
              class="w-4 h-4 rounded-full flex-shrink-0"
              :style="{ backgroundColor: group.color }"
            ></div>
            <h3 class="text-lg font-semibold text-gray-900">{{ group.name }}</h3>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {{ group.phaseCount }} {{ group.phaseCount === 1 ? 'etap' : 'etapów' }}
            </span>
          </div>
          
          <p v-if="group.description" class="text-sm text-gray-600 mb-3">
            {{ group.description }}
          </p>
        </div>
        
        <div class="flex items-center gap-2 ml-4">
          <Button
            size="sm"
            variant="ghost"
            @click="$emit('edit', group)"
            v-if="group.id !== 'ungrouped'"
          >
            <Edit2 class="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            class="text-red-600 hover:text-red-700 hover:bg-red-50"
            @click="$emit('delete', group)"
            v-if="group.id !== 'ungrouped'"
          >
            <Trash2 class="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            @click="toggleExpanded"
          >
            <ChevronDown 
              class="h-4 w-4 transition-transform duration-200"
              :class="{ 'rotate-180': expanded }"
            />
          </Button>
        </div>
      </div>
      
      <!-- Summary Stats -->
      <div class="grid grid-cols-3 gap-4 mt-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900">{{ group.completedPhases }}/{{ group.phaseCount }}</div>
          <div class="text-xs text-gray-600">Zakończone</div>
        </div>
        
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900">{{ group.totalProgress }}%</div>
          <div class="text-xs text-gray-600">Średni postęp</div>
        </div>
        
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900">{{ formatCurrency(group.totalBudget) }}</div>
          <div class="text-xs text-gray-600">Budżet</div>
        </div>
      </div>
      
      <!-- Progress Bar -->
      <div class="mt-4">
        <div class="flex items-center justify-between text-sm text-gray-600 mb-1">
          <span>Postęp grupy</span>
          <span>{{ group.totalProgress }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="h-2 rounded-full transition-all duration-300"
            :class="getProgressBarClass(group.totalProgress)"
            :style="{ 
              width: `${group.totalProgress}%`,
              backgroundColor: group.totalProgress > 0 ? group.color : undefined
            }"
          ></div>
        </div>
      </div>
    </div>
    
    <!-- Phases List -->
    <div v-if="expanded" class="divide-y divide-gray-200">
      <div v-if="group.phases.length === 0" class="p-4 text-center text-gray-500">
        <Calendar class="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p class="text-sm">Brak etapów w tej grupie</p>
      </div>
      
      <div 
        v-else
        v-for="phase in sortedPhases" 
        :key="phase.id"
        class="p-4 hover:bg-gray-50 transition-colors duration-150"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h4 class="font-medium text-gray-900">{{ phase.name }}</h4>
              <span :class="getStatusBadgeClass(phase.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                {{ getStatusText(phase.status) }}
              </span>
              <span :class="getPriorityBadgeClass(phase.priority)" class="px-2 py-1 text-xs font-medium rounded-full">
                {{ getPriorityText(phase.priority) }}
              </span>
            </div>
            
            <div class="flex items-center gap-4 text-sm text-gray-600 mb-2 flex-wrap">
              <span v-if="phase.budget" class="flex items-center gap-1">
                <CreditCard class="h-3 w-3" />
                {{ formatCurrency(phase.budget) }}
              </span>
              
              <span v-if="phase.start_date || phase.end_date" class="flex items-center gap-1">
                <Calendar class="h-3 w-3" />
                {{ formatDateRange(phase.start_date, phase.end_date) }}
              </span>
              
              <span v-if="phase.budget_categories?.name" class="flex items-center gap-1">
                <Tag class="h-3 w-3" />
                {{ phase.budget_categories.name }}
              </span>
            </div>
            
            <div class="flex items-center gap-2">
              <div class="flex-1 bg-gray-200 rounded-full h-1.5">
                <div
                  class="h-1.5 rounded-full transition-all duration-300"
                  :class="getProgressBarClass(phase.progress)"
                  :style="{ width: `${phase.progress}%` }"
                ></div>
              </div>
              <span class="text-xs text-gray-600 w-10">{{ phase.progress }}%</span>
            </div>
          </div>
          
          <div class="flex items-center gap-1 ml-4">
            <Button
              size="sm"
              variant="ghost"
              @click="$emit('editPhase', phase)"
            >
              <Edit2 class="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              class="text-red-600 hover:text-red-700 hover:bg-red-50"
              @click="$emit('deletePhase', phase)"
            >
              <Trash2 class="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Add Phase Button -->
    <div v-if="expanded && group.id !== 'ungrouped'" class="p-4 border-t border-gray-200 bg-gray-50">
      <Button 
        variant="outline" 
        size="sm" 
        class="w-full"
        @click="$emit('addPhase', group)"
      >
        <Plus class="h-4 w-4 mr-2" />
        Dodaj etap do grupy
      </Button>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Calendar, CreditCard, Edit2, Trash2, ChevronDown, Plus, Tag } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import type { PhaseGroupWithPhases, RenovationPhase } from '@/types/database'

// Helper functions for badge classes and text
function getStatusBadgeClass(status: string) {
  const classes = {
    'planned': 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800'
  }
  return classes[status] || classes.planned
}

function getStatusText(status: string) {
  const text = {
    'planned': 'Planowany',
    'in-progress': 'W trakcie',
    'completed': 'Zakończony'
  }
  return text[status] || status
}

function getPriorityBadgeClass(priority: string) {
  const classes = {
    'low': 'bg-gray-100 text-gray-600',
    'medium': 'bg-yellow-100 text-yellow-700',
    'high': 'bg-red-100 text-red-700'
  }
  return classes[priority] || classes.medium
}

function getPriorityText(priority: string) {
  const text = {
    'low': 'Niski',
    'medium': 'Średni', 
    'high': 'Wysoki'
  }
  return text[priority] || priority
}

interface Props {
  group: PhaseGroupWithPhases
  defaultExpanded?: boolean
}

interface Emits {
  (e: 'edit', group: PhaseGroupWithPhases): void
  (e: 'delete', group: PhaseGroupWithPhases): void
  (e: 'addPhase', group: PhaseGroupWithPhases): void
  (e: 'editPhase', phase: RenovationPhase): void
  (e: 'deletePhase', phase: RenovationPhase): void
}

const props = withDefaults(defineProps<Props>(), {
  defaultExpanded: false
})

const emit = defineEmits<Emits>()

const expanded = ref(props.defaultExpanded)

const sortedPhases = computed(() => {
  return [...props.group.phases].sort((a, b) => a.order_index - b.order_index)
})

function toggleExpanded() {
  expanded.value = !expanded.value
}

function getProgressBarClass(progress: number) {
  if (progress >= 100) {
    return 'bg-green-500'
  } else if (progress >= 50) {
    return 'bg-blue-500'
  } else if (progress > 0) {
    return 'bg-yellow-500'
  }
  return 'bg-gray-300'
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    maximumFractionDigits: 0
  }).format(amount)
}

function formatDateRange(startDate: string | null, endDate: string | null): string {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit'
    })
  }
  
  if (startDate && endDate) {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  } else if (startDate) {
    return `Od: ${formatDate(startDate)}`
  } else if (endDate) {
    return `Do: ${formatDate(endDate)}`
  }
  return 'Brak dat'
}
</script>