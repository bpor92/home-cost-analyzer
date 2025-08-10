<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-gray-900">Harmonogram etapów</h3>
      <div class="flex items-center gap-2">
        <Button
          size="sm"
          :variant="viewMode === 'timeline' ? 'primary' : 'outline'"
          @click="viewMode = 'timeline'"
        >
          <Calendar class="h-4 w-4 mr-1" />
          Oś czasu
        </Button>
        <Button
          size="sm"
          :variant="viewMode === 'gantt' ? 'primary' : 'outline'"
          @click="viewMode = 'gantt'"
        >
          <BarChart3 class="h-4 w-4 mr-1" />
          Gantt
        </Button>
      </div>
    </div>

    <div v-if="phasesWithDates.length === 0" class="text-center py-8">
      <Calendar class="mx-auto h-12 w-12 text-gray-400" />
      <h4 class="mt-2 text-sm font-medium text-gray-900">Brak etapów z datami</h4>
      <p class="mt-1 text-sm text-gray-600">Dodaj daty do etapów, aby zobaczyć harmonogram</p>
    </div>

    <div v-else-if="viewMode === 'timeline'" class="space-y-4">
      <div class="relative">
        <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
        
        <div
          v-for="(phase, index) in sortedPhasesWithDates"
          :key="phase.id"
          class="relative flex items-start pb-8"
        >
          <div class="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white"
               :class="getTimelineNodeClass(phase.status)">
            <component :is="getStatusIcon(phase.status)" class="h-4 w-4" />
          </div>
          
          <div class="ml-4 flex-1">
            <div class="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900">{{ phase.name }}</h4>
                  <p class="text-sm text-gray-600 mt-1">
                    {{ formatDateRange(phase.start_date, phase.end_date) }}
                  </p>
                  <div class="flex items-center gap-4 mt-2">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          :class="getStatusBadgeClass(phase.status)">
                      {{ getStatusText(phase.status) }}
                    </span>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          :class="getPriorityBadgeClass(phase.priority)">
                      {{ getPriorityText(phase.priority) }}
                    </span>
                    <span v-if="phase.budget" class="text-sm text-gray-600">
                      {{ formatCurrency(phase.budget) }}
                    </span>
                  </div>
                </div>
                
                <div class="ml-4 text-right">
                  <div class="text-sm text-gray-600 mb-1">{{ phase.progress }}%</div>
                  <div class="w-16 bg-gray-200 rounded-full h-1.5">
                    <div
                      class="h-1.5 rounded-full transition-all duration-300"
                      :class="getProgressBarClass(phase.progress)"
                      :style="{ width: `${phase.progress}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="viewMode === 'gantt'" class="overflow-x-auto">
      <div class="flex">
        <!-- Phase names column -->
        <div class="flex-shrink-0 w-48 pr-4">
          <div class="h-8 mb-4"></div> <!-- Spacer for header alignment -->
          <div class="space-y-2">
            <div
              v-for="phase in sortedPhasesWithDates"
              :key="phase.id"
              class="h-8 flex items-center text-sm font-medium text-gray-900 truncate"
            >
              {{ phase.name }}
            </div>
          </div>
        </div>
        
        <!-- Scrollable timeline area -->
        <div class="flex-1 min-w-0">
          <div class="min-w-max">
            <!-- Month headers -->
            <div class="flex gap-1 mb-4 text-xs text-gray-600 h-8 items-center">
              <div
                v-for="month in monthHeaders"
                :key="month"
                class="w-24 text-center font-medium flex-shrink-0"
              >
                {{ month }}
              </div>
            </div>
            
            <!-- Timeline bars -->
            <div class="space-y-2">
              <div
                v-for="phase in sortedPhasesWithDates"
                :key="phase.id"
                class="flex gap-1 h-8"
              >
                <div
                  v-for="(month, monthIndex) in monthHeaders"
                  :key="monthIndex"
                  class="relative bg-gray-50 rounded w-24 flex-shrink-0"
                >
                  <div
                    v-if="isPhaseInMonth(phase, monthIndex)"
                    class="absolute inset-0 rounded transition-colors"
                    :class="getGanttBarClass(phase.status)"
                    :style="getGanttBarStyle(phase, monthIndex)"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Calendar, Clock, Play, CheckCircle, BarChart3 } from 'lucide-vue-next'
import Button from '~/components/ui/Button.vue'
import type { RenovationPhase } from '~/types/database'

interface Props {
  phases: RenovationPhase[]
}

const props = defineProps<Props>()

const viewMode = ref<'timeline' | 'gantt'>('timeline')

const phasesWithDates = computed(() => {
  return props.phases.filter(phase => phase.start_date || phase.end_date)
})

const sortedPhasesWithDates = computed(() => {
  return [...phasesWithDates.value].sort((a, b) => {
    const aDate = new Date(a.start_date || a.end_date || '')
    const bDate = new Date(b.start_date || b.end_date || '')
    return aDate.getTime() - bDate.getTime()
  })
})

const monthHeaders = computed(() => {
  if (phasesWithDates.value.length === 0) return []
  
  const dates = phasesWithDates.value.flatMap(phase => [
    phase.start_date && new Date(phase.start_date),
    phase.end_date && new Date(phase.end_date)
  ]).filter(Boolean) as Date[]
  
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))
  
  const months = []
  const current = new Date(minDate.getFullYear(), minDate.getMonth(), 1)
  const monthNames = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru']
  
  while (current <= maxDate && months.length < 12) {
    const monthName = monthNames[current.getMonth()]
    const year = current.getFullYear().toString().slice(-2)
    months.push(`${monthName} ${year}`)
    current.setMonth(current.getMonth() + 1)
  }
  
  return months
})

function getTimelineNodeClass(status: string) {
  switch (status) {
    case 'completed':
      return 'border-green-300 bg-green-50 text-green-600'
    case 'in-progress':
      return 'border-blue-300 bg-blue-50 text-blue-600'
    case 'planned':
    default:
      return 'border-gray-300 bg-gray-50 text-gray-600'
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'completed':
      return CheckCircle
    case 'in-progress':
      return Play
    case 'planned':
    default:
      return Clock
  }
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'in-progress':
      return 'bg-blue-100 text-blue-800'
    case 'planned':
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getPriorityBadgeClass(priority: string) {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-700'
    case 'medium':
      return 'bg-yellow-100 text-yellow-700'
    case 'low':
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'completed':
      return 'Zakończony'
    case 'in-progress':
      return 'W trakcie'
    case 'planned':
    default:
      return 'Planowany'
  }
}

function getPriorityText(priority: string) {
  switch (priority) {
    case 'high':
      return 'Wysoki'
    case 'medium':
      return 'Średni'
    case 'low':
    default:
      return 'Niski'
  }
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

function getGanttBarClass(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-500'
    case 'in-progress':
      return 'bg-blue-500'
    case 'planned':
    default:
      return 'bg-gray-400'
  }
}

function isPhaseInMonth(phase: RenovationPhase, monthIndex: number): boolean {
  if (!phase.start_date && !phase.end_date) return false
  
  const monthStart = getMonthStart(monthIndex)
  const monthEnd = getMonthEnd(monthIndex)
  
  const phaseStart = phase.start_date ? new Date(phase.start_date) : monthStart
  const phaseEnd = phase.end_date ? new Date(phase.end_date) : monthEnd
  
  return phaseStart <= monthEnd && phaseEnd >= monthStart
}

function getMonthStart(monthIndex: number): Date {
  if (monthHeaders.value.length === 0) return new Date()
  
  const [monthStr, yearStr] = monthHeaders.value[monthIndex].split(' ')
  const monthNames = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru']
  const month = monthNames.indexOf(monthStr)
  const year = 2000 + parseInt(yearStr)
  
  return new Date(year, month, 1)
}

function getMonthEnd(monthIndex: number): Date {
  const start = getMonthStart(monthIndex)
  return new Date(start.getFullYear(), start.getMonth() + 1, 0)
}

function getGanttBarStyle(phase: RenovationPhase, monthIndex: number) {
  if (!isPhaseInMonth(phase, monthIndex)) return { width: '0%' }
  
  const monthStart = getMonthStart(monthIndex)
  const monthEnd = getMonthEnd(monthIndex)
  
  const phaseStart = phase.start_date ? new Date(phase.start_date) : monthStart
  const phaseEnd = phase.end_date ? new Date(phase.end_date) : monthEnd
  
  const actualStart = new Date(Math.max(phaseStart.getTime(), monthStart.getTime()))
  const actualEnd = new Date(Math.min(phaseEnd.getTime(), monthEnd.getTime()))
  
  const monthDuration = monthEnd.getTime() - monthStart.getTime()
  const phaseDuration = actualEnd.getTime() - actualStart.getTime()
  const startOffset = actualStart.getTime() - monthStart.getTime()
  
  const left = (startOffset / monthDuration) * 100
  const width = (phaseDuration / monthDuration) * 100
  
  return {
    left: `${left}%`,
    width: `${width}%`
  }
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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN'
  }).format(amount)
}
</script>