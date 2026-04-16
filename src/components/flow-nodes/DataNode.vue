<template>
  <div :class="['custom-node', 'data-node', { selected }]">
    <NodeResizer :min-width="120" :min-height="60" :is-visible="selected" />
    <Handle type="source" :position="Position.Right" />
    <div class="node-header">
      <span class="node-icon">📁</span>
      <span class="node-title">{{ data.label }}</span>
      <button class="run-btn" @click.stop="$emit('run')" title="执行到此节点">▶</button>
    </div>
    <div class="node-content">
      <div class="node-info">
        <div v-if="data.fileName" class="info-item">
          <span class="label">文件:</span>
          <span class="value">{{ data.fileName }}</span>
        </div>
        <div v-if="data.totalRows" class="info-item">
          <span class="label">行数:</span>
          <span class="value">{{ data.totalRows }}</span>
        </div>
        <div v-if="data.totalCols" class="info-item">
          <span class="label">列数:</span>
          <span class="value">{{ data.totalCols }}</span>
        </div>
        <div v-if="!data.fileName" class="empty-hint">点击配置数据源</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Handle, Position } from '@vue-flow/core'
import { NodeResizer } from '@vue-flow/node-resizer'
defineProps({ data: Object, selected: Boolean })
defineEmits(['run'])
</script>

<style scoped>
.custom-node {
  min-width: 120px;
  width: 100%;
  background: white;
  border: 2px solid #4a90e2;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,.1);
  transition: all .2s;
}
.custom-node.selected { border-color: #2563eb; box-shadow: 0 4px 16px rgba(37,99,235,.3); }
.node-header {
  display: flex; align-items: center; padding: 10px 12px;
  background: #4a90e2; color: white; font-weight: 600;
  border-radius: 6px 6px 0 0;
}
.node-icon { margin-right: 6px; font-size: 12px; }
.node-title { font-size: 11px; flex: 1; }
.run-btn {
  background: rgba(255,255,255,.2); border: 1px solid rgba(255,255,255,.3);
  color: white; border-radius: 4px; padding: 2px 6px; font-size: 11px;
  cursor: pointer; margin-left: 6px;
}
.run-btn:hover { background: rgba(255,255,255,.35); }
.node-content { padding: 10px 12px; }
.node-info { display: flex; flex-direction: column; gap: 4px; }
.info-item { display: flex; justify-content: space-between; font-size: 11px; }
.info-item .label { color: #666; }
.info-item .value { color: #333; font-weight: 500; }
.empty-hint { font-size: 11px; color: #999; font-style: italic; }
</style>
