<template>
  <div :class="['custom-node', 'logic-node', { selected }]">
    <NodeResizer :min-width="120" :min-height="60" :is-visible="selected" />
    <Handle type="target" :position="Position.Left" id="target" />
    <Handle type="source" :position="Position.Right" id="source" />
    <div class="node-header">
      <span class="node-icon">{{ getIcon() }}</span>
      <span class="node-title">{{ data.label }}</span>
      <button class="run-btn" @click.stop="$emit('run')" title="执行到此节点">▶</button>
    </div>
    <div class="node-content">
      <div v-if="data.nodeType === 'logic-if'" class="logic-content">
        <div v-for="(branch, idx) in (data.config?.conditions || [])" :key="idx" class="condition-item">
          <span class="condition-label">{{ idx === 0 ? 'IF' : `ELSE IF ${idx}` }}</span>
          <span class="condition-value">{{ summarizeBranch(branch) }}</span>
        </div>
        <div v-if="!data.config?.conditions?.length" class="empty-hint">点击配置条件</div>
      </div>
      <div v-else class="logic-content">
        <div class="params-count">参数数量: {{ data.params?.length || 0 }}</div>
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
  switch (props.data.nodeType) {
    case 'logic-if': return '🔀'
    case 'logic-and': return '∧'
    case 'logic-or': return '∨'
    case 'logic-nor': return '⊽'
    default: return '🔀'
  }
}
function summarizeBranch(branch) {
  if (!branch?.rules?.length) return '...'
  return branch.rules.map((r, i) => {
    const part = `${r.field || '?'} ${r.operator || '='} ${r.value !== '' ? r.value : '?'}`
    if (i < branch.rules.length - 1) return `${part} ${r.logic === '||' ? 'OR' : 'AND'}`
    return part
  }).join(' ')
}
</script>

<style scoped>
.custom-node {
  min-width: 120px; width: 100%; background: white; border: 2px solid #10b981;
  border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,.1); transition: all .2s;
}
.custom-node.selected { border-color: #059669; box-shadow: 0 4px 16px rgba(5,150,105,.3); }
.node-header {
  display: flex; align-items: center; padding: 10px 12px;
  background: #10b981; color: white; font-weight: 600; border-radius: 6px 6px 0 0;
}
.node-icon { margin-right: 6px; font-size: 12px; font-weight: bold; }
.node-title { font-size: 11px; flex: 1; }
.run-btn {
  background: rgba(255,255,255,.2); border: 1px solid rgba(255,255,255,.3);
  color: white; border-radius: 4px; padding: 2px 6px; font-size: 11px; cursor: pointer; margin-left: 6px;
}
.run-btn:hover { background: rgba(255,255,255,.35); }
.node-content { padding: 10px 12px; }
.logic-content { min-height: 32px; }
.condition-item {
  display: flex; flex-direction: column; padding: 4px 6px;
  background: #f0fdf4; border-radius: 4px; font-size: 11px; margin-bottom: 4px;
}
.condition-label { color: #10b981; font-weight: 600; margin-bottom: 2px; }
.condition-value { color: #333; }
.params-count { font-size: 12px; color: #666; }
.empty-hint { font-size: 11px; color: #999; font-style: italic; }
</style>
