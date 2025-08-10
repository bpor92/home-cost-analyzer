<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">Lista etapów</h3>
      <Button
        size="sm"
        :variant="dragMode ? 'primary' : 'outline'"
        @click="toggleDragMode"
      >
        <GripVertical class="h-4 w-4 mr-1" />
        {{ dragMode ? 'Zakończ sortowanie' : 'Sortuj etapy' }}
      </Button>
    </div>
    
    <div
      ref="listContainer"
      class="space-y-3"
      :class="{ 'drag-mode': dragMode }"
    >
      <PhaseCard
        v-for="phase in localPhases"
        :key="phase.id"
        :phase="phase"
        :show-drag-handle="dragMode"
        :class="dragMode ? 'draggable-item cursor-move' : ''"
        @edit="$emit('edit', phase)"
        @delete="$emit('delete', phase)"
      />
    </div>
    
    <div v-if="dragMode" class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div class="flex items-center text-blue-800">
        <Info class="h-5 w-5 mr-2" />
        <p class="text-sm">
          Przeciągnij etapy, aby zmienić ich kolejność. Kliknij "Zakończ sortowanie" aby zapisać zmiany.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { GripVertical, Info } from 'lucide-vue-next'
import Sortable from 'sortablejs'
import Button from '~/components/ui/Button.vue'
import PhaseCard from '~/components/ui/PhaseCard.vue'
import type { RenovationPhase } from '~/types/database'

interface Props {
  phases: RenovationPhase[]
}

interface Emits {
  (e: 'edit', phase: RenovationPhase): void
  (e: 'delete', phase: RenovationPhase): void
  (e: 'reorder', phases: RenovationPhase[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const listContainer = ref<HTMLElement>()
const localPhases = ref<RenovationPhase[]>([])
const dragMode = ref(false)
let sortableInstance: Sortable | null = null

watch(() => props.phases, (newPhases) => {
  localPhases.value = [...newPhases]
}, { immediate: true })

function toggleDragMode() {
  dragMode.value = !dragMode.value
  
  if (dragMode.value) {
    enableDragMode()
  } else {
    disableDragMode()
    emit('reorder', localPhases.value)
  }
}

async function enableDragMode() {
  await nextTick()
  
  if (!listContainer.value) return
  
  sortableInstance = new Sortable(listContainer.value, {
    animation: 150,
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',
    handle: '.drag-handle',
    
    onEnd: (evt: any) => {
      if (evt.oldIndex !== undefined && evt.newIndex !== undefined) {
        const item = localPhases.value.splice(evt.oldIndex, 1)[0]
        localPhases.value.splice(evt.newIndex, 0, item)
        
        localPhases.value.forEach((phase, index) => {
          phase.order_index = index
        })
      }
    }
  })
}

function disableDragMode() {
  if (sortableInstance) {
    sortableInstance.destroy()
    sortableInstance = null
  }
}

onMounted(() => {
  if (dragMode.value) {
    enableDragMode()
  }
})

onBeforeUnmount(() => {
  disableDragMode()
})
</script>

<style scoped>
.drag-mode .draggable-item {
  transition: transform 0.2s ease;
}

.drag-mode .draggable-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.sortable-ghost {
  opacity: 0.5;
  background: #f3f4f6;
  border: 2px dashed #d1d5db;
}

.sortable-chosen {
  transform: rotate(2deg);
}

.sortable-drag {
  opacity: 0.8;
  transform: rotate(5deg);
  z-index: 9999;
}

:deep(.drag-handle) {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.drag-mode :deep(.drag-handle) {
  opacity: 1;
}

.drag-mode .draggable-item:hover :deep(.drag-handle) {
  opacity: 1;
}
</style>