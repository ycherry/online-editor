<template>
  <div class="config-form">
    <div class="form-group">
      <label class="form-label">追加方式</label>
      <div class="radio-group">
        <label class="radio-item">
          <input type="radio" v-model="cfg.unionType" value="all"
            @change="emit('update:modelValue', { ...cfg })" />
          <span>追加全部（UNION ALL）</span>
        </label>
        <label class="radio-item">
          <input type="radio" v-model="cfg.unionType" value="distinct"
            @change="emit('update:modelValue', { ...cfg })" />
          <span>去重追加（UNION DISTINCT）</span>
        </label>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">对齐方式</label>
      <select v-model="cfg.alignMode" class="form-select"
        @change="emit('update:modelValue', { ...cfg })">
        <option value="name">按字段名对齐</option>
        <option value="position">按位置对齐</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
const props = defineProps({ modelValue: Object })
const emit = defineEmits(['update:modelValue'])
const cfg = reactive({ unionType: 'all', alignMode: 'name', ...props.modelValue })
watch(() => props.modelValue, v => Object.assign(cfg, v), { deep: true })
</script>

<style scoped>
.config-form { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 13px; font-weight: 600; color: #374151; }
.form-select { padding: 6px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; }
.radio-group { display: flex; flex-direction: column; gap: 8px; }
.radio-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #374151; cursor: pointer; }
</style>
