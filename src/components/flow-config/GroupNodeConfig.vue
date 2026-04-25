<template>
  <div class="config-form">
    <div class="form-group">
      <label class="form-label">分组字段</label>
      <div v-for="(g, i) in cfg.groupFields" :key="i" class="tag-row">
        <input
          v-model="cfg.groupFields[i]"
          class="form-input"
          placeholder="字段名"
          @input="emit('update:modelValue', { ...cfg })"
        />
        <button
          class="del-btn"
          @click="cfg.groupFields.splice(i, 1); emit('update:modelValue', { ...cfg })"
        >
          ✕
        </button>
      </div>
      <button
        class="add-btn"
        @click="cfg.groupFields.push(''); emit('update:modelValue', { ...cfg })"
      >
        + 添加分组字段
      </button>
    </div>
    <div class="form-group">
      <label class="form-label">汇总计算</label>
      <div v-for="(agg, i) in cfg.aggregations" :key="i" class="agg-row">
        <input
          v-model="agg.field"
          class="form-input"
          placeholder="字段名"
          @input="emit('update:modelValue', { ...cfg })"
        />
        <select
          v-model="agg.func"
          class="func-select"
          @change="emit('update:modelValue', { ...cfg })"
        >
          <option value="sum">求和</option>
          <option value="count">计数</option>
          <option value="avg">平均值</option>
          <option value="max">最大值</option>
          <option value="min">最小值</option>
        </select>
        <input
          v-model="agg.alias"
          class="form-input"
          placeholder="输出字段名（别名）"
          @input="emit('update:modelValue', { ...cfg })"
        />
        <button
          class="del-btn"
          @click="cfg.aggregations.splice(i, 1); emit('update:modelValue', { ...cfg })"
        >
          ✕
        </button>
      </div>
      <button
        class="add-btn"
        @click="cfg.aggregations.push({ field: '', func: 'sum', alias: '' }); emit('update:modelValue', { ...cfg })"
      >
        + 添加汇总项
      </button>
    </div>
  </div>
</template>

<script setup>
  import { reactive, watch } from 'vue'
  const props = defineProps({ modelValue: Object })
  const emit = defineEmits(['update:modelValue'])
  const cfg = reactive({ groupFields: [], aggregations: [], ...props.modelValue })
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
    color: #374151;
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
  .tag-row,
  .agg-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .func-select {
    padding: 5px 6px;
    border: 1px solid #d1d5db;
    border-radius: 5px;
    font-size: 12px;
    width: 76px;
    flex-shrink: 0;
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
