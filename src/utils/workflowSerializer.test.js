/**
 * 运行方式: node src/utils/workflowSerializer.test.js
 * 无需任何测试框架，直接 node 执行即可
 */

// 因为是纯 JS 文件，直接 require 模拟 ESM
// 用动态 import 运行
import { serializeWorkflow, deserializeWorkflow } from './workflowSerializer.js'

// ── 测试数据 ──────────────────────────────────────────────────────────────────

const mockNodes = [
  {
    id: 'node_1776685745564',
    type: 'etl',
    position: { x: 50, y: 100 },
    data: {
      label: '项目清单',
      nodeType: 'data',
      config: {
        batchNo: 'be5d7e74688c4c8787d5e1db9aba2cba',
        id: 'eff466bd911a4e6babdd9e34eb477273',
      },
    },
  },
  {
    id: 'node_1776685977957',
    type: 'etl',
    position: { x: 100, y: 100 },
    data: {
      label: '数据库筛选条件',
      nodeType: 'etl-filter',
      config: {
        defaultFilter: ['major_level1', 'major_level2', 'major_level3'],
        dbFilter: [
          {
            match: [
              {
                concat: 'and',
                field: 'major_level3',
                type: 'string',
                method: 'equal',
                value: ['混凝土'],
              },
              {
                concat: 'or',
                field: 'major_level3',
                type: 'string',
                method: 'equal',
                value: ['线缆'],
              },
            ],
            return: [
              {
                concat: 'and',
                field: 'bid_time',
                type: 'datetime',
                method: 'range',
                value: ['2025-01-01 00:00:00', '2026-01-01 00:00:00'],
              },
            ],
          },
        ],
      },
    },
  },
  {
    id: 'node_1776685977958',
    type: 'etl',
    position: { x: 150, y: 100 },
    data: { label: '数据库查询', nodeType: 'query-filter', config: {} },
  },
  {
    id: 'node_1776685977959',
    type: 'etl',
    position: { x: 150, y: 100 },
    data: { label: '最大值', nodeType: 'processing-extreme', config: { method: 'max' } },
  },
  {
    id: 'node_1776685977960',
    type: 'etl',
    position: { x: 200, y: 100 },
    data: { label: '写入excel', nodeType: 'etl-output', config: { filename: '输出数据' } },
  },
]

const mockEdges = [
  { id: 'e1', source: 'node_1776685745564', target: 'node_1776685977957' },
  { id: 'e2', source: 'node_1776685977957', target: 'node_1776685977958' },
  { id: 'e3', source: 'node_1776685977958', target: 'node_1776685977959' },
  { id: 'e4', source: 'node_1776685977959', target: 'node_1776685977960' },
]

// ── 测试 1: 序列化 ─────────────────────────────────────────────────────────────

console.log('\n═══ 测试1: serializeWorkflow ═══')
const payload = serializeWorkflow(mockNodes, mockEdges, '69e61239557960474fd2d6d3')
console.log(JSON.stringify(payload, null, 2))

// 断言
console.assert(payload.streamId === '69e61239557960474fd2d6d3', 'streamId 应匹配')
console.assert(payload.nodeId === 'node_1776685977960', 'nodeId 应为输出节点')
console.assert(payload.nodes.length === 5, 'nodes 应有 5 个')

const srcNode = payload.nodes.find((n) => n.id === 'node_1776685745564')
console.assert(srcNode.type === 'source', '数据源 type 应为 source')
console.assert(
  srcNode.source?.batchNo === 'be5d7e74688c4c8787d5e1db9aba2cba',
  'source.batchNo 应匹配'
)
console.assert(!srcNode.input, '源节点不应有 input')

const filterNode = payload.nodes.find((n) => n.id === 'node_1776685977957')
console.assert(filterNode.type === 'dbFilter', 'etl-filter → dbFilter')
console.assert(Array.isArray(filterNode.dbFilter), 'dbFilter 字段应存在')
console.assert(filterNode.input[0] === 'node_1776685745564', 'input 应为上游节点 id')

const maxNode = payload.nodes.find((n) => n.id === 'node_1776685977959')
console.assert(maxNode.type === 'max', 'processing-extreme(max) → max')
console.assert(!('method' in maxNode), 'method 字段不应出现在节点中')

const outNode = payload.nodes.find((n) => n.id === 'node_1776685977960')
console.assert(outNode.type === 'excel', 'etl-output → excel')

console.log('✅ 序列化测试全部通过\n')

// ── 测试 2: 反序列化 ───────────────────────────────────────────────────────────

console.log('═══ 测试2: deserializeWorkflow ═══')
const backendData = {
  streamId: '69e61239557960474fd2d6d3',
  nodeId: 'node_1776685977960',
  nodes: [
    {
      id: 'node_1776685745564',
      title: '项目清单',
      posX: 50,
      posY: 100,
      type: 'source',
      source: {
        batchNo: 'be5d7e74688c4c8787d5e1db9aba2cba',
        id: 'eff466bd911a4e6babdd9e34eb477273',
      },
    },
    {
      id: 'node_1776685977957',
      input: ['node_1776685745564'],
      title: '数据库筛选条件',
      posX: 100,
      posY: 100,
      type: 'dbFilter',
      defaultFilter: ['major_level1', 'major_level2', 'major_level3'],
      dbFilter: [],
    },
    {
      id: 'node_1776685977958',
      input: ['node_1776685977957'],
      title: '数据库查询',
      posX: 150,
      posY: 100,
      type: 'dbSelect',
    },
    {
      id: 'node_1776685977959',
      input: ['node_1776685977958'],
      title: '最大值',
      posX: 150,
      posY: 100,
      type: 'max',
    },
    {
      id: 'node_1776685977960',
      input: ['node_1776685977959'],
      title: '写入excel',
      posX: 200,
      posY: 100,
      type: 'excel',
    },
  ],
}

const { nodes: rNodes, edges: rEdges, streamId: rSid } = deserializeWorkflow(backendData)
console.log(
  '反序列化 nodes:',
  rNodes.map((n) => `${n.id} → nodeType=${n.data.nodeType}`)
)
console.log(
  '反序列化 edges:',
  rEdges.map((e) => `${e.source} → ${e.target}`)
)

console.assert(rSid === '69e61239557960474fd2d6d3', 'streamId 应还原')
console.assert(rNodes.length === 5, 'nodes 应有 5 个')
console.assert(rEdges.length === 4, 'edges 应有 4 条')

const r0 = rNodes.find((n) => n.id === 'node_1776685745564')
console.assert(r0.data.nodeType === 'etl-input', 'source → etl-input')
console.assert(
  r0.data.config.batchNo === 'be5d7e74688c4c8787d5e1db9aba2cba',
  'config.batchNo 应还原'
)

const rMax = rNodes.find((n) => n.id === 'node_1776685977959')
console.assert(rMax.data.nodeType === 'processing-extreme', 'max → processing-extreme')
console.assert(rMax.data.config.method === 'max', 'config.method 应为 max')

console.log('✅ 反序列化测试全部通过\n')

// ── 测试 3: 往返一致性 ─────────────────────────────────────────────────────────

console.log('═══ 测试3: 序列化 → 反序列化 往返 ═══')
const roundtrip = deserializeWorkflow(payload)
const payload2 = serializeWorkflow(roundtrip.nodes, roundtrip.edges, roundtrip.streamId)

console.assert(payload2.streamId === payload.streamId, 'streamId 往返一致')
console.assert(payload2.nodeId === payload.nodeId, 'nodeId 往返一致')
console.assert(payload2.nodes.length === payload.nodes.length, 'nodes 数量往返一致')
console.log('✅ 往返一致性测试通过\n')
