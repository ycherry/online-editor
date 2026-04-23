/**
 * workflowApi.js
 * Backend API calls for workflow node operations.
 *
 * Configure base URL via .env:
 *   VITE_WORKFLOW_API_URL=https://your-backend.com/api
 */

const BASE_URL = (import.meta.env.VITE_WORKFLOW_API_URL || '').replace(/\/$/, '')

/**
 * POST a payload to the backend and return the parsed JSON response.
 * Throws on network errors or non-2xx HTTP status.
 */
async function post(path, payload) {
  const url = BASE_URL + path
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`[workflowApi] ${res.status} ${res.statusText}${text ? ': ' + text : ''}`)
  }
  return res.json()
}

/**
 * Fetch default / suggested configuration for a node given the upstream subgraph.
 * Called when a new edge is connected to a node.
 *
 * @param {object} payload - Backend format: { streamId, nodeId, nodes[] }
 * @returns {Promise<object>} Backend response (node config suggestion)
 */
export async function fetchNodeConfig(payload) {
  return post('/etl/node/config', payload)
}

/**
 * Fetch the execution preview (output data) for a node up to the selected point.
 * Called when the user clicks the 数据预览 tab.
 *
 * @param {object} payload - Backend format: { streamId, nodeId, nodes[] }
 * @returns {Promise<object>} Backend response (preview rows / result)
 */
export async function fetchNodePreview(payload) {
  return post('/etl/node/preview', payload)
}
