<template>
  <div :class="['custom-node', 'processing-node', { selected }]">
    <NodeResizer :min-width="120" :min-height="60" :is-visible="selected" />
    <Handle type="target" :position="Position.Left" id="target" />
    <Handle type="source" :position="Position.Right" id="source" />
    <div class="node-header">
      <span class="node-icon">{{ getIcon() }}</span>
      <span class="node-title">{{ data.label }}</span>
      <button class="run-btn" @click.stop="$emit('run')" title="执行到此节点">▶</button>
    </div>
    <div class="node-content">
      <div class="processing-info">
        <div class="method-display">{{ getMethodLabel() }}</div>
        <div v-if="data.result !== undefined && data.result !== null" class="node-result">
          <span class="result-label">结果: </span>
          <span class="result-value">{{ formatResult(data.result) }}</span>
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
  const icons = {
    'processing-extreme': '📊', 'processing-average': '📉',
    'processing-interpolation': '📈', 'processing-price': '💰',
  }
  return icons[props.data.nodeType] || '📊'
}
function getMethodLabel() {
  const d = props.data
  if (d.nodeType === 'processing-extreme') {
    return { max:'最大值',min:'最小值',median:'中位数',second_low:'次低值',second_high:'次高值' }[d.method] || d.method
  }
  if (d.nodeType === 'processing-average') {
    return d.method === 'arithmetic' ? '算术平均' : '加权平均'
  }
  if (d.nodeType === 'processing-interpolation') {
    return { regression:'回归插值',nearest:'就近插值' }[d.method] || d.method
  }
  return '价格调整'
}
function formatResult(result) {
  if (typeof result === 'number') return result.toFixed(2)
  return result
}
</script>

<style scoped>
.custom-node {
  min-width: 120px; width: 100%; background: white; border: 2px solid #6366f1;
  border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,.1);
}
.custom-node.selected { border-color: #4f46e5; box-shadow: 0 4px 16px rgba(79,70,229,.3); }
.node-header {
  display: flex; align-items: center; padding: 10px 12px;
  background: #6366f1; color: white; font-weight: 600; border-radius: 6px 6px 0 0;
}
.node-icon { margin-right: 6px; font-size: 12px; }
.node-title { font-size: 11px; flex: 1; }
.run-btn {
  background: rgba(255,255,255,.2); border: 1px solid rgba(255,255,255,.3);
  color: white; border-radius: 4px; padding: 2px 6px; font-size: 11px; cursor: pointer; margin-left: 6px;
}
.run-btn:hover { background: rgba(255,255,255,.35); }
.node-content { padding: 10px 12px; }
.processing-info { text-align: center; }
.method-display { font-size: 12px; color: #666; font-weight: 500; }
.node-result { margin-top: 6px; padding-top: 6px; border-top: 1px solid #e5e7eb; }
.result-label { font-size: 11px; color: #6b7280; }
.result-value { font-size: 12px; font-weight: 700; color: #10b981; font-family: monospace; }
</style>
