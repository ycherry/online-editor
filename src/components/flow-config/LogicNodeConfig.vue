<template>
  <div class="config-form">
    <div class="form-group">
      <label class="form-label">逻辑运算符</label>
      <div class="operator-badge">{{ localData.nodeType === 'logic-and' ? 'AND (且)' : localData.nodeType === 'logic-or' ? 'OR (或)' : 'NOR (都不)' }}</div>
    </div>
    <div class="form-group">
      <label class="form-label">布尔输入参数</label>
      <div class="params-list">
        <div v-for="(param, idx) in localData.params" :key="idx" class="param-item">
          <span class="param-index">{{ idx + 1 }}</span>
          <input v-model="localData.params[idx]" type="text" class="form-input" placeholder="参数名称（连接其他节点）" @input="emitUpdate" />
          <button class="btn-remove" @click="removeParam(idx)">×</button>
        </div>
        <button v-if="localData.nodeType !== 'logic-nor'" class="btn-add" @click="addParam">+ 添加参数</button>
      </div>
    </div>
    <div class="info-box">
      <p v-if="localData.nodeType === 'logic-and'">AND 节点：所有参数都为 true 时输出 true</p>
      <p v-else-if="localData.nodeType === 'logic-or'">OR 节点：任意参数为 true 时输出 true</p>
      <p v-else>NOR 节点：所有参数都为 false 时输出 true</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ modelValue: Object })
const emit = defineEmits(['update:modelValue'])
const localData = ref({ ...props.modelValue })
if (!localData.value.params) localData.value.params = ['', '']
watch(() => props.modelValue, (v) => { localData.value = { ...v } }, { deep: true })
function emitUpdate() { emit('update:modelValue', localData.value) }
function addParam() { localData.value.params.push(''); emitUpdate() }
function removeParam(idx) {
  if (localData.value.params.length > 2) { localData.value.params.splice(idx, 1); emitUpdate() }
}
</script>

<style scoped>
.config-form { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 13px; font-weight: 600; color: #333; }
.form-input { padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; flex: 1; }
.form-input:focus { outline: none; border-color: #4a90e2; }
.operator-badge { padding: 10px 16px; background: #eff6ff; border: 2px solid #4a90e2; border-radius: 6px; font-size: 16px; font-weight: 600; color: #1e40af; text-align: center; }
.params-list { display: flex; flex-direction: column; gap: 8px; }
.param-item { display: flex; gap: 8px; align-items: center; }
.param-index { width: 26px; height: 26px; background: #4a90e2; color: white; border-radius: 50%; font-size: 12px; font-weight: 600; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.btn-remove { padding: 4px 8px; background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; border-radius: 4px; cursor: pointer; font-size: 14px; flex-shrink: 0; }
.btn-remove:hover { background: #fecaca; }
.btn-add { padding: 8px; background: white; border: 1px dashed #d1d5db; border-radius: 6px; color: #6b7280; cursor: pointer; font-size: 13px; }
.btn-add:hover { border-color: #4a90e2; color: #4a90e2; background: #f0f7ff; }
.info-box { padding: 12px; background: #f0fdf4; border-left: 3px solid #10b981; border-radius: 4px; font-size: 12px; color: #065f46; }
.info-box p { margin: 0; }
</style>
