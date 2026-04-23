/**
 * workflowSerializer.js
 * Converts between Vue Flow editor format and backend API format.
 *
 * Backend format:
 * {
 *   streamId: string,
 *   nodeId: string,       // output/sink node id
 *   nodes: [
 *     { id, title, posX, posY, type, input?, ...typeSpecificFields }
 *   ]
 * }
 */

// ── Type mappings ──────────────────────────────────────────────────────────────

/** Editor nodeType → backend type */
const EDITOR_TO_BACKEND = {
  'etl-input':          'source',
  'data':               'source',
  'etl-output':         'excel',
  'output-excel':       'excel',
  'etl-join':           'join',
  'etl-union':          'union',
  'etl-group':          'group',
  'etl-filter':         'dbFilter',
  'query-filter':       'dbSelect',
  'etl-field':          'fieldMapping',
  'etl-pivot':          'pivot',
  'etl-dedup':          'dedup',
  'logic-if':           'if',
  'calculation':        'calc',
  'comparison':         'compare',
  'dbSelect':           'dbSelect',
  // processing-extreme handled separately (method: max|min)
}

/** Backend type → editor nodeType */
const BACKEND_TO_EDITOR = {
  'source':       'etl-input',
  'excel':        'etl-output',
  'join':         'etl-join',
  'union':        'etl-union',
  'group':        'etl-group',
  'dbFilter':     'etl-filter',
  'fieldMapping': 'etl-field',
  'pivot':        'etl-pivot',
  'dedup':        'etl-dedup',
  'max':          'processing-extreme',
  'min':          'processing-extreme',
  'if':           'logic-if',
  'calc':         'calculation',
  'compare':      'comparison',
  'dbSelect':     'query-filter',
}

/** Color meta for re-hydrated nodes */
const EDITOR_TYPE_COLOR = {
  'etl-input':          '#4a90e2',
  'etl-output':         '#22c55e',
  'etl-join':           '#3b82f6',
  'etl-union':          '#6366f1',
  'etl-group':          '#f59e0b',
  'etl-filter':         '#14b8a6',
  'etl-field':          '#8b5cf6',
  'etl-pivot':          '#ec4899',
  'etl-dedup':          '#64748b',
  'processing-extreme': '#6366f1',
  'logic-if':           '#10b981',
  'calculation':        '#8b5cf6',
  'comparison':         '#ef4444',
  'query-filter':       '#14b8a6',
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Resolve backend type from editor nodeType + config */
function toBackendType(editorType, config = {}) {
  if (editorType === 'processing-extreme') {
    return config.method === 'min' ? 'min' : 'max'
  }
  return EDITOR_TO_BACKEND[editorType] || editorType
}

/**
 * Build type-specific fields for the backend node object.
 * Config fields are embedded directly in the node (not nested).
 */
function buildBackendFields(backendType, config = {}) {
  switch (backendType) {
    case 'source': {
      const out = {}
      if (config.batchNo || config.id) {
        out.source = { batchNo: config.batchNo || '', id: config.id || '' }
      }
      return out
    }
    case 'dbFilter': {
      const out = {}
      if (config.defaultFilter != null) out.defaultFilter = config.defaultFilter
      if (config.dbFilter != null)      out.dbFilter = config.dbFilter
      return out
    }
    case 'max':
    case 'min':
      // type itself encodes the method; no extra fields needed
      return {}
    default: {
      // Strip internal editor-only fields and spread the rest
      const { source: _s, data: _d, color: _c, notes: _n, label: _l, ...rest } = config
      return Object.keys(rest).length ? rest : {}
    }
  }
}

/** Find the output/sink node id (excel or no outgoing edges) */
function findOutputNodeId(nodes, edges) {
  const outputEditorTypes = new Set(['etl-output', 'output-excel'])
  const hasOutgoing = new Set(edges.map(e => e.source))

  // Prefer an explicit output node
  const outputNode = nodes.find(n => {
    const nt = n.data?.nodeType || n.type
    return outputEditorTypes.has(nt) ||
           EDITOR_TO_BACKEND[nt] === 'excel'
  })
  if (outputNode) return outputNode.id

  // Fallback: sink node (no outgoing edges)
  const sink = nodes.find(n => !hasOutgoing.has(n.id))
  return sink?.id || nodes[nodes.length - 1]?.id || ''
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Serialize a single Vue Flow node to backend node format.
 */
export function serializeNode(node, edges) {
  const nt = node.data?.nodeType || node.type
  const config = node.data?.config || {}
  const bType = toBackendType(nt, config)

  // input = IDs of nodes that have edges pointing to this node
  const input = edges
    .filter(e => e.target === node.id)
    .map(e => e.source)

  const result = {
    id: node.id,
    title: node.data?.label || '',
    posX: Math.round(node.position?.x ?? 0),
    posY: Math.round(node.position?.y ?? 0),
    type: bType,
    ...buildBackendFields(bType, config),
  }

  if (input.length > 0) result.input = input

  return result
}

/**
 * Collect the subgraph of nodes that are ancestors of targetNodeId (inclusive).
 * Walks edges backwards via BFS.
 */
export function collectAncestors(nodes, edges, targetNodeId) {
  const nodeMap = new Map(nodes.map(n => [n.id, n]))
  const visited = new Set()
  const queue = [targetNodeId]
  while (queue.length) {
    const id = queue.shift()
    if (visited.has(id)) continue
    visited.add(id)
    edges
      .filter(e => e.target === id)
      .forEach(e => { if (!visited.has(e.source)) queue.push(e.source) })
  }
  return [...visited].map(id => nodeMap.get(id)).filter(Boolean)
}

/**
 * Serialize only the subgraph from all source nodes up to (and including) targetNodeId.
 * Used when a connection is made or preview is requested for a specific node.
 *
 * @param {Array}  nodes        - All Vue Flow nodes
 * @param {Array}  edges        - All Vue Flow edges
 * @param {string} targetNodeId - The node to compute up to
 * @param {string} streamId
 * @returns {object} Backend payload with nodeId = targetNodeId
 */
export function serializeUpToNode(nodes, edges, targetNodeId, streamId = '') {
  const subNodes = collectAncestors(nodes, edges, targetNodeId)
  const subNodeIds = new Set(subNodes.map(n => n.id))
  const subEdges = edges.filter(e => subNodeIds.has(e.source) && subNodeIds.has(e.target))
  return {
    streamId,
    nodeId: targetNodeId,
    nodes: subNodes.map(n => serializeNode(n, subEdges)),
  }
}

/**
 * Serialize Vue Flow nodes + edges to backend workflow format.
 *
 * @param {Array}  nodes    - Vue Flow nodes array
 * @param {Array}  edges    - Vue Flow edges array
 * @param {string} streamId - Workflow/stream ID
 * @returns {object} Backend payload
 */
export function serializeWorkflow(nodes, edges, streamId = '') {
  return {
    streamId,
    nodeId: findOutputNodeId(nodes, edges),
    nodes: nodes.map(n => serializeNode(n, edges)),
  }
}

/**
 * Deserialize backend workflow format to Vue Flow nodes + edges.
 *
 * @param {object} data - Backend payload
 * @returns {{ nodes, edges, streamId, outputNodeId }}
 */
export function deserializeWorkflow(data) {
  if (!data || !Array.isArray(data.nodes)) {
    return { nodes: [], edges: [], streamId: '', outputNodeId: '' }
  }

  const nodes = data.nodes.map((n, i) => {
    const editorType = BACKEND_TO_EDITOR[n.type] || n.type
    const config = extractEditorConfig(n)

    return {
      id: n.id,
      type: 'etl',
      position: { x: n.posX ?? i * 180 + 50, y: n.posY ?? 100 },
      data: {
        label: n.title || '',
        nodeType: editorType,
        color: EDITOR_TYPE_COLOR[editorType] || '#4a90e2',
        config,
        notes: '',
      },
      width: 140,
      height: 40,
    }
  })

  // Rebuild edges from input arrays
  const edges = []
  data.nodes.forEach(n => {
    if (!Array.isArray(n.input)) return
    n.input.forEach(sourceId => {
      edges.push({
        id: `edge-${sourceId}-${n.id}`,
        source: sourceId,
        target: n.id,
        style: { stroke: '#4a90e2', strokeWidth: 2 },
        markerEnd: { type: 'arrowclosed', color: '#4a90e2' },
      })
    })
  })

  return { nodes, edges, streamId: data.streamId || '', outputNodeId: data.nodeId || '' }
}

/** Reconstruct editor config object from a backend node object */
function extractEditorConfig(n) {
  switch (n.type) {
    case 'source':
      return { batchNo: n.source?.batchNo || '', id: n.source?.id || '' }
    case 'dbFilter':
      return { defaultFilter: n.defaultFilter || [], dbFilter: n.dbFilter || [] }
    case 'max':
      return { method: 'max' }
    case 'min':
      return { method: 'min' }
    default: {
      // Everything except structural fields becomes config
      const { id: _i, title: _t, posX: _x, posY: _y, type: _tp, input: _in, ...rest } = n
      return rest
    }
  }
}
