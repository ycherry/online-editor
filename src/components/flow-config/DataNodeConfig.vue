<template>
  <div class="config-form">
    <div class="form-group">
      <label class="form-label">数据文件</label>
      <div class="file-upload-area">
        <input
          ref="fileInputRef"
          type="file"
          accept=".csv,.json"
          style="display: none"
          @change="handleFileSelect"
        />
        <div v-if="!localData.fileName" class="upload-prompt" @click="fileInputRef?.click()">
          <div class="upload-icon">📤</div>
          <p>点击选择文件</p>
          <p class="hint">支持 CSV, JSON 格式</p>
        </div>
        <div v-else class="file-selected">
          <div class="file-info-row">
            <span class="file-icon">📄</span>
            <div class="file-details">
              <div class="file-name">{{ localData.fileName }}</div>
              <div class="file-meta">
                {{ localData.totalRows || 0 }} 行 × {{ localData.totalCols || 0 }} 列
              </div>
            </div>
            <button class="btn-change" @click="fileInputRef?.click()">更换</button>
          </div>
        </div>
      </div>
      <p v-if="uploadError" class="error-text">{{ uploadError }}</p>
    </div>
    <div v-if="previewData.length > 0" class="form-group">
      <label class="form-label">数据预览（前5行）</label>
      <div class="preview-table-container">
        <table class="preview-table">
          <thead>
            <tr>
              <th v-for="(h, i) in previewData[0]" :key="i">{{ h }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, ri) in previewData.slice(1, 6)" :key="ri">
              <td v-for="(cell, ci) in row" :key="ci">{{ cell }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-if="!localData.fileName" class="info-box">
      <p>📁 请先选择数据文件，支持 CSV / JSON 格式</p>
    </div>
  </div>
</template>

<script setup>
  import { ref, watch } from 'vue'
  import { parseCSV, parseJSON, detectFileType, readFileAsText } from '@/utils/fileParser'

  const props = defineProps({ modelValue: Object })
  const emit = defineEmits(['update:modelValue'])
  const localData = ref({ ...props.modelValue })
  const fileInputRef = ref()
  const previewData = ref([])
  const uploadError = ref('')
  const parseError = ref('')

  watch(
    () => props.modelValue,
    (v) => {
      localData.value = { ...v }
    },
    { deep: true }
  )

  function emitUpdate() {
    emit('update:modelValue', localData.value)
  }

  async function handleFileSelect(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      uploadError.value = '文件大小不能超过 10MB'
      return
    }
    uploadError.value = ''
    try {
      const fileType = detectFileType(file.name)
      if (fileType === 'unknown') throw new Error('不支持的文件格式，请选择 CSV 或 JSON 文件')
      const text = await readFileAsText(file)
      let data = []
      if (fileType === 'csv') data = parseCSV(text)
      else if (fileType === 'json') data = parseJSON(text)
      if (data.length === 0) throw new Error('文件内容为空')
      localData.value.fileName = file.name
      localData.value.fileType = fileType
      localData.value.totalRows = data.length - 1
      localData.value.totalCols = data[0]?.length || 0
      localData.value.rawData = data
      previewData.value = data
      emitUpdate()
    } catch (error) {
      uploadError.value = error.message || '文件解析失败'
    }
  }
</script>

<style scoped>
  .config-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .form-label {
    font-size: 13px;
    font-weight: 600;
    color: #333;
  }
  .form-input {
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
  }
  .form-input:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.15);
  }
  .upload-prompt {
    border: 2px dashed #d1d5db;
    border-radius: 8px;
    padding: 24px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
  }
  .upload-prompt:hover {
    border-color: #4a90e2;
    background: #f0f7ff;
  }
  .upload-icon {
    font-size: 28px;
    margin-bottom: 8px;
  }
  .upload-prompt p {
    margin: 4px 0;
    font-size: 13px;
    color: #555;
  }
  .upload-prompt .hint {
    font-size: 11px;
    color: #999;
  }
  .file-selected {
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 12px;
    background: #f9fafb;
  }
  .file-info-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .file-icon {
    font-size: 24px;
  }
  .file-details {
    flex: 1;
  }
  .file-name {
    font-size: 13px;
    font-weight: 600;
    color: #333;
  }
  .file-meta {
    font-size: 11px;
    color: #666;
    margin-top: 2px;
  }
  .btn-change {
    padding: 4px 10px;
    background: #4a90e2;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
  }
  .btn-change:hover {
    background: #357abd;
  }
  .error-text {
    font-size: 12px;
    color: #ef4444;
    margin: 0;
  }
  .preview-table-container {
    overflow-x: auto;
    max-height: 200px;
    overflow-y: auto;
  }
  .preview-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
  }
  .preview-table th,
  .preview-table td {
    padding: 4px 8px;
    border: 1px solid #e5e7eb;
    white-space: nowrap;
  }
  .preview-table th {
    background: #f3f4f6;
    font-weight: 600;
    position: sticky;
    top: 0;
  }
  .info-box {
    padding: 12px 16px;
    background: #dbeafe;
    border-left: 4px solid #3b82f6;
    border-radius: 4px;
    font-size: 13px;
    color: #1e40af;
  }
  .info-box p {
    margin: 0;
  }
</style>
