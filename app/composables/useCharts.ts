import { computed, type Ref } from 'vue'
import type { ExpenseWithCategory, BudgetCategory } from '~/types'
import { useDarkMode } from '~/composables/useDarkMode'

export interface ChartColors {
  primary: string
  success: string
  warning: string
  danger: string
  info: string
  purple: string
  pink: string
  indigo: string
}

export const useCharts = () => {
  const { isDark } = useDarkMode()
  // Color palette for charts
  const chartColors: ChartColors = {
    primary: '#3B82F6',   // blue-500
    success: '#10B981',   // green-500
    warning: '#F59E0B',   // yellow-500
    danger: '#EF4444',    // red-500
    info: '#06B6D4',      // cyan-500
    purple: '#8B5CF6',    // violet-500
    pink: '#EC4899',      // pink-500
    indigo: '#6366F1'     // indigo-500
  }

  // Extended palette for many categories
  const extendedColors = [
    chartColors.primary,
    chartColors.success,
    chartColors.warning,
    chartColors.danger,
    chartColors.info,
    chartColors.purple,
    chartColors.pink,
    chartColors.indigo,
    '#F97316', // orange-500
    '#84CC16', // lime-500
    '#06D6A0', // teal-400
    '#8E44AD', // purple-600
    '#E74C3C', // red-600
    '#3498DB', // blue-600
    '#F39C12', // orange-600
    '#27AE60'  // green-600
  ]

  // Generate chart colors with transparency
  const generateColors = (count: number, alpha: number = 0.8) => {
    return Array.from({ length: count }, (_, i) => {
      const color = extendedColors[i % extendedColors.length] || chartColors.primary
      return addAlpha(color, alpha)
    })
  }

  // Add alpha to hex color
  const addAlpha = (hex: string, alpha: number) => {
    if (!hex || hex.length < 7) return `rgba(59, 130, 246, ${alpha})` // fallback to primary color
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  // Budget overview pie chart data
  const getBudgetOverviewData = (
    categories: Ref<BudgetCategory[]>,
    expenses: Ref<ExpenseWithCategory[]>
  ) => {
    return computed(() => {
      const categorySpending = new Map<string, number>()
      
      // Calculate spending per category
      expenses.value.forEach(expense => {
        const categoryId = expense.category_id || 'uncategorized'
        const currentSpending = categorySpending.get(categoryId) || 0
        categorySpending.set(categoryId, currentSpending + expense.amount)
      })

      // Prepare chart data
      const labels: string[] = []
      const data: number[] = []
      const colors: string[] = []
      
      // Add categorized expenses
      categories.value.forEach((category, index) => {
        const spending = categorySpending.get(category.id) || 0
        if (spending > 0) {
          labels.push(category.name)
          data.push(spending)
          colors.push(extendedColors[index % extendedColors.length] || chartColors.primary)
        }
      })
      
      // Add uncategorized expenses if any
      const uncategorizedSpending = categorySpending.get('uncategorized') || 0
      if (uncategorizedSpending > 0) {
        labels.push('Bez kategorii')
        data.push(uncategorizedSpending)
        colors.push('#6B7280') // gray-500
      }

      return {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderColor: colors.map(color => color ? addAlpha(color, 1) : chartColors.primary),
          borderWidth: 2,
          hoverOffset: 4
        }]
      }
    })
  }

  // Expenses timeline chart data
  const getExpensesTimelineData = (expenses: Ref<ExpenseWithCategory[]>) => {
    return computed(() => {
      // Group expenses by date
      const dailyExpenses = new Map<string, number>()
      
      expenses.value.forEach(expense => {
        const date = expense.expense_date
        const currentAmount = dailyExpenses.get(date) || 0
        dailyExpenses.set(date, currentAmount + expense.amount)
      })

      // Sort dates and prepare data
      const sortedEntries = Array.from(dailyExpenses.entries())
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))

      const labels = sortedEntries.map(([date]) => {
        return new Date(date).toLocaleDateString('pl-PL', {
          month: 'short',
          day: 'numeric'
        })
      })

      const data = sortedEntries.map(([, amount]) => amount)

      // Calculate cumulative spending
      const cumulativeData: number[] = []
      let cumSum = 0
      data.forEach(amount => {
        cumSum += amount
        cumulativeData.push(cumSum)
      })

      return {
        labels,
        datasets: [
          {
            label: 'Wydatki dzienne',
            data,
            backgroundColor: addAlpha(chartColors.primary, 0.3),
            borderColor: chartColors.primary,
            borderWidth: 2,
            fill: false,
            tension: 0.4
          },
          {
            label: 'Skumulowane wydatki',
            data: cumulativeData,
            backgroundColor: addAlpha(chartColors.success, 0.1),
            borderColor: chartColors.success,
            borderWidth: 3,
            fill: true,
            tension: 0.4
          }
        ]
      }
    })
  }

  // Budget progress data
  const getBudgetProgressData = (
    categories: Ref<BudgetCategory[]>,
    expenses: Ref<ExpenseWithCategory[]>
  ) => {
    return computed(() => {
      const categoryProgress = categories.value.map(category => {
        const spent = expenses.value
          .filter(expense => expense.category_id === category.id)
          .reduce((sum, expense) => sum + expense.amount, 0)
        
        const planned = category.planned_amount || 0
        const percentage = planned > 0 ? (spent / planned) * 100 : 0
        
        return {
          category: category.name,
          spent,
          planned,
          percentage: Math.min(percentage, 100), // Cap at 100%
          overBudget: percentage > 100
        }
      }).filter(item => item.planned > 0) // Only show categories with planned budget

      const labels = categoryProgress.map(item => item.category)
      const spentData = categoryProgress.map(item => item.spent)
      const plannedData = categoryProgress.map(item => item.planned)
      
      return {
        labels,
        datasets: [
          {
            label: 'Planowany budżet',
            data: plannedData,
            backgroundColor: addAlpha(chartColors.info, 0.3),
            borderColor: chartColors.info,
            borderWidth: 1
          },
          {
            label: 'Wydane',
            data: spentData,
            backgroundColor: categoryProgress.map(item => 
              addAlpha(item.overBudget ? chartColors.danger : chartColors.success, 0.7)
            ),
            borderColor: categoryProgress.map(item => 
              item.overBudget ? chartColors.danger : chartColors.success
            ),
            borderWidth: 2
          }
        ]
      }
    })
  }

  // Chart options
  const getPieChartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10
      }
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 8,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 10
          },
          boxWidth: 10,
          maxWidth: 150,
          color: isDark.value ? '#E5E7EB' : '#374151' // gray-200 : gray-700
        }
      },
      tooltip: {
        backgroundColor: isDark.value ? '#1F2937' : '#FFFFFF', // gray-800 : white
        titleColor: isDark.value ? '#F9FAFB' : '#111827', // gray-50 : gray-900
        bodyColor: isDark.value ? '#E5E7EB' : '#374151', // gray-200 : gray-700
        borderColor: isDark.value ? '#374151' : '#E5E7EB', // gray-700 : gray-200
        borderWidth: 1,
        callbacks: {
          label: (context: any) => {
            const value = new Intl.NumberFormat('pl-PL', {
              style: 'currency',
              currency: 'PLN'
            }).format(context.parsed)
            return `${context.label}: ${value}`
          }
        }
      }
    }
  }))

  const getLineChartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Data',
          color: isDark.value ? '#E5E7EB' : '#374151'
        },
        ticks: {
          color: isDark.value ? '#9CA3AF' : '#6B7280'
        },
        grid: {
          color: isDark.value ? '#374151' : '#E5E7EB'
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        title: {
          display: true,
          text: 'Kwota (PLN)',
          color: isDark.value ? '#E5E7EB' : '#374151'
        },
        ticks: {
          color: isDark.value ? '#9CA3AF' : '#6B7280',
          callback: (value: any) => {
            return new Intl.NumberFormat('pl-PL', {
              style: 'currency',
              currency: 'PLN',
              minimumFractionDigits: 0
            }).format(value)
          }
        },
        grid: {
          color: isDark.value ? '#374151' : '#E5E7EB'
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: isDark.value ? '#E5E7EB' : '#374151'
        }
      },
      tooltip: {
        backgroundColor: isDark.value ? '#1F2937' : '#FFFFFF',
        titleColor: isDark.value ? '#F9FAFB' : '#111827',
        bodyColor: isDark.value ? '#E5E7EB' : '#374151',
        borderColor: isDark.value ? '#374151' : '#E5E7EB',
        borderWidth: 1,
        callbacks: {
          label: (context: any) => {
            const value = new Intl.NumberFormat('pl-PL', {
              style: 'currency',
              currency: 'PLN'
            }).format(context.parsed.y)
            return `${context.dataset.label}: ${value}`
          }
        }
      }
    }
  }))

  const getBarChartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDark.value ? '#E5E7EB' : '#374151'
        }
      },
      tooltip: {
        backgroundColor: isDark.value ? '#1F2937' : '#FFFFFF',
        titleColor: isDark.value ? '#F9FAFB' : '#111827',
        bodyColor: isDark.value ? '#E5E7EB' : '#374151',
        borderColor: isDark.value ? '#374151' : '#E5E7EB',
        borderWidth: 1,
        callbacks: {
          label: (context: any) => {
            const value = new Intl.NumberFormat('pl-PL', {
              style: 'currency',
              currency: 'PLN'
            }).format(context.parsed.y)
            return `${context.dataset.label}: ${value}`
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Kategorie',
          color: isDark.value ? '#E5E7EB' : '#374151'
        },
        ticks: {
          color: isDark.value ? '#9CA3AF' : '#6B7280'
        },
        grid: {
          color: isDark.value ? '#374151' : '#E5E7EB'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Kwota (PLN)',
          color: isDark.value ? '#E5E7EB' : '#374151'
        },
        ticks: {
          color: isDark.value ? '#9CA3AF' : '#6B7280',
          callback: (value: any) => {
            return new Intl.NumberFormat('pl-PL', {
              style: 'currency',
              currency: 'PLN',
              minimumFractionDigits: 0
            }).format(value)
          }
        },
        grid: {
          color: isDark.value ? '#374151' : '#E5E7EB'
        }
      }
    }
  }))

  return {
    chartColors,
    generateColors,
    addAlpha,
    getBudgetOverviewData,
    getExpensesTimelineData,
    getBudgetProgressData,
    getPieChartOptions,
    getLineChartOptions,
    getBarChartOptions
  }
}