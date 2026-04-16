<template>
  <div class="config-form">
    <div class="form-group">
      <label class="form-label">分析类型</label>
      <select v-model="localData.analysisType" class="form-select" @change="emitUpdate">
        <option value="price_diff">单价差异排列</option>
        <option value="total_diff">总价差异排列</option>
        <option value="ai_report">AI分析报告</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">数据列表</label>
      <div class="data-lists">
        <div v-for="(list, idx) in localData.dataLists" :key="idx" class="list-item">
          <span class="list-index">{{ idx + 1 }}</span>
          <input v-model="localData.dataLists[idx]" type="text" class="form-input" :placeholder="`数据列表 ${idx + 1}`" @input="emitUpdate" />
          <button class="btn-remove" @click="removeList(idx)">×</button>
        </div>
        <button class="btn-add" @click="addList">+ 添加数据列表</button>
      </div>
    </div>
    <div class="info-box">
      <div class="info-title">📊 输出说明</div>
      <ul>
        <li>单价差异排列：按单价差异从大到小排列</li>
        <li>总价差异排列：按总价差异从大到小排列</li>
        <li>AI分析报告：生成综合分析报告</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ modelValue: Object })
const emit = defineEmits(['update:modelValue'])
const localData = ref({ ...props.modelValue })
if (!localData.value.dataLists || localData.value.dataLists.length === 0) localData.value.dataLists = ['', '']
if (!localData.value.analysisType) localData.value.analysisType = 'price_diff'
watch(() => props.modelValue, (v) => { localData.value = { ...v } }, { deep: true })
function emitUpdate() { emit('update:modelValue', localData.value) }
function addList() { localData.value.dataLists.push(''); emitUpdate() }
function removeList(idx) { if (localData.value.dataLists.length > 2) { localData.value.dataLists.splice(idx, 1); emitUpdate() } }
</script>

<style scoped>
.config-form { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 13px; font-weight: 600; color: #333; }
.form-input, .form-select { padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; flex: 1; }
.form-input:focus, .form-select:focus { outline: none; border-color: #ef4444; }
.data-lists { display: flex; flex-direction: column; gap: 8px; }
.list-item { display: flex; gap: 8px; align-items: center; }
.list-index { width: 26px; height: 26px; background: #ef4444; color: white; border-radius: 50%; font-size: 12px; font-weight: 600; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.btn-remove { padding: 4px 8px; background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; border-radius: 4px; cursor: pointer; font-size: 14px; flex-shrink: 0; }
.btn-remove:hover { background: #fecaca; }
.btn-add { padding: 8px; background: white; border: 1px dashed #d1d5db; border-radius: 6px; color: #6b7280; cursor: pointer; font-size: 13px; }
.btn-add:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }
.info-box { padding: 12px; background: #fff1f2; border-left: 3px solid #ef4444; border-radius: 4px; font-size: 12px; color: #9b1c1c; }
.info-box .info-title { font-weight: 600; margin-bottom: 6px; }
.info-box ul { margin: 0; padding-left: 16px; }
.info-box li { margin-bottom: 2px; }
</style>
