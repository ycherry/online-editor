<template>
  <div class="config-form">
    <!-- 列表 -->
    <template v-if="localData.nodeType === 'container-list'">
      <div class="form-group">
        <label class="form-label">列表名称</label>
        <input v-model="localData.name" type="text" class="form-input" placeholder="输入列表名称" @input="emitUpdate" />
      </div>
      <div class="form-group">
        <label class="form-label">列表元素</label>
        <div class="elements-list">
          <div v-for="(element, idx) in localData.elements" :key="idx" class="element-item">
            <span class="element-index">{{ idx }}</span>
            <input v-model="localData.elements[idx]" type="text" class="form-input" placeholder="元素值" @input="emitUpdate" />
            <button class="btn-remove" @click="removeElement(idx)">×</button>
          </div>
          <button class="btn-add" @click="addElement">+ 添加元素</button>
        </div>
      </div>
    </template>
    <!-- 字典 -->
    <template v-else-if="localData.nodeType === 'container-dict'">
      <div class="form-group">
        <label class="form-label">字典名称</label>
        <input v-model="localData.name" type="text" class="form-input" placeholder="输入字典名称" @input="emitUpdate" />
      </div>
      <div class="form-group">
        <label class="form-label">键值对</label>
        <div class="pairs-list">
          <div v-for="(pair, idx) in localData.pairs" :key="idx" class="pair-item">
            <input v-model="pair.key" type="text" class="form-input key-input" placeholder="键" @input="emitUpdate" />
            <span class="separator">:</span>
            <input v-model="pair.value" type="text" class="form-input" placeholder="值" @input="emitUpdate" />
            <button class="btn-remove" @click="removePair(idx)">×</button>
          </div>
          <button class="btn-add" @click="addPair">+ 添加键值对</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ modelValue: Object })
const emit = defineEmits(['update:modelValue'])
const localData = ref({ ...props.modelValue })
if ('elements' in (localData.value || {}) && !localData.value.elements) localData.value.elements = ['']
if ('pairs' in (localData.value || {}) && !localData.value.pairs) localData.value.pairs = [{ key: '', value: '' }]
watch(() => props.modelValue, (v) => { localData.value = { ...v } }, { deep: true })
function emitUpdate() { emit('update:modelValue', localData.value) }
function addElement() { localData.value.elements.push(''); emitUpdate() }
function removeElement(idx) { if (localData.value.elements.length > 1) { localData.value.elements.splice(idx, 1); emitUpdate() } }
function addPair() { localData.value.pairs.push({ key: '', value: '' }); emitUpdate() }
function removePair(idx) { if (localData.value.pairs.length > 1) { localData.value.pairs.splice(idx, 1); emitUpdate() } }
</script>

<style scoped>
.config-form { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 13px; font-weight: 600; color: #333; }
.form-input { padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; flex: 1; min-width: 0; }
.form-input:focus { outline: none; border-color: #ec4899; }
.elements-list, .pairs-list { display: flex; flex-direction: column; gap: 8px; }
.element-item, .pair-item { display: flex; gap: 6px; align-items: center; }
.element-index { width: 28px; height: 28px; background: #10b981; color: white; border-radius: 6px; font-size: 12px; font-weight: 600; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.key-input { max-width: 100px; }
.separator { font-weight: 700; color: #6b7280; flex-shrink: 0; }
.btn-remove { padding: 4px 8px; background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; border-radius: 4px; cursor: pointer; font-size: 14px; flex-shrink: 0; }
.btn-remove:hover { background: #fecaca; }
.btn-add { padding: 8px; background: white; border: 1px dashed #d1d5db; border-radius: 6px; color: #6b7280; cursor: pointer; font-size: 13px; }
.btn-add:hover { border-color: #ec4899; color: #ec4899; }
</style>
