import { ref } from 'vue'

const imageCache = new Map()
const PIXABAY_API_KEY = import.meta.env.VITE_PIXABAY_API_KEY

export const useImageSearch = () => {
  const isLoading = ref(false)
  let currentAbortController = null

  /**
   * Cancels the current ongoing fetch request
   */
  const cancelFetch = () => {
    if (currentAbortController) {
      currentAbortController.abort()
      currentAbortController = null
    }
  }

  /**
   * Fetches 4 image URLs using Pixabay API
   * Falls back to empty array if no results
   */
  const fetchImageForWord = async (word) => {
    if (!word) return []

    // Check cache first
    const cacheKey = word.toLowerCase().trim()
    if (imageCache.has(cacheKey)) {
      return imageCache.get(cacheKey)
    }

    // Cancel any previous fetch
    cancelFetch()

    // Create new abort controller for this request
    currentAbortController = new AbortController()
    const signal = currentAbortController.signal

    isLoading.value = true

    try {
      // Use Pixabay API directly with the word (works with Russian)
      const response = await fetch(
        `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(word)}&image_type=photo&per_page=4&safesearch=true&lang=ru`,
        { signal }
      )

      if (!response.ok) {
        throw new Error(`Pixabay API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.hits && data.hits.length > 0) {
        // Get available images with both quality options
        const imageUrls = data.hits.map((hit) => ({
          high: hit.webformatURL,
          low: hit.previewURL
        }))

        imageCache.set(cacheKey, imageUrls)
        return imageUrls
      }

      // No results, return empty array instead of placeholders
      imageCache.set(cacheKey, [])
      return []
    } catch (error) {
      if (error.name === 'AbortError') {
        // Request was cancelled, just return empty array
        return []
      }
      console.error('Error fetching image:', error)
      // Return empty array on error instead of placeholders
      imageCache.set(cacheKey, [])
      return []
    } finally {
      isLoading.value = false
      currentAbortController = null
    }
  }

  /**
   * Clears the image cache
   */
  const clearCache = () => {
    imageCache.clear()
  }

  return {
    isLoading,
    fetchImageForWord,
    cancelFetch,
    clearCache
  }
}
