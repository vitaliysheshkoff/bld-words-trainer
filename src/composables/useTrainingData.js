import { ref } from 'vue'
import Papa from 'papaparse'
import { MODES } from '@/constants/modes'

export const useTrainingData = () => {
  const isLoading = ref(false)
  const error = ref(null)

  /**
   * Fetches CSV data from URL
   */
  const fetchCSV = async (url) => {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    return await response.text()
  }

  /**
   * Parses CSV data using PapaParse
   */
  const parseCSV = (csvText) => {
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data),
        error: (err) => reject(err)
      })
    })
  }

  /**
   * Extracts first Russian letter from labels like "В (UB)" -> "В"
   */
  const extractRussianLetter = (label) => {
    if (!label || typeof label !== 'string') return null
    const match = label.match(/^([А-Яа-яЁё])/)
    return match ? match[1] : null
  }

  /**
   * Processes Words data (simple structure)
   */
  const processWordsData = (data) => {
    return data.filter((row) => {
      const firstLetter = row['first/second']
      return firstLetter && firstLetter !== '-'
    })
  }

  /**
   * Processes Edges/Corners data (extracts Russian letters from labels)
   */
  const processEdgesCorners = (data) => {
    return data
      .map((row) => {
        const firstLetterLabel = row['1st ->'] || row['first/second']
        const firstLetter = extractRussianLetter(firstLetterLabel)

        if (!firstLetter || firstLetter === '-') return null

        const processedRow = { 'first/second': firstLetter }

        Object.keys(row).forEach((key) => {
          if (key === '1st ->' || key === 'first/second') return

          const secondLetter = extractRussianLetter(key)
          if (secondLetter && row[key] && row[key] !== '' && row[key] !== '-') {
            processedRow[secondLetter] = row[key]
          }
        })

        return processedRow
      })
      .filter(Boolean)
  }

  /**
   * Main function to load data for a specific mode
   */
  const loadData = async (mode, csvUrl) => {
    isLoading.value = true
    error.value = null

    try {
      const csvText = await fetchCSV(csvUrl)
      const parsedData = await parseCSV(csvText)

      let processedData
      if (mode === MODES.WORDS) {
        processedData = processWordsData(parsedData)
      } else {
        processedData = processEdgesCorners(parsedData)
      }

      return processedData
    } catch (err) {
      error.value = err.message
      console.error(`Error loading ${mode} data:`, err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Gets a random pair from the data
   */
  const getRandomPair = (data, mode) => {
    if (!data || data.length === 0) return null

    const randomIndex = Math.floor(Math.random() * data.length)
    const row = data[randomIndex]
    const firstLetter = row['first/second']

    const availableKeys = Object.keys(row).filter(
      (key) => key !== 'first/second' && row[key] && row[key] !== '' && row[key] !== '-'
    )

    if (availableKeys.length === 0) return null

    let secondLetter
    do {
      secondLetter = availableKeys[Math.floor(Math.random() * availableKeys.length)]
    } while (secondLetter === firstLetter && availableKeys.length > 1)

    const value = row[secondLetter]

    return {
      pair: mode === MODES.WORDS ? `${firstLetter}${secondLetter}` : `${secondLetter}${firstLetter}`,
      firstLetter,
      secondLetter,
      value
    }
  }

  /**
   * Parses algorithm and word from combined value
   * For edges/corners: returns the entire value as algorithm
   * For words: returns the word as-is
   */
  const parseValue = (value, hasAlgorithm) => {
    if (!value) return { word: '', algorithm: '' }

    if (!hasAlgorithm) {
      return { word: value.trim(), algorithm: '' }
    }

    // For edges/corners: the entire cell value is the algorithm
    return {
      word: '',
      algorithm: value.trim()
    }
  }

  return {
    isLoading,
    error,
    loadData,
    getRandomPair,
    parseValue
  }
}
