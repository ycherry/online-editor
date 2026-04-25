<template>
  <div class="config-form">
    <div class="form-group">
      <label class="form-label">过滤条件</label>
      <div v-for="(cond, i) in cfg.conditions" :key="i" class="cond-row">
        <select
          v-model="cond.logic"
          v-if="i > 0"
          class="logic-select"
          @change="emit('update:modelValue', { ...cfg })"
        >
          <option value="and">AND</option>
          <option value="or">OR</option>
        </select>
        <span v-else class="logic-placeholder">WHERE</span>
        <input
          v-model="cond.field"
          class="form-input"
          placeholder="字段名"
          @input="emit('update:modelValue', { ...cfg })"
        />
        <select
          v-model="cond.operator"
          class="op-select"
          @change="emit('update:modelValue', { ...cfg })"
        >
          <option value="eq">等于</option>
          <option value="ne">不等于</option>
          <option value="gt">大于</option>
          <option value="lt">小于</option>
          <option value="gte">≥</option>
          <option value="lte">≤</option>
          <option value="contains">包含</option>
          <option value="notContains">不包含</option>
          <option value="empty">为空</option>
          <option value="notEmpty">不为空</option>
        </select>
        <input
          v-model="cond.value"
          class="form-input"
          placeholder="值"
          @input="emit('update:modelValue', { ...cfg })"
        />
        <button
          class="del-btn"
          @click="cfg.conditions.splice(i, 1); emit('update:modelValue', { ...cfg })"
        >
          ✕
        </button>
      </div>
      <button
        class="add-btn"
        @click="cfg.conditions.push({ logic: 'and', field: '', operator: 'eq', value: '' }); emit('update:modelValue', { ...cfg })"
      >
        + 添加条件
      </button>
    </div>
  </div>
</template>

<script setup>
  import { reactive, watch } from 'vue'
  const props = defineProps({ modelValue: Object })
  const emit = defineEmits(['update:modelValue'])
  const cfg = reactive({ conditions: [], ...props.modelValue })
  watch(
    () => props.modelValue,
    (v) => Object.assign(cfg, v),
    { deep: true }
  )
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
    color: #374151;
  }
  .cond-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
  }
  .form-input {
    flex: 1;
    padding: 5px 8px;
    border: 1px solid #d1d5db;
    border-radius: 5px;
    font-size: 12px;
    min-width: 0;
  }
  .form-input:focus {
    outline: none;
    border-color: #4a90e2;
  }
  .logic-select {
    width: 64px;
    flex-shrink: 0;
    padding: 5px 4px;
    border: 1px solid #d1d5db;
    border-radius: 5px;
    font-size: 12px;
  }
  .logic-placeholder {
    width: 64px;
    flex-shrink: 0;
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-align: center;
  }
  .op-select {
    width: 72px;
    flex-shrink: 0;
    padding: 5px 4px;
    border: 1px solid #d1d5db;
    border-radius: 5px;
    font-size: 12px;
  }
  .del-btn {
    border: none;
    background: none;
    cursor: pointer;
    color: #9ca3af;
    font-size: 13px;
    padding: 2px 4px;
    border-radius: 3px;
  }
  .del-btn:hover {
    background: #fef2f2;
    color: #ef4444;
  }
  .add-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 10px;
    border: none;
    background: none;
    color: #3b82f6;
    cursor: pointer;
    font-size: 12px;
    border-radius: 4px;
  }
  .add-btn:hover {
    background: #eff6ff;
  }
</style>
