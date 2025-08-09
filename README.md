# Renovation Budget App

Nowoczesna aplikacja Vue 3 do zarządzania budżetem remontu mieszkania w stanie deweloperskim.

## 🚀 Funkcjonalności

### ✅ Zaimplementowane
- **Autentykacja** - Rejestracja i logowanie użytkowników
- **Dashboard** - Przegląd kluczowych wskaźników budżetu
- **Wydatki** - Dodawanie, edycja i śledzenie wydatków z filtrowaniem
- **Projekty** - Zarządzanie projektami remontu
- **Responsywny design** - Działanie na desktop i mobile

### 🔄 W trakcie implementacji
- **Zarządzanie budżetem** - Kategorie, planowany vs rzeczywisty budżet
- **Planowanie etapów** - Harmonogram remontu z drag & drop
- **Raporty i wykresy** - Wizualizacja danych Chart.js
- **Pożyczki** - Śledzenie środków pożyczonych

## 🛠️ Stack technologiczny

- **Frontend**: Vue 3 + TypeScript + Composition API
- **Styling**: Tailwind CSS
- **Icons**: Lucide Vue
- **Routing**: Vue Router
- **State Management**: Pinia
- **Backend**: Supabase (PostgreSQL + Auth)
- **Build Tool**: Vite

## 📦 Instalacja

1. **Instalacja dependencji**
```bash
npm install
```

2. **Konfiguracja Supabase**

Utwórz projekt na [Supabase](https://supabase.com) i wykonaj następujące kroki:

a) **Utwórz tabele w SQL Editor:**

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

-- Włączenie RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrowed_funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE renovation_phases ENABLE ROW LEVEL SECURITY;

-- Polityki RLS
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

b) **Skonfiguruj zmienne środowiskowe:**

Edytuj plik `.env` i uzupełnij danymi z Supabase:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. **Uruchomienie aplikacji**
```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem: `http://localhost:5173`

## 📱 Użytkowanie

1. **Rejestracja/Logowanie**
   - Utwórz nowe konto lub zaloguj się
   - Potwierdź email (jeśli wymagane)

2. **Pierwszy projekt**
   - Po zalogowaniu utwórz pierwszy projekt remontu
   - Podaj nazwę i budżet całkowity

3. **Dodawanie wydatków**
   - Przejdź do sekcji "Wydatki"
   - Dodawaj wydatki z kategoriami i datami
   - Używaj filtrów do wyszukiwania

4. **Monitor budżetu**
   - Dashboard pokazuje aktualne wykorzystanie budżetu
   - Karty z kluczowymi wskaźnikami

## 🔧 Komendy

```bash
# Deweloperskie
npm run dev          # Uruchomienie serwera deweloperskiego
npm run build        # Build produkcyjny
npm run preview      # Podgląd buildu
npm run type-check   # Sprawdzanie typów TypeScript
npm run lint         # Linting kodu
```

## 📁 Struktura projektu

```
src/
├── components/
│   ├── ui/              # Komponenty UI (Button, Card, Input, Modal)
│   ├── forms/           # Formularze (ExpenseForm, BudgetForm)
│   ├── charts/          # Komponenty wykresów
│   └── layout/          # Layout (Header, Sidebar, Layout)
├── views/               # Widoki/strony
│   ├── Auth/           # Logowanie, rejestracja
│   ├── Dashboard.vue   # Dashboard główny
│   ├── Expenses.vue    # Zarządzanie wydatkami
│   └── ...
├── composables/        # Logika biznesowa (useAuth, useExpenses)
├── stores/             # Globalne store (Pinia)
├── types/              # Typy TypeScript
├── lib/                # Konfiguracje (Supabase)
└── router/             # Konfiguracja routingu
```

## 🔐 Bezpieczeństwo

- **Row Level Security (RLS)** - Automatyczna ochrona danych
- **JWT Tokens** - Bezpieczna autentykacja  
- **HTTPS Only** - Szyfrowana komunikacja
- **Environment variables** - Bezpieczne przechowywanie kluczy

## 🆘 Pomoc

- **Dokumentacja Vue 3** - [Vue.js Guide](https://vuejs.org/guide/)
- **Dokumentacja Supabase** - [Supabase Docs](https://supabase.com/docs)
- **Dokumentacja Tailwind** - [Tailwind CSS](https://tailwindcss.com/docs)
