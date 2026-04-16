<template>
  <div class="config-form">
    <!-- DO...WHILE -->
    <template v-if="localData.nodeType === 'execution-dowhile'">
      <div class="form-group">
        <label class="form-label">起始事件</label>
        <input v-model="localData.startEvent" type="text" class="form-input" placeholder="选择起始节点" @input="emitUpdate" />
      </div>
      <div class="form-group">
        <label class="form-label">终止事件</label>
        <input v-model="localData.endEvent" type="text" class="form-input" placeholder="选择结束节点" @input="emitUpdate" />
      </div>
      <div class="form-group">
        <label class="form-label">循环条件</label>
        <input v-model="localData.condition" type="text" class="form-input" placeholder="条件表达式，成立则继续循环" @input="emitUpdate" />
      </div>
      <div class="info-box">
        <p>DO...WHILE 先执行一次，再检查条件，条件成立则继续循环。</p>
        <p>输出：执行总次数 + 断点位置</p>
      </div>
    </template>
    <!-- FOR -->
    <template v-else-if="localData.nodeType === 'execution-for'">
      <div class="form-group">
        <label class="form-label">循环列表</label>
        <input v-model="localData.list" type="text" class="form-input" placeholder="连接列表节点或数据源" @input="emitUpdate" />
      </div>
      <div class="form-group">
        <label class="form-label">迭代变量名</label>
        <input v-model="localData.itemName" type="text" class="form-input" placeholder="例如：item" @input="emitUpdate" />
      </div>
      <div class="form-group">
        <label class="form-label">索引变量名（可选）</label>
        <input v-model="localData.indexName" type="text" class="form-input" placeholder="例如：index" @input="emitUpdate" />
      </div>
      <div class="example-box">
        <pre class="example-code">for {{ localData.itemName || 'item' }} in {{ localData.list || '列表' }}:
    执行后续节点...</pre>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ modelValue: Object })
const emit = defineEmits(['update:modelValue'])
const localData = ref({ ...props.modelValue })
if (!localData.value.itemName) localData.value.itemName = 'item'
watch(() => props.modelValue, (v) => { localData.value = { ...v } }, { deep: true })
function emitUpdate() { emit('update:modelValue', localData.value) }
</script>

<style scoped>
.config-form { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 13px; font-weight: 600; color: #333; }
.form-input { padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; }
.form-input:focus { outline: none; border-color: #06b6d4; }
.info-box { padding: 12px 16px; background: #fef3c7; border-left: 4px solid #fbbf24; border-radius: 4px; font-size: 12px; color: #78350f; }
.info-box p { margin: 2px 0; }
.example-box { padding: 8px; background: #f3f4f6; border-radius: 6px; }
.example-code { margin: 0; padding: 8px; background: #1f2937; color: #10b981; border-radius: 4px; font-family: monospace; font-size: 12px; }
</style>
