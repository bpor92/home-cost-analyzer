# Migracja do Backend-only Supabase

Wszystkie wywołania Supabase zostały przeniesione z frontendu do backendu Nuxt. Teraz komunikacja z bazą danych odbywa się tylko przez API endpoints.

## Zmiany w architekturze

### Przed migracją
- Bezpośrednie wywołania Supabase z composables
- Klucze Supabase widoczne w kodzie frontendowym
- Client-side authentykacja

### Po migracji
- Wszystkie wywołania przechodzą przez API endpoints
- Klucze Supabase są tylko po stronie serwera
- Token-based authentykacja z localStorage

## Nowe API Endpoints

### Autentykacja
- `POST /api/auth/signin` - Logowanie
- `POST /api/auth/signup` - Rejestracja
- `POST /api/auth/signout` - Wylogowanie
- `GET /api/auth/session` - Sprawdzenie sesji

### Projekty
- `GET /api/projects` - Lista projektów
- `POST /api/projects` - Tworzenie projektu
- `PUT /api/projects/[id]` - Aktualizacja projektu
- `DELETE /api/projects/[id]` - Usuwanie projektu

### Kategorie budżetowe
- `GET /api/budget-categories/[projectId]` - Lista kategorii dla projektu
- `POST /api/budget-categories` - Tworzenie kategorii

### Fazy renowacji
- `GET /api/renovation-phases/[projectId]` - Lista faz dla projektu
- `POST /api/renovation-phases` - Tworzenie fazy

### Wydatki
- `GET /api/expenses/[projectId]` - Lista wydatków dla projektu
- `POST /api/expenses` - Dodawanie wydatku

### Grupy faz
- `GET /api/phase-groups/[projectId]` - Lista grup faz
- `GET /api/phase-groups/with-phases/[projectId]` - Grupy faz z fazami

## Konfiguracja zmiennych środowiskowych

Dodaj do `.env`:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

## Zmiany w composables

### useAuthStore
- Używa localStorage do przechowywania tokenów
- Komunikuje się z API endpoints zamiast bezpośrednio z Supabase
- Automatyczna walidacja sesji przy inicjalizacji

### useProjects, useBudget, useRenovationPhases, itp.
- Wszystkie używają `$fetch` do komunikacji z API
- Dodane nagłówki autoryzacji z tokenem
- Ustandaryzowane obsługa błędów

## Bezpieczeństwo

- Klucze Supabase są tylko po stronie serwera
- Weryfikacja autoryzacji na każdym endpoincie
- Sprawdzanie własności zasobów (user musi być właścicielem projektu)
- Ustandaryzowane obsługa błędów i logowanie

## Następne kroki

1. Przetestować wszystkie funkcje aplikacji
2. Sprawdzić czy wszystkie wywołania działają poprawnie
3. Dodać brakujące API endpoints jeśli potrzebne
4. Dodać testy do API endpoints