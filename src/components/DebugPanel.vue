<template>
  <div class="debug-panel">
    <div class="debug-header">
      <div class="debug-title">🐛 调试控制台</div>
      <div class="mode-selector">
        <button :class="['mode-btn', mode === 'normal' && 'active']" @click="$emit('set-mode', 'normal')">普通</button>
        <button :class="['mode-btn', mode === 'debug' && 'active']" @click="$emit('set-mode', 'debug')">调试</button>
        <button :class="['mode-btn', mode === 'step' && 'active']" @click="$emit('set-mode', 'step')">单步</button>
      </div>
      <div class="control-btns">
        <button class="ctrl-btn run" :disabled="isRunning" @click="$emit('run')" title="运行">▶</button>
        <button class="ctrl-btn step" :disabled="isRunning && mode !== 'step'" @click="$emit('step')" title="单步">⏭</button>
        <button class="ctrl-btn cont" :disabled="!isPaused" @click="$emit('continue')" title="继续">⏩</button>
        <button class="ctrl-btn pause" :disabled="!isRunning || isPaused" @click="$emit('pause')" title="暂停">⏸</button>
        <button class="ctrl-btn stop" :disabled="!isRunning" @click="$emit('stop')" title="停止">⏹</button>
        <button class="ctrl-btn clear" @click="$emit('clear')" title="清除">🗑</button>
      </div>
    </div>
    <div class="debug-body">
      <div class="status-section">
        <div class="status-row">
          <span class="status-label">状态：</span>
          <span :class="['status-badge', statusClass]">{{ statusText }}</span>
          <span v-if="currentNodeName" class="current-node">当前：{{ currentNodeName }}</span>
        </div>
        <div v-if="isRunning" class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
      </div>
      <div class="log-section">
        <div class="section-title">执行日志</div>
        <div class="log-list" ref="logListEl">
          <div v-for="(log, i) in logs" :key="i" :class="['log-entry', 'log-' + log.level]">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-tag">{{ log.tag }}</span>
            <span class="log-msg">{{ log.message }}</span>
          </div>
          <div v-if="logs.length === 0" class="log-empty">等待执行...</div>
        </div>
      </div>
      <div v-if="mode === 'debug' && breakpoints.size > 0" class="bp-section">
        <div class="section-title">断点 ({{ breakpoints.size }})</div>
        <div class="bp-list">
          <div v-for="bp in Array.from(breakpoints)" :key="bp" class="bp-item">
            <span class="bp-dot">🔴</span>
            <span class="bp-name">{{ getNodeName(bp) }}</span>
            <button class="bp-remove" @click="$emit('remove-breakpoint', bp)">×</button>
          </div>
        </div>
        <button class="clear-bp-btn" @click="$emit('clear-breakpoints')">清除所有断点</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
const props = defineProps({
  mode: { type: String, default: 'normal' },
  isRunning: Boolean,
  isPaused: Boolean,
  progress: { type: Number, default: 0 },
  currentNodeId: String,
  breakpoints: { type: Object, default: () => new Set() },
  logs: { type: Array, default: () => [] },
  nodes: { type: Array, default: () => [] }
})
const emit = defineEmits(['run','step','continue','pause','stop','clear','set-mode','remove-breakpoint','clear-breakpoints'])
const logListEl = ref(null)
const statusText = computed(() => {
  if (props.isPaused) return '已暂停'
  if (props.isRunning) return '运行中'
  return '就绪'
})
const statusClass = computed(() => {
  if (props.isPaused) return 'paused'
  if (props.isRunning) return 'running'
  return 'idle'
})
const currentNodeName = computed(() => {
  if (!props.currentNodeId) return null
  const node = props.nodes.find(n => n.id === props.currentNodeId)
  return node?.data?.label || props.currentNodeId
})
function getNodeName(id) {
  const node = props.nodes.find(n => n.id === id)
  return node?.data?.label || id
}
</script>

<style scoped>
.debug-panel { height: 100%; display: flex; flex-direction: column; background: #1e1e2e; color: #cdd6f4; font-size: 12px; }
.debug-header { display: flex; align-items: center; gap: 10px; padding: 6px 12px; border-bottom: 1px solid #313244; flex-shrink: 0; flex-wrap: wrap; }
.debug-title { font-weight: 600; color: #cba6f7; }
.mode-selector { display: flex; gap: 2px; }
.mode-btn { padding: 3px 9px; border: 1px solid #45475a; border-radius: 4px; background: transparent; color: #cdd6f4; cursor: pointer; font-size: 11px; }
.mode-btn.active { background: #4a90e2; border-color: #4a90e2; color: white; }
.control-btns { display: flex; gap: 3px; }
.ctrl-btn { padding: 3px 8px; border: 1px solid #45475a; border-radius: 4px; background: transparent; color: #cdd6f4; cursor: pointer; font-size: 12px; }
.ctrl-btn:disabled { opacity: .4; cursor: not-allowed; }
.ctrl-btn.run { color: #a6e3a1; }
.ctrl-btn.stop { color: #f38ba8; }
.ctrl-btn.pause, .ctrl-btn.cont { color: #fab387; }
.debug-body { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
.status-section { padding: 6px 12px; border-bottom: 1px solid #313244; }
.status-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.status-label { color: #6c7086; }
.status-badge { padding: 2px 8px; border-radius: 10px; font-size: 11px; }
.status-badge.idle { background: #45475a; color: #a6adc8; }
.status-badge.running { background: #1e3a5f; color: #89b4fa; }
.status-badge.paused { background: #3d2814; color: #fab387; }
.current-node { color: #89dceb; font-size: 11px; }
.progress-bar { height: 3px; background: #313244; border-radius: 2px; overflow: hidden; }
.progress-fill { height: 100%; background: #89b4fa; transition: width .3s; }
.log-section { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
.section-title { padding: 4px 12px; font-size: 11px; color: #6c7086; border-bottom: 1px solid #313244; }
.log-list { flex: 1; overflow-y: auto; padding: 4px 0; }
.log-entry { display: flex; gap: 6px; padding: 2px 12px; }
.log-entry:hover { background: #313244; }
.log-time { color: #6c7086; flex-shrink: 0; }
.log-tag { color: #cba6f7; flex-shrink: 0; min-width: 80px; }
.log-msg { color: #cdd6f4; }
.log-entry.log-error .log-msg { color: #f38ba8; }
.log-entry.log-warn .log-msg { color: #f9e2af; }
.log-entry.log-success .log-msg { color: #a6e3a1; }
.log-empty { padding: 12px; color: #6c7086; text-align: center; }
.bp-section { border-top: 1px solid #313244; padding: 6px 12px; }
.bp-list { max-height: 100px; overflow-y: auto; margin: 4px 0; }
.bp-item { display: flex; align-items: center; gap: 6px; padding: 2px 0; }
.bp-name { flex: 1; color: #cdd6f4; }
.bp-remove { background: none; border: none; color: #f38ba8; cursor: pointer; }
.clear-bp-btn { font-size: 11px; background: none; border: 1px solid #45475a; border-radius: 4px; color: #6c7086; padding: 2px 8px; cursor: pointer; }
</style>
