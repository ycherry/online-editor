<template>
  <div class="config-form">
    <!-- 查询筛选器 -->
    <template v-if="localData.nodeType === 'query-filter'">
      <div class="form-group">
        <label class="form-label">数据源</label>
        <input v-model="localData.dataSource" type="text" class="form-input" placeholder="连接数据节点" @input="emitUpdate" />
      </div>
      <div class="form-group">
        <label class="form-label">筛选条件</label>
        <textarea v-model="localData.condition" class="form-textarea" rows="4" placeholder="示例：单价 > 100 AND 供应商 == '供应商甲'" @input="emitUpdate"></textarea>
        <p class="hint-text">支持运算符：&gt; &lt; &gt;= &lt;= == != AND OR contains</p>
      </div>
      <div class="form-group">
        <label class="form-label">返回列（留空返回全部）</label>
        <input v-model="localData.columns" type="text" class="form-input" placeholder="列名逗号分隔，留空返回全部" @input="emitUpdate" />
      </div>
    </template>
    <!-- 条件查询 -->
    <template v-else-if="localData.nodeType === 'query-condition'">
      <div class="form-group">
        <label class="form-label">数据源</label>
        <input v-model="localData.dataSource" type="text" class="form-input" placeholder="连接数据节点" @input="emitUpdate" />
      </div>
      <div class="form-group">
        <label class="form-label">查询字段</label>
        <input v-model="localData.field" type="text" class="form-input" placeholder="字段名称" @input="emitUpdate" />
      </div>
      <div class="form-group">
        <label class="form-label">查询值</label>
        <input v-model="localData.value" type="text" class="form-input" placeholder="要查询的值" @input="emitUpdate" />
      </div>
      <div class="form-group">
        <label class="form-label">匹配模式</label>
        <select v-model="localData.matchMode" class="form-select" @change="emitUpdate">
          <option value="exact">精确匹配</option>
          <option value="contains">包含</option>
          <option value="startsWith">以...开头</option>
          <option value="endsWith">以...结尾</option>
        </select>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ modelValue: Object })
const emit = defineEmits(['update:modelValue'])
const localData = ref({ ...props.modelValue })
if (!localData.value.matchMode) localData.value.matchMode = 'exact'
watch(() => props.modelValue, (v) => { localData.value = { ...v } }, { deep: true })
function emitUpdate() { emit('update:modelValue', localData.value) }
</script>

<style scoped>
.config-form { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 13px; font-weight: 600; color: #333; }
.form-input, .form-select, .form-textarea { padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; font-family: inherit; }
.form-input:focus, .form-select:focus, .form-textarea:focus { outline: none; border-color: #14b8a6; }
.form-textarea { resize: vertical; min-height: 80px; font-family: monospace; }
.hint-text { font-size: 11px; color: #6b7280; margin: 0; font-style: italic; }
</style>
