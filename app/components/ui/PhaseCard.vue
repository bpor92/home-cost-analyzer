<template>
  <Card class="hover:shadow-lg transition-shadow duration-200">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-2">
          <h3 class="text-lg font-semibold text-gray-900">{{ phase.name }}</h3>
          <StatusBadge :status="phase.status" />
          <PriorityBadge :priority="phase.priority" />
        </div>
        
        <div class="space-y-2 text-sm text-gray-600">
          <div v-if="phase.budget" class="flex items-center gap-2">
            <CreditCard class="h-4 w-4" />
            <span>Budżet: {{ formatCurrency(phase.budget) }}</span>
          </div>
          
          <div v-if="phase.start_date || phase.end_date" class="flex items-center gap-2">
            <Calendar class="h-4 w-4" />
            <span>
              {{ formatDateRange(phase.start_date, phase.end_date) }}
            </span>
          </div>
          
          <div v-if="phase.budget_categories?.name" class="flex items-center gap-2">
            <Tag class="h-4 w-4" />
            <span>Kategoria: {{ phase.budget_categories.name }}</span>
          </div>
          
          <div v-if="phase.notes" class="flex items-start gap-2">
            <FileText class="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span class="line-clamp-2">{{ phase.notes }}</span>
          </div>
        </div>
      </div>
      
      <div class="flex items-center gap-2 ml-4">
        <Button
          size="sm"
          variant="ghost"
          @click="$emit('edit', phase)"
        >
          <Edit2 class="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          class="text-red-600 hover:text-red-700 hover:bg-red-50"
          @click="$emit('delete', phase)"
        >
          <Trash2 class="h-4 w-4" />
        </Button>
      </div>
    </div>
    
    <div class="mt-4">
      <div class="flex items-center justify-between text-sm text-gray-600 mb-1">
        <span>Postęp</span>
        <span>{{ phase.progress }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="h-2 rounded-full transition-all duration-300"
          :class="progressBarClass"
          :style="{ width: `${phase.progress}%` }"
        ></div>
      </div>
    </div>
    
    <div v-if="showDragHandle" class="flex justify-center mt-3 pt-3 border-t border-gray-200">
      <div class="drag-handle cursor-move text-gray-400 hover:text-gray-600">
        <GripVertical class="h-5 w-5" />
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed, defineComponent, type PropType, h } from 'vue'
import { Calendar, CreditCard, FileText, Edit2, Trash2, GripVertical, Tag } from 'lucide-vue-next'
import Card from '~/components/ui/Card.vue'
import Button from '~/components/ui/Button.vue'
import type { RenovationPhase } from '~/types/database'

const StatusBadge = defineComponent({
  props: {
    status: {
      type: String as PropType<'planned' | 'in-progress' | 'completed'>,
      required: true
    }
  },
  setup(props) {
    const badgeClass = computed(() => {
      switch (props.status) {
        case 'planned':
          return 'bg-gray-100 text-gray-800'
        case 'in-progress':
          return 'bg-blue-100 text-blue-800'
        case 'completed':
          return 'bg-green-100 text-green-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    })
    
    const statusText = computed(() => {
      switch (props.status) {
        case 'planned':
          return 'Planowany'
        case 'in-progress':
          return 'W trakcie'
        case 'completed':
          return 'Zakończony'
        default:
          return props.status
      }
    })
    
    return () => h('span', {
      class: `px-2 py-1 text-xs font-medium rounded-full ${badgeClass.value}`
    }, statusText.value)
  }
})

const PriorityBadge = defineComponent({
  props: {
    priority: {
      type: String as PropType<'low' | 'medium' | 'high'>,
      required: true
    }
  },
  setup(props) {
    const badgeClass = computed(() => {
      switch (props.priority) {
        case 'low':
          return 'bg-gray-100 text-gray-600'
        case 'medium':
          return 'bg-yellow-100 text-yellow-700'
        case 'high':
          return 'bg-red-100 text-red-700'
        default:
          return 'bg-gray-100 text-gray-600'
      }
    })
    
    const priorityText = computed(() => {
      switch (props.priority) {
        case 'low':
          return 'Niski'
        case 'medium':
          return 'Średni'
        case 'high':
          return 'Wysoki'
        default:
          return props.priority
      }
    })
    
    return () => h('span', {
      class: `px-2 py-1 text-xs font-medium rounded-full ${badgeClass.value}`
    }, priorityText.value)
  }
})

interface Props {
  phase: RenovationPhase
  showDragHandle?: boolean
}

interface Emits {
  (e: 'edit', phase: RenovationPhase): void
  (e: 'delete', phase: RenovationPhase): void
}

const props = withDefaults(defineProps<Props>(), {
  showDragHandle: false
})

const emit = defineEmits<Emits>()

const progressBarClass = computed(() => {
  if (props.phase.progress >= 100) {
    return 'bg-green-500'
  } else if (props.phase.progress >= 50) {
    return 'bg-blue-500'
  } else if (props.phase.progress > 0) {
    return 'bg-yellow-500'
  }
  return 'bg-gray-300'
})

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN'
  }).format(amount)
}

function formatDateRange(startDate: string | null, endDate: string | null): string {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
  
  if (startDate && endDate) {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  } else if (startDate) {
    return `Od: ${formatDate(startDate)}`
  } else if (endDate) {
    return `Do: ${formatDate(endDate)}`
  }
  return 'Brak terminów'
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.drag-handle {
  touch-action: none;
}
</style>