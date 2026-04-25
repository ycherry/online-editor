<template>
  <div class="preview-panel">
    <div class="preview-header">
      <div class="node-info">
        <span class="node-icon">{{ nodeIcon }}</span>
        <span class="node-name">{{ nodeName || '节点预览' }}</span>
      </div>
      <div class="view-tabs">
        <button
          v-for="tab in availableTabs"
          :key="tab.key"
          :class="['tab-btn', activeTab === tab.key && 'active']"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
      <div class="preview-actions">
        <button class="action-btn" @click="copyData" title="复制">📋</button>
        <button class="action-btn" @click="downloadData" title="下载">⬇️</button>
      </div>
    </div>
    <div v-if="!result" class="empty-preview">
      <div class="empty-icon">🔍</div>
      <p>点击节点上的 ▶ 按钮执行并预览结果</p>
    </div>
    <div v-else class="preview-body">
      <div v-if="activeTab === 'table' && isTableData" class="table-view">
        <div class="table-stats">共 {{ result.length }} 行 × {{ columns.length }} 列</div>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th v-for="col in columns" :key="col">{{ col }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in previewRows" :key="i">
                <td v-for="col in columns" :key="col">{{ row[col] ?? '' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="result.length > 50" class="row-hint">仅显示前 50 行</div>
      </div>
      <div v-else-if="activeTab === 'array' && Array.isArray(result)" class="array-view">
        <div class="array-list">
          <div v-for="(item, i) in result.slice(0, 100)" :key="i" class="array-item">
            <span class="array-idx">[{{ i }}]</span>
            <span class="array-val">{{ formatValue(item) }}</span>
          </div>
        </div>
      </div>
      <div v-else-if="activeTab === 'object'" class="object-view">
        <pre class="json-code">{{ JSON.stringify(result, null, 2) }}</pre>
      </div>
      <div v-else class="raw-view">
        <pre class="raw-code">{{ String(result) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { downloadCSV, downloadJSON } from '../utils/fileParser.js'
  const props = defineProps({
    nodeId: String,
    nodeName: String,
    nodeType: String,
    result: { default: null },
  })
  const activeTab = ref('table')
  const isTableData = computed(
    () =>
      Array.isArray(props.result) &&
      props.result.length > 0 &&
      typeof props.result[0] === 'object' &&
      props.result[0] !== null &&
      !Array.isArray(props.result[0])
  )
  const columns = computed(() => (isTableData.value ? Object.keys(props.result[0]) : []))
  const previewRows = computed(() => (props.result || []).slice(0, 50))
  const availableTabs = computed(() => {
    const tabs = [
      { key: 'raw', label: '原始' },
      { key: 'object', label: 'JSON' },
    ]
    if (isTableData.value) tabs.unshift({ key: 'table', label: '表格' })
    else if (Array.isArray(props.result)) tabs.unshift({ key: 'array', label: '列表' })
    return tabs
  })
  const nodeIcon = computed(() => {
    const icons = {
      data: '📊',
      logic: '🔀',
      condition: '⚖️',
      calculation: '🔢',
      container: '📦',
      execution: '⚙️',
      query: '🔍',
      processing: '📈',
      comparison: '🆚',
    }
    const type = (props.nodeType || '').split('-')[0]
    return icons[type] || '⚙️'
  })
  function formatValue(v) {
    if (v === null || v === undefined) return 'null'
    if (typeof v === 'object') return JSON.stringify(v)
    return String(v)
  }
  function copyData() {
    navigator.clipboard?.writeText(JSON.stringify(props.result, null, 2))
  }
  function downloadData() {
    const name = props.nodeName || props.nodeId || 'result'
    if (isTableData.value) downloadCSV(props.result, `${name}.csv`)
    else downloadJSON(props.result, `${name}.json`)
  }
</script>

<style scoped>
  .preview-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: white;
  }
  .preview-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-bottom: 1px solid #e5e7eb;
    flex-shrink: 0;
  }
  .node-info {
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 600;
    color: #1f2937;
    font-size: 13px;
  }
  .node-icon {
    font-size: 14px;
  }
  .view-tabs {
    display: flex;
    gap: 2px;
  }
  .tab-btn {
    padding: 3px 9px;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    font-size: 11px;
    color: #6b7280;
  }
  .tab-btn.active {
    background: #4a90e2;
    border-color: #4a90e2;
    color: white;
  }
  .preview-actions {
    margin-left: auto;
    display: flex;
    gap: 4px;
  }
  .action-btn {
    padding: 3px 7px;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    font-size: 12px;
  }
  .action-btn:hover {
    background: #f3f4f6;
  }
  .empty-preview {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #9ca3af;
  }
  .empty-icon {
    font-size: 32px;
    margin-bottom: 8px;
  }
  .empty-preview p {
    font-size: 12px;
  }
  .preview-body {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .table-view {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 0;
  }
  .table-stats {
    padding: 4px 12px;
    font-size: 11px;
    color: #6b7280;
    border-bottom: 1px solid #e5e7eb;
  }
  .table-wrapper {
    flex: 1;
    overflow: auto;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
  }
  th {
    background: #f9fafb;
    padding: 6px 8px;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
    position: sticky;
    top: 0;
    white-space: nowrap;
  }
  td {
    padding: 4px 8px;
    border-bottom: 1px solid #f3f4f6;
  }
  .row-hint {
    padding: 4px 12px;
    font-size: 11px;
    color: #9ca3af;
  }
  .array-view,
  .object-view,
  .raw-view {
    flex: 1;
    overflow: auto;
    padding: 8px;
  }
  .array-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .array-item {
    display: flex;
    gap: 8px;
    font-size: 11px;
  }
  .array-idx {
    color: #6b7280;
    min-width: 40px;
  }
  .array-val {
    color: #1f2937;
    font-family: monospace;
  }
  .json-code,
  .raw-code {
    font-size: 11px;
    font-family: monospace;
    color: #1f2937;
    white-space: pre-wrap;
    word-break: break-all;
    margin: 0;
  }
</style>
