<template>
  <div class="config-form">
    <!-- 查询筛选器 -->
    <template v-if="localData.nodeType === 'query-filter'">
      <div class="form-group">
        <label class="form-label">数据源</label>
        <input
          v-model="localData.dataSource"
          type="text"
          class="form-input"
          placeholder="连接数据节点"
          @input="emitUpdate"
        />
      </div>
      <div class="form-group">
        <label class="form-label">筛选条件</label>
        <textarea
          v-model="localData.condition"
          class="form-textarea"
          rows="4"
          placeholder="示例：单价 > 100 AND 供应商 == '供应商甲'"
          @input="emitUpdate"
        ></textarea>
        <p class="hint-text">支持运算符：&gt; &lt; &gt;= &lt;= == != AND OR contains</p>
      </div>
      <div class="form-group">
        <label class="form-label">返回列（留空返回全部）</label>
        <input
          v-model="localData.columns"
          type="text"
          class="form-input"
          placeholder="列名逗号分隔，留空返回全部"
          @input="emitUpdate"
        />
      </div>
    </template>

    <!-- 条件查询 -->
    <template v-else-if="localData.nodeType === 'query-condition'">
      <div class="form-group">
        <label class="form-label">数据源</label>
        <input
          v-model="localData.dataSource"
          type="text"
          class="form-input"
          placeholder="连接数据节点"
          @input="emitUpdate"
        />
      </div>
      <div class="form-group">
        <label class="form-label">查询字段</label>
        <input
          v-model="localData.field"
          type="text"
          class="form-input"
          placeholder="字段名称"
          @input="emitUpdate"
        />
      </div>
      <div class="form-group">
        <label class="form-label">查询值</label>
        <input
          v-model="localData.value"
          type="text"
          class="form-input"
          placeholder="要查询的值"
          @input="emitUpdate"
        />
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

    <!-- 后端查询 -->
    <template v-else-if="localData.nodeType === 'query-api'">
      <div class="info-box">
        取上游数据的<strong>第一行</strong>，按字段映射自动调用后端价格接口，返回匹配的价格数据。
      </div>

      <div class="section-title">字段映射（输入字段 → API 参数名）</div>
      <div class="mappings-list">
        <div v-for="(m, i) in localData.fieldMappings || []" :key="i" class="mapping-row">
          <input
            v-model="m.inputField"
            class="map-input"
            placeholder="输入字段名（如：三级专业）"
            @input="emitUpdate"
          />
          <span class="arrow">→</span>
          <input
            v-model="m.apiParam"
            class="map-input"
            placeholder="API参数名（如：thirdCategory）"
            @input="emitUpdate"
          />
          <button class="btn-remove-map" @click="removeMapping(i)">×</button>
        </div>
        <button class="btn-add-map" @click="addMapping">+ 添加映射</button>
      </div>
    </template>

    <!-- 字段提取 -->
    <template v-else-if="localData.nodeType === 'query-field'">
      <div class="info-box">
        从上游表格数据中提取指定列的数值，输出为数组（可接数据处理节点）
        或仅取第一行的值（标量，可直接接输出节点作为单价）。
      </div>
      <div class="form-group">
        <label class="form-label">提取列名</label>
        <input
          v-model="localData.extractField"
          type="text"
          class="form-input"
          placeholder="如：综合单价"
          @input="emitUpdate"
        />
      </div>
      <div class="form-group">
        <label class="form-label">提取模式</label>
        <select v-model="localData.extractFirst" class="form-select" @change="emitUpdate">
          <option :value="false">全部行（数组，用于均值/最值等）</option>
          <option :value="true">仅第一行（标量，直接作为单价）</option>
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
  if (!localData.value.fieldMappings) localData.value.fieldMappings = []
  if (localData.value.extractFirst === undefined) localData.value.extractFirst = false

  watch(
    () => props.modelValue,
    (v) => {
      localData.value = {
        matchMode: 'exact',
        fieldMappings: [],
        extractFirst: false,
        ...v,
      }
    },
    { deep: true }
  )

  function emitUpdate() {
    emit('update:modelValue', localData.value)
  }

  function addMapping() {
    if (!localData.value.fieldMappings) localData.value.fieldMappings = []
    localData.value.fieldMappings.push({ inputField: '', apiParam: '' })
    emitUpdate()
  }
  function removeMapping(i) {
    localData.value.fieldMappings.splice(i, 1)
    emitUpdate()
  }
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
    color: #333;
  }
  .section-title {
    font-size: 13px;
    font-weight: 700;
    color: #1f2937;
    padding-bottom: 4px;
    border-bottom: 1px solid #e5e7eb;
  }
  .form-input,
  .form-select,
  .form-textarea {
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 13px;
    font-family: inherit;
  }
  .form-input:focus,
  .form-select:focus,
  .form-textarea:focus {
    outline: none;
    border-color: #14b8a6;
  }
  .form-textarea {
    resize: vertical;
    min-height: 80px;
    font-family: monospace;
  }
  .hint-text {
    font-size: 11px;
    color: #6b7280;
    margin: 0;
    font-style: italic;
  }
  .info-box {
    padding: 8px 12px;
    background: #f0fdfa;
    border-left: 3px solid #14b8a6;
    border-radius: 4px;
    font-size: 12px;
    color: #134e4a;
    line-height: 1.5;
  }
  .mappings-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .mapping-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .map-input {
    flex: 1;
    padding: 6px 10px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 12px;
  }
  .map-input:focus {
    outline: none;
    border-color: #14b8a6;
  }
  .arrow {
    color: #6b7280;
    font-size: 14px;
    flex-shrink: 0;
  }
  .btn-remove-map {
    background: none;
    border: none;
    color: #ef4444;
    cursor: pointer;
    font-size: 16px;
    padding: 0 4px;
    flex-shrink: 0;
  }
  .btn-add-map {
    align-self: flex-start;
    background: #f0fdfa;
    border: 1px dashed #14b8a6;
    color: #0d9488;
    border-radius: 6px;
    padding: 5px 12px;
    font-size: 12px;
    cursor: pointer;
  }
  .btn-add-map:hover {
    background: #ccfbf1;
  }
</style>
