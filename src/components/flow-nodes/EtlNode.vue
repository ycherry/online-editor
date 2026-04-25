<template>
  <div :class="['etl-node', nodeTypeCls, { selected }]">
    <Handle
      v-if="hasTarget"
      type="target"
      :position="Position.Left"
      id="a"
      :style="isMultiInput ? { top: '33%' } : {}"
    />
    <Handle v-if="isMultiInput" type="target" :position="Position.Left" id="b" style="top: 67%" />
    <div class="etl-node-body">
      <span class="etl-icon" :style="{ color: iconColor }">{{ nodeIcon }}</span>
      <span class="etl-label">{{ data.label }}</span>
      <span v-if="statusDot" class="status-dot" :class="statusDotClass"></span>
    </div>
    <Handle v-if="hasSource" type="source" :position="Position.Right" />
  </div>
</template>

<script setup>
  import { Handle, Position } from '@vue-flow/core'
  import { computed } from 'vue'
  import { useExecutionStore } from '@/store/execution'

  const props = defineProps({ data: Object, selected: Boolean, id: String })

  const executionStore = useExecutionStore()

  const nodeType = computed(() => props.data?.nodeType || 'etl-input')

  const META = {
    'etl-input': { icon: '→', color: '#4a90e2', label: '输入' },
    'etl-output': { icon: '←', color: '#22c55e', label: '输出' },
    'etl-join': { icon: '∞', color: '#3b82f6', label: '横向连接' },
    'etl-union': { icon: '⊕', color: '#6366f1', label: '追加合并' },
    'etl-group': { icon: '≡', color: '#f59e0b', label: '分组汇总' },
    'etl-filter': { icon: '▽', color: '#14b8a6', label: '数据筛选' },
    'etl-field': { icon: '⊞', color: '#8b5cf6', label: '字段设置' },
    'etl-pivot': { icon: '⇄', color: '#ec4899', label: '行转列' },
    'etl-dedup': { icon: '⊟', color: '#64748b', label: '去重' },
    // 高级节点
    data: { icon: '📁', color: '#4a90e2', label: '数据源' },
    'logic-if': { icon: '🔀', color: '#10b981', label: 'IF 判断' },
    calculation: { icon: '∑', color: '#8b5cf6', label: '运算' },
    'query-filter': { icon: '▽', color: '#14b8a6', label: '筛选器' },
    'processing-extreme': { icon: '↕', color: '#6366f1', label: '最值' },
    comparison: { icon: '⬡', color: '#ef4444', label: '多版本比较' },
    'output-excel': { icon: '📤', color: '#22c55e', label: 'Excel输出' },
  }

  const meta = computed(() => META[nodeType.value] || META['etl-input'])
  const nodeIcon = computed(() => meta.value.icon)
  const iconColor = computed(() => meta.value.color)
  const nodeTypeCls = computed(() => 'nt-' + nodeType.value.replace(/^etl-/, ''))

  const isMultiInput = computed(() => ['etl-join', 'etl-union'].includes(nodeType.value))
  const hasTarget = computed(() => !['etl-input', 'data'].includes(nodeType.value))
  const hasSource = computed(() => !['etl-output', 'output-excel'].includes(nodeType.value))

  const nodeStatus = computed(() => executionStore.getNodeResult(props.id)?.status)
  const statusDot = computed(() => !!nodeStatus.value)
  const statusDotClass = computed(() => ({
    'dot-running': nodeStatus.value === 'running',
    'dot-done': nodeStatus.value === 'completed',
    'dot-error': nodeStatus.value === 'error',
  }))
</script>

<style scoped>
  .etl-node {
    min-width: 120px;
    background: #fff;
    border: 1.5px solid #d1d9e6;
    border-radius: 6px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    cursor: pointer;
    transition:
      border-color 0.15s,
      box-shadow 0.15s;
    user-select: none;
  }

  .etl-node:hover {
    border-color: #4a90e2;
    box-shadow: 0 2px 8px rgba(74, 144, 226, 0.2);
  }

  .etl-node.selected {
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.3);
  }

  .etl-node-body {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
  }

  .etl-icon {
    font-size: 14px;
    font-weight: 700;
    flex-shrink: 0;
    width: 18px;
    text-align: center;
  }

  .etl-label {
    font-size: 12px;
    color: #1f2937;
    font-weight: 500;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .dot-running {
    background: #f59e0b;
    animation: pulse 0.8s infinite;
  }
  .dot-done {
    background: #22c55e;
  }
  .dot-error {
    background: #ef4444;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }
</style>
