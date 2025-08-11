export interface Project {
  id: string
  user_id: string
  name: string
  total_budget: number
  own_budget: number
  created_at: string
  updated_at: string
}

export interface BorrowedFund {
  id: string
  project_id: string
  source: string
  amount: number
  due_date: string | null
  interest_rate: number
  created_at: string
}

export interface BudgetCategory {
  id: string
  project_id: string
  name: string
  planned_amount: number
  spent_amount: number
  created_at: string
}

export interface Expense {
  id: string
  project_id: string
  category_id: string | null
  phase_id: string | null
  name: string
  amount: number
  description: string | null
  expense_date: string
  receipt_photo_url: string | null
  created_at: string
}

export interface PhaseGroup {
  id: string
  project_id: string
  name: string
  description: string | null
  color: string
  order_index: number
  created_at: string
  updated_at: string
}

export interface RenovationPhase {
  id: string
  project_id: string
  group_id: string | null
  category_id: string | null
  name: string
  budget: number | null
  start_date: string | null
  end_date: string | null
  status: 'planned' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  progress: number
  notes: string | null
  order_index: number
  created_at: string
}

// Computed types for UI
export interface BudgetSummary {
  totalBudget: number
  ownBudget: number
  borrowedTotal: number
  totalSpent: number
  remainingBudget: number
  spentPercentage: number
}

export interface CategoryWithSpent extends BudgetCategory {
  expenses: Expense[]
  spentPercentage: number
}

export interface ExpenseWithCategory extends Expense {
  budget_categories?: {
    name: string
  }
  renovation_phases?: {
    name: string
  }
}

export interface PhaseGroupWithPhases extends PhaseGroup {
  phases: PhaseWithGroupAndCategory[]
  totalBudget: number
  totalProgress: number
  phaseCount: number
  completedPhases: number
}

export interface PhaseWithGroup extends RenovationPhase {
  phase_groups?: {
    name: string
    color: string
  }
}

export interface PhaseWithCategory extends RenovationPhase {
  budget_categories?: {
    name: string
  }
}

export interface PhaseWithGroupAndCategory extends RenovationPhase {
  phase_groups?: {
    name: string
    color: string
  }
  budget_categories?: {
    name: string
  }
}