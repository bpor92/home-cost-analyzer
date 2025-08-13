<template>
  <div class="receipt-scanner p-4">
    <!-- Camera View -->
    <div v-if="!capturedImage && !isProcessing" class="camera-container">
      <div class="relative bg-gray-900 rounded-lg overflow-hidden">
        <video
          ref="videoRef"
          :class="[
            'w-full h-64 object-cover',
            !isCameraReady && 'opacity-50'
          ]"
          autoplay
          muted
          playsinline
        />
        
        <!-- Camera overlay with guide frame -->
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="border-2 border-white border-dashed rounded-lg w-4/5 h-3/4 flex items-center justify-center">
            <div class="text-white text-center">
              <Receipt class="mx-auto h-8 w-8 mb-2 opacity-75" />
              <p class="text-sm">Umieść paragon w ramce</p>
            </div>
          </div>
        </div>

        <!-- Camera controls -->
        <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div class="flex items-center space-x-4">
            <Button
              @click="capturePhoto"
              :disabled="!isCameraReady"
              class="bg-white text-gray-900 hover:bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center"
            >
              <Camera class="h-6 w-6" />
            </Button>
          </div>
        </div>

        <!-- Flash overlay -->
        <div
          v-if="showFlash"
          class="absolute inset-0 bg-white opacity-80 transition-opacity duration-200"
        />
      </div>

      <!-- Alternative: File upload -->
      <div class="mt-4 text-center">
        <p class="text-sm text-gray-600 mb-2">lub</p>
        <label class="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            @change="handleFileUpload"
            class="hidden"
          />
          <Button variant="outline" class="inline-flex items-center">
            <Upload class="mr-2 h-4 w-4" />
            Wybierz zdjęcie
          </Button>
        </label>
      </div>
    </div>

    <!-- Captured Image Preview -->
    <div v-else-if="capturedImage && !isProcessing" class="image-preview">
      <div class="relative">
        <img
          :src="capturedImage"
          alt="Captured receipt"
          class="w-full h-64 object-contain bg-gray-100 rounded-lg"
        />
        
        <!-- Image controls -->
        <div class="absolute top-2 right-2 flex space-x-2">
          <Button
            @click="retakePhoto"
            variant="outline"
            size="sm"
            class="bg-white/90"
          >
            <RotateCcw class="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div class="mt-4 flex justify-center space-x-3">
        <Button
          @click="retakePhoto"
          variant="outline"
        >
          Powtórz zdjęcie
        </Button>
        <Button
          @click="processReceipt"
          :disabled="!capturedImage"
        >
          <Scan class="mr-2 h-4 w-4" />
          Skanuj paragon
        </Button>
      </div>
    </div>

    <!-- Processing State -->
    <div v-else-if="isProcessing" class="processing-state text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Analizuję paragon...</h3>
      <p class="text-sm text-gray-600">{{ processingStatus }}</p>
      
      <!-- Progress bar -->
      <div class="w-full bg-gray-200 rounded-full h-2 mt-4">
        <div 
          class="bg-primary-600 h-2 rounded-full transition-all duration-500"
          :style="{ width: `${processingProgress}%` }"
        ></div>
      </div>
    </div>

    <!-- Results -->
    <div v-if="ocrResults && !isProcessing" class="ocr-results mt-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Wynik skanowania</h3>
      
      <!-- Extracted data preview -->
      <div class="bg-gray-50 rounded-lg p-4 mb-4">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label class="font-medium text-gray-700">Sklep:</label>
            <p class="text-gray-900">{{ ocrResults.merchantName || 'Nie rozpoznano' }}</p>
          </div>
          <div>
            <label class="font-medium text-gray-700">Data:</label>
            <p class="text-gray-900">{{ ocrResults.date || 'Nie rozpoznano' }}</p>
          </div>
          <div>
            <label class="font-medium text-gray-700">Kwota:</label>
            <p class="text-gray-900 font-semibold">{{ ocrResults.total || 'Nie rozpoznano' }}</p>
          </div>
          <div>
            <label class="font-medium text-gray-700">Pewność:</label>
            <p class="text-gray-900">{{ Math.round((ocrResults.confidence || 0) * 100) }}%</p>
          </div>
        </div>
      </div>

      <!-- Items list -->
      <div v-if="ocrResults.items && ocrResults.items.length > 0" class="mb-4">
        <h4 class="font-medium text-gray-900 mb-2">Rozpoznane produkty:</h4>
        <div class="space-y-2 max-h-32 overflow-y-auto">
          <div
            v-for="(item, index) in ocrResults.items"
            :key="index"
            class="flex justify-between items-center text-sm bg-white p-2 rounded border"
          >
            <span class="text-gray-900">{{ item.name }}</span>
            <span class="font-medium">{{ item.price }} PLN</span>
          </div>
        </div>
      </div>

      <!-- Raw text (collapsible) -->
      <details class="mb-4">
        <summary class="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
          Zobacz pełny tekst
        </summary>
        <div class="mt-2 p-3 bg-gray-100 rounded text-xs font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
          {{ ocrResults.rawText }}
        </div>
      </details>

      <!-- Action buttons -->
      <div class="flex justify-center space-x-3">
        <Button
          @click="resetScanner"
          variant="outline"
        >
          Skanuj kolejny
        </Button>
        <Button
          @click="useResults"
          :disabled="!ocrResults.total"
        >
          Użyj danych
        </Button>
      </div>
    </div>

    <!-- Error state -->
    <div v-if="error" class="error-state text-center py-8">
      <AlertTriangle class="mx-auto h-12 w-12 text-red-500 mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">Wystąpił błąd</h3>
      <p class="text-sm text-gray-600 mb-4">{{ error }}</p>
      <Button @click="resetScanner" variant="outline">
        Spróbuj ponownie
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { 
  Camera, Upload, Receipt, Scan, RotateCcw, AlertTriangle 
} from 'lucide-vue-next'
import Button from './Button.vue'

interface OCRResults {
  merchantName?: string
  date?: string
  total?: string
  items?: Array<{ name: string; price: string }>
  confidence?: number
  rawText: string
  receiptImageUrl?: string
}

interface Emits {
  (e: 'receipt-scanned', data: OCRResults): void
  (e: 'close'): void
}

const emit = defineEmits<Emits>()

// Refs
const videoRef = ref<HTMLVideoElement>()

// State
const isCameraReady = ref(false)
const capturedImage = ref<string>()
const isProcessing = ref(false)
const processingStatus = ref('Inicjalizuję OCR...')
const processingProgress = ref(0)
const ocrResults = ref<OCRResults>()
const error = ref<string>()
const showFlash = ref(false)
const stream = ref<MediaStream>()

// Methods
const initCamera = async () => {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Camera API not supported')
    }

    const constraints = {
      video: {
        facingMode: 'environment', // Use back camera on mobile
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    }

    stream.value = await navigator.mediaDevices.getUserMedia(constraints)
    
    if (videoRef.value) {
      videoRef.value.srcObject = stream.value
      await new Promise((resolve) => {
        videoRef.value!.onloadedmetadata = resolve
      })
      isCameraReady.value = true
    }
  } catch (err) {
    console.error('Camera error:', err)
    error.value = 'Nie można uzyskać dostępu do kamery. Sprawdź uprawnienia lub użyj opcji upload pliku.'
  }
}

const capturePhoto = () => {
  if (!videoRef.value || !isCameraReady.value) return

  // Show flash effect
  showFlash.value = true
  setTimeout(() => {
    showFlash.value = false
  }, 200)

  // Create canvas and capture image
  const canvas = document.createElement('canvas')
  const video = videoRef.value
  
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.drawImage(video, 0, 0)
    capturedImage.value = canvas.toDataURL('image/jpeg', 0.8)
  }
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      capturedImage.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const retakePhoto = () => {
  capturedImage.value = undefined
  ocrResults.value = undefined
  error.value = undefined
}

const uploadReceiptImage = async (imageDataUrl: string): Promise<string> => {
  try {
    // Convert data URL to blob
    const response = await fetch(imageDataUrl)
    const blob = await response.blob()
    
    // Get current user
    const { $supabase } = useNuxtApp()
    const { data: { user } } = await $supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Użytkownik nie jest zalogowany')
    }
    
    // Generate unique filename with user folder
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const randomId = Math.random().toString(36).substring(7)
    const fileName = `${user.id}/receipt_${timestamp}_${randomId}.jpg`
    
    // Upload to Supabase Storage
    const { error: uploadError } = await $supabase.storage
      .from('receipts')
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: false
      })
    
    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      // If bucket doesn't exist, provide helpful error message
      if (uploadError.message.includes('not found') || uploadError.message.includes('bucket')) {
        throw new Error('Bucket "receipts" nie istnieje w Supabase Storage. Skontaktuj się z administratorem.')
      }
      throw new Error(`Upload failed: ${uploadError.message}`)
    }
    
    // Get public URL
    const { data: { publicUrl } } = $supabase.storage
      .from('receipts')
      .getPublicUrl(fileName)
    
    return publicUrl
  } catch (error) {
    console.error('Image upload error:', error)
    // Return empty string if upload fails - OCR can still work without saving image
    return ''
  }
}

const processReceipt = async () => {
  if (!capturedImage.value) return

  isProcessing.value = true
  processingProgress.value = 0
  error.value = undefined

  try {
    // Upload image to Supabase Storage first
    processingStatus.value = 'Zapisuję zdjęcie...'
    processingProgress.value = 5
    
    const receiptImageUrl = await uploadReceiptImage(capturedImage.value)
    
    // Import Tesseract dynamically
    processingStatus.value = 'Ładuję silnik OCR...'
    processingProgress.value = 15
    
    const { createWorker } = await import('tesseract.js')
    
    processingStatus.value = 'Inicjalizuję OCR...'
    processingProgress.value = 25
    
    const worker = await createWorker('pol', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          processingProgress.value = 25 + (m.progress * 60)
          processingStatus.value = `Rozpoznaję tekst... ${Math.round(m.progress * 100)}%`
        }
      }
    })

    processingStatus.value = 'Analizuję paragon...'
    
    const { data } = await worker.recognize(capturedImage.value)
    
    processingStatus.value = 'Przetwarzam dane...'
    processingProgress.value = 90
    
    // Parse the OCR results
    const results = parseReceiptText(data.text)
    results.confidence = data.confidence / 100
    results.rawText = data.text
    results.receiptImageUrl = receiptImageUrl
    
    await worker.terminate()
    
    processingProgress.value = 100
    ocrResults.value = results
    
  } catch (err) {
    console.error('OCR Error:', err)
    error.value = 'Nie udało się przeanalizować paragonu. Spróbuj ponownie z lepszym zdjęciem.'
  } finally {
    isProcessing.value = false
  }
}

const parseReceiptText = (text: string): OCRResults => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  
  const results: OCRResults = {
    rawText: text,
    items: []
  }

  // Common Polish store patterns
  const storePatterns = [
    /castorama/i,
    /leroy\s*merlin/i,
    /obi/i,
    /bricomarche/i,
    /praktiker/i,
    /nomi/i,
    /ikea/i
  ]

  // Find merchant name
  for (const line of lines.slice(0, 5)) {
    for (const pattern of storePatterns) {
      if (pattern.test(line)) {
        results.merchantName = line
        break
      }
    }
    if (results.merchantName) break
  }

  // Find date (Polish format: DD.MM.YYYY or DD/MM/YYYY)
  const datePattern = /(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})/
  for (const line of lines) {
    const dateMatch = line.match(datePattern)
    if (dateMatch && dateMatch[1] && dateMatch[2] && dateMatch[3]) {
      results.date = `${dateMatch[1].padStart(2, '0')}.${dateMatch[2].padStart(2, '0')}.${dateMatch[3]}`
      break
    }
  }

  // Find total amount
  const totalPatterns = [
    /suma\s*:?\s*(\d+[,.]?\d*)/i,
    /razem\s*:?\s*(\d+[,.]?\d*)/i,
    /total\s*:?\s*(\d+[,.]?\d*)/i,
    /do\s*zapłaty\s*:?\s*(\d+[,.]?\d*)/i
  ]

  for (const line of lines) {
    for (const pattern of totalPatterns) {
      const match = line.match(pattern)
      if (match && match[1]) {
        results.total = match[1].replace(',', '.')
        break
      }
    }
    if (results.total) break
  }

  // If no total found, look for the largest amount
  if (!results.total) {
    const amounts = []
    for (const line of lines) {
      const amountMatches = line.match(/(\d+[,.]?\d+)/g)
      if (amountMatches) {
        amounts.push(...amountMatches.map(a => parseFloat(a.replace(',', '.'))))
      }
    }
    if (amounts.length > 0) {
      results.total = Math.max(...amounts).toFixed(2)
    }
  }

  // Try to extract items (basic implementation)
  for (const line of lines) {
    const itemMatch = line.match(/^(.+?)\s+(\d+[,.]?\d+)$/)
    if (itemMatch && itemMatch[1] && itemMatch[2] && itemMatch[1].length > 3 && itemMatch[1].length < 50) {
      results.items?.push({
        name: itemMatch[1].trim(),
        price: itemMatch[2].replace(',', '.')
      })
    }
  }

  return results
}

const useResults = () => {
  if (ocrResults.value) {
    emit('receipt-scanned', ocrResults.value)
    resetScanner()
  }
}

const resetScanner = () => {
  capturedImage.value = undefined
  ocrResults.value = undefined
  error.value = undefined
  isProcessing.value = false
  processingProgress.value = 0
}

const cleanup = () => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
  }
}

// Lifecycle
onMounted(() => {
  initCamera()
})

onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
.camera-container {
  @apply max-w-md mx-auto;
}

.processing-state {
  @apply max-w-md mx-auto;
}

.ocr-results {
  @apply max-w-md mx-auto;
}
</style>