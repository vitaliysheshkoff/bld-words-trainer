<script setup>
import { computed, onBeforeMount, ref, watch } from 'vue'
import { MODE_CONFIG, MODES } from '@/constants/modes'
import { useTrainingData } from '@/composables/useTrainingData'
import { useTheme } from '@/composables/useTheme'
import { useSettings } from '@/composables/useSettings'
import { useImageSearch } from '@/composables/useImageSearch'
import MoonLightIcon from '@/components/icons/MoonLightIcon.vue'
import MoonDarkIcon from '@/components/icons/MoonDarkIcon.vue'
import FileExcelDarkIcon from '@/components/icons/FileExcelDarkIcon.vue'
import FileExcelLightIcon from '@/components/icons/FileExcelLightIcon.vue'
import SettingsIcon from '@/components/icons/SettingsIcon.vue'
import SettingsModal from '@/components/SettingsModal.vue'

// Theme management
const { currentTheme, toggleTheme } = useTheme()

// Settings management
const { settings } = useSettings()
const isSettingsOpen = ref(false)

// Training data management
const { loadData, getRandomPair, parseValue, isLoading } = useTrainingData()

// Image search
const { fetchImageForWord, cancelFetch } = useImageSearch()
const currentImageUrls = ref([])
const imagesLoaded = ref([])

// State
const modeData = ref({
  [MODES.WORDS]: null,
  [MODES.EDGES]: null,
  [MODES.CORNERS]: null
})
const currentPair = ref('')
const currentWord = ref('')
const currentAlgorithm = ref('')
const showAnswer = ref(false)

// Computed
const currentMode = computed(() => settings.value.currentMode)
const currentConfig = computed(() => MODE_CONFIG[currentMode.value])
const hasAlgorithm = computed(() => currentConfig.value.hasAlgorithm)
const shouldShowAlgorithm = computed(() => hasAlgorithm.value && showAnswer.value && currentAlgorithm.value)
const shouldShowWord = computed(() => currentWord.value && (!hasAlgorithm.value || showAnswer.value))
const shouldShowImage = computed(
  () => settings.value.showImages && shouldShowWord.value && currentImageUrls.value.length > 0
)
const displayImageUrls = computed(() => {
  const quality = settings.value.imageQuality || 'high'
  return currentImageUrls.value.map((img) => img[quality])
})

// Watch for word changes to fetch images
watch([() => currentWord.value, () => settings.value.showImages], async ([word, showImages]) => {
  // Cancel any ongoing fetch first
  cancelFetch()

  // Clear current images immediately
  currentImageUrls.value = []
  imagesLoaded.value = []

  if (showImages && word) {
    const urls = await fetchImageForWord(word)
    currentImageUrls.value = urls
    // Initialize loaded state for each image
    imagesLoaded.value = new Array(urls.length).fill(false)
  }
})

// Watch for quality changes to reset image loaded states
watch(
  () => settings.value.imageQuality,
  () => {
    // Reset loaded states when quality changes
    imagesLoaded.value = new Array(currentImageUrls.value.length).fill(false)
  }
)

// Watch for mode changes
watch(currentMode, async (newMode) => {
  showAnswer.value = false

  // Always ensure words data is loaded (needed for edges/corners word lookup)
  if (!modeData.value[MODES.WORDS]) {
    await loadModeData(MODES.WORDS)
  }

  // Load data for the new mode if needed
  if (!modeData.value[newMode]) {
    await loadModeData(newMode)
  }

  // Show first pair
  showNextPair()
})

/**
 * Loads data for a specific mode if not already loaded
 */
const loadModeData = async (mode) => {
  if (modeData.value[mode]) return modeData.value[mode]

  const config = MODE_CONFIG[mode]
  const data = await loadData(mode, config.csvUrl)
  modeData.value[mode] = data
  return data
}

/**
 * Shows the next random pair
 */
const showNextPair = () => {
  const data = modeData.value[currentMode.value]
  if (!data || data.length === 0) return

  const randomPair = getRandomPair(data, currentMode.value)
  if (!randomPair) return

  const { pair, value, firstLetter, secondLetter } = randomPair
  const { word, algorithm } = parseValue(value, hasAlgorithm.value)

  // For edges/corners mode, get word from words table
  // Pair is displayed as: secondLetter (from column) + firstLetter (from row)
  // For word lookup: find row with secondLetter, get column firstLetter
  let wordFromWordsTable = word
  if (hasAlgorithm.value && modeData.value[MODES.WORDS]) {
    const wordsData = modeData.value[MODES.WORDS]
    const wordRow = wordsData.find((row) => row['first/second'] === secondLetter)
    if (wordRow && wordRow[firstLetter]) {
      wordFromWordsTable = wordRow[firstLetter]
    }
  }

  currentPair.value = pair
  currentWord.value = wordFromWordsTable
  currentAlgorithm.value = algorithm
  showAnswer.value = false
}

/**
 * Handles click/keypress to toggle answer or show next pair
 */
const handleInteraction = (event) => {
  // Prevent triggering on button/link clicks
  if (event.target.closest('button, a')) return

  // For words mode (no algorithm), always show next pair
  if (!hasAlgorithm.value) {
    showNextPair()
    return
  }

  // For edges/corners (has algorithm), toggle answer first, then next pair
  if (!showAnswer.value) {
    showAnswer.value = true
  } else {
    showNextPair()
  }
}

/**
 * Handles theme toggle click
 */
const handleThemeToggle = (event) => {
  event.stopPropagation()
  toggleTheme()
  event.currentTarget.blur()
  event.currentTarget.parentElement?.focus()
}

/**
 * Handles settings button click
 */
const handleSettingsClick = (event) => {
  event.stopPropagation()
  isSettingsOpen.value = true
}

/**
 * Handles settings modal close
 */
const handleSettingsClose = () => {
  isSettingsOpen.value = false
}

/**
 * Handles image load event
 */
const handleImageLoad = (index) => {
  imagesLoaded.value[index] = true
}

/**
 * Handles image error event
 */
const handleImageError = (index) => {
  imagesLoaded.value[index] = true // Show broken state rather than infinite loading
}

/**
 * Handles external link click
 */
const handleLinkClick = (event) => {
  event.stopPropagation()
}

/**
 * Initialize app
 */
onBeforeMount(async () => {
  // Load words data (always needed)
  await loadModeData(MODES.WORDS)

  // Load current mode data if different from words
  if (currentMode.value !== MODES.WORDS) {
    await loadModeData(currentMode.value)
  }

  showNextPair()
})
</script>

<template>
  <div
    class="flex min-h-screen flex-col items-center justify-center cursor-pointer transition-colors duration-300 relative p-8 bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100 focus:outline-none"
    tabindex="0"
    @click="handleInteraction"
    @keydown.space.prevent="handleInteraction"
    @keydown.enter.prevent="handleInteraction"
  >
    <!-- Main Content -->
    <div class="flex flex-col items-center justify-center gap-8 max-w-[90vw]">
      <div v-if="isLoading" class="text-2xl opacity-70">Loading...</div>
      <template v-else>
        <!-- Letter Pair -->
        <h1 class="text-7xl sm:text-8xl font-bold transition-colors duration-300 m-0">
          {{ currentPair }}
        </h1>

        <!-- Algorithm (shown first for edges/corners after reveal) -->
        <transition
          enter-active-class="transition-opacity duration-300"
          leave-active-class="transition-opacity duration-300"
          enter-from-class="opacity-0"
          leave-to-class="opacity-0"
        >
          <div
            v-if="shouldShowAlgorithm"
            class="text-xl sm:text-2xl font-mono px-8 py-4 rounded-lg bg-black/10 dark:bg-white/10 break-words max-w-full"
          >
            {{ currentAlgorithm }}
          </div>
        </transition>

        <!-- Word (shown immediately for words mode, after reveal for edges/corners) -->
        <transition
          enter-active-class="transition-opacity duration-300"
          leave-active-class="transition-opacity duration-300"
          enter-from-class="opacity-0"
          leave-to-class="opacity-0"
        >
          <h2 v-if="shouldShowWord" class="text-4xl sm:text-5xl font-semibold m-0 break-words max-w-full">
            {{ currentWord }}
          </h2>
        </transition>

        <!-- Images Grid (shown after word when enabled) -->
        <transition
          enter-active-class="transition-opacity duration-300"
          leave-active-class="transition-opacity duration-300"
          enter-from-class="opacity-0"
          leave-to-class="opacity-0"
        >
          <div v-if="shouldShowImage" class="grid grid-cols-2 gap-4 w-[400px]">
            <div
              v-for="(imageUrl, index) in displayImageUrls"
              :key="`${imageUrl}-${index}`"
              class="relative w-full h-[150px]"
            >
              <!-- Loading skeleton -->
              <div
                v-if="!imagesLoaded[index]"
                class="absolute inset-0 rounded-xl bg-neutral-300 dark:bg-neutral-700 animate-pulse"
              ></div>

              <!-- Actual image -->
              <img
                v-show="imagesLoaded[index]"
                :src="imageUrl"
                :alt="`${currentWord} ${index + 1}`"
                @load="handleImageLoad(index)"
                @error="handleImageError(index)"
                class="absolute inset-0 w-full h-full rounded-xl shadow-lg object-cover"
              />
            </div>
          </div>
        </transition>
      </template>
    </div>

    <!-- External Link -->
    <a
      @click="handleLinkClick"
      :href="currentConfig.sheetUrl"
      class="absolute top-5 left-5 p-2.5 transition-opacity duration-200 hover:opacity-70"
      target="_blank"
      rel="noopener noreferrer"
      :title="`Open ${currentConfig.label} sheet`"
    >
      <FileExcelDarkIcon v-if="currentTheme === 'dark'" class="w-8 h-8 block" />
      <FileExcelLightIcon v-else class="w-8 h-8 block" />
    </a>

    <!-- Theme Toggle -->
    <button
      @click="handleThemeToggle"
      class="absolute top-5 right-5 bg-transparent border-none cursor-pointer p-2.5 transition-opacity duration-200 hover:opacity-70"
      :aria-label="`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} theme`"
    >
      <MoonDarkIcon v-if="currentTheme === 'dark'" class="w-8 h-8 block" />
      <MoonLightIcon v-else class="w-8 h-8 block" />
    </button>

    <!-- Settings Button -->
    <button
      @click="handleSettingsClick"
      class="absolute top-5 right-20 bg-transparent border-none cursor-pointer p-2.5 transition-opacity duration-200 hover:opacity-70"
      aria-label="Open settings"
    >
      <SettingsIcon class="w-8 h-8 block" />
    </button>

    <!-- Settings Modal -->
    <SettingsModal :is-open="isSettingsOpen" @close="handleSettingsClose" />
  </div>
</template>
