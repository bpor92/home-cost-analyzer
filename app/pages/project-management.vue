<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Zarządzanie Projektem</h1>
        <p v-if="currentProject" class="text-sm text-gray-600 mt-1">
          Projekt: {{ currentProject.name }}
        </p>
      </div>
    </div>

    <!-- No Project Selected -->
    <Card v-if="!currentProject" class="text-center py-12">
      <FolderOpen class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">Brak wybranego projektu</h3>
      <p class="mt-1 text-sm text-gray-600">Wybierz projekt aby zarządzać jego budżetem i etapami</p>
      <div class="mt-6">
        <router-link to="/projects">
          <Button>
            <FolderOpen class="mr-2 h-4 w-4" />
            Przejdź do projektów
          </Button>
        </router-link>
      </div>
    </Card>

    <!-- Project Management Content -->
    <div v-else class="space-y-6">
      <!-- Navigation Tabs -->
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            :class="[
              'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === tab.key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            <component :is="tab.icon" class="h-5 w-5 mr-2 inline" />
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div>
        <!-- Overview Tab -->
        <div v-if="activeTab === 'overview'" class="space-y-6">
          <!-- Project Statistics -->
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Card class="bg-blue-50 border-blue-200">
              <div class="p-5">
                <div class="flex items-center">
                  <Target class="h-6 w-6 text-blue-600" />
                  <div class="ml-3">
                    <p class="text-sm font-medium text-blue-700">Całkowity budżet</p>
                    <p class="text-xl font-semibold text-blue-900">
                      {{ formatCurrency(currentProject.total_budget) }}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card class="bg-purple-50 border-purple-200">
              <div class="p-5">
                <div class="flex items-center">
                  <DollarSign class="h-6 w-6 text-purple-600" />
                  <div class="ml-3">
                    <p class="text-sm font-medium text-purple-700">Wydano</p>
                    <p class="text-xl font-semibold text-purple-900">
                      {{ formatCurrency(totalSpentBudget) }}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card class="bg-green-50 border-green-200">
              <div class="p-5">
                <div class="flex items-center">
                  <CheckCircle class="h-6 w-6 text-green-600" />
                  <div class="ml-3">
                    <p class="text-sm font-medium text-green-700">Etapy ukończone</p>
                    <p class="text-xl font-semibold text-green-900">
                      {{ phasesByStatus.completed?.length || 0 }}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card class="bg-orange-50 border-orange-200">
              <div class="p-5">
                <div class="flex items-center">
                  <Clock class="h-6 w-6 text-orange-600" />
                  <div class="ml-3">
                    <p class="text-sm font-medium text-orange-700">Etapy w trakcie</p>
                    <p class="text-xl font-semibold text-orange-900">
                      {{ phasesByStatus.inProgress?.length || 0 }}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <!-- Recent Activities -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Budget Progress -->
            <Card>
              <template #header>
                <h3 class="text-lg font-medium text-gray-900">Postęp budżetu</h3>
              </template>
              <div class="space-y-4">
                <div
                  v-for="category in categoriesWithProgress.slice(0, 3)"
                  :key="category.id"
                  class="space-y-2"
                >
                  <div class="flex justify-between text-sm">
                    <span class="font-medium">{{ category.name }}</span>
                    <span>{{ category.spentPercentage.toFixed(1) }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div
                      class="h-2 rounded-full transition-all"
                      :class="category.spentPercentage > 100 ? 'bg-red-500' : 'bg-blue-500'"
                      :style="{ width: `${Math.min(category.spentPercentage, 100)}%` }"
                    ></div>
                  </div>
                  <!-- Show connected phases -->
                  <div v-if="getPhasesForCategory(category.id).length > 0" class="text-xs text-gray-600">
                    Etapy: {{ getPhasesForCategory(category.id).map(p => p.name).join(', ') }}
                  </div>
                </div>
                <div v-if="categoriesWithProgress.length > 3" class="text-center pt-2">
                  <Button variant="ghost" size="sm" @click="activeTab = 'budget'">
                    Zobacz wszystkie kategorie
                  </Button>
                </div>
              </div>
            </Card>

            <!-- Phase Timeline -->
            <Card>
              <template #header>
                <h3 class="text-lg font-medium text-gray-900">Najbliższe etapy</h3>
              </template>
              <div class="space-y-3">
                <div
                  v-for="phase in upcomingPhases.slice(0, 4)"
                  :key="phase.id"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p class="font-medium text-gray-900">{{ phase.name }}</p>
                    <p class="text-sm text-gray-600">
                      {{ formatDate(phase.start_date) }}
                    </p>
                    <!-- Show budget category and expenses -->
                    <p v-if="getCategoryForPhase(phase.category_id)" class="text-xs text-blue-600">
                      {{ getCategoryForPhase(phase.category_id)?.name }}
                      {{ phase.budget ? `• ${formatCurrency(phase.budget)}` : '' }}
                    </p>
                    <p v-if="getExpenseTotal(phase.id) > 0" class="text-xs text-green-600">
                      Wydano: {{ formatCurrency(getExpenseTotal(phase.id)) }}
                    </p>
                  </div>
                  <span
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="getStatusColor(phase.status)"
                  >
                    {{ getStatusLabel(phase.status) }}
                  </span>
                </div>
                <div v-if="upcomingPhases.length > 4" class="text-center pt-2">
                  <Button variant="ghost" size="sm" @click="activeTab = 'phases'">
                    Zobacz wszystkie etapy
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <!-- Budget vs Phases Integration Summary -->
          <Card>
            <template #header>
              <h3 class="text-lg font-medium text-gray-900">Integracja budżetu z etapami</h3>
            </template>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="text-center p-4 bg-blue-50 rounded-lg">
                <div class="text-2xl font-bold text-blue-600">{{ connectedPhasesCount }}</div>
                <div class="text-sm text-blue-700">Etapy z budżetem</div>
              </div>
              <div class="text-center p-4 bg-green-50 rounded-lg">
                <div class="text-2xl font-bold text-green-600">{{ formatCurrency(totalPhaseBudget) }}</div>
                <div class="text-sm text-green-700">Budżet w etapach</div>
              </div>
              <div class="text-center p-4 bg-purple-50 rounded-lg">
                <div class="text-2xl font-bold text-purple-600">{{ categoriesWithPhasesCount }}</div>
                <div class="text-sm text-purple-700">Kategorie z etapami</div>
              </div>
            </div>
          </Card>
        </div>

        <!-- Budget Tab -->
        <div v-if="activeTab === 'budget'" class="space-y-6">
          <!-- Budget Overview Cards -->
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            <Card class="bg-blue-50 border-blue-200">
              <div class="p-5">
                <div class="flex items-center">
                  <Target class="h-6 w-6 text-blue-600" />
                  <div class="ml-3">
                    <p class="text-sm font-medium text-blue-700">Całkowity budżet</p>
                    <p class="text-xl font-semibold text-blue-900">
                      {{ formatCurrency(currentProject.total_budget) }}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card class="bg-green-50 border-green-200">
              <div class="p-5">
                <div class="flex items-center">
                  <Wallet class="h-6 w-6 text-green-600" />
                  <div class="ml-3">
                    <p class="text-sm font-medium text-green-700">Własny budżet</p>
                    <p class="text-xl font-semibold text-green-900">
                      {{ formatCurrency(currentProject.own_budget) }}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card class="bg-orange-50 border-orange-200">
              <div class="p-5">
                <div class="flex items-center">
                  <TrendingUp class="h-6 w-6 text-orange-600" />
                  <div class="ml-3">
                    <p class="text-sm font-medium text-orange-700">Pożyczki</p>
                    <p class="text-xl font-semibold text-orange-900">
                      {{ formatCurrency(totalBorrowedAmount) }}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card class="bg-purple-50 border-purple-200">
              <div class="p-5">
                <div class="flex items-center">
                  <DollarSign class="h-6 w-6 text-purple-600" />
                  <div class="ml-3">
                    <p class="text-sm font-medium text-purple-700">Wydano</p>
                    <p class="text-xl font-semibold text-purple-900">
                      {{ formatCurrency(totalSpentBudget) }}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card class="bg-indigo-50 border-indigo-200">
              <div class="p-5">
                <div class="flex items-center">
                  <Calculator class="h-6 w-6 text-indigo-600" />
                  <div class="ml-3">
                    <p class="text-sm font-medium text-indigo-700">Zaplanowano</p>
                    <p class="text-xl font-semibold text-indigo-900">
                      {{ formatCurrency(totalPlannedBudget) }}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <!-- Budget Actions -->
          <div class="flex justify-end gap-3">
            <Button v-if="categories.length === 0" @click="initializeCategories" :disabled="loading">
              <Plus class="mr-2 h-4 w-4" />
              Inicjalizuj kategorie
            </Button>
            <Button @click="showAddBorrowedModal = true">
              <Plus class="mr-2 h-4 w-4" />
              Dodaj pożyczkę
            </Button>
            <Button @click="showAddCategoryModal = true">
              <Plus class="mr-2 h-4 w-4" />
              Dodaj kategorię
            </Button>
          </div>

          <!-- Budget Categories -->
          <Card>
            <template #header>
              <h3 class="text-lg font-medium text-gray-900">Kategorie budżetowe</h3>
            </template>

            <div v-if="loading" class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>

            <div v-else-if="categories.length === 0" class="text-center py-8">
              <Wallet class="mx-auto h-12 w-12 text-gray-400" />
              <h3 class="mt-2 text-sm font-medium text-gray-900">Brak kategorii budżetowych</h3>
              <p class="mt-1 text-sm text-gray-600">Zacznij od dodania pierwszej kategorii</p>
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="category in categoriesWithProgress"
                :key="category.id"
                class="border border-gray-200 rounded-lg p-4"
              >
                <div class="flex items-center justify-between mb-3">
                  <h4 class="font-medium text-gray-900">{{ category.name }}</h4>
                  <div class="flex gap-2">
                    <Button variant="outline" size="sm" @click="editCategory(category)">
                      <Edit class="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" @click="confirmDeleteCategory(category)" class="text-red-600">
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div class="grid grid-cols-3 gap-4 text-sm mb-3">
                  <div>
                    <span class="text-gray-600">Planowano:</span>
                    <span class="font-medium ml-1 text-gray-900">{{ formatCurrency(category.planned_amount) }}</span>
                  </div>
                  <div>
                    <span class="text-gray-600">Wydano:</span>
                    <span class="font-medium ml-1 text-gray-900">{{ formatCurrency(category.spent_amount) }}</span>
                  </div>
                  <div>
                    <span class="text-gray-600">Pozostało:</span>
                    <span class="font-medium ml-1 text-gray-900">{{ formatCurrency(category.planned_amount - category.spent_amount) }}</span>
                  </div>
                </div>
                
                <!-- Connected phases -->
                <div v-if="getPhasesForCategory(category.id).length > 0" class="mb-3 p-2 bg-blue-50 rounded">
                  <div class="text-xs font-medium text-blue-700 mb-1">Powiązane etapy:</div>
                  <div class="flex flex-wrap gap-1">
                    <span 
                      v-for="phase in getPhasesForCategory(category.id)" 
                      :key="phase.id"
                      class="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-md"
                    >
                      {{ phase.name }}
                      <span v-if="phase.budget" class="ml-1 text-blue-600">
                        ({{ formatCurrency(phase.budget) }})
                      </span>
                    </span>
                  </div>
                </div>
                
                <!-- Progress bar -->
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="h-2 rounded-full transition-all"
                    :class="category.spentPercentage > 100 ? 'bg-red-500' : 'bg-blue-500'"
                    :style="{ width: `${Math.min(category.spentPercentage, 100)}%` }"
                  ></div>
                </div>
                <div class="text-xs text-gray-600 mt-1 text-right">
                  {{ category.spentPercentage.toFixed(1) }}%
                </div>
              </div>
            </div>
          </Card>

          <!-- Borrowed Funds -->
          <Card v-if="borrowedFunds.length > 0">
            <template #header>
              <h3 class="text-lg font-medium text-gray-900">Pożyczki</h3>
            </template>
            
            <div class="space-y-4">
              <div
                v-for="fund in borrowedFunds"
                :key="fund.id"
                class="border border-gray-200 rounded-lg p-4"
              >
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-medium text-gray-900">{{ fund.source }}</h4>
                  <div class="flex gap-2">
                    <Button variant="outline" size="sm" @click="editBorrowedFund(fund)">
                      <Edit class="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" @click="confirmDeleteBorrowedFund(fund)" class="text-red-600">
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div class="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span class="text-gray-600">Kwota:</span>
                    <span class="font-medium ml-1">{{ formatCurrency(fund.amount) }}</span>
                  </div>
                  <div>
                    <span class="text-gray-600">Oprocentowanie:</span>
                    <span class="font-medium ml-1">{{ fund.interest_rate }}%</span>
                  </div>
                  <div>
                    <span class="text-gray-600">Termin spłaty:</span>
                    <span class="font-medium ml-1">
                      {{ fund.due_date ? formatDate(fund.due_date) : 'Brak' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <!-- Phases Tab -->
        <div v-if="activeTab === 'phases'" class="space-y-6">
          <!-- Phase Stats -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card class="p-4">
              <div class="flex items-center">
                <Clock class="h-8 w-8 text-blue-500" />
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Planowane</p>
                  <p class="text-2xl font-bold text-gray-900">{{ phasesByStatus.planned?.length || 0 }}</p>
                </div>
              </div>
            </Card>
            
            <Card class="p-4">
              <div class="flex items-center">
                <Play class="h-8 w-8 text-orange-500" />
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">W trakcie</p>
                  <p class="text-2xl font-bold text-gray-900">{{ phasesByStatus.inProgress?.length || 0 }}</p>
                </div>
              </div>
            </Card>
            
            <Card class="p-4">
              <div class="flex items-center">
                <CheckCircle class="h-8 w-8 text-green-500" />
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Zakończone</p>
                  <p class="text-2xl font-bold text-gray-900">{{ phasesByStatus.completed?.length || 0 }}</p>
                </div>
              </div>
            </Card>
          </div>

          <!-- Phase Actions -->
          <div class="flex justify-end gap-3">
            <Button v-if="viewMode === 'groups'" variant="outline" @click="openAddGroupModal">
              <Plus class="h-4 w-4 mr-2" />
              Dodaj grupę
            </Button>
            <Button @click="openAddModal">
              <Plus class="h-4 w-4 mr-2" />
              Dodaj etap
            </Button>
          </div>

          <!-- View Toggle -->
          <div class="flex bg-gray-100 rounded-lg p-1 w-fit">
            <Button
              size="sm"
              :variant="viewMode === 'groups' ? 'primary' : 'ghost'"
              @click="viewMode = 'groups'"
            >
              Grupy
            </Button>
            <Button
              size="sm"
              :variant="viewMode === 'list' ? 'primary' : 'ghost'"
              @click="viewMode = 'list'"
            >
              Lista
            </Button>
          </div>

          <!-- Phase Content -->
          <div v-if="phasesLoading" class="text-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p class="mt-2 text-sm text-gray-600">Ładowanie etapów...</p>
          </div>

          <div v-else-if="phasesError" class="text-center py-8">
            <div class="text-red-600 mb-4">{{ phasesError }}</div>
            <Button @click="loadPhases" variant="outline">Spróbuj ponownie</Button>
          </div>

          <div v-else-if="phases.length === 0" class="text-center py-12">
            <Calendar class="mx-auto h-12 w-12 text-gray-400" />
            <h3 class="mt-2 text-sm font-medium text-gray-900">Brak etapów</h3>
            <p class="mt-1 text-sm text-gray-600">Rozpocznij planowanie swojego remontu</p>
          </div>

          <div v-else>
            <!-- Groups View -->
            <div v-if="viewMode === 'groups'">
              <div v-if="groupsLoading" class="text-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p class="mt-2 text-sm text-gray-600">Ładowanie grup...</p>
              </div>
              
              <div v-else-if="groupsWithPhases.length === 0" class="text-center py-12">
                <Calendar class="mx-auto h-12 w-12 text-gray-400" />
                <h3 class="mt-2 text-sm font-medium text-gray-900">Brak grup etapów</h3>
                <p class="mt-1 text-sm text-gray-600">Stwórz pierwszą grupę aby uporządkować swoje etapy</p>
                <Button class="mt-4" @click="openAddGroupModal">
                  <Plus class="h-4 w-4 mr-2" />
                  Dodaj pierwszą grupę
                </Button>
              </div>
              
              <div v-else class="space-y-6">
                <PhaseGroupCard
                  v-for="group in groupsWithPhases"
                  :key="group.id"
                  :group="group"
                  :default-expanded="groupsWithPhases.length <= 2"
                  @edit="editGroup"
                  @delete="deleteGroupConfirm"
                  @add-phase="addPhaseToGroup"
                  @edit-phase="editPhase"
                  @delete-phase="deletePhase"
                  @add-expense-to-phase="openExpenseModalForPhase"
                />
              </div>
            </div>
            
            <!-- List View -->
            <div v-else-if="viewMode === 'list'">
              <div class="mb-6">
                <PhaseTimeline :phases="phases" />
              </div>
              
              <div class="mb-6">
                <PhaseDragList
                  :phases="phases"
                  @edit="editPhase"
                  @delete="deletePhase"
                  @add-expense="openExpenseModalForPhase"
                  @reorder="handlePhaseReorder"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Budget Modals -->
    <Modal v-model:open="showAddCategoryModal">
      <div class="p-6">
        <h3 class="text-lg font-medium mb-4">
          {{ editingCategory ? 'Edytuj kategorię' : 'Dodaj kategorię budżetową' }}
        </h3>
        
        <form @submit.prevent="saveCategory" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Nazwa kategorii
            </label>
            <Input
              v-model="categoryForm.name"
              placeholder="np. Wykończenie podłóg"
              required
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Planowana kwota (zł)
            </label>
            <Input
              v-model.number="categoryForm.planned_amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              required
            />
          </div>
          
          <div class="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" @click="cancelCategoryEdit">
              Anuluj
            </Button>
            <Button type="submit" :disabled="saving">
              {{ saving ? 'Zapisywanie...' : (editingCategory ? 'Zapisz zmiany' : 'Dodaj kategorię') }}
            </Button>
          </div>
        </form>
      </div>
    </Modal>

    <Modal v-model:open="showAddBorrowedModal">
      <div class="p-6">
        <h3 class="text-lg font-medium mb-4">
          {{ editingBorrowedFund ? 'Edytuj pożyczkę' : 'Dodaj pożyczkę' }}
        </h3>
        
        <form @submit.prevent="saveBorrowedFund" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Źródło pożyczki
            </label>
            <Input
              v-model="borrowedForm.source"
              placeholder="np. Bank ABC, Rodzice"
              required
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Kwota (zł)
            </label>
            <Input
              v-model.number="borrowedForm.amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              required
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Oprocentowanie (%)
            </label>
            <Input
              v-model.number="borrowedForm.interest_rate"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Termin spłaty
            </label>
            <Input
              v-model="borrowedForm.due_date"
              type="date"
            />
          </div>
          
          <div class="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" @click="cancelBorrowedEdit">
              Anuluj
            </Button>
            <Button type="submit" :disabled="saving">
              {{ saving ? 'Zapisywanie...' : (editingBorrowedFund ? 'Zapisz zmiany' : 'Dodaj pożyczkę') }}
            </Button>
          </div>
        </form>
      </div>
    </Modal>

    <!-- Phase Modals -->
    <Modal :open="showModal" @close="closeModal">
      <div class="p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          {{ editingPhase ? 'Edytuj etap' : 'Dodaj nowy etap' }}
        </h2>
        
        <PhaseForm
          :phase="editingPhase || undefined"
          :loading="formLoading"
          :available-groups="groups"
          :available-categories="categories"
          @submit="handleFormSubmit"
          @cancel="closeModal"
        />
      </div>
    </Modal>

    <Modal :open="showDeleteModal" @close="showDeleteModal = false">
      <div class="p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Usuń etap</h2>
        <p class="text-gray-600 mb-6">
          Czy na pewno chcesz usunąć etap "{{ phaseToDelete?.name }}"? 
          Ta operacja jest nieodwracalna.
        </p>
        
        <div class="flex gap-3">
          <Button
            @click="confirmDelete"
            variant="danger"
            :loading="formLoading"
            class="flex-1"
          >
            Usuń etap
          </Button>
          <Button
            @click="showDeleteModal = false"
            variant="outline"
            class="flex-1"
          >
            Anuluj
          </Button>
        </div>
      </div>
    </Modal>

    <Modal :open="showGroupModal" @close="closeGroupModal">
      <div class="p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          {{ editingGroup ? 'Edytuj grupę' : 'Dodaj nową grupę' }}
        </h2>
        
        <PhaseGroupForm
          :group="editingGroup || undefined"
          :loading="formLoading"
          @submit="handleGroupFormSubmit"
          @cancel="closeGroupModal"
        />
      </div>
    </Modal>

    <Modal :open="showGroupDeleteModal" @close="showGroupDeleteModal = false">
      <div class="p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Usuń grupę</h2>
        <p class="text-gray-600 mb-4">
          Czy na pewno chcesz usunąć grupę "{{ groupToDelete?.name }}"?
        </p>
        <p class="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg mb-6">
          <strong>Uwaga:</strong> Etapy z tej grupy zostaną przeniesione do sekcji "Niezgrupowane etapy".
          Sama grupa zostanie permanentnie usunięta.
        </p>
        
        <div class="flex gap-3">
          <Button
            @click="confirmGroupDelete"
            variant="danger"
            :loading="formLoading"
            class="flex-1"
          >
            Usuń grupę
          </Button>
          <Button
            @click="showGroupDeleteModal = false"
            variant="outline"
            class="flex-1"
          >
            Anuluj
          </Button>
        </div>
      </div>
    </Modal>

    <!-- Delete Confirmation Modal -->
    <Modal v-model:open="showBudgetDeleteModal">
      <div class="p-6">
        <h3 class="text-lg font-medium mb-4 text-red-800">Potwierdź usunięcie</h3>
        <p class="text-sm text-gray-600 mb-6">
          {{ deleteConfirmText }}
        </p>
        
        <div class="flex justify-end gap-3">
          <Button variant="outline" @click="showBudgetDeleteModal = false">
            Anuluj
          </Button>
          <Button @click="confirmBudgetDelete" :disabled="deleting" class="bg-red-600 hover:bg-red-700">
            {{ deleting ? 'Usuwanie...' : 'Usuń' }}
          </Button>
        </div>
      </div>
    </Modal>

    <!-- Add Expense to Phase Modal -->
    <Modal v-model:open="showExpenseModal">
      <div class="p-6">
        <h3 class="text-lg font-medium mb-4">
          Dodaj wydatek {{ targetPhase ? `do etapu: ${targetPhase.name}` : '' }}
        </h3>
        
        <form @submit.prevent="saveExpenseToPhase" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Nazwa wydatku
            </label>
            <Input
              v-model="expenseForm.name"
              placeholder="np. Zakup płytek do łazienki"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Kwota (PLN)
            </label>
            <Input
              v-model.number="expenseForm.amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Data wydatku
            </label>
            <Input
              v-model="expenseForm.expense_date"
              type="date"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Opis (opcjonalnie)
            </label>
            <textarea
              v-model="expenseForm.description"
              rows="3"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Dodatkowe informacje o wydatku..."
            />
          </div>

          <div v-if="targetPhase" class="p-3 bg-blue-50 rounded-lg">
            <div class="text-sm text-blue-800">
              <strong>Etap:</strong> {{ targetPhase.name }}
            </div>
            <div v-if="getCategoryForPhase(targetPhase.category_id)" class="text-sm text-blue-700">
              <strong>Kategoria:</strong> {{ getCategoryForPhase(targetPhase.category_id)?.name }}
            </div>
          </div>
          
          <div class="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" @click="closeExpenseModal">
              Anuluj
            </Button>
            <Button type="submit" :disabled="!canSaveExpense || saving">
              {{ saving ? 'Zapisywanie...' : 'Dodaj wydatek' }}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useProjectsStore } from '~/stores/projects'
import { useBudget } from '~/composables/useBudget'
import { useRenovationPhases } from '~/composables/useRenovationPhases'
import { usePhaseGroups } from '~/composables/usePhaseGroups'
import { useBudgetCategories } from '~/composables/useBudgetCategories'
import { useExpenses } from '~/composables/useExpenses'
import type { BudgetCategory, BorrowedFund, RenovationPhase, PhaseGroup, PhaseGroupWithPhases } from '~/types'
import Button from '~/components/ui/Button.vue'
import Card from '~/components/ui/Card.vue'
import Input from '~/components/ui/Input.vue'
import Modal from '~/components/ui/Modal.vue'
import PhaseForm from '~/components/forms/PhaseForm.vue'
import PhaseTimeline from '~/components/ui/PhaseTimeline.vue'
import PhaseDragList from '~/components/ui/PhaseDragList.vue'
import PhaseGroupCard from '~/components/ui/PhaseGroupCard.vue'
import PhaseGroupForm from '~/components/forms/PhaseGroupForm.vue'
import {
  Wallet,
  Plus,
  Target,
  TrendingUp,
  DollarSign,
  Edit,
  Trash2,
  FolderOpen,
  Calculator,
  BarChart3,
  Calendar,
  Clock,
  Play,
  CheckCircle,
  PieChart
} from 'lucide-vue-next'

const projectsStore = useProjectsStore()

const currentProject = computed(() => projectsStore.currentProject)
const currentProjectId = computed(() => projectsStore.currentProject?.id || null)

// Budget composables
const {
  categories,
  borrowedFunds,
  loading,
  error,
  totalPlannedBudget,
  totalSpentBudget,
  totalBorrowedAmount,
  budgetSummary,
  categoriesWithProgress,
  fetchBudgetData,
  initializeDefaultCategories,
  addBudgetCategory,
  updateBudgetCategory,
  deleteBudgetCategory,
  addBorrowedFund,
  updateBorrowedFund,
  deleteBorrowedFund
} = useBudget(currentProjectId)

// Phase composables
const {
  phases,
  phasesByStatus,
  totalBudget,
  loading: phasesLoading,
  error: phasesError,
  fetchPhases,
  createPhase,
  updatePhase,
  deletePhase: deletePhaseAction,
  bulkUpdatePhaseOrder
} = useRenovationPhases()

const {
  groups,
  loading: groupsLoading,
  error: groupsError,
  fetchGroups,
  fetchGroupsWithPhases,
  createGroup,
  updateGroup,
  deleteGroup,
  assignPhaseToGroup
} = usePhaseGroups()

// Expenses composable
const { addExpense, getPhaseExpenseTotal, expenses } = useExpenses(currentProjectId)

// Tab management
const activeTab = ref('overview')

const tabs = [
  { key: 'overview', name: 'Przegląd', icon: BarChart3 },
  { key: 'budget', name: 'Budżet', icon: DollarSign },
  { key: 'phases', name: 'Etapy', icon: Calendar }
]

// Modal states
const showAddCategoryModal = ref(false)
const showAddBorrowedModal = ref(false)
const showBudgetDeleteModal = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const showGroupModal = ref(false)
const showGroupDeleteModal = ref(false)
const showExpenseModal = ref(false)
const saving = ref(false)
const deleting = ref(false)
const formLoading = ref(false)

// Form states
const editingCategory = ref<BudgetCategory | null>(null)
const editingBorrowedFund = ref<BorrowedFund | null>(null)
const editingPhase = ref<RenovationPhase | null>(null)
const editingGroup = ref<PhaseGroup | null>(null)
const itemToDelete = ref<{ type: 'category' | 'borrowed', item: any } | null>(null)
const phaseToDelete = ref<RenovationPhase | null>(null)
const groupToDelete = ref<PhaseGroupWithPhases | null>(null)
const targetPhase = ref<RenovationPhase | null>(null)

const viewMode = ref<'list' | 'groups'>('groups')
const groupsWithPhases = ref<PhaseGroupWithPhases[]>([])

const categoryForm = reactive({
  name: '',
  planned_amount: 0
})

const borrowedForm = reactive({
  source: '',
  amount: 0,
  interest_rate: 0,
  due_date: ''
})

const expenseForm = reactive({
  name: '',
  amount: 0,
  expense_date: '',
  description: ''
})

// Computed properties
const deleteConfirmText = computed(() => {
  if (!itemToDelete.value) return ''
  
  if (itemToDelete.value.type === 'category') {
    return `Czy na pewno chcesz usunąć kategorię "${itemToDelete.value.item.name}"?`
  } else {
    return `Czy na pewno chcesz usunąć pożyczkę od "${itemToDelete.value.item.source}"?`
  }
})

const upcomingPhases = computed(() => {
  return phases.value
    .filter(phase => phase.status !== 'completed')
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
})

// Budget-Phase integration computed properties
const connectedPhasesCount = computed(() => {
  return phases.value.filter(phase => phase.category_id || phase.budget).length
})

const totalPhaseBudget = computed(() => {
  return phases.value.reduce((total, phase) => total + (phase.budget || 0), 0)
})

const categoriesWithPhasesCount = computed(() => {
  const categoryIds = new Set(phases.value.map(phase => phase.category_id).filter(Boolean))
  return categoryIds.size
})

const getPhasesForCategory = (categoryId: string) => {
  return phases.value.filter(phase => phase.category_id === categoryId)
}

const getCategoryForPhase = (categoryId: string | null) => {
  if (!categoryId) return null
  return categories.value.find(category => category.id === categoryId)
}

const getExpenseTotal = (phaseId: string) => {
  return expenses.value
    .filter(expense => expense.phase_id === phaseId)
    .reduce((sum, expense) => sum + expense.amount, 0)
}

const canSaveExpense = computed(() => {
  return expenseForm.name && expenseForm.amount && expenseForm.expense_date
})

// Budget methods
const initializeCategories = async () => {
  await initializeDefaultCategories()
}

const resetCategoryForm = () => {
  categoryForm.name = ''
  categoryForm.planned_amount = 0
  editingCategory.value = null
}

const resetBorrowedForm = () => {
  borrowedForm.source = ''
  borrowedForm.amount = 0
  borrowedForm.interest_rate = 0
  borrowedForm.due_date = ''
  editingBorrowedFund.value = null
}

const editCategory = (category: BudgetCategory) => {
  editingCategory.value = category
  categoryForm.name = category.name
  categoryForm.planned_amount = category.planned_amount
  showAddCategoryModal.value = true
}

const editBorrowedFund = (fund: BorrowedFund) => {
  editingBorrowedFund.value = fund
  borrowedForm.source = fund.source
  borrowedForm.amount = fund.amount
  borrowedForm.interest_rate = fund.interest_rate
  borrowedForm.due_date = fund.due_date || ''
  showAddBorrowedModal.value = true
}

const cancelCategoryEdit = () => {
  showAddCategoryModal.value = false
  resetCategoryForm()
}

const cancelBorrowedEdit = () => {
  showAddBorrowedModal.value = false
  resetBorrowedForm()
}

const saveCategory = async () => {
  saving.value = true
  
  try {
    if (editingCategory.value) {
      await updateBudgetCategory(editingCategory.value.id, {
        name: categoryForm.name,
        planned_amount: categoryForm.planned_amount
      })
    } else {
      await addBudgetCategory(categoryForm.name, categoryForm.planned_amount)
    }
    
    showAddCategoryModal.value = false
    resetCategoryForm()
  } finally {
    saving.value = false
  }
}

const saveBorrowedFund = async () => {
  saving.value = true
  
  try {
    const fundData = {
      source: borrowedForm.source,
      amount: borrowedForm.amount,
      interest_rate: borrowedForm.interest_rate,
      due_date: borrowedForm.due_date || null
    }
    
    if (editingBorrowedFund.value) {
      await updateBorrowedFund(editingBorrowedFund.value.id, fundData)
    } else {
      await addBorrowedFund({
        ...fundData,
        project_id: currentProjectId.value!
      })
    }
    
    showAddBorrowedModal.value = false
    resetBorrowedForm()
  } finally {
    saving.value = false
  }
}

const confirmDeleteCategory = (category: BudgetCategory) => {
  itemToDelete.value = { type: 'category', item: category }
  showBudgetDeleteModal.value = true
}

const confirmDeleteBorrowedFund = (fund: BorrowedFund) => {
  itemToDelete.value = { type: 'borrowed', item: fund }
  showBudgetDeleteModal.value = true
}

const confirmBudgetDelete = async () => {
  if (!itemToDelete.value) return
  
  deleting.value = true
  
  try {
    if (itemToDelete.value.type === 'category') {
      await deleteBudgetCategory(itemToDelete.value.item.id)
    } else {
      await deleteBorrowedFund(itemToDelete.value.item.id)
    }
    
    showBudgetDeleteModal.value = false
    itemToDelete.value = null
  } finally {
    deleting.value = false
  }
}

// Expense methods
function openExpenseModalForPhase(phase: RenovationPhase) {
  targetPhase.value = phase
  expenseForm.name = ''
  expenseForm.amount = 0
  expenseForm.expense_date = new Date().toISOString().split('T')[0]
  expenseForm.description = ''
  showExpenseModal.value = true
}

function closeExpenseModal() {
  showExpenseModal.value = false
  targetPhase.value = null
  expenseForm.name = ''
  expenseForm.amount = 0
  expenseForm.expense_date = ''
  expenseForm.description = ''
}

async function saveExpenseToPhase() {
  if (!canSaveExpense.value || !targetPhase.value || !currentProjectId.value) return
  
  saving.value = true
  
  try {
    const expenseData = {
      project_id: currentProjectId.value,
      phase_id: targetPhase.value.id,
      category_id: targetPhase.value.category_id,
      name: expenseForm.name,
      amount: expenseForm.amount,
      expense_date: expenseForm.expense_date,
      description: expenseForm.description || null,
      receipt_photo_url: null
    }
    
    await addExpense(expenseData)
    closeExpenseModal()
  } catch (error) {
    console.error('Error saving expense:', error)
  } finally {
    saving.value = false
  }
}

// Phase methods
function openAddModal() {
  editingPhase.value = null
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingPhase.value = null
}

function openAddGroupModal() {
  editingGroup.value = null
  showGroupModal.value = true
}

function closeGroupModal() {
  showGroupModal.value = false
  editingGroup.value = null
}

function editPhase(phase: RenovationPhase) {
  editingPhase.value = phase
  showModal.value = true
}

function deletePhase(phase: RenovationPhase) {
  phaseToDelete.value = phase
  showDeleteModal.value = true
}

function editGroup(group: PhaseGroupWithPhases) {
  editingGroup.value = group
  showGroupModal.value = true
}

function deleteGroupConfirm(group: PhaseGroupWithPhases) {
  groupToDelete.value = group
  showGroupDeleteModal.value = true
}

function addPhaseToGroup(group: PhaseGroupWithPhases) {
  editingPhase.value = null
  showModal.value = true
}

async function handleFormSubmit(formData: any) {
  if (!projectsStore.currentProject) return

  formLoading.value = true
  try {
    const phaseData = {
      ...formData,
      group_id: formData.group_id || null,
      category_id: formData.category_id || null
    }
    
    if (editingPhase.value) {
      await updatePhase(editingPhase.value.id, phaseData)
    } else {
      await createPhase(projectsStore.currentProject.id, phaseData)
    }
    
    closeModal()
    
    if (viewMode.value === 'groups') {
      await loadGroupsWithPhases()
    } else {
      await loadPhases()
    }
  } catch (err) {
    console.error('Error saving phase:', err)
  } finally {
    formLoading.value = false
  }
}

async function confirmDelete() {
  if (!phaseToDelete.value) return

  formLoading.value = true
  try {
    await deletePhaseAction(phaseToDelete.value.id)
    showDeleteModal.value = false
    phaseToDelete.value = null
    
    if (viewMode.value === 'groups') {
      await loadGroupsWithPhases()
    }
  } catch (err) {
    console.error('Error deleting phase:', err)
  } finally {
    formLoading.value = false
  }
}

async function handleGroupFormSubmit(formData: any) {
  if (!projectsStore.currentProject) return

  formLoading.value = true
  try {
    if (editingGroup.value) {
      await updateGroup(editingGroup.value.id, formData)
    } else {
      await createGroup(projectsStore.currentProject.id, formData)
    }
    closeGroupModal()
    await loadGroupsWithPhases()
  } catch (err) {
    console.error('Error saving group:', err)
  } finally {
    formLoading.value = false
  }
}

async function confirmGroupDelete() {
  if (!groupToDelete.value || groupToDelete.value.id === 'ungrouped') return

  formLoading.value = true
  try {
    await deleteGroup(groupToDelete.value.id)
    showGroupDeleteModal.value = false
    groupToDelete.value = null
    await loadGroupsWithPhases()
  } catch (err) {
    console.error('Error deleting group:', err)
  } finally {
    formLoading.value = false
  }
}

async function loadPhases() {
  if (projectsStore.currentProject) {
    await fetchPhases(projectsStore.currentProject.id)
  }
}

async function loadGroupsWithPhases() {
  if (projectsStore.currentProject) {
    const data = await fetchGroupsWithPhases(projectsStore.currentProject.id)
    groupsWithPhases.value = data
  }
}

async function handlePhaseReorder(reorderedPhases: RenovationPhase[]) {
  const updates = reorderedPhases.map((phase, index) => ({
    id: phase.id,
    order_index: index
  }))
  
  try {
    await bulkUpdatePhaseOrder(updates)
  } catch (err) {
    console.error('Error reordering phases:', err)
    await loadPhases()
  }
}

// Utility methods
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN'
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'planned':
      return 'bg-blue-100 text-blue-800'
    case 'in-progress':
      return 'bg-orange-100 text-orange-800'
    case 'completed':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'planned':
      return 'Planowane'
    case 'in-progress':
      return 'W trakcie'
    case 'completed':
      return 'Zakończone'
    default:
      return status
  }
}

// Watchers
watch(() => projectsStore.currentProject, () => {
  loadPhases()
  loadGroupsWithPhases()
  
  if (projectsStore.currentProject) {
    fetchGroups(projectsStore.currentProject.id)
  }
}, { immediate: true })

watch(viewMode, (newMode) => {
  if (newMode === 'groups') {
    loadGroupsWithPhases()
  }
})

onMounted(() => {
  projectsStore.loadCurrentProject()
})
</script>