<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900">Ustawienia</h1>
    
    <!-- Profile Settings -->
    <Card>
      <div class="px-6 py-4">
        <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <User class="mr-2 h-5 w-5" />
          Profil użytkownika
        </h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div class="text-sm text-gray-500">{{ user?.email || 'Nie zalogowany' }}</div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Zmiana hasła</label>
            <div class="space-y-3">
              <Input
                v-model="passwordData.currentPassword"
                type="password"
                placeholder="Aktualne hasło"
                :disabled="passwordLoading"
              />
              <Input
                v-model="passwordData.newPassword"
                type="password"
                placeholder="Nowe hasło"
                :disabled="passwordLoading"
              />
              <Input
                v-model="passwordData.confirmPassword"
                type="password"
                placeholder="Potwierdź nowe hasło"
                :disabled="passwordLoading"
              />
              <Button
                @click="changePassword"
                :disabled="passwordLoading || !canChangePassword"
                class="w-full sm:w-auto"
              >
                {{ passwordLoading ? 'Zmienianie...' : 'Zmień hasło' }}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <!-- Language Settings -->
    <Card>
      <div class="px-6 py-4">
        <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Globe class="mr-2 h-5 w-5" />
          Język i region
        </h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Język interfejsu</label>
            <select 
              v-model="selectedLanguage"
              @change="changeLanguage"
              class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800"
            >
              <option value="pl">Polski</option>
              <option value="en">English</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Format daty</label>
            <select 
              v-model="dateFormat"
              @change="saveDateFormat"
              class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800"
            >
              <option value="dd/mm/yyyy">DD/MM/YYYY</option>
              <option value="mm/dd/yyyy">MM/DD/YYYY</option>
              <option value="yyyy-mm-dd">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </div>
    </Card>

    <!-- Success/Error Messages -->
    <div v-if="message.text" :class="[
      'p-4 rounded-md',
      message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
    ]">
      {{ message.text }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { User, Globe } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import Card from '~/components/ui/Card.vue'
import Input from '~/components/ui/Input.vue'
import Button from '~/components/ui/Button.vue'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const user = computed(() => authStore.user)

// Password change functionality
const passwordData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const passwordLoading = ref(false)

const canChangePassword = computed(() => {
  return passwordData.value.currentPassword && 
         passwordData.value.newPassword && 
         passwordData.value.confirmPassword &&
         passwordData.value.newPassword === passwordData.value.confirmPassword &&
         passwordData.value.newPassword.length >= 6
})

// Language settings
const selectedLanguage = ref('pl')
const dateFormat = ref('dd/mm/yyyy')

// Messages
const message = ref<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' })

const showMessage = (text: string, type: 'success' | 'error') => {
  message.value = { text, type }
  setTimeout(() => {
    message.value = { text: '', type: '' }
  }, 5000)
}

const changePassword = async () => {
  if (!canChangePassword.value) return
  
  if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
    showMessage('Nowe hasła nie są identyczne', 'error')
    return
  }

  if (passwordData.value.newPassword.length < 6) {
    showMessage('Nowe hasło musi mieć co najmniej 6 znaków', 'error')
    return
  }
  
  passwordLoading.value = true
  
  try {
    const fetchResponse = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.value?.access_token}`
      },
      body: JSON.stringify({
        currentPassword: passwordData.value.currentPassword,
        newPassword: passwordData.value.newPassword
      })
    })
    
    const response = await fetchResponse.json() as { error?: string; success?: boolean; message?: string }
    
    if ('error' in response && response.error) {
      showMessage(response.error, 'error')
    } else {
      showMessage('Hasło zostało zmienione pomyślnie', 'success')
      passwordData.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    }
  } catch (error: any) {
    showMessage(error.data?.error || 'Wystąpił błąd podczas zmiany hasła', 'error')
  } finally {
    passwordLoading.value = false
  }
}

const changeLanguage = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user-language', selectedLanguage.value)
    showMessage('Język został zmieniony', 'success')
  }
}

const saveDateFormat = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user-date-format', dateFormat.value)
    showMessage('Format daty został zapisany', 'success')
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    selectedLanguage.value = localStorage.getItem('user-language') || 'pl'
    dateFormat.value = localStorage.getItem('user-date-format') || 'dd/mm/yyyy'
  }
})
</script>