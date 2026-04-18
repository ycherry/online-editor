<template>
  <div :class="['custom-node', 'output-node', { selected }]">
    <NodeResizer :min-width="120" :min-height="60" :is-visible="selected" />
    <Handle type="target" :position="Position.Left" />
    <div class="node-header">
      <span class="node-icon">📤</span>
      <span class="node-title">{{ data.label }}</span>
      <button class="run-btn" @click.stop="$emit('run')" title="执行到此节点">▶</button>
    </div>
    <div class="node-content">
      <div class="node-info">
        <div v-if="outputHeaders.length > 0" class="columns-wrap">
          <span v-for="col in outputHeaders" :key="col" class="col-tag">{{ col }}</span>
        </div>
        <div v-else class="empty-hint">连接数据节点后执行</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Handle, Position } from '@vue-flow/core'
import { NodeResizer } from '@vue-flow/node-resizer'
import { useExecutionStore } from '@/store/execution'
import { computed } from 'vue'

const props = defineProps({ data: Object, selected: Boolean, id: String })
defineEmits(['run'])

const executionStore = useExecutionStore()

const outputHeaders = computed(() => {
  const result = executionStore.getNodeResult(props.id)
  return result?.output?.headers ?? []
})
</script>

<style scoped>
.custom-node {
  min-width: 120px;
  width: 100%;
  background: white;
  border: 2px solid #22c55e;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,.1);
  transition: all .2s;
}
.custom-node.selected { border-color: #16a34a; box-shadow: 0 4px 16px rgba(22,163,74,.3); }
.node-header {
  display: flex; align-items: center; padding: 10px 12px;
  background: #22c55e; color: white; font-weight: 600;
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
.columns-wrap { display: flex; flex-wrap: wrap; gap: 4px; }
.col-tag {
  padding: 2px 7px; background: #dcfce7; border: 1px solid #86efac;
  border-radius: 10px; font-size: 10px; color: #166534;
}
.empty-hint { font-size: 11px; color: #999; font-style: italic; }
</style>
