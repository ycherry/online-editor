<template>
  <div class="join-config">
    <!-- 1. 连接方式 -->
    <div class="section">
      <div class="section-title">1. 设置连接方式</div>
      <div class="join-type-grid">
        <button
          v-for="jt in joinTypes"
          :key="jt.value"
          :class="['jt-btn', cfg.joinType === jt.value && 'active']"
          @click="cfg.joinType = jt.value; emit('update:modelValue', { ...cfg })"
        >
          <span class="jt-icon">{{ jt.icon }}</span>
          <span>{{ jt.label }}</span>
        </button>
      </div>
    </div>

    <!-- 2. 连接字段 -->
    <div class="section">
      <div class="section-title">2. 添加连接字段</div>
      <div class="field-header">
        <div class="field-col">
          <span class="table-icon">📋</span>
          <span class="table-label">左侧表单：{{ leftTableName }}</span>
        </div>
        <div class="eq-placeholder"></div>
        <div class="field-col">
          <span class="table-icon">📋</span>
          <span class="table-label">右侧表单：{{ rightTableName }}</span>
        </div>
        <div style="width:28px"></div>
      </div>

      <div v-for="(mapping, idx) in cfg.fieldMappings" :key="idx" class="mapping-row">
        <div class="field-inputs">
          <input
            v-model="mapping.leftField"
            class="field-input"
            placeholder="左侧字段"
            @input="emit('update:modelValue', { ...cfg })"
          />
          <select v-model="mapping.leftType" class="type-select"
            @change="emit('update:modelValue', { ...cfg })">
            <option v-for="t in fieldTypes" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
        <span class="eq-sign">=</span>
        <div class="field-inputs">
          <input
            v-model="mapping.rightField"
            class="field-input"
            placeholder="右侧字段"
            @input="emit('update:modelValue', { ...cfg })"
          />
          <select v-model="mapping.rightType" class="type-select"
            @change="emit('update:modelValue', { ...cfg })">
            <option v-for="t in fieldTypes" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
        <button class="del-btn" @click="removeMapping(idx)" title="删除">🗑</button>
      </div>

      <button class="add-btn" @click="addMapping">
        <span>+</span> 添加
      </button>
    </div>

    <!-- 3. 字段设置 -->
    <div class="section">
      <div class="section-title">连接字段设置</div>
      <label class="checkbox-row">
        <input
          type="checkbox"
          v-model="cfg.mergeJoinFields"
          @change="emit('update:modelValue', { ...cfg })"
        />
        <span>合并连接字段</span>
      </label>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, computed } from 'vue'
import { useExecutionStore } from '@/store/execution'

const props = defineProps({
  modelValue: Object,
  nodeId: String,
})
const emit = defineEmits(['update:modelValue'])

const executionStore = useExecutionStore()

const defaultCfg = {
  joinType: 'left',
  fieldMappings: [{ leftField: '', leftType: '文本', rightField: '', rightType: '文本' }],
  mergeJoinFields: true,
  leftTableName: '',
  rightTableName: '',
}

const cfg = reactive({ ...defaultCfg, ...props.modelValue })

watch(() => props.modelValue, (v) => Object.assign(cfg, v), { deep: true })

const joinTypes = [
  { value: 'inner', label: '内连接', icon: '⊗' },
  { value: 'full',  label: '全连接', icon: '⊕' },
  { value: 'left',  label: '左连接', icon: '⊲' },
  { value: 'right', label: '右连接', icon: '⊳' },
]

const fieldTypes = ['文本', '数字', '日期', '布尔']

// Derive table names from connected node labels stored in config
const leftTableName = computed(() => cfg.leftTableName || '—')
const rightTableName = computed(() => cfg.rightTableName || '—')

function addMapping() {
  cfg.fieldMappings.push({ leftField: '', leftType: '文本', rightField: '', rightType: '文本' })
  emit('update:modelValue', { ...cfg })
}

function removeMapping(idx) {
  cfg.fieldMappings.splice(idx, 1)
  emit('update:modelValue', { ...cfg })
}
</script>

<style scoped>
.join-config { display: flex; flex-direction: column; gap: 20px; padding: 4px 0; }

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 10px;
}

.join-type-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.jt-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 8px;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 13px;
  color: #6b7280;
  transition: all .15s;
}

.jt-btn:hover { border-color: #4a90e2; color: #4a90e2; }

.jt-btn.active {
  border-color: #14b8a6;
  color: #14b8a6;
  font-weight: 600;
  background: #f0fdfa;
}

.jt-icon { font-size: 15px; }

.field-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;
  color: #374151;
}

.field-col {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}

.table-label { font-size: 12px; }
.table-icon  { font-size: 13px; }

.eq-placeholder { width: 20px; flex-shrink: 0; }

.mapping-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.field-inputs {
  flex: 1;
  display: flex;
  gap: 4px;
}

.field-input {
  flex: 1;
  padding: 5px 8px;
  border: 1px solid #d1d5db;
  border-radius: 5px;
  font-size: 12px;
  min-width: 0;
}

.field-input:focus { outline: none; border-color: #4a90e2; }

.type-select {
  width: 56px;
  padding: 5px 2px;
  border: 1px solid #d1d5db;
  border-radius: 5px;
  font-size: 11px;
  background: white;
}

.eq-sign {
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  width: 20px;
  text-align: center;
}

.del-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  cursor: pointer;
  color: #9ca3af;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}
.del-btn:hover { background: #fef2f2; color: #ef4444; }

.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border: none;
  background: none;
  color: #3b82f6;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  border-radius: 4px;
}
.add-btn:hover { background: #eff6ff; }

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #374151;
}

.checkbox-row input[type="checkbox"] {
  width: 14px;
  height: 14px;
  accent-color: #3b82f6;
}
</style>
