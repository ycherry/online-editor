<template>
  <div class="config-form">
    <div class="form-group">
      <div class="field-header">
        <span class="col-title" style="flex: 1.2">原字段名</span>
        <span class="col-title" style="flex: 1.2">输出字段名</span>
        <span class="col-title" style="width: 60px; text-align: center">保留</span>
        <span style="width: 28px"></span>
      </div>
      <div v-for="(f, i) in cfg.fields" :key="i" class="field-row">
        <input
          v-model="f.source"
          class="form-input"
          placeholder="原字段名"
          @input="emit('update:modelValue', { ...cfg })"
        />
        <input
          v-model="f.alias"
          class="form-input"
          placeholder="别名（留空保持原名）"
          @input="emit('update:modelValue', { ...cfg })"
        />
        <div style="width: 60px; text-align: center">
          <input type="checkbox" v-model="f.keep" @change="emit('update:modelValue', { ...cfg })" />
        </div>
        <button
          class="del-btn"
          @click="cfg.fields.splice(i, 1); emit('update:modelValue', { ...cfg })"
        >
          ✕
        </button>
      </div>
      <button
        class="add-btn"
        @click="cfg.fields.push({ source: '', alias: '', keep: true }); emit('update:modelValue', { ...cfg })"
      >
        + 添加字段
      </button>
    </div>
  </div>
</template>

<script setup>
  import { reactive, watch } from 'vue'
  const props = defineProps({ modelValue: Object })
  const emit = defineEmits(['update:modelValue'])
  const cfg = reactive({ fields: [], ...props.modelValue })
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
  .field-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 2px;
    margin-bottom: 4px;
  }
  .col-title {
    font-size: 11px;
    font-weight: 600;
    color: #6b7280;
  }
  .field-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
  }
  .form-input {
    flex: 1.2;
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
  .del-btn {
    width: 28px;
    border: none;
    background: none;
    cursor: pointer;
    color: #9ca3af;
    font-size: 13px;
    padding: 2px;
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
