// 文件解析工具

export function parseCSV(text) {
  const lines = text.split(/\r?\n/)
  const result = []
  for (const line of lines) {
    if (!line.trim()) continue
    const fields = []
    let currentField = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        fields.push(currentField.trim())
        currentField = ''
      } else {
        currentField += char
      }
    }
    fields.push(currentField.trim())
    result.push(fields)
  }
  return result
}

export function parseJSON(text) {
  const data = JSON.parse(text)
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('JSON 文件必须包含数组数据')
  }
  if (Array.isArray(data[0])) {
    return data.map(row => row.map(cell => String(cell)))
  }
  if (typeof data[0] === 'object' && data[0] !== null) {
    const headers = Object.keys(data[0])
    const rows = [headers]
    data.forEach(obj => {
      rows.push(headers.map(h => String(obj[h] ?? '')))
    })
    return rows
  }
  throw new Error('不支持的 JSON 格式')
}

export function detectFileType(fileName) {
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (ext === 'csv') return 'csv'
  if (ext === 'json') return 'json'
  if (ext === 'xlsx' || ext === 'xls') return 'xlsx'
  return 'unknown'
}

export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file, 'UTF-8')
  })
}

export function downloadCSV(data, filename) {
  if (!Array.isArray(data) || data.length === 0) return
  const csv = data.map(row =>
    row.map(cell => {
      const s = String(cell ?? '')
      return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s
    }).join(',')
  ).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadJSON(data, filename) {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
