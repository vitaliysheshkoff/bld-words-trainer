<script setup>
import { computed } from 'vue'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  TransitionChild,
  TransitionRoot
} from '@headlessui/vue'
import { useSettings } from '@/composables/useSettings'
import { MODE_CONFIG, MODES } from '@/constants/modes'

defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
})
const emit = defineEmits(['close'])

const { settings, updateSetting } = useSettings()

const handleClose = () => {
  emit('close')
}

const toggleShowImages = () => {
  updateSetting('showImages', !settings.value.showImages)
}

const handleModeChange = (newMode) => {
  updateSetting('currentMode', newMode)
}

const handleQualityChange = (newQuality) => {
  updateSetting('imageQuality', newQuality)
}

const modeOptions = computed(() =>
  Object.values(MODES).map((mode) => ({
    value: mode,
    label: MODE_CONFIG[mode].label
  }))
)

const qualityOptions = [
  { value: 'low', label: 'Low Resolution' },
  { value: 'high', label: 'High Resolution' }
]
</script>

<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="handleClose" class="relative z-50">
      <!-- Backdrop with animation -->
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      </TransitionChild>

      <!-- Modal container -->
      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-md min-h-[23rem] transform overflow-hidden rounded-3xl bg-white dark:bg-neutral-800 p-8 shadow-2xl transition-all"
            >
              <!-- Header -->
              <div class="flex items-center justify-between mb-8">
                <DialogTitle class="text-3xl font-bold text-neutral-700 dark:text-neutral-300"> Settings </DialogTitle>
                <button
                  @click="handleClose"
                  class="rounded-full p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                  aria-label="Close"
                >
                  <svg class="w-6 h-6 text-neutral-700 dark:text-neutral-300" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Settings Options -->
              <div class="space-y-6">
                <!-- Mode Selection -->
                <div class="space-y-2">
                  <label class="text-sm font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">
                    Training Mode
                  </label>
                  <Listbox :modelValue="settings.currentMode" @update:modelValue="handleModeChange">
                    <div class="relative">
                      <ListboxButton
                        class="relative w-full cursor-pointer rounded-xl bg-neutral-50 dark:bg-neutral-700 py-3 pl-4 pr-10 text-left shadow-sm hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <span class="block truncate text-lg font-medium text-neutral-900 dark:text-neutral-100">
                          {{ MODE_CONFIG[settings.currentMode].label }}
                        </span>
                        <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg class="h-5 w-5 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fill-rule="evenodd"
                              d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                              clip-rule="evenodd"
                            />
                          </svg>
                        </span>
                      </ListboxButton>
                      <transition
                        leave-active-class="transition duration-100 ease-in"
                        leave-from-class="opacity-100"
                        leave-to-class="opacity-0"
                      >
                        <ListboxOptions
                          class="absolute z-10 mt-2 w-full overflow-hidden rounded-xl bg-white dark:bg-neutral-700 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                        >
                          <ListboxOption
                            v-for="option in modeOptions"
                            :key="option.value"
                            :value="option.value"
                            v-slot="{ active, selected }"
                            as="template"
                          >
                            <li
                              :class="[
                                'relative cursor-pointer select-none py-3 px-4',
                                active ? 'bg-blue-500 text-white' : 'text-neutral-900 dark:text-neutral-100'
                              ]"
                            >
                              <span :class="['block truncate', selected ? 'font-bold' : 'font-normal']">
                                {{ option.label }}
                              </span>
                              <span v-if="selected" class="absolute inset-y-0 right-0 flex items-center pr-4">
                                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path
                                    fill-rule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clip-rule="evenodd"
                                  />
                                </svg>
                              </span>
                            </li>
                          </ListboxOption>
                        </ListboxOptions>
                      </transition>
                    </div>
                  </Listbox>
                </div>

                <!-- Divider -->
                <div class="border-t border-neutral-200 dark:border-neutral-700"></div>

                <!-- Show Images Toggle -->
                <label class="flex items-center justify-between cursor-pointer group">
                  <div class="flex flex-col">
                    <span class="text-sm font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">
                      Show Images
                    </span>
                    <span class="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5"> Display visual aids </span>
                  </div>
                  <button
                    type="button"
                    @click="toggleShowImages"
                    :class="[
                      'relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                      settings.showImages ? 'bg-blue-600' : 'bg-neutral-300 dark:bg-neutral-600'
                    ]"
                  >
                    <span
                      :class="[
                        'inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform',
                        settings.showImages ? 'translate-x-7' : 'translate-x-1'
                      ]"
                    />
                  </button>
                </label>

                <!-- Image Quality -->
                <transition
                  enter-active-class="transition duration-200 ease-out"
                  enter-from-class="transform scale-95 opacity-0"
                  enter-to-class="transform scale-100 opacity-100"
                  leave-active-class="transition duration-150 ease-in"
                  leave-from-class="transform scale-100 opacity-100"
                  leave-to-class="transform scale-95 opacity-0"
                >
                  <div v-if="settings.showImages" class="space-y-2 pl-1 min-h-40">
                    <label class="text-sm font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">
                      Image Quality
                    </label>
                    <Listbox :modelValue="settings.imageQuality" @update:modelValue="handleQualityChange">
                      <div class="relative mt-1">
                        <ListboxButton
                          class="relative w-full cursor-pointer rounded-xl bg-neutral-50 dark:bg-neutral-700 py-2.5 pl-4 pr-10 text-left shadow-sm hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <span class="block truncate font-medium text-neutral-900 dark:text-neutral-100">
                            {{ qualityOptions.find((q) => q.value === settings.imageQuality)?.label }}
                          </span>
                          <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <svg class="h-5 w-5 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
                              <path
                                fill-rule="evenodd"
                                d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                clip-rule="evenodd"
                              />
                            </svg>
                          </span>
                        </ListboxButton>
                        <transition
                          leave-active-class="transition duration-100 ease-in"
                          leave-from-class="opacity-100"
                          leave-to-class="opacity-0"
                        >
                          <ListboxOptions
                            class="absolute z-50 mt-2 w-full overflow-auto rounded-xl bg-white dark:bg-neutral-700 py-1 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60"
                          >
                            <ListboxOption
                              v-for="option in qualityOptions"
                              :key="option.value"
                              :value="option.value"
                              v-slot="{ active, selected }"
                              as="template"
                            >
                              <li
                                :class="[
                                  'relative cursor-pointer select-none py-2.5 px-4',
                                  active ? 'bg-blue-500 text-white' : 'text-neutral-900 dark:text-neutral-100'
                                ]"
                              >
                                <span :class="['block truncate', selected ? 'font-bold' : 'font-normal']">
                                  {{ option.label }}
                                </span>
                                <span
                                  v-if="selected"
                                  :class="[
                                    'absolute inset-y-0 right-0 flex items-center pr-4',
                                    active ? 'text-white' : 'text-blue-600'
                                  ]"
                                >
                                  <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path
                                      fill-rule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clip-rule="evenodd"
                                    />
                                  </svg>
                                </span>
                              </li>
                            </ListboxOption>
                          </ListboxOptions>
                        </transition>
                      </div>
                    </Listbox>
                  </div>
                </transition>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
