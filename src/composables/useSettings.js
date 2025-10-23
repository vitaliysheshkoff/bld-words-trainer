import { ref, watch } from 'vue'
import { MODES } from '@/constants/modes'

const SETTINGS_KEY = 'bld-trainer-settings'

const defaultSettings = {
  showImages: false,
  imageQuality: 'high', // 'high' or 'low'
  currentMode: MODES.WORDS
}

const settings = ref({ ...defaultSettings })

export const useSettings = () => {
  /**
   * Load settings from localStorage
   */
  const loadSettings = () => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY)
      if (stored) {
        settings.value = { ...defaultSettings, ...JSON.parse(stored) }
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  /**
   * Save settings to localStorage
   */
  const saveSettings = () => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings.value))
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }

  /**
   * Update a specific setting
   */
  const updateSetting = (key, value) => {
    settings.value[key] = value
    saveSettings()
  }

  // Watch for changes and auto-save
  watch(settings, saveSettings, { deep: true })

  // Load on first use
  loadSettings()

  return {
    settings,
    updateSetting
  }
}
