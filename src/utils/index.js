import Papa from 'papaparse'

const importCSV = async () => {
  const url = import.meta.env.VITE_DOWNLOAD_SPREADSHEET_URL
  let result = null

  await fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.text()
    })
    .then((data) => {
      return Papa.parse(data, {
        header: true,
        complete: function (results) {
          result = results.data
        },
        error: (error) => {
          console.error('Error parsing CSV:', error)
        }
      })
    })
    .catch((error) => {
      console.error('Error fetching CSV:', error)
    })

  return result
}

export default { importCSV }
