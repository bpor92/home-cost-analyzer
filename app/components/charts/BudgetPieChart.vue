<template>
  <div class="budget-pie-chart">
    <div v-if="hasData" class="h-full">
      <Pie 
        :data="chartData" 
        :options="chartOptions"
        class="w-full h-full"
      />
    </div>
    <div v-else class="h-full flex items-center justify-center text-gray-500">
      <div class="text-center">
        <PieChart class="mx-auto h-12 w-12 mb-2 opacity-50" />
        <p class="text-sm">Brak danych do wyświetlenia</p>
        <p class="text-xs mt-1">Dodaj wydatki z kategoriami</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Pie } from 'vue-chartjs'
import { PieChart } from 'lucide-vue-next'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale
} from 'chart.js'
import { useCharts } from '~/composables/useCharts'
import type { ExpenseWithCategory, BudgetCategory } from '~/types'

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale)

interface Props {
  expenses: ExpenseWithCategory[]
  categories: BudgetCategory[]
}

const props = defineProps<Props>()

const { getBudgetOverviewData, getPieChartOptions } = useCharts()

// Convert props to refs for composable
const expensesRef = computed(() => props.expenses)
const categoriesRef = computed(() => props.categories)

const chartData = getBudgetOverviewData(categoriesRef, expensesRef)
const chartOptions = getPieChartOptions()

const hasData = computed(() => {
  const firstDataset = chartData.value.datasets[0]
  return firstDataset?.data ? firstDataset.data.length > 0 : false
})
</script>

<style scoped>
.budget-pie-chart {
  @apply w-full h-full min-h-[300px];
}
</style>