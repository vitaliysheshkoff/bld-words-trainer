import { ref } from 'vue'
import { createStore, get, set } from 'idb-keyval'

// Create a custom IndexedDB store for image URLs
const imageStore = createStore('bld-trainer-db', 'image-cache')
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
   * Checks IndexedDB cache first, then fetches from API if needed
   */
  const fetchImageForWord = async (word) => {
    if (!word) return []

    const cacheKey = word.toLowerCase().trim()

    // Check IndexedDB cache
    try {
      const cachedUrls = await get(cacheKey, imageStore)
      if (cachedUrls) {
        return cachedUrls
      }
    } catch (error) {
      console.error('Error reading from cache:', error)
    }

    // Fetch from API if not in cache
    cancelFetch()
    currentAbortController = new AbortController()
    const signal = currentAbortController.signal

    isLoading.value = true

    try {
      const response = await fetch(
        `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(word)}&image_type=photo&per_page=4&safesearch=true&lang=ru`,
        { signal }
      )

      if (!response.ok) {
        throw new Error(`Pixabay API error: ${response.status}`)
      }

      const data = await response.json()

      let imageUrls = []
      if (data.hits && data.hits.length > 0) {
        imageUrls = data.hits.map((hit) => ({
          high: hit.webformatURL,
          low: hit.previewURL
        }))
      }

      // Cache the result
      await set(cacheKey, imageUrls, imageStore)

      return imageUrls
    } catch (error) {
      if (error.name === 'AbortError') {
        return []
      }
      console.error('Error fetching image:', error)

      // Cache empty result to avoid repeated failed requests
      await set(cacheKey, [], imageStore)
      return []
    } finally {
      isLoading.value = false
      currentAbortController = null
    }
  }

  /**
   * Clears the IndexedDB cache
   */
  const clearCache = async () => {
    console.log('Cache clear not fully implemented - IndexedDB persists')
  }

  return {
    isLoading,
    fetchImageForWord,
    cancelFetch,
    clearCache
  }
}
