<template>
  <div class="config-form">
    <div class="empty-state">
      <div class="empty-icon">⚙️</div>
      <p>该节点类型暂无专属配置面板</p>
      <p class="hint">直接使用画布连线即可</p>
    </div>
  </div>
</template>

<script setup>
  defineProps({ modelValue: Object })
  const emit = defineEmits(['update:modelValue'])
</script>

<style scoped>
  .config-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .empty-state {
    text-align: center;
    padding: 24px;
    color: #6b7280;
  }
  .empty-icon {
    font-size: 32px;
    margin-bottom: 8px;
  }
  .empty-state p {
    margin: 4px 0;
    font-size: 13px;
  }
  .empty-state .hint {
    font-size: 12px;
    color: #9ca3af;
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
  .form-input {
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 13px;
  }
</style>
