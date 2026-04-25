<template>
  <div class="config-form">
    <div class="form-group">
      <label class="form-label">运算符</label>
      <select v-model="localData.operator" class="form-select" @change="emitUpdate">
        <option value="+">加法 (+)</option>
        <option value="-">减法 (-)</option>
        <option value="*">乘法 (×)</option>
        <option value="/">除法 (÷)</option>
        <option value="%">取模 (%)</option>
        <option value="**">幂运算 (**)</option>
        <option value="sqrt">平方根 (√)</option>
        <option value="abs">绝对值 (|x|)</option>
        <option value="log">对数 (log)</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">输入参数</label>
      <div class="params-list">
        <div v-for="(param, idx) in localData.params" :key="idx" class="param-item">
          <span class="param-index">{{ idx + 1 }}</span>
          <input
            v-model="localData.params[idx]"
            type="text"
            class="form-input"
            placeholder="参数名称或数值"
            @input="emitUpdate"
          />
          <button class="btn-remove" @click="removeParam(idx)">×</button>
        </div>
        <button class="btn-add" @click="addParam">+ 添加参数</button>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">表达式预览</label>
      <div class="expression-preview">{{ getExpression() }}</div>
    </div>
  </div>
</template>

<script setup>
  import { ref, watch } from 'vue'
  const props = defineProps({ modelValue: Object })
  const emit = defineEmits(['update:modelValue'])
  const localData = ref({ ...props.modelValue })
  if (!localData.value.params || localData.value.params.length === 0)
    localData.value.params = ['', '']
  if (!localData.value.operator) localData.value.operator = '+'
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
  function addParam() {
    localData.value.params.push('')
    emitUpdate()
  }
  function removeParam(idx) {
    localData.value.params.splice(idx, 1)
    emitUpdate()
  }
  function getExpression() {
    const params = (localData.value.params || []).filter((p) => p)
    if (params.length === 0) return '请添加参数'
    return params.join(` ${localData.value.operator || '+'} `)
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
  .form-input,
  .form-select {
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 13px;
  }
  .form-input:focus,
  .form-select:focus {
    outline: none;
    border-color: #8b5cf6;
  }
  .params-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .param-item {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .param-index {
    width: 24px;
    height: 24px;
    background: #8b5cf6;
    color: white;
    border-radius: 50%;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .form-input {
    flex: 1;
  }
  .btn-remove {
    padding: 4px 8px;
    background: #fee2e2;
    color: #dc2626;
    border: 1px solid #fecaca;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }
  .btn-remove:hover {
    background: #fecaca;
  }
  .btn-add {
    padding: 8px;
    background: white;
    border: 1px dashed #d1d5db;
    border-radius: 6px;
    color: #6b7280;
    cursor: pointer;
    font-size: 13px;
  }
  .btn-add:hover {
    border-color: #8b5cf6;
    color: #8b5cf6;
    background: #f5f3ff;
  }
  .expression-preview {
    padding: 10px 16px;
    background: #f3f4f6;
    border-radius: 6px;
    font-family: monospace;
    font-size: 13px;
    color: #1f2937;
  }
</style>
