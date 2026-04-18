/**
 * 价格分析 Service
 * 数据来源：/data/材料清单.csv 和 /data/历史价格表.csv
 */

// 后端接口配置（由 .env 统一管理，用户无需感知）
const PRICE_API_URL = import.meta.env.VITE_PRICE_API_URL || ''
const PRICE_API_METHOD = (import.meta.env.VITE_PRICE_API_METHOD || 'POST').toUpperCase()
const PRICE_API_RESPONSE_PATH = import.meta.env.VITE_PRICE_API_RESPONSE_PATH || ''

// 缓存
let _materialListCache = null
let _historyPriceCache = null

/**
 * 解析 CSV 文本为对象数组
 * @param {string} text CSV 文本内容
 * @returns {{ headers: string[], rows: object[] }}
 */
function parseCSV(text) {
  const lines = text.trim().split('\n').map(line => line.trimEnd())
  if (lines.length === 0) return { headers: [], rows: [] }

  const headers = lines[0].split(',')
  const rows = lines.slice(1).map(line => {
    const values = line.split(',')
    const row = {}
    headers.forEach((header, index) => {
      row[header] = values[index] !== undefined ? values[index] : ''
    })
    return row
  })

  return { headers, rows }
}

/**
 * 加载并缓存材料清单数据
 * @returns {Promise<{ headers: string[], rows: object[] }>}
 */
async function loadMaterialList() {
  if (_materialListCache) return _materialListCache
  const response = await fetch('/data/材料清单.csv')
  if (!response.ok) throw new Error(`加载材料清单失败: ${response.status}`)
  const text = await response.text()
  _materialListCache = parseCSV(text)
  return _materialListCache
}

/**
 * 加载并缓存历史价格表数据
 * @returns {Promise<{ headers: string[], rows: object[] }>}
 */
async function loadHistoryPrice() {
  if (_historyPriceCache) return _historyPriceCache
  const response = await fetch('/data/历史价格表.csv')
  if (!response.ok) throw new Error(`加载历史价格表失败: ${response.status}`)
  const text = await response.text()
  _historyPriceCache = parseCSV(text)
  return _historyPriceCache
}

/**
 * 获取材料清单所有数据
 * @returns {Promise<object[]>}
 */
export async function getMaterialList() {
  const { rows } = await loadMaterialList()
  return rows
}

/**
 * 根据三级专业 + 清单名称获取历史价格记录
 * @param {string} thirdCategory 三级专业
 * @param {string} itemName 清单名称
 * @returns {Promise<object[]>}
 */
export async function getHistoryPrices(thirdCategory, itemName) {
  const { rows } = await loadHistoryPrice()
  return rows.filter(
    row => row['三级专业'] === thirdCategory && row['清单名称'] === itemName
  )
}

/**
 * 获取材料清单的所有字段名
 * @returns {Promise<string[]>}
 */
export async function getMaterialListFields() {
  const { headers } = await loadMaterialList()
  return headers
}

/**
 * 获取历史价格表的所有字段名
 * @returns {Promise<string[]>}
 */
export async function getHistoryPriceFields() {
  const { headers } = await loadHistoryPrice()
  return headers
}

/**
 * 调用后端价格查询接口（地址由 .env 统一配置，用户无需感知）
 * @param {object} params  字段参数 key-value
 * @returns {Promise<{ headers: string[], rows: Array<any[]> }>}
 */
export async function queryPriceApi(params = {}) {
  if (!PRICE_API_URL) throw new Error('后端接口地址未配置，请在 .env 中设置 VITE_PRICE_API_URL')
  return queryBackendApi(PRICE_API_URL, params, PRICE_API_METHOD, PRICE_API_RESPONSE_PATH)
}

/**
 * 调用后端接口查询价格数据（底层通用方法）
 * @param {string} url  API 地址
 * @param {object} params  查询参数 key-value
 * @param {'GET'|'POST'} method  请求方法
 * @param {string} responsePath  响应 JSON 中数据数组的路径（空串=根数组，"data"=response.data 等）
 * @returns {Promise<{ headers: string[], rows: Array<any[]> }>}  tabular 格式
 */
export async function queryBackendApi(url, params = {}, method = 'GET', responsePath = '') {
  let response
  if (method === 'POST') {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
  } else {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
    ).toString()
    response = await fetch(qs ? `${url}?${qs}` : url)
  }

  if (!response.ok) throw new Error(`后端接口请求失败: ${response.status} ${response.statusText}`)

  const json = await response.json()

  // Resolve data array from responsePath (e.g. "" / "data" / "result.list")
  let list = json
  if (responsePath) {
    for (const key of responsePath.split('.')) {
      if (list && typeof list === 'object') list = list[key]
      else { list = []; break }
    }
  }

  if (!Array.isArray(list) || list.length === 0) {
    return { headers: [], rows: [] }
  }

  const headers = Object.keys(list[0])
  const rows = list.map(item => headers.map(h => item[h] ?? ''))
  return { headers, rows }
}
