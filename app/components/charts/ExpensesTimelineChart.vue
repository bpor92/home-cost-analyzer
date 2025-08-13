<template>
  <div class="expenses-timeline-chart">
    <div v-if="hasData" class="h-full">
      <Line 
        :data="chartData" 
        :options="chartOptions"
        class="w-full h-full"
      />
    </div>
    <div v-else class="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
      <div class="text-center">
        <TrendingUp class="mx-auto h-12 w-12 mb-2 opacity-50" />
        <p class="text-sm">Brak danych do wyświetlenia</p>
        <p class="text-xs mt-1">Dodaj wydatki aby zobaczyć timeline</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Line, Bar } from 'vue-chartjs'
import { TrendingUp } from 'lucide-vue-next'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement,
  Filler,
  BarElement
} from 'chart.js'
import { useCharts } from '~/composables/useCharts'
import type { ExpenseWithCategory } from '~/types'

// Register Chart.js components
ChartJS.register(
  Title, 
  Tooltip, 
  Legend, 
  LineElement, 
  LinearScale, 
  CategoryScale, 
  PointElement, 
  Filler,
  BarElement
)

interface Props {
  expenses: ExpenseWithCategory[]
}

const props = defineProps<Props>()

const { getExpensesTimelineData, getLineChartOptions } = useCharts()

// Convert props to refs for composable
const expensesRef = computed(() => props.expenses)

const chartData = getExpensesTimelineData(expensesRef)
const chartOptions = getLineChartOptions

const hasData = computed(() => {
  return props.expenses.length > 0
})
</script>

<style scoped>
.expenses-timeline-chart {
  @apply w-full h-full min-h-[300px];
}
</style>