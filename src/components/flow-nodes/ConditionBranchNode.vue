<template>
  <div :class="['custom-node', 'branch-node', { selected }]">
    <NodeResizer :min-width="220" :min-height="80" :is-visible="selected" />

    <!-- Single input handle on the left, vertically centered -->
    <Handle type="target" :position="Position.Left" id="input" />

    <!-- One source handle per branch, positioned at each branch row's vertical center.
         HEADER_H=34 (8px padding×2 + 18px line-height), BRANCH_ROW_H=28 -->
    <Handle
      v-for="(branch, idx) in displayBranches"
      :key="'h-' + branch.id"
      type="source"
      :position="Position.Right"
      :id="branch.id"
      :style="{ top: (34 + idx * 28 + 14) + 'px' }"
    />

    <!-- ETL-style header row -->
    <div class="etl-node-body">
      <span class="etl-icon" style="color: #8b5cf6">⑂</span>
      <span class="etl-label">{{ data.label }}</span>
    </div>

    <!-- Branch rows -->
    <div class="branch-list">
      <div
        v-for="(branch, idx) in displayBranches"
        :key="branch.id"
        class="branch-row"
      >
        <span :class="['branch-tag', branch.isElse ? 'tag-else' : 'tag-if']">
          {{ branchLabel(idx, branch.isElse) }}
        </span>
        <span class="branch-cond">{{ branch.summary }}</span>
      </div>
      <div v-if="!displayBranches.length" class="empty-hint">点击配置条件</div>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { Handle, Position } from '@vue-flow/core'
  import { NodeResizer } from '@vue-flow/node-resizer'

  const props = defineProps({ data: Object, selected: Boolean })

  const displayBranches = computed(() => {
    const cfg = props.data?.config || {}
    const list = (cfg.branches || []).map((b, idx) => ({
      id: b.id || `branch-${idx}`,
      isElse: false,
      summary: summarize(b.rules),
    }))
    if (cfg.hasElse) {
      list.push({ id: 'branch-else', isElse: true, summary: '其他情况' })
    }
    return list
  })

  function branchLabel(idx, isElse) {
    if (isElse) return 'ELSE'
    if (idx === 0) return 'IF'
    return `ELSE IF ${idx}`
  }

  function summarize(rules) {
    if (!rules || !rules.length) return '未配置条件'
    return rules
      .map((r, i) => {
        const part = `${r.field || '?'} ${r.operator || '='} ${r.value !== undefined ? r.value : '?'}`
        if (i < rules.length - 1) return `${part} ${r.logic === '||' ? 'OR' : 'AND'}`
        return part
      })
      .join(' ')
  }
</script>

<style scoped>
  .custom-node {
    min-width: 200px;
    width: 100%;
    background: #fff;
    border: 1.5px solid #d1d9e6;
    border-radius: 6px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    cursor: pointer;
    transition: border-color 0.15s, box-shadow 0.15s;
    user-select: none;
  }
  .custom-node:hover {
    border-color: #8b5cf6;
    box-shadow: 0 2px 8px rgba(139, 92, 246, 0.2);
  }
  .custom-node.selected {
    border-color: #8b5cf6;
    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.3);
  }
  .etl-node-body {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-bottom: 1px solid #f0f0f0;
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
  .branch-list {
    padding: 2px 0;
  }
  .branch-row {
    display: flex;
    align-items: center;
    height: 28px;
    padding: 0 12px;
    gap: 6px;
    border-bottom: 1px solid #f3f4f6;
  }
  .branch-row:last-child {
    border-bottom: none;
  }
  .branch-tag {
    font-size: 10px;
    font-weight: 700;
    padding: 1px 5px;
    border-radius: 3px;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .tag-if {
    background: #ede9fe;
    color: #7c3aed;
  }
  .tag-else {
    background: #fce7f3;
    color: #be185d;
  }
  .branch-cond {
    font-size: 11px;
    color: #6b7280;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .empty-hint {
    font-size: 11px;
    color: #9ca3af;
    padding: 6px 12px;
    font-style: italic;
  }
</style>
