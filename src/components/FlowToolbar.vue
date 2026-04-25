<template>
  <div class="flow-toolbar">
    <div class="toolbar-left">
      <h2 class="toolbar-title">🔧 流程编辑器</h2>
      <span v-if="currentWorkflowName" class="current-workflow">{{ currentWorkflowName }}</span>
    </div>
    <div class="toolbar-actions">
      <button class="toolbar-btn" @click="$emit('new')"><span>📄</span> 新建</button>
      <button class="toolbar-btn btn-save" @click="$emit('save')"><span>💾</span> 保存</button>
      <button class="toolbar-btn" @click="$emit('load')"><span>📂</span> 加载</button>
      <button class="toolbar-btn" @click="$emit('export')"><span>📤</span> 导出</button>
      <button class="toolbar-btn" @click="$emit('import')"><span>📥</span> 导入</button>
      <div class="toolbar-divider"></div>
      <button class="toolbar-btn btn-run" @click="$emit('run')"><span>▶️</span> 执行</button>
      <button class="toolbar-btn btn-clear" @click="$emit('clear')"><span>🗑️</span> 清空</button>
    </div>
  </div>
</template>

<script setup>
  defineProps({ currentWorkflowName: String })
  defineEmits(['new', 'save', 'load', 'export', 'import', 'run', 'clear'])
</script>

<style scoped>
  .flow-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 20px;
    background: white;
    border-bottom: 1px solid #e0e0e0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    flex-shrink: 0;
  }
  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .toolbar-title {
    margin: 0;
    font-size: 17px;
    font-weight: 600;
    color: #333;
  }
  .current-workflow {
    font-size: 12px;
    color: #666;
    padding: 3px 10px;
    background: #f0f7ff;
    border-radius: 10px;
    border: 1px solid #d0e7ff;
  }
  .toolbar-actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .toolbar-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 7px 12px;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    color: #374151;
    transition: all 0.2s;
  }
  .toolbar-btn:hover {
    background: #f9fafb;
    border-color: #4a90e2;
    color: #4a90e2;
  }
  .btn-save {
    background: #4a90e2;
    color: white;
    border-color: #4a90e2;
  }
  .btn-save:hover {
    background: #357abd;
    border-color: #357abd;
    color: white;
  }
  .btn-run {
    background: #10b981;
    color: white;
    border-color: #10b981;
  }
  .btn-run:hover {
    background: #059669;
    border-color: #059669;
    color: white;
  }
  .btn-clear {
    color: #ef4444;
    border-color: #fecaca;
  }
  .btn-clear:hover {
    background: #fef2f2;
    border-color: #ef4444;
  }
  .toolbar-divider {
    width: 1px;
    height: 24px;
    background: #e5e7eb;
    margin: 0 2px;
  }
</style>
