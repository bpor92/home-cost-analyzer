# Home Cost Analyzer - Analiza Aplikacji

## Przegląd Aplikacji

**Home Cost Analyzer** to aplikacja webowa do zarządzania budżetem remontów, zbudowana w technologii **Nuxt 4** z **Vue 3**, **TypeScript**, **Pinia** i **Supabase**.

### Główne funkcjonalności:
- Zarządzanie projektami remontowymi
- Planowanie budżetu i kategorii wydatków
- Śledzenie wydatków i faktur
- Zarządzanie fazami remontu i grupami faz
- Zarządzanie pomieszczeniami i materiałami
- Raportowanie i wykresy
- Uwierzytelnianie użytkowników

---

## Architektura Techniczna

### Stack Technologiczny

#### Frontend
- **Nuxt 4.0.3** - Meta-framework Vue.js z SSR
- **Vue 3.5.18** - Framework JavaScript
- **TypeScript 5.8.0** - Statyczne typowanie
- **Pinia 3.0.3** - Zarządzanie stanem
- **@pinia/nuxt 0.11.2** - Integracja Pinia z Nuxt

#### Styling
- **TailwindCSS 3.4.17** - Utility-first CSS framework
- **@nuxtjs/tailwindcss 6.14.0** - Moduł Nuxt dla Tailwind
- **@tailwindcss/forms 0.5.10** - Style dla formularzy
- **PostCSS 8.5.6** - CSS processor
- **Autoprefixer 10.4.21** - CSS vendor prefixes

#### UI/UX Libraries
- **lucide-vue-next 0.539.0** - Ikony
- **Chart.js 4.5.0** - Wykresy
- **vue-chartjs 5.3.2** - Wrapper Chart.js dla Vue
- **sortablejs 1.15.6** - Drag & drop functionality
- **vue-draggable-next 2.2.1** - Vue wrapper dla drag & drop

#### Backend/Database
- **@supabase/supabase-js 2.54.0** - Klient Supabase
- **Supabase** - Backend-as-a-Service (PostgreSQL, Auth, Storage)

#### Dev Tools
- **ESLint 9.31.0** - Linting JavaScript/TypeScript
- **@vue/eslint-config-typescript 14.6.0** - Konfiguracja ESLint dla Vue+TS

#### Utilities
- **@vueuse/core 13.6.0** - Utilities dla Vue Composition API

---

## Struktura Aplikacji

### Struktura katalogów

```
app/
├── assets/           # Statyczne zasoby (CSS, obrazy)
├── components/       # Komponenty Vue
│   ├── charts/       # Komponenty wykresów
│   ├── forms/        # Komponenty formularzy
│   ├── icons/        # Ikony
│   ├── layout/       # Komponenty layoutu
│   └── ui/           # Komponenty UI (Button, Input, Modal)
├── composables/      # Logika business (9 composables)
├── layouts/          # Layouty stron
├── middleware/       # Middleware routingu
├── pages/            # Strony aplikacji
├── plugins/          # Pluginy Nuxt
├── stores/           # Stores Pinia
└── types/            # Definicje typów TypeScript

server/
├── api/              # API endpoints
│   ├── auth/         # Endpointy uwierzytelniania
│   ├── budget-categories/
│   ├── expenses/
│   ├── materials/
│   ├── phase-groups/
│   ├── projects/
│   ├── renovation-phases/
│   └── rooms/
├── lib/              # Biblioteki serwera
└── utils/            # Narzędzia serwera
```

---

## Analiza Funkcjonalna

### 1. Moduły Główne

#### Auth Module
- **Store**: `stores/auth.ts`
- **Composable**: `composables/useAuth.ts` (duplikuje funkcjonalność store)
- **API**: `server/api/auth/`
- **Strony**: `pages/auth/login.vue`, `pages/auth/register.vue`

#### Projects Module
- **Store**: `stores/projects.ts`
- **Composable**: `composables/useProjects.ts`
- **API**: `server/api/projects/`
- **Strony**: `pages/projects.vue`, `pages/project-management.vue`

#### Budget Module
- **Composable**: `composables/useBudget.ts`
- **Composable**: `composables/useBudgetCategories.ts`
- **API**: `server/api/budget-categories/`
- **Strona**: `pages/budget.vue`

#### Expenses Module
- **Composable**: `composables/useExpenses.ts`
- **API**: `server/api/expenses/`
- **Strona**: `pages/expenses.vue`

#### Phases Module
- **Composable**: `composables/useRenovationPhases.ts`
- **Composable**: `composables/usePhaseGroups.ts`
- **API**: `server/api/renovation-phases/`, `server/api/phase-groups/`
- **Strona**: `pages/planning.vue`

#### Materials & Rooms Module
- **Composable**: `composables/useMaterials.ts`
- **Composable**: `composables/useRooms.ts`
- **API**: `server/api/materials/`, `server/api/rooms/`
- **Strona**: `pages/materials.vue`

### 2. Strony Aplikacji

| Strona | Ścieżka | Funkcjonalność |
|--------|---------|----------------|
| Strona główna | `/` | Landing page z linkami do logowania |
| Dashboard | `/dashboard` | Podsumowanie projektów i statystyki |
| Projekty | `/projects` | Lista projektów |
| Zarządzanie projektami | `/project-management` | CRUD projektów |
| Budżet | `/budget` | Zarządzanie budżetem i kategoriami |
| Wydatki | `/expenses` | Lista i zarządzanie wydatkami |
| Planowanie | `/planning` | Fazy remontu i grupy faz |
| Materiały | `/materials` | Lista materiałów i pomieszczeń |
| Raporty | `/reports` | Wykresy i statystyki |
| Ustawienia | `/settings` | Konfiguracja aplikacji |
| O aplikacji | `/about` | Informacje o aplikacji |

---

## Identyfikacja Duplikacji i Problemów

### 🔴 **Krytyczne Duplikacje**

#### 1. **Duplikacja logiki uwierzytelniania**
- **Problem**: `useAuth.ts` composable duplikuje funkcjonalność `auth.ts` store
- **Impakt**: Redundantny kod, potencjalne konflikty stanu
- **Rozwiązanie**: Usunąć `useAuth.ts`, używać tylko `useAuthStore()`

#### 2. **Powtarzająca się logika `getAuthHeaders`**
```typescript
// Ten kod powtarza się w 8 composables:
const getAuthHeaders = () => {
  const token = authStore.user?.access_token
  return token ? { Authorization: `Bearer ${token}` } : undefined
}
```
- **Wystąpienia**: useProjects, useExpenses, useBudget, useBudgetCategories, useRenovationPhases, usePhaseGroups, useRooms, useMaterials
- **Rozwiązanie**: Utworzyć wspólny composable `useApiClient.ts`

#### 3. **Powtarzająca się obsługa błędów API**
```typescript
// Ten pattern powtarza się w każdym composable:
catch (err: any) {
  error.value = err.statusMessage || err.message || 'Failed to...'
  console.error('Error...:', err)
}
```
- **Rozwiązanie**: Wspólna funkcja `handleApiError()` w `useApiClient.ts`

#### 4. **Duplikacja wzorców CRUD**
- Każdy composable implementuje podobne metody: fetch, create, update, delete
- **Rozwiązanie**: Generyczny `useCrudApi<T>()` composable

### 🟡 **Średnie Duplikacje**

#### 5. **Powtarzające się wzorce loading/error**
```typescript
// Prawie identyczny kod w każdym composable:
const loading = ref(false)
const error = ref<string | null>(null)

loading.value = true
error.value = null
// API call
finally {
  loading.value = false
}
```

#### 6. **Redundantne readonly() wrappery**
- Użycie `readonly()` było problematyczne i zostało usunięte
- ✅ **Naprawione** - readonly() usunięte ze stores i composables

#### 7. **Duplikacja logiki 401 handling**
- Obecnie zaimplementowane tylko w `useProjects.ts`
- **Problem**: Brak spójnej obsługi wygaśnięcia sesji w innych composables
- **Rozwiązanie**: Wspólny interceptor w `useApiClient.ts`

### 🟢 **Drobne Duplikacje**

#### 8. **Podobne struktury typów**
- `ExpenseWithCategory`, `PhaseWithGroup`, `MaterialWithRoom` - podobne wzorce join typów
- **Rozwiązanie**: Generyczny typ `WithRelation<T, R>`

#### 9. **Powtarzające się walidacje**
- Sprawdzanie `authStore.user` w każdym composable
- **Rozwiązanie**: Middleware lub guard w `useApiClient.ts`

---

## Rekomendacje Refaktoryzacji

### 1. **Priorytet 1: Utworzenie `useApiClient.ts`**

```typescript
// composables/useApiClient.ts
export const useApiClient = () => {
  const authStore = useAuthStore()
  const router = useRouter()

  const getAuthHeaders = () => {
    const token = authStore.user?.access_token
    return token ? { Authorization: `Bearer ${token}` } : undefined
  }

  const handleApiError = async (error: any, defaultMessage: string) => {
    if (error.statusCode === 401) {
      await authStore.signOut()
      await router.push('/auth/login')
      return
    }
    return error.statusMessage || error.message || defaultMessage
  }

  const apiCall = async <T>(url: string, options: any = {}): Promise<T> => {
    try {
      return await $fetch<T>(url, {
        ...options,
        headers: { ...getAuthHeaders(), ...options.headers }
      })
    } catch (error: any) {
      const errorMessage = await handleApiError(error, 'API call failed')
      if (errorMessage) throw new Error(errorMessage)
      throw error
    }
  }

  return { apiCall, getAuthHeaders, handleApiError }
}
```

### 2. **Priorytet 2: Usunięcie `useAuth.ts`**
- Zastąpić wszystkie użycia przez `useAuthStore()`
- Przenieść dodatkową logikę do store'a jeśli potrzebna

### 3. **Priorytet 3: Refaktoryzacja composables**
- Użyć `useApiClient()` w wszystkich composables
- Standaryzować wzorce CRUD
- Dodać spójną obsługę 401 wszędzie

### 4. **Priorytet 4: Optymalizacja typów**
- Utworzenie generycznych typów dla relacji
- Standaryzacja interfejsów API response

---

## Metryki Kodu

### Composables
| Composable | Linie kodu | Funkcje | Duplikuje getAuthHeaders |
|------------|------------|---------|-------------------------|
| useAuth.ts | ~63 | 4 | ❌ (ale duplikuje store) |
| useProjects.ts | ~125 | 5 | ✅ |
| useExpenses.ts | ~200+ | 6 | ✅ |
| useBudget.ts | ~150+ | 4 | ✅ |
| useBudgetCategories.ts | ~100+ | 3 | ✅ |
| useRenovationPhases.ts | ~120+ | 3 | ✅ |
| usePhaseGroups.ts | ~80+ | 2 | ✅ |
| useRooms.ts | ~120+ | 4 | ✅ |
| useMaterials.ts | ~100+ | 3 | ✅ |

### API Endpoints
- **Auth**: 4 endpointy
- **Projects**: 4 endpointy  
- **Expenses**: 4 endpointy
- **Budget Categories**: 2 endpointy
- **Renovation Phases**: 2 endpointy
- **Phase Groups**: 2 endpointy
- **Rooms**: 4 endpointy
- **Materials**: 2 endpointy

**Łącznie**: 24 API endpoints

---

## Wnioski

### Pozytywne aspekty:
✅ Dobra separacja concerns  
✅ Spójna struktura katalogów  
✅ Użycie TypeScript dla type safety  
✅ Modularna architektura  
✅ Czyste API endpoints  

### Obszary do poprawy:
🔄 **Wysokiy poziom duplikacji kodu** (~40% kodu w composables)  
🔄 **Brak centralnej obsługi API errors**  
🔄 **Redundantne composables (useAuth)**  
🔄 **Niespójna obsługa 401 errors**  
🔄 **Powtarzające się wzorce CRUD**  

### Szacowany czas refaktoryzacji:
- **Faza 1** (useApiClient): 4-6 godzin
- **Faza 2** (usunięcie useAuth): 2-3 godziny  
- **Faza 3** (refactor composables): 8-12 godzin
- **Faza 4** (optymalizacja typów): 4-6 godzin

**Łączny szacunek**: 18-27 godzin

### Potencjalne oszczędności:
- **Redukcja kodu**: ~30-40%
- **Łatwiejsza maintenance**: znacząca poprawa
- **Mniejsza podatność na błędy**: przez centralizację logiki
- **Lepsza DX**: przez spójne wzorce