# Prompt dla Aplikacji Zarządzania Budżetem Remontu

## Cel aplikacji
Stwórz nowoczesną aplikację React do zarządzania budżetem remontu mieszkania w stanie deweloperskim. Aplikacja ma być intuicyjna, responsywna i funkcjonalna.

## Główne funkcjonalności

### 1. Zarządzanie Budżetem
- **Definiowanie budżetu całkowitego** - możliwość ustawienia łącznej kwoty na remont
- **Budżet własny** - środki własne użytkownika
- **Budżet pożyczony** - środki pożyczone od rodziny/znajomych z możliwością:
  - Dodania źródła pożyczki (kto pożyczył)
  - Terminu zwrotu
  - Oprocentowania (jeśli dotyczy)
- **Podział budżetu na kategorie**:
  - Instalacje (elektryka, hydraulika, gaz)
  - Wykończenie podłóg
  - Malowanie i tynki
  - Łazienka
  - Kuchnia
  - Drzwi i okna
  - Inne/Nieprzewidziane

### 2. Rejestrowanie Wydatków
- **Dodawanie wydatków** z polami:
  - Nazwa wydatku
  - Kwota
  - Kategoria
  - Data
  - Opis/notatki
  - Zdjęcie paragonu (opcjonalnie)
- **Edycja i usuwanie** istniejących wydatków
- **Filtrowanie wydatków** po dacie, kategorii, kwocie

### 3. Planowanie Etapów Remontu
- **Tworzenie harmonogramu** z etapami:
  - Nazwa etapu (np. "Instalacja elektryki")
  - Planowany budżet na etap
  - Planowane daty rozpoczęcia i zakończenia
  - Status (planowany/w trakcie/zakończony)
  - Priorytność
- **Zarządzanie etapami**:
  - Możliwość przeciągania etapów (drag & drop)
  - Oznaczanie postępu w %
  - Dodawanie notatek do etapów

### 4. Wizualizacje i Raporty
- **Wykres kołowy** - podział wydatków według kategorii
- **Wykres liniowy** - wydatki w czasie
- **Wykres słupkowy** - porównanie planowanego vs rzeczywistego budżetu
- **Wykres postępu** - procent wykorzystania budżetu
- **Dashboard** z kluczowymi wskaźnikami:
  - Pozostały budżet
  - Procent wykorzystania
  - Najdroższa kategoria
  - Średnie wydatki dzienne/tygodniowe

### 5. Dodatkowe Funkcje
- **Eksport danych** - możliwość eksportu do CSV/PDF
- **Powiadomienia** - alerty przy przekroczeniu budżetu kategorii
- **Kalkulator** - wbudowany kalkulator do szybkich obliczeń
- **Notatnik** - miejsce na notatki i pomysły
- **Backup danych** - zapisywanie w localStorage

## Wymagania Techniczne

### Stack Technologiczny
- **Vue 3** + **Composition API** + **TypeScript**
- **Vite** - bundler i dev server
- **Supabase** - backend jako serwis (baza danych, autentykacja)
- **Tailwind CSS** - styling z nowoczesnym, clean designem
- **Lucide Vue** - ikony
- **Chart.js** z vue-chartjs - wykresy
- **Responsywność**: Aplikacja musi działać na mobile i desktop

### Zarządzanie Stanem
- **Vue 3 Composition API**: ref, reactive, computed, watch
- **Pinia** - store management dla globalnego stanu
- **Supabase Client** - komunikacja z bazą danych
- **Vue Router** - routing między sekcjami

### Konfiguracja Projektu
```bash
# Inicjalizacja projektu
npm create vue@latest renovation-budget-app
# Wybierz: TypeScript, Router, Pinia, ESLint, Prettier

# Dodatkowe dependencje
npm install @supabase/supabase-js
npm install vue-chartjs chart.js
npm install @vueuse/core
npm install lucide-vue-next
```

### Struktura Bazy Danych (Supabase)

```sql
-- Tabela projektów remontu
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  total_budget DECIMAL(10,2),
  own_budget DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela pożyczek
CREATE TABLE borrowed_funds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  source VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE,
  interest_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela kategorii budżetu
CREATE TABLE budget_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  planned_amount DECIMAL(10,2) DEFAULT 0,
  spent_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela wydatków
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  category_id UUID REFERENCES budget_categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL,
  receipt_photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela etapów remontu
CREATE TABLE renovation_phases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  budget DECIMAL(10,2),
  start_date DATE,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'in-progress', 'completed')),
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  notes TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrowed_funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE renovation_phases ENABLE ROW LEVEL SECURITY;

-- Polityki bezpieczeństwa (users can only access their own data)
CREATE POLICY "Users can manage their own projects" ON projects
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their borrowed funds" ON borrowed_funds
  FOR ALL USING (auth.uid() = (SELECT user_id FROM projects WHERE id = project_id));

CREATE POLICY "Users can manage their budget categories" ON budget_categories
  FOR ALL USING (auth.uid() = (SELECT user_id FROM projects WHERE id = project_id));

CREATE POLICY "Users can manage their expenses" ON expenses
  FOR ALL USING (auth.uid() = (SELECT user_id FROM projects WHERE id = project_id));

CREATE POLICY "Users can manage their renovation phases" ON renovation_phases
  FOR ALL USING (auth.uid() = (SELECT user_id FROM projects WHERE id = project_id));
```

### TypeScript Interfaces

```typescript
// types/database.ts
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
  name: string
  amount: number
  description: string | null
  expense_date: string
  receipt_photo_url: string | null
  created_at: string
}

export interface RenovationPhase {
  id: string
  project_id: string
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
```

### Konfiguracja Supabase

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Composables dla różnych operacji
// composables/useAuth.ts
export const useAuth = () => {
  const user = ref(null)
  const loading = ref(true)

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  // Auto-refresh session
  onMounted(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      user.value = session?.user ?? null
      loading.value = false
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        user.value = session?.user ?? null
        loading.value = false
      }
    )

    onUnmounted(() => subscription.unsubscribe())
  })

  return {
    user: readonly(user),
    loading: readonly(loading),
    signIn,
    signUp,
    signOut,
  }
}
```

### Struktura Projektu Vue 3

```
src/
├── components/
│   ├── ui/
│   │   ├── Button.vue
│   │   ├── Card.vue
│   │   ├── Input.vue
│   │   ├── Modal.vue
│   │   └── Chart.vue
│   ├── forms/
│   │   ├── ExpenseForm.vue
│   │   ├── BudgetForm.vue
│   │   └── PhaseForm.vue
│   ├── charts/
│   │   ├── BudgetPieChart.vue
│   │   ├── ExpenseLineChart.vue
│   │   └── ProgressChart.vue
│   └── layout/
│       ├── AppHeader.vue
│       ├── AppSidebar.vue
│       └── AppLayout.vue
├── views/
│   ├── Dashboard.vue
│   ├── Budget.vue
│   ├── Expenses.vue
│   ├── Planning.vue
│   ├── Reports.vue
│   ├── Auth/
│   │   ├── Login.vue
│   │   └── Register.vue
│   └── Settings.vue
├── composables/
│   ├── useAuth.ts
│   ├── useProjects.ts
│   ├── useExpenses.ts
│   ├── useBudget.ts
│   ├── usePhases.ts
│   └── useCharts.ts
├── stores/
│   ├── auth.ts
│   ├── projects.ts
│   └── ui.ts
├── types/
│   ├── database.ts
│   └── index.ts
├── lib/
│   ├── supabase.ts
│   └── utils.ts
├── router/
│   └── index.ts
└── main.ts
```

### Przykładowe Composables

```typescript
// composables/useProjects.ts
export const useProjects = () => {
  const { user } = useAuth()
  const projects = ref<Project[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchProjects = async () => {
    if (!user.value) return
    
    loading.value = true
    try {
      const { data, error: supabaseError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.value.id)
        .order('created_at', { ascending: false })

      if (supabaseError) throw supabaseError
      projects.value = data || []
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const createProject = async (projectData: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user.value) return null

    const { data, error: supabaseError } = await supabase
      .from('projects')
      .insert({
        ...projectData,
        user_id: user.value.id
      })
      .select()
      .single()

    if (supabaseError) {
      error.value = supabaseError.message
      return null
    }

    projects.value.unshift(data)
    return data
  }

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const { data, error: supabaseError } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (supabaseError) {
      error.value = supabaseError.message
      return null
    }

    const index = projects.value.findIndex(p => p.id === id)
    if (index !== -1) {
      projects.value[index] = data
    }

    return data
  }

  const deleteProject = async (id: string) => {
    const { error: supabaseError } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (supabaseError) {
      error.value = supabaseError.message
      return false
    }

    projects.value = projects.value.filter(p => p.id !== id)
    return true
  }

  return {
    projects: readonly(projects),
    loading: readonly(loading),
    error: readonly(error),
    fetchProjects,
    createProject,
    updateProject,
    deleteProject
  }
}

// composables/useExpenses.ts
export const useExpenses = (projectId: Ref<string>) => {
  const expenses = ref<Expense[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchExpenses = async () => {
    if (!projectId.value) return
    
    loading.value = true
    try {
      const { data, error: supabaseError } = await supabase
        .from('expenses')
        .select(`
          *,
          budget_categories(name)
        `)
        .eq('project_id', projectId.value)
        .order('expense_date', { ascending: false })

      if (supabaseError) throw supabaseError
      expenses.value = data || []
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const addExpense = async (expenseData: Omit<Expense, 'id' | 'created_at'>) => {
    const { data, error: supabaseError } = await supabase
      .from('expenses')
      .insert({
        ...expenseData,
        project_id: projectId.value
      })
      .select()
      .single()

    if (supabaseError) {
      error.value = supabaseError.message
      return null
    }

    expenses.value.unshift(data)
    return data
  }

  // Watch for project changes
  watch(projectId, () => {
    if (projectId.value) {
      fetchExpenses()
    }
  }, { immediate: true })

  return {
    expenses: readonly(expenses),
    loading: readonly(loading),
    error: readonly(error),
    fetchExpenses,
    addExpense
  }
}
```

### Pinia Stores

```typescript
// stores/auth.ts
export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)

  const initialize = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    user.value = session?.user ?? null
    loading.value = false

    supabase.auth.onAuthStateChange((event, session) => {
      user.value = session?.user ?? null
    })
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return {
    user: readonly(user),
    loading: readonly(loading),
    initialize,
    signIn,
    signOut
  }
})

// stores/projects.ts
export const useProjectsStore = defineStore('projects', () => {
  const currentProject = ref<Project | null>(null)
  const projects = ref<Project[]>([])

  const setCurrentProject = (project: Project) => {
    currentProject.value = project
  }

  const addProject = (project: Project) => {
    projects.value.unshift(project)
  }

  return {
    currentProject: readonly(currentProject),
    projects: readonly(projects),
    setCurrentProject,
    addProject
  }
})
```

### Styl Wizualny
- **Paleta kolorów**: Nowoczesna, profesjonalna (np. niebieskie/szare tony)
- **Typografia**: Czytelna, hierarchiczna
- **Layout**: Dashboard z kartami/sekcjami
- **Animacje**: Subtelne transitions i hover effects

### Navigation
- **Sidebar/Bottom Navigation** z sekcjami:
  - Dashboard (przegląd)
  - Budżet
  - Wydatki
  - Planowanie
  - Raporty/Wykresy
  - Ustawienia

### Responsywność
- **Mobile First** approach
- **Adaptacyjne komponenty** - karty na desktop, listy na mobile
- **Touch-friendly** elementy na urządzeniach mobilnych

## Dodatkowe Wskazówki

### Funkcjonalności Premium (do rozważenia)
- **Offline Support** - PWA z możliwością pracy offline
- **Multi-project Management** - zarządzanie wieloma remontami
- **Colaboration** - dzielenie projektu z rodziną/partnerem w real-time
- **AI Insights** - sugestie optymalizacji budżetu
- **Integracje** - połączenie z bankami (API), sklepy budowlane
- **Powiadomienia Email/SMS** - alerty i przypomnienia

### Bezpieczeństwo i Prywatność (Supabase)
- **RLS (Row Level Security)** - automatyczna ochrona danych użytkownika
- **Encryption at rest** - dane szyfrowane w bazie
- **HTTPS Only** - bezpieczna komunikacja
- **JWT Tokens** - bezpieczna autentykacja
- **Backup automatyczny** - Supabase automatycznie tworzy kopie zapasowe

### Optymalizacja (Vue 3 + Vite)
- **Code Splitting** - automatyczne dzielenie kodu przez Vite
- **Tree Shaking** - usuwanie nieużywanego kodu
- **Lazy Loading** - komponenty ładowane na żądanie
- **Virtual Scrolling** - dla długich list wydatków
- **Debouncing** - dla wyszukiwania i filtrowania
- **Caching** - cache'owanie zapytań Supabase

### Development Workflow
```bash
# Rozwój lokalny
npm run dev

# Build produkcyjny
npm run build

# Preview buildu
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

### Deployment
- **Vercel/Netlify** - hosting frontenda (automatyczny deploy z Git)
- **Supabase** - backend automatycznie skalowalny
- **Environment Variables** - bezpieczne przechowywanie kluczy API
- **CI/CD** - automatyczne testy i deployment

## Oczekiwany Rezultat
Kompletna, działająca aplikacja Vue 3 + TypeScript z wszystkimi wymienionymi funkcjonalnościami, połączona z bazą danych Supabase. Aplikacja powinna być:

- **Fully Typed** - kompletne typy TypeScript dla wszystkich komponentów
- **Production Ready** - gotowa do wdrożenia na produkcję
- **Responsive** - działająca na wszystkich urządzeniach
- **Secure** - z pełną autentykacją i RLS
- **Performant** - zoptymalizowana pod kątem wydajności
- **Maintainable** - czysty, dobrze skomentowany kod, łatwy do rozszerzenia

Kod powinien zawierać:
- ✅ Kompletną konfigurację Supabase z RLS
- ✅ Wszystkie composables do zarządzania danymi
- ✅ Type-safe komunikację z API
- ✅ Responsywny UI z Tailwind CSS
- ✅ Interaktywne wykresy i dashboardy
- ✅ Upload plików (zdjęcia paragonów)
- ✅ Real-time updates gdzie to potrzebne
- ✅ Error handling i loading states
- ✅ PWA capabilities (opcjonalnie)