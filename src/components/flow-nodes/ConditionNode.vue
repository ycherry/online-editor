<template>
  <div :class="['custom-node', 'condition-node', { selected }]">
    <NodeResizer :min-width="120" :min-height="60" :is-visible="selected" />
    <Handle type="target" :position="Position.Left" id="target" />
    <Handle type="source" :position="Position.Right" id="source" />
    <div class="node-header">
      <span class="node-icon">{{ getIcon() }}</span>
      <span class="node-title">{{ data.label }}</span>
      <button class="run-btn" @click.stop="$emit('run')" title="执行到此节点">▶</button>
    </div>
    <div class="node-content">
      <div class="condition-display">
        <span class="operator">{{ getOperatorDisplay() }}</span>
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
    if (props.data.nodeType === 'condition-belongs') return '∈'
    return '≈'
  }
  function getOperatorDisplay() {
    return props.data.operator || '未设置'
  }
</script>

<style scoped>
  .custom-node {
    min-width: 120px;
    width: 100%;
    background: white;
    border: 2px solid #f59e0b;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  .custom-node.selected {
    border-color: #d97706;
    box-shadow: 0 4px 16px rgba(217, 119, 6, 0.3);
  }
  .node-header {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    background: #f59e0b;
    color: white;
    font-weight: 600;
    border-radius: 6px 6px 0 0;
  }
  .node-icon {
    margin-right: 6px;
    font-size: 12px;
    font-weight: bold;
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
  .condition-display {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
  }
  .operator {
    font-size: 13px;
    font-weight: 700;
    color: #f59e0b;
  }
</style>
