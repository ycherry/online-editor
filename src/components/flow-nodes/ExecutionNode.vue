<template>
  <div :class="['custom-node', 'execution-node', { selected }]">
    <NodeResizer :min-width="120" :min-height="60" :is-visible="selected" />
    <Handle type="target" :position="Position.Left" id="target" />
    <Handle type="source" :position="Position.Right" id="source" />
    <div class="node-header">
      <span class="node-icon">{{ getIcon() }}</span>
      <span class="node-title">{{ data.label }}</span>
      <button class="run-btn" @click.stop="$emit('run')" title="执行到此节点">▶</button>
    </div>
    <div class="node-content">
      <div class="execution-info">
        <div v-if="data.nodeType === 'execution-dowhile'" class="info-text">
          循环执行直到条件满足
        </div>
        <div v-else class="info-text">遍历列表中每个元素</div>
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
    return props.data.nodeType === 'execution-dowhile' ? '🔁' : '↻'
  }
</script>

<style scoped>
  .custom-node {
    min-width: 120px;
    width: 100%;
    background: white;
    border: 2px solid #06b6d4;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  .custom-node.selected {
    border-color: #0891b2;
    box-shadow: 0 4px 16px rgba(8, 145, 178, 0.3);
  }
  .node-header {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    background: #06b6d4;
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
  .execution-info {
    text-align: center;
  }
  .info-text {
    font-size: 12px;
    color: #666;
  }
</style>
