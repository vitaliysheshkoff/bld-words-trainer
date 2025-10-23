export const MODES = {
  WORDS: 'words',
  EDGES: 'edges',
  CORNERS: 'corners'
}

export const MODE_CONFIG = {
  [MODES.WORDS]: {
    label: 'Words',
    csvUrl: import.meta.env.VITE_WORDS_CSV_URL,
    sheetUrl: import.meta.env.VITE_WORDS_SHEET_URL,
    hasAlgorithm: false
  },
  [MODES.EDGES]: {
    label: 'Edges',
    csvUrl: import.meta.env.VITE_EDGES_CSV_URL,
    sheetUrl: import.meta.env.VITE_EDGES_SHEET_URL,
    hasAlgorithm: true
  },
  [MODES.CORNERS]: {
    label: 'Corners',
    csvUrl: import.meta.env.VITE_CORNERS_CSV_URL,
    sheetUrl: import.meta.env.VITE_CORNERS_SHEET_URL,
    hasAlgorithm: true
  }
}
