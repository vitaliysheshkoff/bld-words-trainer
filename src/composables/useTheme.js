import { ref, watchEffect } from 'vue'

const THEME_KEY = 'bld-trainer-theme'

export const useTheme = () => {
  // Load theme from localStorage or default to 'dark'
  const getInitialTheme = () => {
    try {
      const stored = localStorage.getItem(THEME_KEY)
      return stored === 'light' ? 'light' : 'dark'
    } catch (error) {
      console.error('Error loading theme:', error)
      return 'dark'
    }
  }

  const currentTheme = ref(getInitialTheme())

  const toggleTheme = () => {
    currentTheme.value = currentTheme.value === 'dark' ? 'light' : 'dark'

    // Save to localStorage
    try {
      localStorage.setItem(THEME_KEY, currentTheme.value)
    } catch (error) {
      console.error('Error saving theme:', error)
    }
  }

  watchEffect(() => {
    if (currentTheme.value === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  })

  return {
    currentTheme,
    toggleTheme
  }
}
