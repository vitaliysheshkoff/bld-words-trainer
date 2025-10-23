import { ref, watchEffect } from 'vue'

export const useTheme = () => {
  const currentTheme = ref('dark')

  const toggleTheme = () => {
    currentTheme.value = currentTheme.value === 'dark' ? 'light' : 'dark'
  }

  watchEffect(() => {
    document.documentElement.classList.toggle('dark', currentTheme.value === 'dark')
  })

  return {
    currentTheme,
    toggleTheme
  }
}
