# Receipt Scanner - Dokumentacja Techniczna

## 📋 Przegląd

Receipt Scanner to funkcjonalność OCR (Optical Character Recognition) pozwalająca użytkownikom na automatyczne rozpoznawanie tekstu z paragonów i dodawanie wydatków bez ręcznego wprowadzania danych.

## 🛠️ Architektura

### Komponenty

1. **ReceiptScanner.vue** - Główny komponent interfejsu
2. **Integracja z expenses.vue** - Przycisk skanowania i modal
3. **Supabase Storage** - Przechowywanie zdjęć paragonów
4. **Tesseract.js** - Silnik OCR

### Flow Aplikacji

```
1. Użytkownik → "Skanuj paragon"
2. Kamera/Upload → Zdjęcie paragonu
3. Upload → Supabase Storage
4. OCR → Tesseract.js (język: polski)
5. Parsing → Ekstraktacja danych
6. Auto-fill → Formularz wydatku
7. Zapis → Baza danych z URL zdjęcia
```

## 🔧 Konfiguracja

### Wymagane Dependencje

```json
{
  "tesseract.js": "^6.0.1",
  "@vueuse/core": "^13.6.0"
}
```

### Supabase Storage Setup

1. **Bucket Configuration:**
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true);
```

2. **RLS Policies:**
```sql
CREATE POLICY "Users can upload their receipts" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their receipts" ON storage.objects
  FOR SELECT USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their receipts" ON storage.objects
  FOR DELETE USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 📱 Funkcjonalności

### Interfejs Użytkownika

- **Kamera na żywo** - Stream z urządzenia (preferowana kamera tylna na mobile)
- **Upload z galerii** - Wybór istniejącego zdjęcia
- **Preview zdjęcia** - Podgląd przed skanowaniem
- **Progress bar** - Wizualizacja postępu OCR
- **Wyniki skanowania** - Podgląd rozpoznanych danych

### OCR Engine

- **Język:** Polski (Tesseract 'pol')
- **Dokładność:** ~70-90% w zależności od jakości zdjęcia
- **Obsługiwane formaty:** JPEG, PNG, WebP
- **Maksymalny rozmiar:** 5MB

## 🧠 Algorytm Parsowania

### Rozpoznawanie Sklepów
```javascript
const storePatterns = [
  /castorama/i,
  /leroy\s*merlin/i,
  /obi/i,
  /bricomarche/i,
  /praktiker/i,
  /nomi/i,
  /ikea/i
]
```

### Rozpoznawanie Dat
```javascript
// Polski format: DD.MM.YYYY lub DD/MM/YYYY
const datePattern = /(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})/
```

### Rozpoznawanie Kwot
```javascript
const totalPatterns = [
  /suma\s*:?\s*(\d+[,.]?\d*)/i,
  /razem\s*:?\s*(\d+[,.]?\d*)/i,
  /total\s*:?\s*(\d+[,.]?\d*)/i,
  /do\s*zapłaty\s*:?\s*(\d+[,.]?\d*)/i
]
```

### Rozpoznawanie Produktów
- Wzorzec: `^(.+?)\s+(\d+[,.]?\d+)$`
- Filtrowanie: długość nazwy 3-50 znaków
- Mapowanie: nazwa → cena

## 📊 Struktura Danych

### OCRResults Interface
```typescript
interface OCRResults {
  merchantName?: string       // Nazwa sklepu
  date?: string              // Data w formacie DD.MM.YYYY
  total?: string             // Łączna kwota
  items?: Array<{            // Lista produktów
    name: string
    price: string
  }>
  confidence?: number        // Pewność OCR (0-1)
  rawText: string           // Pełny rozpoznany tekst
  receiptImageUrl?: string  // URL zdjęcia w Storage
}
```

### Database Schema
```sql
-- Tabela expenses już obsługuje receipt_photo_url
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS receipt_photo_url TEXT;
```

## 🚀 Użycie w Kodzie

### Import Komponentu
```vue
<script setup>
import ReceiptScanner from '~/components/ui/ReceiptScanner.vue'
</script>
```

### Obsługa Eventów
```vue
<template>
  <ReceiptScanner
    @receipt-scanned="handleReceiptScanned"
    @close="closeScannerModal"
  />
</template>

<script setup>
const handleReceiptScanned = (ocrResults) => {
  // Auto-fill expense form
  expenseForm.value.name = ocrResults.merchantName || 'Zakup w sklepie'
  expenseForm.value.amount = ocrResults.total || ''
  expenseForm.value.expense_date = ocrResults.date || new Date().toISOString().split('T')[0]
  expenseForm.value.receipt_photo_url = ocrResults.receiptImageUrl || ''
}
</script>
```

## 🔍 Error Handling

### Błędy Kamery
- Brak uprawnień: "Nie można uzyskać dostępu do kamery"
- Urządzenie bez kamery: Przełączenie na upload pliku

### Błędy OCR
- Słaba jakość: "Spróbuj ponownie z lepszym zdjęciem"
- Timeout: "OCR trwał zbyt długo"

### Błędy Storage
- Brak bucket'a: "Bucket 'receipts' nie istnieje"
- Błąd uploadu: "Upload failed: [error message]"

## 📈 Optymalizacje

### Performance
- **Lazy loading** - Tesseract.js ładowany dynamicznie
- **Web Workers** - OCR działa w tle
- **Image compression** - Zmniejszenie rozmiaru przed OCR

### UX Improvements
- **Flash effect** - Wizualna informacja o zrobieniu zdjęcia
- **Guide frame** - Ramka pomagająca w pozycjonowaniu
- **Progress tracking** - Informacja o postępie przetwarzania

### Mobile Optimizations
- **Back camera** - Preferowana kamera tylna
- **Touch gestures** - Dotknij aby zrobić zdjęcie
- **Responsive layout** - Dostosowanie do ekranów mobilnych

## 🧪 Testing

### Manual Testing Checklist
- [ ] Kamera uruchamia się poprawnie
- [ ] Upload pliku działa
- [ ] OCR rozpoznaje polskie paragony
- [ ] Dane wypełniają formularz automatycznie
- [ ] Zdjęcie zapisuje się w Storage
- [ ] Error handling działa poprawnie

### Test Cases
1. **Paragon Castorama** - typowy paragon budowlany
2. **Paragon Leroy Merlin** - większy paragon z wieloma produktami
3. **Słaba jakość zdjęcia** - test error handling
4. **Różne formaty dat** - DD.MM.YYYY vs DD/MM/YYYY

## 🔮 Przyszłe Usprawnienia

### Krótkoterminowe
- [ ] Wsparcie dla większej liczby sklepów
- [ ] Lepsze rozpoznawanie produktów
- [ ] Walidacja rozpoznanych kwot

### Długoterminowe
- [ ] ML model dla polskich paragonów
- [ ] Automatyczna kategoryzacja produktów
- [ ] Analiza NLP opisów produktów
- [ ] API integracje z centrami handlowymi

## 📝 Znane Ograniczenia

1. **Jakość OCR** - Zależna od jakości zdjęcia i oświetlenia
2. **Formaty paragonów** - Optymalizowane dla popularnych sklepów
3. **Język** - Obecnie tylko polski
4. **Rozmiar pliku** - Limit 5MB dla zdjęć
5. **Połączenie** - Wymaga internetu dla OCR i uploadu

## 🛟 Troubleshooting

### Częste Problemy

**OCR nie rozpoznaje tekstu:**
- Sprawdź oświetlenie
- Upewnij się, że paragon jest płaski
- Spróbuj z większą rozdzielczością

**Błędy uploadu:**
- Sprawdź konfigurację Supabase
- Zweryfikuj polityki RLS
- Upewnij się, że bucket 'receipts' istnieje

**Slow performance:**
- Zmniejsz rozdzielczość zdjęcia
- Sprawdź połączenie internetowe
- Wyczyść cache przeglądarki

---

*Dokumentacja stworzona dla wersji Receipt Scanner v1.0*