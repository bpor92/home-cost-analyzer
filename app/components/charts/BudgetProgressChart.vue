<template>
  <div class="budget-progress-chart">
    <div v-if="hasData" class="h-full">
      <Bar 
        :data="chartData" 
        :options="chartOptions"
        class="w-full h-full"
      />
    </div>
    <div v-else class="h-full flex items-center justify-center text-gray-500">
      <div class="text-center">
        <BarChart class="mx-auto h-12 w-12 mb-2 opacity-50" />
        <p class="text-sm">Brak kategorii z budżetem</p>
        <p class="text-xs mt-1">Ustaw planowany budżet dla kategorii</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { BarChart } from 'lucide-vue-next'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import { useCharts } from '~/composables/useCharts'
import type { ExpenseWithCategory, BudgetCategory } from '~/types'

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

interface Props {
  expenses: ExpenseWithCategory[]
  categories: BudgetCategory[]
}

const props = defineProps<Props>()

const { getBudgetProgressData, getBarChartOptions } = useCharts()

// Convert props to refs for composable
const expensesRef = computed(() => props.expenses)
const categoriesRef = computed(() => props.categories)

const chartData = getBudgetProgressData(categoriesRef, expensesRef)
const chartOptions = getBarChartOptions()

const hasData = computed(() => {
  return chartData.value.labels.length > 0
})
</script>

<style scoped>
.budget-progress-chart {
  @apply w-full h-full min-h-[300px];
}
</style>