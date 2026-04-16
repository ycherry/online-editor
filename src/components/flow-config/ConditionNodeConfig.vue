<template>
  <div class="config-form">
    <!-- 比较节点 -->
    <template v-if="localData.nodeType === 'condition-compare'">
      <div class="form-group">
        <label class="form-label">比较运算符</label>
        <select v-model="localData.operator" class="form-select" @change="emitUpdate">
          <option value=">">大于 (&gt;)</option>
          <option value="<">小于 (&lt;)</option>
          <option value=">=">大于等于 (&gt;=)</option>
          <option value="<=">小于等于 (&lt;=)</option>
          <option value="==">等于 (==)</option>
          <option value="!=">不等于 (!=)</option>
          <option value="between">在之间 (between)</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">左操作数</label>
        <input v-model="localData.left" type="text" class="form-input" placeholder="值或连接节点" @input="emitUpdate" />
      </div>
      <div class="form-group">
        <label class="form-label">右操作数</label>
        <input v-model="localData.right" type="text" class="form-input" placeholder="值或连接节点" @input="emitUpdate" />
      </div>
      <div class="expression-preview">{{ localData.left || '左值' }} {{ localData.operator }} {{ localData.right || '右值' }}</div>
    </template>
    <!-- 集合判断节点 -->
    <template v-else-if="localData.nodeType === 'condition-belongs'">
      <div class="form-group">
        <label class="form-label">判断类型</label>
        <select v-model="localData.belongsType" class="form-select" @change="emitUpdate">
          <option value="belongs">属于 (∈)</option>
          <option value="not-belongs">不属于 (∉)</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">元素</label>
        <input v-model="localData.param" type="text" class="form-input" placeholder="要判断的元素" @input="emitUpdate" />
      </div>
      <div class="form-group">
        <label class="form-label">集合</label>
        <textarea v-model="localData.container" class="form-textarea" rows="3" placeholder='[1, 2, 3] 或连接列表节点' @input="emitUpdate"></textarea>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ modelValue: Object })
const emit = defineEmits(['update:modelValue'])
const localData = ref({ ...props.modelValue })
if (!localData.value.operator) localData.value.operator = '>'
if (!localData.value.belongsType) localData.value.belongsType = 'belongs'
watch(() => props.modelValue, (v) => { localData.value = { ...v } }, { deep: true })
function emitUpdate() { emit('update:modelValue', localData.value) }
</script>

<style scoped>
.config-form { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 13px; font-weight: 600; color: #333; }
.form-input, .form-select, .form-textarea { padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; font-family: inherit; }
.form-input:focus, .form-select:focus, .form-textarea:focus { outline: none; border-color: #4a90e2; }
.form-textarea { resize: vertical; min-height: 60px; }
.expression-preview { padding: 10px 16px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; font-family: monospace; font-size: 14px; color: #1f2937; text-align: center; }
</style>
