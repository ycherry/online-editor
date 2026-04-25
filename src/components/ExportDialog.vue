<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">
        <div class="modal-header">
          <h3>导出节点数据</h3>
          <button class="close-btn" @click="$emit('close')">×</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <label>文件名</label>
            <input v-model="filename" class="input" placeholder="export" />
          </div>
          <div class="form-row">
            <label>格式</label>
            <div class="format-btns">
              <button :class="['fmt-btn', format === 'csv' && 'active']" @click="format = 'csv'">
                CSV
              </button>
              <button :class="['fmt-btn', format === 'json' && 'active']" @click="format = 'json'">
                JSON
              </button>
            </div>
          </div>
          <div class="form-row">
            <label>选择节点</label>
            <div class="node-list">
              <label v-for="node in exportableNodes" :key="node.id" class="node-check">
                <input type="checkbox" v-model="selectedNodes" :value="node.id" />
                <span>{{ node.data.label || node.id }}</span>
              </label>
            </div>
          </div>
          <div v-if="selectedNodes.length > 0" class="preview-hint">
            已选 {{ selectedNodes.length }} 个节点
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn" @click="$emit('close')">取消</button>
          <button class="btn primary" :disabled="selectedNodes.length === 0" @click="handleExport">
            导出
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { downloadCSV, downloadJSON } from '../utils/fileParser.js'
  const props = defineProps({ show: Boolean, nodes: Array, results: Object })
  const emit = defineEmits(['close'])
  const filename = ref('export')
  const format = ref('csv')
  const selectedNodes = ref([])
  const exportableNodes = computed(() =>
    (props.nodes || []).filter((n) => {
      const id = n.id
      const r = props.results instanceof Map ? props.results.get(id) : props.results?.[id]
      return r !== undefined
    })
  )
  function handleExport() {
    selectedNodes.value.forEach((nodeId) => {
      const r = props.results instanceof Map ? props.results.get(nodeId) : props.results?.[nodeId]
      if (r === undefined) return
      const node = props.nodes.find((n) => n.id === nodeId)
      const name = `${filename.value}_${node?.data?.label || nodeId}`
      if (format.value === 'csv' && Array.isArray(r) && r.length > 0 && typeof r[0] === 'object') {
        downloadCSV(r, `${name}.csv`)
      } else {
        downloadJSON(r, `${name}.json`)
      }
    })
    emit('close')
  }
</script>

<style scoped>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  }
  .modal-content {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 480px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
  }
  .modal-header h3 {
    margin: 0;
    font-size: 17px;
    font-weight: 600;
  }
  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #6b7280;
  }
  .modal-body {
    padding: 20px 24px;
  }
  .form-row {
    margin-bottom: 16px;
  }
  .form-row label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 6px;
  }
  .input {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 13px;
    box-sizing: border-box;
  }
  .format-btns {
    display: flex;
    gap: 6px;
  }
  .fmt-btn {
    padding: 6px 16px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    cursor: pointer;
    background: white;
    font-size: 13px;
  }
  .fmt-btn.active {
    background: #4a90e2;
    border-color: #4a90e2;
    color: white;
  }
  .node-list {
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    max-height: 180px;
    overflow-y: auto;
    padding: 6px;
  }
  .node-check {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 6px;
    cursor: pointer;
    border-radius: 4px;
    font-size: 13px;
  }
  .node-check:hover {
    background: #f9fafb;
  }
  .preview-hint {
    font-size: 12px;
    color: #6b7280;
  }
  .modal-footer {
    padding: 14px 24px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
  .btn {
    padding: 9px 20px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    background: white;
  }
  .btn.primary {
    background: #4a90e2;
    border-color: #4a90e2;
    color: white;
  }
  .btn.primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
