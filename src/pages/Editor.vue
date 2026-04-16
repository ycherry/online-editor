<template>
  <div class="editor-page" @keydown="handleKeyDown" tabindex="0">
    <FlowToolbar @new="handleNew" @save="showSaveDialog = true" @load="showLoadDialog = true" @export="showExportDialog = true" @import="handleImport" @run="handleRun" @clear="handleClear" />
    <div class="editor-main">
      <div class="node-library">
        <div class="library-title">节点库</div>
        <div v-for="cat in nodeCategories" :key="cat.name" class="node-category">
          <div class="category-label" @click="cat.open = !cat.open">
            <span>{{ cat.icon }} {{ cat.name }}</span>
            <span>{{ cat.open ? "▾" : "▸" }}</span>
          </div>
          <div v-if="cat.open" class="category-nodes">
            <div v-for="item in cat.nodes" :key="item.type" class="node-item" draggable="true" @dragstart="onDragStart($event, item)" :style="{ borderLeftColor: item.color }">
              <span>{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="canvas-area" @drop="onDrop" @dragover.prevent>
        <VueFlow v-model:nodes="nodes" v-model:edges="edges" :connection-mode="ConnectionMode.Loose" fit-view-on-init @node-click="onNodeClick" @pane-click="onPaneClick" @node-context-menu="onNodeContextMenu" @connect="onConnect">
          <Background pattern-color="#aaa" :gap="16" />
          <Controls />
          <MiniMap />
          <template #node-data="props"><DataNode v-bind="props" @run="runSingleNode" /></template>
          <template #node-logic="props"><LogicNode v-bind="props" @run="runSingleNode" /></template>
          <template #node-condition="props"><ConditionNode v-bind="props" @run="runSingleNode" /></template>
          <template #node-calculation="props"><CalculationNode v-bind="props" @run="runSingleNode" /></template>
          <template #node-container="props"><ContainerNode v-bind="props" @run="runSingleNode" /></template>
          <template #node-execution="props"><ExecutionNode v-bind="props" @run="runSingleNode" /></template>
          <template #node-query="props"><QueryNode v-bind="props" @run="runSingleNode" /></template>
          <template #node-processing="props"><ProcessingNode v-bind="props" @run="runSingleNode" /></template>
          <template #node-comparison="props"><ComparisonNode v-bind="props" @run="runSingleNode" /></template>
        </VueFlow>
        <div v-if="contextMenu.show" class="context-menu" :style="{ top: contextMenu.y + `px`, left: contextMenu.x + `px` }" @click.stop>
          <div class="ctx-item" @click="previewContextNode">🔍 预览结果</div>
          <div class="ctx-item" @click="toggleBreakpoint">{{ executionStore.breakpoints.has(contextMenu.nodeId) ? "🔴 移除断点" : "⚪ 添加断点" }}</div>
          <div class="ctx-item danger" @click="deleteContextNode">🗑️ 删除节点</div>
        </div>
      </div>
      <div class="right-panel">
        <div class="panel-tabs">
          <button :class="[`ptab`, rightTab === `config` && `active`]" @click="rightTab = `config`">配置</button>
          <button :class="[`ptab`, rightTab === `preview` && `active`]" @click="rightTab = `preview`">预览</button>
        </div>
        <div class="panel-body">
          <div v-if="rightTab === `config`" class="config-panel">
            <div v-if="!selectedNode" class="no-selection">
              <div class="ns-icon">⚙️</div>
              <p>点击节点进行配置</p>
            </div>
            <template v-else>
              <div class="config-header">
                <div class="config-title">{{ selectedNode.data.label }}</div>
                <div class="config-type">{{ selectedNode.data.nodeType }}</div>
              </div>
              <div class="config-name">
                <label>节点名称</label>
                <input v-model="selectedNode.data.label" class="config-input" @input="onNodeDataChange" />
              </div>
              <component :is="getConfigComponent(selectedNode.data.nodeType)" v-model="selectedNode.data.config" @update:model-value="onNodeDataChange" />
            </template>
          </div>
          <NodePreviewPanel v-else :node-id="previewNodeId" :node-name="previewNodeName" :node-type="previewNodeType" :result="previewResult" />
        </div>
      </div>
    </div>
    <div :class="[`debug-wrapper`, debugOpen && `open`]">
      <div class="debug-toggle" @click="debugOpen = !debugOpen">
        <span>🐛 调试控制台</span>
        <span>{{ debugOpen ? "▾" : "▴" }}</span>
      </div>
      <div v-if="debugOpen" class="debug-content">
        <DebugPanel :mode="executionMode" :is-running="executionStore.isRunning" :is-paused="executionStore.isPaused" :progress="executionStore.progress" :current-node-id="executionStore.currentNodeId" :breakpoints="executionStore.breakpoints" :logs="debugLogs" :nodes="nodes" @run="handleRun" @step="handleStep" @continue="handleContinue" @pause="executionStore.pause()" @stop="handleStop" @clear="clearDebug" @set-mode="executionMode = $event" @remove-breakpoint="executionStore.removeBreakpoint($event)" @clear-breakpoints="executionStore.clearBreakpoints()" />
      </div>
    </div>
    <SaveWorkflowDialog :show="showSaveDialog" :workflow="currentWorkflow" :node-count="nodes.length" :edge-count="edges.length" @close="showSaveDialog = false" @save="handleSaveWorkflow" />
    <LoadWorkflowDialog :show="showLoadDialog" :workflows="workflowStore.workflows" @close="showLoadDialog = false" @select="handleLoadWorkflow" @delete="workflowStore.deleteWorkflow($event)" />
    <ExportDialog :show="showExportDialog" :nodes="nodes" :results="executionStore.nodeResults" @close="showExportDialog = false" />
    <input ref="importInput" type="file" accept=".json" style="display:none" @change="handleImportFile" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, markRaw } from "vue"
import { VueFlow, useVueFlow, ConnectionMode } from "@vue-flow/core"
import { Background } from "@vue-flow/background"
import { Controls } from "@vue-flow/controls"
import { MiniMap } from "@vue-flow/minimap"
import "@vue-flow/core/dist/style.css"
import "@vue-flow/core/dist/theme-default.css"
import "@vue-flow/node-resizer/dist/style.css"
import "@vue-flow/controls/dist/style.css"
import { useWorkflowStore } from "../store/workflow.js"
import { useExecutionStore } from "../store/execution.js"
import DataNode from "../components/flow-nodes/DataNode.vue"
import LogicNode from "../components/flow-nodes/LogicNode.vue"
import ConditionNode from "../components/flow-nodes/ConditionNode.vue"
import CalculationNode from "../components/flow-nodes/CalculationNode.vue"
import ContainerNode from "../components/flow-nodes/ContainerNode.vue"
import ExecutionNode from "../components/flow-nodes/ExecutionNode.vue"
import QueryNode from "../components/flow-nodes/QueryNode.vue"
import ProcessingNode from "../components/flow-nodes/ProcessingNode.vue"
import ComparisonNode from "../components/flow-nodes/ComparisonNode.vue"
import DataNodeConfig from "../components/flow-config/DataNodeConfig.vue"
import LogicIfNodeConfig from "../components/flow-config/LogicIfNodeConfig.vue"
import LogicNodeConfig from "../components/flow-config/LogicNodeConfig.vue"
import ConditionNodeConfig from "../components/flow-config/ConditionNodeConfig.vue"
import CalculationNodeConfig from "../components/flow-config/CalculationNodeConfig.vue"
import QueryNodeConfig from "../components/flow-config/QueryNodeConfig.vue"
import ProcessingNodeConfig from "../components/flow-config/ProcessingNodeConfig.vue"
import ContainerNodeConfig from "../components/flow-config/ContainerNodeConfig.vue"
import ExecutionNodeConfig from "../components/flow-config/ExecutionNodeConfig.vue"
import ComparisonNodeConfig from "../components/flow-config/ComparisonNodeConfig.vue"
import DefaultNodeConfig from "../components/flow-config/DefaultNodeConfig.vue"
import FlowToolbar from "../components/FlowToolbar.vue"
import SaveWorkflowDialog from "../components/SaveWorkflowDialog.vue"
import LoadWorkflowDialog from "../components/LoadWorkflowDialog.vue"
import ExportDialog from "../components/ExportDialog.vue"
import DebugPanel from "../components/DebugPanel.vue"
import NodePreviewPanel from "../components/NodePreviewPanel.vue"
import { WorkflowExecutor } from "../utils/workflowExecutor.js"

const workflowStore = useWorkflowStore()
const executionStore = useExecutionStore()
const { addNodes, addEdges, removeNodes } = useVueFlow()
const nodes = ref([])
const edges = ref([])
const selectedNode = ref(null)
const rightTab = ref("config")
const debugOpen = ref(false)
const debugLogs = ref([])
const executionMode = ref("normal")
const showSaveDialog = ref(false)
const showLoadDialog = ref(false)
const showExportDialog = ref(false)
const contextMenu = ref({ show: false, x: 0, y: 0, nodeId: null })
const importInput = ref(null)
const currentWorkflow = ref(null)
let executor = null
let nodeCounter = 0
const previewNodeId = ref(null)
const previewNodeName = ref(null)
const previewNodeType = ref(null)
const previewResult = computed(() => previewNodeId.value ? executionStore.getNodeResult(previewNodeId.value) : null)

const nodeCategories = ref([
  { name: "数据", icon: "📊", open: true, nodes: [
    { type: "data", label: "数据源", icon: "📁", color: "#4a90e2", defaultConfig: { source: "upload", data: null } }
  ]},
  { name: "逻辑", icon: "🔀", open: true, nodes: [
    { type: "logic-if", label: "IF 判断", icon: "🔀", color: "#10b981", defaultConfig: { conditions: [], elseResult: null } },
    { type: "logic-and", label: "AND", icon: "∧", color: "#10b981", defaultConfig: { params: [] } },
    { type: "logic-or", label: "OR", icon: "∨", color: "#10b981", defaultConfig: { params: [] } },
    { type: "logic-nor", label: "NOR", icon: "⊽", color: "#10b981", defaultConfig: { params: [] } }
  ]},
  { name: "条件", icon: "⚖️", open: false, nodes: [
    { type: "condition-belongs", label: "集合判断", icon: "∈", color: "#f59e0b", defaultConfig: { conditionType: "belongs", element: "", container: "" } },
    { type: "condition-compare", label: "比较", icon: "≤", color: "#f59e0b", defaultConfig: { conditionType: "compare", operator: "==", left: "", right: "" } }
  ]},
  { name: "运算", icon: "🔢", open: false, nodes: [
    { type: "calculation", label: "运算", icon: "∑", color: "#8b5cf6", defaultConfig: { operator: "+", params: [] } }
  ]},
  { name: "容器", icon: "📦", open: false, nodes: [
    { type: "container-list", label: "列表", icon: "[]", color: "#ec4899", defaultConfig: { containerType: "list", elements: [] } },
    { type: "container-dict", label: "字典", icon: "{}", color: "#ec4899", defaultConfig: { containerType: "dict", pairs: [] } }
  ]},
  { name: "执行", icon: "⚙️", open: false, nodes: [
    { type: "execution-do", label: "DO...WHILE", icon: "↺", color: "#06b6d4", defaultConfig: { loopType: "do-while", start: 0, end: 10, condition: "" } },
    { type: "execution-for", label: "FOR 循环", icon: "→", color: "#06b6d4", defaultConfig: { loopType: "for", list: "", itemName: "item", indexName: "i" } }
  ]},
  { name: "查询", icon: "🔍", open: false, nodes: [
    { type: "query-filter", label: "筛选器", icon: "▽", color: "#14b8a6", defaultConfig: { queryType: "filter", condition: "" } },
    { type: "query-condition", label: "条件查询", icon: "?", color: "#14b8a6", defaultConfig: { queryType: "condition", field: "", value: "", matchMode: "exact" } }
  ]},
  { name: "数据处理", icon: "📈", open: false, nodes: [
    { type: "processing-extreme", label: "最值", icon: "↕", color: "#6366f1", defaultConfig: { nodeType: "processing-extreme", method: "max" } },
    { type: "processing-average", label: "平均值", icon: "Ā", color: "#6366f1", defaultConfig: { nodeType: "processing-average", method: "arithmetic" } },
    { type: "processing-interpolation", label: "缺失处理", icon: "~", color: "#6366f1", defaultConfig: { nodeType: "processing-interpolation", method: "regression" } },
    { type: "processing-price", label: "价格调整", icon: "¥", color: "#6366f1", defaultConfig: { method: "price", adjustType: "index", indexValue: 1 } }
  ]},
  { name: "多版本比较", icon: "🆚", open: false, nodes: [
    { type: "comparison", label: "多版本比较", icon: "⬡", color: "#ef4444", defaultConfig: { analysisType: "cost", dataList: [] } }
  ]}
])

function getConfigComponent(nodeType) {
  const map = {
    "data": DataNodeConfig, "logic-if": LogicIfNodeConfig,
    "logic-and": LogicNodeConfig, "logic-or": LogicNodeConfig, "logic-nor": LogicNodeConfig,
    "condition-belongs": ConditionNodeConfig, "condition-compare": ConditionNodeConfig,
    "calculation": CalculationNodeConfig,
    "query-filter": QueryNodeConfig, "query-condition": QueryNodeConfig,
    "processing-extreme": ProcessingNodeConfig, "processing-average": ProcessingNodeConfig,
    "processing-interpolation": ProcessingNodeConfig, "processing-price": ProcessingNodeConfig,
    "container-list": ContainerNodeConfig, "container-dict": ContainerNodeConfig,
    "execution-do": ExecutionNodeConfig, "execution-for": ExecutionNodeConfig,
    "comparison": ComparisonNodeConfig,
  }
  return markRaw(map[nodeType] || DefaultNodeConfig)
}

function onDragStart(event, item) {
  event.dataTransfer.setData("node-type", item.type)
  event.dataTransfer.setData("node-label", item.label)
  event.dataTransfer.setData("node-color", item.color)
  event.dataTransfer.effectAllowed = "move"
}

function onDrop(event) {
  const type = event.dataTransfer.getData("node-type")
  if (!type) return
  const label = event.dataTransfer.getData("node-label")
  const color = event.dataTransfer.getData("node-color")
  const canvasEl = event.currentTarget
  const rect = canvasEl.getBoundingClientRect()
  const position = { x: event.clientX - rect.left, y: event.clientY - rect.top }
  const vfType = type.split("-")[0]
  const cat = nodeCategories.value.flatMap(c => c.nodes).find(n => n.type === type)
  const config = cat ? JSON.parse(JSON.stringify(cat.defaultConfig)) : {}
  nodeCounter++
  addNodes([{ id: `node-${Date.now()}-${nodeCounter}`, type: vfType, position, data: { label: `${label} ${nodeCounter}`, nodeType: type, color, config }, width: 140, height: 80 }])
}

function onNodeClick({ node }) {
  selectedNode.value = node
  rightTab.value = "config"
  contextMenu.value.show = false
}
function onPaneClick() { selectedNode.value = null; contextMenu.value.show = false }
function onNodeContextMenu({ event, node }) { event.preventDefault(); contextMenu.value = { show: true, x: event.clientX, y: event.clientY, nodeId: node.id } }
function onConnect(params) { addEdges([{ ...params, id: `edge-${Date.now()}` }]) }
function onNodeDataChange() {
  const idx = nodes.value.findIndex(n => n.id === selectedNode.value.id)
  if (idx !== -1) nodes.value[idx] = { ...nodes.value[idx], data: { ...selectedNode.value.data } }
}

function previewContextNode() {
  const node = nodes.value.find(n => n.id === contextMenu.value.nodeId)
  if (node) { previewNodeId.value = node.id; previewNodeName.value = node.data.label; previewNodeType.value = node.data.nodeType; rightTab.value = "preview" }
  contextMenu.value.show = false
}
function toggleBreakpoint() { executionStore.toggleBreakpoint(contextMenu.value.nodeId); contextMenu.value.show = false }
function deleteContextNode() { removeNodes([contextMenu.value.nodeId]); if (selectedNode.value?.id === contextMenu.value.nodeId) selectedNode.value = null; contextMenu.value.show = false }

function addLog(level, tag, message) {
  const time = new Date().toTimeString().slice(0, 8)
  debugLogs.value.push({ level, tag, message, time })
}

async function handleRun() {
  if (executionStore.isRunning) return
  executionStore.clearResults()
  addLog("info", "[执行]", "开始执行工作流...")
  debugOpen.value = true
  executor = new WorkflowExecutor(nodes.value, edges.value, executionStore, executionMode.value)
  try { await executor.execute(executionMode.value); addLog("success", "[完成]", "工作流执行完成") }
  catch (e) { addLog("error", "[错误]", e.message || "执行失败") }
}
async function handleStep() {
  if (!executor) { executor = new WorkflowExecutor(nodes.value, edges.value, executionStore, "step"); executor.execute("step").catch(e => addLog("error", "[错误]", e.message)) }
  else executor.step()
}
function handleContinue() { executor?.continueExecution() }
function handleStop() { executor?.stop(); executor = null; addLog("warn", "[停止]", "执行已停止") }
async function runSingleNode(nodeId) {
  const node = nodes.value.find(n => n.id === nodeId)
  if (!node) return
  addLog("info", "[单节点]", `执行：${node.data.label}`)
  const tempExecutor = new WorkflowExecutor(nodes.value, edges.value, executionStore, "normal")
  try {
    await tempExecutor.executeNode(node)
    previewNodeId.value = nodeId; previewNodeName.value = node.data.label; previewNodeType.value = node.data.nodeType; rightTab.value = "preview"
    addLog("success", "[单节点]", `完成：${node.data.label}`)
  } catch(e) { addLog("error", "[单节点]", e.message) }
}
function clearDebug() { debugLogs.value = []; executionStore.clearResults(); addLog("info", "[清除]", "已清除执行结果") }

function handleNew() {
  if (nodes.value.length > 0 && !confirm("创建新工作流将清空当前画布，确定继续？")) return
  nodes.value = []; edges.value = []; selectedNode.value = null; currentWorkflow.value = null; executionStore.clearResults(); debugLogs.value = []
}
function handleSaveWorkflow({ name, description }) {
  const wfData = { nodes: nodes.value, edges: edges.value }
  if (currentWorkflow.value?.id) { workflowStore.updateWorkflow(currentWorkflow.value.id, { name, description, ...wfData }); currentWorkflow.value = { ...currentWorkflow.value, name, description } }
  else { currentWorkflow.value = workflowStore.createWorkflow(name, description, wfData) }
  showSaveDialog.value = false
  addLog("success", "[保存]", `已保存工作流：${name}`)
}
function handleLoadWorkflow(wf) {
  nodes.value = wf.nodes || []; edges.value = wf.edges || []; currentWorkflow.value = wf; selectedNode.value = null; showLoadDialog.value = false
  addLog("info", "[加载]", `已加载工作流：${wf.name}`)
}
function handleClear() { if (confirm("确定清空当前画布？")) { nodes.value = []; edges.value = []; selectedNode.value = null } }
function handleImport() { importInput.value?.click() }
function handleImportFile(event) {
  const file = event.target.files?.[0]; if (!file) return
  const reader = new FileReader()
  reader.onload = e => { try { const d = JSON.parse(e.target.result); if (d.nodes) nodes.value = d.nodes; if (d.edges) edges.value = d.edges || []; addLog("info", "[导入]", `已导入：${file.name}`) } catch { addLog("error", "[导入]", "文件格式错误") } }
  reader.readAsText(file); event.target.value = ""
}
function handleKeyDown(event) {
  if ((event.ctrlKey || event.metaKey) && event.key === "`") { debugOpen.value = !debugOpen.value; event.preventDefault() }
  if ((event.ctrlKey || event.metaKey) && event.key === "s") { showSaveDialog.value = true; event.preventDefault() }
  if (event.key === "Delete" && selectedNode.value) { removeNodes([selectedNode.value.id]); selectedNode.value = null }
  if (event.key === "Escape") contextMenu.value.show = false
}
onMounted(() => { workflowStore.initWorkflows(); document.addEventListener("click", () => { contextMenu.value.show = false }) })
onBeforeUnmount(() => document.removeEventListener("click", () => {}))
</script>

<style scoped>
.editor-page { height: 100vh; display: flex; flex-direction: column; background: #f8fafc; outline: none; overflow: hidden; }
.editor-main { flex: 1; display: flex; overflow: hidden; }
.node-library { width: 200px; background: white; border-right: 1px solid #e5e7eb; overflow-y: auto; flex-shrink: 0; }
.library-title { padding: 12px 14px; font-weight: 700; font-size: 13px; color: #1f2937; border-bottom: 1px solid #e5e7eb; background: #f9fafb; }
.node-category { border-bottom: 1px solid #f3f4f6; }
.category-label { display: flex; justify-content: space-between; align-items: center; padding: 8px 14px; font-size: 12px; font-weight: 600; color: #374151; cursor: pointer; user-select: none; }
.category-label:hover { background: #f9fafb; }
.category-nodes { padding: 4px 0; }
.node-item { display: flex; align-items: center; gap: 6px; padding: 6px 14px 6px 18px; font-size: 11px; color: #4b5563; cursor: grab; border-left: 3px solid transparent; transition: all .15s; }
.node-item:hover { background: #f0f7ff; }
.node-item:active { cursor: grabbing; }
.canvas-area { flex: 1; position: relative; }
.right-panel { width: 280px; background: white; border-left: 1px solid #e5e7eb; display: flex; flex-direction: column; flex-shrink: 0; }
.panel-tabs { display: flex; border-bottom: 1px solid #e5e7eb; }
.ptab { flex: 1; padding: 10px; border: none; background: white; cursor: pointer; font-size: 13px; color: #6b7280; border-bottom: 2px solid transparent; }
.ptab.active { color: #4a90e2; border-bottom-color: #4a90e2; font-weight: 600; }
.panel-body { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
.config-panel { flex: 1; overflow-y: auto; padding: 12px; }
.no-selection { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 200px; color: #9ca3af; }
.ns-icon { font-size: 32px; margin-bottom: 8px; }
.no-selection p { font-size: 12px; }
.config-header { margin-bottom: 12px; }
.config-title { font-size: 14px; font-weight: 600; color: #1f2937; }
.config-type { font-size: 11px; color: #9ca3af; font-family: monospace; }
.config-name { margin-bottom: 12px; }
.config-name label { display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 4px; }
.config-input { width: 100%; padding: 7px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; box-sizing: border-box; }
.debug-wrapper { flex-shrink: 0; background: #1e1e2e; border-top: 1px solid #313244; }
.debug-toggle { display: flex; justify-content: space-between; align-items: center; padding: 6px 14px; cursor: pointer; color: #cba6f7; font-size: 12px; font-weight: 600; }
.debug-toggle:hover { background: #313244; }
.debug-content { height: 220px; overflow: hidden; }
.context-menu { position: fixed; z-index: 1000; background: white; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,.15); min-width: 160px; overflow: hidden; }
.ctx-item { padding: 9px 16px; font-size: 13px; cursor: pointer; color: #374151; }
.ctx-item:hover { background: #f3f4f6; }
.ctx-item.danger { color: #dc2626; }
.ctx-item.danger:hover { background: #fef2f2; }
</style>

