<template>
  <div class="config-form">
    <!-- 最值 -->
    <template v-if="localData.nodeType === 'processing-extreme'">
      <div class="form-group">
        <label class="form-label">处理方法</label>
        <select v-model="localData.method" class="form-select" @change="emitUpdate">
          <option value="max">最大值</option>
          <option value="min">最小值</option>
          <option value="median">中位数</option>
          <option value="second_low">次低值</option>
          <option value="second_high">次高值</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">数据列表</label>
        <input
          v-model="localData.list"
          type="text"
          class="form-input"
          placeholder="连接数据源或输入列表"
          @input="emitUpdate"
        />
      </div>
    </template>
    <!-- 平均值 -->
    <template v-else-if="localData.nodeType === 'processing-average'">
      <div class="form-group">
        <label class="form-label">计算方法</label>
        <select v-model="localData.method" class="form-select" @change="emitUpdate">
          <option value="arithmetic">算术平均</option>
          <option value="weighted">加权平均</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">数值列表</label>
        <input
          v-model="localData.values"
          type="text"
          class="form-input"
          placeholder="连接数据源"
          @input="emitUpdate"
        />
      </div>
      <div v-if="localData.method === 'weighted'" class="form-group">
        <label class="form-label">权重列表</label>
        <input
          v-model="localData.weights"
          type="text"
          class="form-input"
          placeholder="输入权重数据"
          @input="emitUpdate"
        />
      </div>
    </template>
    <!-- 缺失值处理 -->
    <template v-else-if="localData.nodeType === 'processing-interpolation'">
      <div class="form-group">
        <label class="form-label">插值方法</label>
        <select v-model="localData.method" class="form-select" @change="emitUpdate">
          <option value="regression">回归插值</option>
          <option value="nearest">就近插值</option>
        </select>
      </div>
      <div class="info-box">
        <p>{{ getInterpolationDesc() }}</p>
      </div>
    </template>
    <!-- 价格调整 -->
    <template v-else-if="localData.nodeType === 'processing-price'">
      <div class="form-group">
        <label class="form-label">原始数据列表</label>
        <input
          v-model="localData.data"
          type="text"
          class="form-input"
          placeholder="连接原始数据源"
          @input="emitUpdate"
        />
      </div>
      <div class="form-group">
        <label class="form-label">大宗材料价格数据</label>
        <input
          v-model="localData.priceData"
          type="text"
          class="form-input"
          placeholder="连接价格数据源"
          @input="emitUpdate"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
  import { ref, watch } from 'vue'
  const props = defineProps({ modelValue: Object })
  const emit = defineEmits(['update:modelValue'])
  const localData = ref({ ...props.modelValue })
  if (!localData.value.method)
    localData.value.method =
      localData.value.nodeType === 'processing-average'
        ? 'arithmetic'
        : localData.value.nodeType === 'processing-interpolation'
          ? 'regression'
          : 'max'
  watch(
    () => props.modelValue,
    (v) => {
      localData.value = { ...v }
    },
    { deep: true }
  )
  function emitUpdate() {
    emit('update:modelValue', localData.value)
  }
  function getInterpolationDesc() {
    const descs = {
      regression: '使用线性回归分析填充缺失数据，适用于有明显趋势的序列',
      nearest: '使用距离最近的已知值填充缺失数据，简单快速',
    }
    return descs[localData.value.method] || ''
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
  .form-input,
  .form-select {
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 13px;
  }
  .form-input:focus,
  .form-select:focus {
    outline: none;
    border-color: #6366f1;
  }
  .info-box {
    padding: 12px;
    background: #f0f9ff;
    border-left: 3px solid #6366f1;
    border-radius: 4px;
    font-size: 12px;
    color: #1e40af;
  }
  .info-box p {
    margin: 0;
  }
</style>
