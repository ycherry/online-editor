<template>
  <div class="config-form">
    <div class="form-group">
      <label class="form-label">去重字段</label>
      <div class="hint">留空则对全部字段进行去重</div>
      <div v-for="(f, i) in cfg.fields" :key="i" class="tag-row">
        <input v-model="cfg.fields[i]" class="form-input" placeholder="字段名"
          @input="emit('update:modelValue', { ...cfg })" />
        <button class="del-btn"
          @click="cfg.fields.splice(i,1); emit('update:modelValue', {...cfg})">✕</button>
      </div>
      <button class="add-btn"
        @click="cfg.fields.push(''); emit('update:modelValue', {...cfg})">
        + 添加字段
      </button>
    </div>
    <div class="form-group">
      <label class="form-label">保留记录</label>
      <select v-model="cfg.keepRecord" class="form-select"
        @change="emit('update:modelValue', { ...cfg })">
        <option value="first">保留第一条</option>
        <option value="last">保留最后一条</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
const props = defineProps({ modelValue: Object })
const emit = defineEmits(['update:modelValue'])
const cfg = reactive({ fields: [], keepRecord: 'first', ...props.modelValue })
watch(() => props.modelValue, v => Object.assign(cfg, v), { deep: true })
</script>

<style scoped>
.config-form { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 13px; font-weight: 600; color: #374151; }
.hint { font-size: 11px; color: #9ca3af; margin-top: -2px; }
.tag-row { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.form-input { flex: 1; padding: 5px 8px; border: 1px solid #d1d5db; border-radius: 5px; font-size: 12px; }
.form-input:focus { outline: none; border-color: #4a90e2; }
.form-select { padding: 6px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; }
.del-btn { border: none; background: none; cursor: pointer; color: #9ca3af; font-size: 13px; padding: 2px 4px; border-radius: 3px; }
.del-btn:hover { background: #fef2f2; color: #ef4444; }
.add-btn { display: inline-flex; align-items: center; gap: 4px; padding: 5px 10px; border: none; background: none; color: #3b82f6; cursor: pointer; font-size: 12px; border-radius: 4px; }
.add-btn:hover { background: #eff6ff; }
</style>
