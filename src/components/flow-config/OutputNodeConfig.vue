<template>
  <div class="config-form">
    <div class="form-group">
      <label class="form-label">输出文件名</label>
      <input
        v-model="localData.filename"
        type="text"
        class="form-input"
        placeholder="输出数据"
        @input="emitUpdate"
      />
    </div>

    <div class="section-title">输出列</div>
    <div v-if="outputHeaders.length > 0" class="columns-list">
      <span v-for="col in outputHeaders" :key="col" class="col-tag">{{ col }}</span>
    </div>
    <div v-else class="info-box">
      执行节点后自动显示输出列（输入数据的所有列 + <strong>合价</strong>）。<br />
      <em>接线说明：</em>输入1 = 材料清单表格数据；输入2（可选）=
      单价标量（来自字段提取或运算节点）， 若接入则用于计算 合价 = 数量 × 单价。
    </div>

    <div class="export-section">
      <div v-if="hasResult" class="result-info">
        ✅ 已执行，共 {{ resultRowCount }} 行数据
        <span v-if="nodeResult?.output?.unitPrice != null">
          （综合单价: {{ nodeResult.output.unitPrice }}）
        </span>
      </div>
      <div v-else class="result-info pending">⏳ 请先执行工作流，再导出 Excel</div>
      <button class="export-btn" :disabled="!hasResult" @click="exportToExcel">
        📥 导出 Excel
      </button>
    </div>
  </div>
</template>

<script setup>
  import { ref, watch, computed } from 'vue'
  import * as XLSX from 'xlsx'
  import { useExecutionStore } from '@/store/execution'

  const props = defineProps({
    modelValue: Object,
    nodeId: String,
  })
  const emit = defineEmits(['update:modelValue'])

  const executionStore = useExecutionStore()

  const localData = ref({
    filename: '输出数据',
    ...props.modelValue,
  })

  watch(
    () => props.modelValue,
    (v) => {
      localData.value = { filename: '输出数据', ...v }
    },
    { deep: true }
  )

  function emitUpdate() {
    emit('update:modelValue', { ...localData.value })
  }

  const nodeResult = computed(() => {
    if (!props.nodeId) return null
    return executionStore.getNodeResult(props.nodeId)
  })

  const hasResult = computed(() => {
    const r = nodeResult.value
    return r?.status === 'completed' && r?.output?.rows?.length > 0
  })

  const resultRowCount = computed(() => {
    return nodeResult.value?.output?.rows?.length ?? 0
  })

  const outputHeaders = computed(() => {
    return nodeResult.value?.output?.headers ?? []
  })

  function exportToExcel() {
    const output = nodeResult.value?.output
    if (!output || !output.rows) return

    const wsData = [output.headers, ...output.rows]
    const ws = XLSX.utils.aoa_to_sheet(wsData)

    // auto column width
    const colWidths = output.headers.map((h, i) => {
      const maxLen = Math.max(
        String(h).length,
        ...output.rows.map((r) => String(r[i] ?? '').length)
      )
      return { wch: Math.min(Math.max(maxLen + 2, 8), 30) }
    })
    ws['!cols'] = colWidths

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '输出数据')
    XLSX.writeFile(wb, `${output.filename || '输出数据'}.xlsx`)
  }
</script>

<style scoped>
  .config-form {
    display: flex;
    flex-direction: column;
    gap: 14px;
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
    font-size: 13px;
  }
  .form-input:focus {
    outline: none;
    border-color: #22c55e;
  }

  .section-title {
    font-size: 13px;
    font-weight: 700;
    color: #1f2937;
    padding-bottom: 4px;
    border-bottom: 1px solid #e5e7eb;
  }
  .info-box {
    padding: 8px 12px;
    background: #f0fdf4;
    border-left: 3px solid #22c55e;
    border-radius: 4px;
    font-size: 12px;
    color: #166534;
  }

  .columns-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .col-tag {
    padding: 3px 9px;
    background: #dcfce7;
    border: 1px solid #86efac;
    border-radius: 12px;
    font-size: 11px;
    color: #166534;
    font-weight: 500;
  }

  .export-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    background: #f9fafb;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
  }
  .result-info {
    font-size: 12px;
    color: #374151;
  }
  .result-info.pending {
    color: #9ca3af;
  }
  .export-btn {
    padding: 9px 16px;
    background: #22c55e;
    border: none;
    border-radius: 6px;
    color: white;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
  }
  .export-btn:hover:not(:disabled) {
    background: #16a34a;
  }
  .export-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
</style>
