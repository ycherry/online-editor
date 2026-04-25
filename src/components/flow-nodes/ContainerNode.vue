<template>
  <div :class="['custom-node', 'container-node', { selected }]">
    <NodeResizer :min-width="120" :min-height="60" :is-visible="selected" />
    <Handle type="target" :position="Position.Left" id="target" />
    <Handle type="source" :position="Position.Right" id="source" />
    <div class="node-header">
      <span class="node-icon">{{ getIcon() }}</span>
      <span class="node-title">{{ data.label }}</span>
      <button class="run-btn" @click.stop="$emit('run')" title="执行到此节点">▶</button>
    </div>
    <div class="node-content">
      <div v-if="data.nodeType === 'container-list'" class="container-info">
        <div class="info-item">
          <span class="label">元素数:</span
          ><span class="value">{{ data.elements?.length || 0 }}</span>
        </div>
      </div>
      <div v-else class="container-info">
        <div class="info-item">
          <span class="label">键值对:</span><span class="value">{{ data.pairs?.length || 0 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { Handle, Position } from '@vue-flow/core'
  import { NodeResizer } from '@vue-flow/node-resizer'
  const props = defineProps({ data: Object, selected: Boolean })
  defineEmits(['run'])
  function getIcon() {
    return props.data.nodeType === 'container-list' ? '📋' : '📖'
  }
</script>

<style scoped>
  .custom-node {
    min-width: 120px;
    width: 100%;
    background: white;
    border: 2px solid #ec4899;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  .custom-node.selected {
    border-color: #db2777;
    box-shadow: 0 4px 16px rgba(219, 39, 119, 0.3);
  }
  .node-header {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    background: #ec4899;
    color: white;
    font-weight: 600;
    border-radius: 6px 6px 0 0;
  }
  .node-icon {
    margin-right: 6px;
    font-size: 12px;
  }
  .node-title {
    font-size: 11px;
    flex: 1;
  }
  .run-btn {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 11px;
    cursor: pointer;
    margin-left: 6px;
  }
  .run-btn:hover {
    background: rgba(255, 255, 255, 0.35);
  }
  .node-content {
    padding: 10px 12px;
  }
  .container-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .info-item {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
  }
  .info-item .label {
    color: #666;
  }
  .info-item .value {
    color: #333;
    font-weight: 500;
  }
</style>
