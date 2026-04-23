<template>
  <div class="editor-page" @keydown="handleKeyDown" tabindex="0">
    <!-- ── Top Header ── -->
    <div class="etl-header">
      <div class="header-left">
        <button class="back-btn" @click="handleNew" title="新建">←</button>
        <input v-model="workflowTitle" class="title-input" placeholder="未命名数据流" />
      </div>
      <div class="header-center">
        <button class="hc-btn hc-icon" @click="handleUndo" title="撤销 (Ctrl+Z)" :disabled="!canUndo">↩</button>
        <button class="hc-btn hc-icon" @click="handleRedo" title="重做 (Ctrl+Y)" :disabled="!canRedo">↪</button>
        <div class="hc-divider"></div>
        <button class="hc-btn" @click="handleRun" title="执行" :disabled="executionStore.isRunning">
          ▶ 执行
        </button>
        <button class="hc-btn" @click="handleClear">🗑 清空</button>
      </div>
      <div class="header-right">
        <button class="save-btn" @click="showSaveDialog = true">保存</button>
      </div>
    </div>

    <!-- ── Body ── -->
    <div class="editor-body">
      <!-- Left Sidebar -->
      <div class="etl-sidebar">
        <div v-for="cat in nodeCategories" :key="cat.name" class="sidebar-cat">
          <div class="sidebar-cat-header">
            <span>{{ cat.name }}</span>
            <span v-if="cat.warn" class="cat-warn" title="部分节点需要数据源">▲</span>
          </div>
          <div v-for="item in cat.nodes" :key="item.type"
            class="sidebar-item"
            draggable="true"
            @dragstart="onDragStart($event, item)"
            :class="{ 'item-disabled': item.disabled }"
          >
            <span class="si-icon" :style="{ color: item.color }">{{ item.icon }}</span>
            <span class="si-label">{{ item.label }}</span>
          </div>
        </div>
      </div>

      <!-- Main: canvas + bottom panel -->
      <div class="canvas-wrap">
        <div class="canvas-area" @drop="onDrop" @dragover.prevent>
          <VueFlow v-model:nodes="nodes" v-model:edges="edges"
            :connection-mode="ConnectionMode.Loose"
            :default-edge-options="{ style: { stroke: '#4a90e2', strokeWidth: 2 }, markerEnd: { type: 'arrowclosed', color: '#4a90e2' } }"
            @node-click="onNodeClick" @pane-click="onPaneClick"
            @node-context-menu="onNodeContextMenu" @connect="onConnect">
            <Background pattern-color="#d1d9e6" :gap="20" :size="1" />
            <Controls />
            <MiniMap :node-color="() => '#4a90e2'" pannable zoomable class="etl-minimap" />
            <!-- ETL nodes -->
            <template #node-etl="props">
              <EtlNode v-bind="props" />
            </template>
            <!-- Legacy nodes -->
            <template #node-data="props"><DataNode v-bind="props" @run="runSingleNode" /></template>
            <template #node-logic="props"><LogicNode v-bind="props" @run="runSingleNode" /></template>
            <template #node-condition="props"><ConditionNode v-bind="props" @run="runSingleNode" /></template>
            <template #node-calculation="props"><CalculationNode v-bind="props" @run="runSingleNode" /></template>
            <template #node-container="props"><ContainerNode v-bind="props" @run="runSingleNode" /></template>
            <template #node-execution="props"><ExecutionNode v-bind="props" @run="runSingleNode" /></template>
            <template #node-query="props"><QueryNode v-bind="props" @run="runSingleNode" /></template>
            <template #node-processing="props"><ProcessingNode v-bind="props" @run="runSingleNode" /></template>
            <template #node-comparison="props"><ComparisonNode v-bind="props" @run="runSingleNode" /></template>
            <template #node-output="props"><OutputNode v-bind="props" @run="runSingleNode" /></template>
          </VueFlow>
          <div v-if="contextMenu.show" class="context-menu"
            :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }" @click.stop>
            <div class="ctx-item" @click="previewContextNode">🔍 预览结果</div>
            <div class="ctx-item" @click="toggleBreakpoint">{{ executionStore.breakpoints.has(contextMenu.nodeId) ? '移除断点' : '添加断点' }}</div>
            <div class="ctx-item danger" @click="deleteContextNode">🗑️ 删除节点</div>
          </div>
        </div>

        <!-- Bottom Panel (shown when node selected) -->
        <div v-if="selectedNode" class="bottom-panel">
          <!-- Tab bar -->
          <div class="bp-tabbar">
            <div class="bp-type-tab">
              <span class="bp-node-icon" :style="{ color: selectedNodeMeta.color }">{{ selectedNodeMeta.icon }}</span>
              <span class="bp-node-type">{{ selectedNodeMeta.label }}</span>
              <span class="bp-help">?</span>
            </div>
            <button :class="['bp-tab', bottomTab === 'config' && 'active']" @click="bottomTab = 'config'">节点配置</button>
            <button :class="['bp-tab', bottomTab === 'preview' && 'active']" @click="bottomTab = 'preview'; triggerPreview()">数据预览</button>
            <button :class="['bp-tab', bottomTab === 'notes' && 'active']" @click="bottomTab = 'notes'">节点备注</button>
            <div class="bp-spacer"></div>
            <div class="bp-node-name">
              <span class="bp-name-label">节点名称：</span>
              <input v-model="selectedNode.data.label" class="bp-name-input" @input="onNodeDataChange" />
            </div>
            <button class="bp-close" @click="selectedNode = null">×</button>
          </div>

          <!-- Tab content -->
          <div class="bp-body">
            <!-- Config tab -->
            <div v-if="bottomTab === 'config'" class="bp-config">
              <!-- Connection hint -->
              <div v-if="showConnectionHint" class="conn-hint">
                <div class="conn-hint-diagram">
                  <template v-if="connectionHintCount === 2">
                    <div class="ch-box-col">
                      <div class="ch-box"></div>
                      <div class="ch-box"></div>
                    </div>
                    <div class="ch-arrows">
                      <svg width="48" height="56" viewBox="0 0 48 56">
                        <defs><marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#ef4444"/></marker></defs>
                        <path d="M0,14 Q24,14 24,28" stroke="#ef4444" stroke-width="1.5" fill="none" stroke-dasharray="4,3" marker-end="url(#arr)"/>
                        <path d="M0,42 Q24,42 24,28" stroke="#ef4444" stroke-width="1.5" fill="none" stroke-dasharray="4,3" marker-end="url(#arr)"/>
                      </svg>
                    </div>
                  </template>
                  <template v-else>
                    <div class="ch-box-col single">
                      <div class="ch-box"></div>
                    </div>
                    <div class="ch-arrows">
                      <svg width="48" height="28" viewBox="0 0 48 28">
                        <defs><marker id="arr1" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#ef4444"/></marker></defs>
                        <path d="M0,14 L42,14" stroke="#ef4444" stroke-width="1.5" fill="none" stroke-dasharray="4,3" marker-end="url(#arr1)"/>
                      </svg>
                    </div>
                  </template>
                  <div class="ch-target-box"></div>
                </div>
                <p class="conn-hint-text">请将 {{ connectionHintCount }} 个节点连接至本节点</p>
              </div>
              <component
                v-else
                :is="getConfigComponent(selectedNode.data.nodeType)"
                v-model="selectedNode.data.config"
                :node-id="selectedNode.id"
                @update:model-value="onNodeDataChange"
              />
            </div>

            <!-- Preview tab -->
            <div v-else-if="bottomTab === 'preview'" class="bp-preview">
              <!-- Loading -->
              <div v-if="previewLoading" class="bp-empty">
                <span class="preview-loading">⏳ 正在获取预览数据…</span>
              </div>
              <!-- Error -->
              <div v-else-if="previewError" class="bp-empty bp-error">
                <span>⚠️ {{ previewError }}</span>
              </div>
              <!-- No data yet -->
              <div v-else-if="!previewResult" class="bp-empty">
                <span>点击「数据预览」 Tab 将向后端获取该节点的执行结果</span>
              </div>
              <template v-else-if="previewResult">
                <div v-if="isTablePreview" class="preview-table-wrap">
                  <div class="preview-stats">共 {{ previewResult.length }} 行 × {{ previewColumns.length }} 列</div>
                  <div class="preview-scroll">
                    <table class="preview-table">
                      <thead>
                        <tr>
                          <th v-for="col in previewColumns" :key="col">{{ col }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(row, i) in previewResult.slice(0, 100)" :key="i">
                          <td v-for="col in previewColumns" :key="col">{{ row[col] ?? '' }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <pre v-else class="preview-raw">{{ JSON.stringify(previewResult, null, 2) }}</pre>
              </template>
            </div>

            <!-- Notes tab -->
            <div v-else-if="bottomTab === 'notes'" class="bp-notes">
              <textarea
                v-model="selectedNode.data.notes"
                class="notes-input"
                placeholder="为这个节点添加备注说明..."
                @input="onNodeDataChange"
              ></textarea>
            </div>
          </div>
        </div>

      </div><!-- end canvas-wrap -->
    </div><!-- end editor-body -->

    <SaveWorkflowDialog :show="showSaveDialog" :workflow="currentWorkflow" :node-count="nodes.length"
      :edge-count="edges.length" @close="showSaveDialog = false" @save="handleSaveWorkflow" />
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, onBeforeUnmount, markRaw, nextTick } from "vue"
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
  import EtlNode from "../components/flow-nodes/EtlNode.vue"
  import DataNode from "../components/flow-nodes/DataNode.vue"
  import LogicNode from "../components/flow-nodes/LogicNode.vue"
  import ConditionNode from "../components/flow-nodes/ConditionNode.vue"
  import CalculationNode from "../components/flow-nodes/CalculationNode.vue"
  import ContainerNode from "../components/flow-nodes/ContainerNode.vue"
  import ExecutionNode from "../components/flow-nodes/ExecutionNode.vue"
  import QueryNode from "../components/flow-nodes/QueryNode.vue"
  import ProcessingNode from "../components/flow-nodes/ProcessingNode.vue"
  import ComparisonNode from "../components/flow-nodes/ComparisonNode.vue"
  import OutputNode from "../components/flow-nodes/OutputNode.vue"
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
  import OutputNodeConfig from "../components/flow-config/OutputNodeConfig.vue"
  import DefaultNodeConfig from "../components/flow-config/DefaultNodeConfig.vue"
  import JoinNodeConfig from "../components/flow-config/JoinNodeConfig.vue"
  import UnionNodeConfig from "../components/flow-config/UnionNodeConfig.vue"
  import GroupNodeConfig from "../components/flow-config/GroupNodeConfig.vue"
  import FilterNodeConfig from "../components/flow-config/FilterNodeConfig.vue"
  import FieldNodeConfig from "../components/flow-config/FieldNodeConfig.vue"
  import DedupNodeConfig from "../components/flow-config/DedupNodeConfig.vue"
  import SaveWorkflowDialog from "../components/SaveWorkflowDialog.vue"
  import { WorkflowExecutor } from "../utils/workflowExecutor.js"
  import { serializeWorkflow, serializeUpToNode, deserializeWorkflow } from "../utils/workflowSerializer.js"
  import { fetchNodeConfig, fetchNodePreview } from "../services/workflowApi.js"

  const workflowStore = useWorkflowStore()
  const executionStore = useExecutionStore()
  const { addNodes, addEdges, removeNodes, screenToFlowCoordinate, fitView } = useVueFlow()
  const nodes = ref([])
  const edges = ref([])
  const selectedNode = ref(null)
  const bottomTab = ref("config")
  const showSaveDialog = ref(false)
  const contextMenu = ref({ show: false, x: 0, y: 0, nodeId: null })
  const currentWorkflow = ref(null)
  const workflowTitle = ref("未命名数据流")
  const streamId = ref('')
  const previewLoading = ref(false)
  const previewError = ref('')
  let executor = null
  let nodeCounter = 0

  // ── Undo / Redo ──
  const history = ref([])
  const historyIndex = ref(-1)
  const canUndo = computed(() => historyIndex.value > 0)
  const canRedo = computed(() => historyIndex.value < history.value.length - 1)
  let _skipHistory = false

  function _snapshot() {
    if (_skipHistory) return
    const snap = JSON.stringify({ nodes: nodes.value, edges: edges.value })
    // drop any redo future
    history.value = history.value.slice(0, historyIndex.value + 1)
    history.value.push(snap)
    historyIndex.value = history.value.length - 1
  }

  function handleUndo() {
    if (!canUndo.value) return
    historyIndex.value--
    _skipHistory = true
    const { nodes: n, edges: e } = JSON.parse(history.value[historyIndex.value])
    nodes.value = n; edges.value = e
    nextTick(() => { _skipHistory = false })
  }

  function handleRedo() {
    if (!canRedo.value) return
    historyIndex.value++
    _skipHistory = true
    const { nodes: n, edges: e } = JSON.parse(history.value[historyIndex.value])
    nodes.value = n; edges.value = e
    nextTick(() => { _skipHistory = false })
  }

  // ── ETL node meta ──
  const ETL_META = {
    'etl-input':  { icon: '→',  color: '#4a90e2', label: '输入' },
    'etl-output': { icon: '←',  color: '#22c55e', label: '输出' },
    'etl-join':   { icon: '∞',  color: '#3b82f6', label: '横向连接' },
    'etl-union':  { icon: '⊕',  color: '#6366f1', label: '追加合并' },
    'etl-group':  { icon: '≡',  color: '#f59e0b', label: '分组汇总' },
    'etl-filter': { icon: '▽',  color: '#14b8a6', label: '数据筛选' },
    'etl-field':  { icon: '⊞',  color: '#8b5cf6', label: '字段设置' },
    'etl-pivot':  { icon: '⇄',  color: '#ec4899', label: '行转列' },
    'etl-dedup':  { icon: '⊟',  color: '#64748b', label: '去重' },
    // 高级节点
    'data':               { icon: '📁', color: '#4a90e2', label: '数据源' },
    'logic-if':           { icon: '🔀', color: '#10b981', label: 'IF 判断' },
    'calculation':        { icon: '∑',  color: '#8b5cf6', label: '运算' },
    'query-filter':       { icon: '▽',  color: '#14b8a6', label: '筛选器' },
    'processing-extreme': { icon: '↕',  color: '#6366f1', label: '最值' },
    'comparison':         { icon: '⬡',  color: '#ef4444', label: '多版本比较' },
    'output-excel':       { icon: '📤', color: '#22c55e', label: 'Excel输出' },
  }

  const selectedNodeMeta = computed(() => {
    if (!selectedNode.value) return { icon: '○', color: '#6b7280', label: '节点' }
    const nt = selectedNode.value.data?.nodeType
    if (ETL_META[nt]) return ETL_META[nt]
    const iconMap = { data:'📊', logic:'🔀', condition:'⚖️', calculation:'🔢',
      container:'📦', execution:'⚙️', query:'🔍', processing:'📈', comparison:'🆚', output:'📤' }
    const base = (nt || '').split('-')[0]
    return { icon: iconMap[base] || '⚙️', color: '#6b7280', label: nt || '节点' }
  })

  // Preview for bottom panel
  const previewResult = computed(() => {
    if (!selectedNode.value) return null
    const r = executionStore.getNodeResult(selectedNode.value.id)
    return r?.output ?? null
  })
  const isTablePreview = computed(() =>
    Array.isArray(previewResult.value) &&
    previewResult.value.length > 0 &&
    typeof previewResult.value[0] === 'object' &&
    previewResult.value[0] !== null
  )
  const previewColumns = computed(() =>
    isTablePreview.value ? Object.keys(previewResult.value[0]) : []
  )

  async function triggerPreview() {
    if (!selectedNode.value) return
    previewLoading.value = true
    previewError.value = ''
    const targetId = selectedNode.value.id
    const payload = serializeUpToNode(nodes.value, edges.value, targetId, streamId.value)
    console.log(`[fetchNodePreview] 节点=${targetId}`, payload)
    try {
      const result = await fetchNodePreview(payload)
      console.log(`[fetchNodePreview] 响应`, result)
      // 将结果写入 executionStore，以便现有预览表格展示逻辑复用
      const output = result?.data ?? result?.rows ?? result?.output ?? result
      executionStore.setNodeResult(targetId, { status: 'completed', output })
    } catch (e) {
      previewError.value = e.message || '获取预览失败'
      console.error('[fetchNodePreview]', e)
    } finally {
      previewLoading.value = false
    }
  }

  // ── Connection hint ──
  const selectedNodeRequired = computed(() => {
    if (!selectedNode.value) return 0
    const nt = selectedNode.value.data?.nodeType
    if (['etl-input', 'data'].includes(nt)) return 0
    if (['etl-join', 'etl-union'].includes(nt)) return 2
    return 1
  })
  const selectedNodeIncomingCount = computed(() =>
    !selectedNode.value ? 0 : edges.value.filter(e => e.target === selectedNode.value.id).length
  )
  const showConnectionHint = computed(() =>
    selectedNodeRequired.value > 0 && selectedNodeIncomingCount.value < selectedNodeRequired.value
  )
  const connectionHintCount = computed(() => selectedNodeRequired.value)

  const nodeCategories = ref([
    {
      name: "输入输出", warn: false, nodes: [
        { type: "etl-input",  label: "输入",  icon: "→", color: "#4a90e2", defaultConfig: { source: "upload", data: null } },
        { type: "etl-output", label: "输出",  icon: "←", color: "#22c55e", defaultConfig: { filename: "输出数据" } },
      ]
    },
    {
      name: "数据处理", warn: true, nodes: [
        { type: "etl-join",   label: "横向连接", icon: "∞", color: "#3b82f6", defaultConfig: { joinType: "left", fieldMappings: [{ leftField:"", leftType:"文本", rightField:"", rightType:"文本" }], mergeJoinFields: true } },
        { type: "etl-union",  label: "追加合并", icon: "⊕", color: "#6366f1", defaultConfig: { unionType: "all", alignMode: "name" } },
        { type: "etl-group",  label: "分组汇总", icon: "≡", color: "#f59e0b", defaultConfig: { groupFields: [], aggregations: [] } },
        { type: "etl-filter", label: "数据筛选", icon: "▽", color: "#14b8a6", defaultConfig: { conditions: [] } },
        { type: "etl-field",  label: "字段设置", icon: "⊞", color: "#8b5cf6", defaultConfig: { fields: [] } },
        { type: "etl-pivot",  label: "行转列",   icon: "⇄", color: "#ec4899", defaultConfig: {} },
        { type: "etl-dedup",  label: "去重",     icon: "⊟", color: "#64748b", defaultConfig: { fields: [], keepRecord: "first" } },
      ]
    },
    {
      name: "高级节点", warn: false, nodes: [
        { type: "data",        label: "数据源",   icon: "📁", color: "#4a90e2", defaultConfig: { source: "upload", data: null } },
        { type: "logic-if",   label: "IF 判断", icon: "🔀", color: "#10b981", defaultConfig: { conditions: [], elseResult: null } },
        { type: "calculation", label: "运算",   icon: "∑",  color: "#8b5cf6", defaultConfig: { operator: "+", params: [] } },
        { type: "query-filter",label: "筛选器", icon: "▽",  color: "#14b8a6", defaultConfig: { queryType: "filter", condition: "" } },
        { type: "processing-extreme", label: "最值", icon: "↕", color: "#6366f1", defaultConfig: { method: "max" } },
        { type: "comparison",  label: "多版本比较", icon: "⬡", color: "#ef4444", defaultConfig: { analysisType: "cost", dataList: [] } },
        { type: "output-excel", label: "Excel输出", icon: "📤", color: "#22c55e", defaultConfig: { filename: "输出数据", fieldMapping: {} } },
      ]
    },
  ])

  function getConfigComponent(nodeType) {
    const map = {
      // ETL nodes
      "etl-input": DataNodeConfig, "etl-output": OutputNodeConfig,
      "etl-join": JoinNodeConfig, "etl-union": UnionNodeConfig,
      "etl-group": GroupNodeConfig, "etl-filter": FilterNodeConfig,
      "etl-field": FieldNodeConfig, "etl-dedup": DedupNodeConfig,
      // Legacy nodes
      "data": DataNodeConfig, "logic-if": LogicIfNodeConfig,
      "logic-and": LogicNodeConfig, "logic-or": LogicNodeConfig, "logic-nor": LogicNodeConfig,
      "condition-belongs": ConditionNodeConfig, "condition-compare": ConditionNodeConfig,
      "calculation": CalculationNodeConfig,
      "query-filter": QueryNodeConfig, "query-condition": QueryNodeConfig,
      "query-api": QueryNodeConfig, "query-field": QueryNodeConfig,
      "processing-extreme": ProcessingNodeConfig, "processing-average": ProcessingNodeConfig,
      "processing-interpolation": ProcessingNodeConfig, "processing-price": ProcessingNodeConfig,
      "container-list": ContainerNodeConfig, "container-dict": ContainerNodeConfig,
      "execution-do": ExecutionNodeConfig, "execution-for": ExecutionNodeConfig,
      "comparison": ComparisonNodeConfig,
      "output-excel": OutputNodeConfig,
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
    const position = screenToFlowCoordinate({ x: event.clientX, y: event.clientY })
    // All nodes in ETL_META use the unified EtlNode renderer
    const isEtl = type in ETL_META
    const vfType = isEtl ? 'etl' : type.split('-')[0]
    const cat = nodeCategories.value.flatMap(c => c.nodes).find(n => n.type === type)
    const config = cat ? JSON.parse(JSON.stringify(cat.defaultConfig)) : {}
    nodeCounter++
    const nodeWidth = isEtl ? 140 : 140
    addNodes([{ id: `node-${Date.now()}-${nodeCounter}`, type: vfType, position, data: { label: `${label} ${nodeCounter}`, nodeType: type, color, config, notes: '' }, width: nodeWidth, height: isEtl ? 40 : 80 }])
    nextTick(() => _snapshot())
  }

  function onNodeClick({ node }) {
    selectedNode.value = node
    bottomTab.value = 'config'
    previewError.value = ''
    previewLoading.value = false
    contextMenu.value.show = false
  }
  function onPaneClick() { selectedNode.value = null; contextMenu.value.show = false }
  function onNodeContextMenu({ event, node }) { event.preventDefault(); contextMenu.value = { show: true, x: event.clientX, y: event.clientY, nodeId: node.id } }
  function onConnect(params) {
    addEdges([{ ...params, id: `edge-${Date.now()}` }])
    _snapshot()
    // 连线建立后，向后端获取目标节点的配置建议
    nextTick(async () => {
      const targetId = params.target
      const targetNode = nodes.value.find(n => n.id === targetId)
      if (!targetNode) return
      const payload = serializeUpToNode(nodes.value, edges.value, targetId, streamId.value)
      console.log(`[fetchNodeConfig] 节点=${targetId}`, payload)
      try {
        const result = await fetchNodeConfig(payload)
        console.log(`[fetchNodeConfig] 响应`, result)
        // 如果后端返回了配置建议，合并到 config 中
        if (result && typeof result === 'object' && result.config) {
          const idx = nodes.value.findIndex(n => n.id === targetId)
          if (idx !== -1) {
            nodes.value[idx] = {
              ...nodes.value[idx],
              data: { ...nodes.value[idx].data, config: { ...nodes.value[idx].data.config, ...result.config } }
            }
            if (selectedNode.value?.id === targetId) {
              selectedNode.value = nodes.value[idx]
            }
          }
        }
      } catch (e) {
        console.warn('[fetchNodeConfig] 接口未就绪或返回错误:', e.message)
      }
    })
  }
  function onNodeDataChange() {
    const idx = nodes.value.findIndex(n => n.id === selectedNode.value.id)
    if (idx !== -1) nodes.value[idx] = { ...nodes.value[idx], data: { ...selectedNode.value.data } }
    _snapshot()
  }

  function previewContextNode() {
    const node = nodes.value.find(n => n.id === contextMenu.value.nodeId)
    if (node) { selectedNode.value = node; bottomTab.value = 'preview' }
    contextMenu.value.show = false
  }
  function toggleBreakpoint() { executionStore.toggleBreakpoint(contextMenu.value.nodeId); contextMenu.value.show = false }
  function deleteContextNode() { removeNodes([contextMenu.value.nodeId]); if (selectedNode.value?.id === contextMenu.value.nodeId) selectedNode.value = null; contextMenu.value.show = false; _snapshot() }

  async function handleRun() {
    if (executionStore.isRunning) return
    const payload = serializeWorkflow(nodes.value, edges.value, streamId.value)
    console.log('[Backend payload]', JSON.stringify(payload, null, 2))
    executionStore.clearResults()
    executor = new WorkflowExecutor(nodes.value, edges.value, executionStore)
    try { await executor.execute() }
    catch (e) { console.error(e) }
  }
  async function runSingleNode(nodeId) {
    const node = nodes.value.find(n => n.id === nodeId)
    if (!node) return
    const tempExecutor = new WorkflowExecutor(nodes.value, edges.value, executionStore)
    try {
      await tempExecutor.executeNode(node)
      if (selectedNode.value?.id === nodeId) bottomTab.value = 'preview'
    } catch (e) { console.error(e) }
  }

  function handleNew() {
    if (nodes.value.length > 0 && !confirm("创建新工作流将清空当前画布，确定继续？")) return
    nodes.value = []; edges.value = []; selectedNode.value = null
    currentWorkflow.value = null; streamId.value = ''
    executionStore.clearResults(); _snapshot()
  }
  function handleSaveWorkflow({ name, description }) {
    if (!streamId.value) streamId.value = `wf_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const backendData = serializeWorkflow(nodes.value, edges.value, streamId.value)
    if (currentWorkflow.value?.id) {
      workflowStore.updateWorkflow(currentWorkflow.value.id, { name, description, ...backendData })
      currentWorkflow.value = { ...currentWorkflow.value, name, description, ...backendData }
    } else {
      currentWorkflow.value = workflowStore.createWorkflow(name, description, backendData)
      streamId.value = currentWorkflow.value.streamId
    }
    showSaveDialog.value = false
  }
  function handleLoadWorkflow(wf) {
    const { nodes: n, edges: e, streamId: sid } = deserializeWorkflow(wf)
    nodes.value = n; edges.value = e
    streamId.value = sid || wf.streamId || wf.id || ''
    workflowTitle.value = wf.name || '未命名数据流'
    currentWorkflow.value = wf; selectedNode.value = null
    nextTick(() => { fitView(); _snapshot() })
  }
  function handleClear() { if (confirm("确定清空当前画布？")) { nodes.value = []; edges.value = []; selectedNode.value = null; _snapshot() } }
  function handleKeyDown(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === "s") { showSaveDialog.value = true; event.preventDefault() }
    if ((event.ctrlKey || event.metaKey) && event.key === "z" && !event.shiftKey) { handleUndo(); event.preventDefault() }
    if ((event.ctrlKey || event.metaKey) && (event.key === "y" || (event.key === "z" && event.shiftKey))) { handleRedo(); event.preventDefault() }
    if (event.key === "Delete" && selectedNode.value) { removeNodes([selectedNode.value.id]); selectedNode.value = null; _snapshot() }
    if (event.key === "Escape") contextMenu.value.show = false
  }
  onMounted(() => {
    workflowStore.initWorkflows()
    document.addEventListener("click", () => { contextMenu.value.show = false })
    _snapshot()
  })
  onBeforeUnmount(() => document.removeEventListener("click", () => { }))
</script>

<style scoped>
  /* ── Page layout ── */
  .editor-page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f0f2f5;
    outline: none;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  /* ── Header ── */
  .etl-header {
    height: 52px;
    background: #fff;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 12px;
    flex-shrink: 0;
    box-shadow: 0 1px 3px rgba(0,0,0,.06);
  }

  .header-left { display: flex; align-items: center; gap: 8px; min-width: 200px; }

  .back-btn {
    padding: 4px 8px;
    border: none;
    background: none;
    font-size: 16px;
    color: #6b7280;
    cursor: pointer;
    border-radius: 4px;
  }
  .back-btn:hover { background: #f3f4f6; }

  .title-input {
    border: none;
    outline: none;
    font-size: 15px;
    font-weight: 600;
    color: #1f2937;
    background: transparent;
    width: 180px;
  }
  .title-input:focus { border-bottom: 1.5px solid #4a90e2; }

  .header-center { flex: 1; display: flex; align-items: center; gap: 6px; justify-content: center; }

  .hc-btn {
    padding: 5px 12px;
    border: 1px solid #d1d5db;
    border-radius: 5px;
    background: white;
    cursor: pointer;
    font-size: 12px;
    color: #374151;
    transition: all .15s;
  }
  .hc-btn:hover { border-color: #4a90e2; color: #4a90e2; }
  .hc-btn:disabled { opacity: .5; cursor: not-allowed; pointer-events: none; }
  .hc-icon { padding: 5px 9px; font-size: 15px; }
  .hc-divider { width: 1px; height: 20px; background: #e5e7eb; margin: 0 2px; }

  .header-right { display: flex; align-items: center; min-width: 80px; justify-content: flex-end; }

  .save-btn {
    padding: 7px 20px;
    background: #00b9a1;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background .15s;
  }
  .save-btn:hover { background: #009e8a; }

  /* ── Body ── */
  .editor-body {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  /* ── Left Sidebar ── */
  .etl-sidebar {
    width: 152px;
    background: #fff;
    border-right: 1px solid #e5e7eb;
    overflow-y: auto;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
  }

  .sidebar-cat { border-bottom: 1px solid #f0f2f5; }

  .sidebar-cat-header {
    padding: 8px 12px 6px;
    font-size: 12px;
    font-weight: 700;
    color: #374151;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .cat-warn {
    font-size: 10px;
    color: #f59e0b;
  }

  .sidebar-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 12px;
    cursor: grab;
    border-radius: 0;
    transition: background .12s;
    user-select: none;
  }

  .sidebar-item:hover { background: #f0f7ff; }
  .sidebar-item:active { cursor: grabbing; }
  .sidebar-item.item-disabled { opacity: .45; cursor: not-allowed; }

  .si-icon {
    font-size: 14px;
    font-weight: 700;
    width: 20px;
    text-align: center;
    flex-shrink: 0;
  }

  .si-label {
    font-size: 12px;
    color: #374151;
  }

  /* ── Canvas wrap ── */
  .canvas-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }

  .canvas-area {
    flex: 1;
    position: relative;
    overflow: hidden;
  }

  /* ── Bottom Panel ── */
  .bottom-panel {
    height: 310px;
    flex-shrink: 0;
    background: #fff;
    border-top: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
  }

  .bp-tabbar {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #e5e7eb;
    padding: 0 16px;
    height: 42px;
    flex-shrink: 0;
    gap: 4px;
  }

  .bp-type-tab {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 4px 12px;
    background: #3b82f6;
    border-radius: 5px;
    margin-right: 4px;
  }

  .bp-node-icon { font-size: 14px; color: white; font-weight: 700; }
  .bp-node-type { font-size: 12px; color: white; font-weight: 600; }
  .bp-help {
    width: 16px;
    height: 16px;
    background: rgba(255,255,255,.3);
    border-radius: 50%;
    font-size: 10px;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: help;
  }

  .bp-tab {
    padding: 4px 14px;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 13px;
    color: #6b7280;
    border-bottom: 2px solid transparent;
    transition: all .15s;
    height: 100%;
  }
  .bp-tab:hover { color: #374151; }
  .bp-tab.active { color: #3b82f6; border-bottom-color: #3b82f6; font-weight: 600; }

  .bp-spacer { flex: 1; }

  .bp-node-name {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-right: 8px;
  }
  .bp-name-label { font-size: 12px; color: #6b7280; white-space: nowrap; }
  .bp-name-input {
    padding: 4px 8px;
    border: 1px solid #d1d5db;
    border-radius: 5px;
    font-size: 12px;
    width: 120px;
  }
  .bp-name-input:focus { outline: none; border-color: #3b82f6; }

  .bp-close {
    padding: 0 6px;
    border: none;
    background: none;
    font-size: 18px;
    color: #9ca3af;
    cursor: pointer;
    border-radius: 4px;
    line-height: 1;
  }
  .bp-close:hover { background: #f3f4f6; color: #374151; }

  .bp-body {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .bp-config {
    flex: 1;
    overflow-y: auto;
    padding: 14px 18px;
  }

  /* ── Connection hint ── */
  .conn-hint {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 28px 0 20px;
    gap: 16px;
  }
  .conn-hint-diagram {
    display: flex;
    align-items: center;
    gap: 0;
  }
  .ch-box-col {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .ch-box-col.single {
    justify-content: center;
  }
  .ch-box {
    width: 76px;
    height: 22px;
    border: 1.5px dashed #ef4444;
    border-radius: 4px;
    background: rgba(239,68,68,.04);
  }
  .ch-arrows {
    display: flex;
    align-items: center;
  }
  .ch-target-box {
    width: 76px;
    height: 22px;
    border: 1.5px dashed #ef4444;
    border-radius: 4px;
    background: rgba(239,68,68,.04);
  }
  .conn-hint-text {
    font-size: 13px;
    color: #ef4444;
    margin: 0;
  }

  .bp-empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9ca3af;
    font-size: 13px;
  }
  .bp-error { color: #ef4444; }
  .preview-loading { color: #6b7280; }

  .bp-preview {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .preview-table-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 0 2px;
  }

  .preview-stats {
    padding: 6px 16px 4px;
    font-size: 12px;
    color: #6b7280;
    flex-shrink: 0;
  }

  .preview-scroll {
    flex: 1;
    overflow: auto;
    padding: 0 16px 8px;
  }

  .preview-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  }
  .preview-table th, .preview-table td {
    padding: 5px 10px;
    border: 1px solid #e5e7eb;
    white-space: nowrap;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .preview-table th {
    background: #f9fafb;
    font-weight: 600;
    position: sticky;
    top: 0;
    color: #374151;
  }
  .preview-table tr:hover td { background: #f0f7ff; }

  .preview-raw {
    flex: 1;
    margin: 0;
    padding: 12px 16px;
    font-size: 11px;
    overflow: auto;
    background: #1e1e2e;
    color: #cdd6f4;
  }

  .bp-notes { flex: 1; padding: 12px 16px; display: flex; }

  .notes-input {
    flex: 1;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 10px;
    font-size: 13px;
    resize: none;
    font-family: inherit;
    color: #374151;
  }
  .notes-input:focus { outline: none; border-color: #3b82f6; }

  /* ── Context menu ── */
  .context-menu {
    position: fixed;
    z-index: 1000;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0,0,0,.15);
    min-width: 160px;
    overflow: hidden;
  }
  .ctx-item { padding: 9px 16px; font-size: 13px; cursor: pointer; color: #374151; }
  .ctx-item:hover { background: #f3f4f6; }
  .ctx-item.danger { color: #dc2626; }
  .ctx-item.danger:hover { background: #fef2f2; }

  /* ── MiniMap ── */
  :deep(.vue-flow__minimap) {
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 2px 8px rgba(0,0,0,.10);
    background: #fff;
    overflow: hidden;
  }
  :deep(.vue-flow__minimap svg) {
    border-radius: 8px;
  }
</style>