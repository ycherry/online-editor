import { useExecutionStore } from '@/store/execution'
import { queryPriceApi } from '@/services/priceAnalysisService'

export class WorkflowExecutor {
  constructor(nodes, edges) {
    this.nodes = nodes
    this.edges = edges
    this.executionStore = useExecutionStore()
    this.nodeResults = new Map()
    this.isStopRequested = false
    this._resumeResolve = null
  }

  async execute(mode = 'normal') {
    this.isStopRequested = false
    this.nodeResults.clear()

    try {
      const executionOrder = this.executionStore.getExecutionOrder(this.nodes, this.edges)
      this.executionStore.startExecution(executionOrder.length)

      for (const nodeId of executionOrder) {
        if (this.isStopRequested) break

        if (mode === 'debug' && this.executionStore.hasBreakpoint(nodeId)) {
          this.executionStore.pauseExecution()
          this.executionStore.setCurrentNode(nodeId)
          await this.waitForContinue()
          if (this.isStopRequested) break
        }

        await this.executeNode(nodeId)

        if (mode === 'step') {
          this.executionStore.pauseExecution()
          await this.waitForContinue()
        }
      }

      if (!this.isStopRequested) {
        this.executionStore.completeExecution()
      }
    } catch (error) {
      console.error('工作流执行出错:', error)
      this.executionStore.errorExecution()
      throw error
    }
  }

  waitForContinue() {
    return new Promise((resolve) => {
      this._resumeResolve = resolve
      const unwatch = setInterval(() => {
        if (this.executionStore.globalStatus === 'running' || this.isStopRequested) {
          clearInterval(unwatch)
          resolve()
        }
      }, 200)
    })
  }

  stop() {
    this.isStopRequested = true
    if (this._resumeResolve) {
      this._resumeResolve()
      this._resumeResolve = null
    }
  }

  async executeNode(nodeId) {
    const node = this.nodes.find(n => n.id === nodeId)
    if (!node) throw new Error(`节点 ${nodeId} 不存在`)

    const startTime = Date.now()
    this.executionStore.setCurrentNode(nodeId)
    this.executionStore.setNodeResult({ nodeId, status: 'running', output: null, startTime })

    try {
      const inputs = this.getNodeInputs(nodeId)
      const output = await this.executeNodeByType(node, inputs)
      this.nodeResults.set(nodeId, output)
      const endTime = Date.now()
      this.executionStore.setNodeResult({
        nodeId, status: 'completed', output, startTime, endTime, duration: endTime - startTime,
      })
    } catch (error) {
      const endTime = Date.now()
      this.executionStore.setNodeResult({
        nodeId, status: 'error', output: null,
        error: error.message || '执行出错', startTime, endTime, duration: endTime - startTime,
      })
      throw error
    }
  }

  getNodeInputs(nodeId) {
    const incomingEdges = this.edges.filter(e => e.target === nodeId)
    return incomingEdges.map(edge => this.nodeResults.get(edge.source))
  }

  async executeNodeByType(node, inputs) {
    const nodeType = node.data.nodeType || node.type || 'default'
    const data = { ...node.data, ...(node.data.config || {}) }

    if (nodeType.includes('data')) return this.executeDataNode(data)
    if (nodeType === 'logic-if') return this.executeLogicIfNode(data, inputs)
    if (nodeType.includes('logic-and')) return inputs.every(i => Boolean(i))
    if (nodeType.includes('logic-or')) return inputs.some(i => Boolean(i))
    if (nodeType.includes('logic-nor')) return !inputs.some(i => Boolean(i))
    if (nodeType.includes('condition-belongs')) return this.executeConditionBelongsNode(data, inputs)
    if (nodeType.includes('condition-compare')) return this.executeConditionCompareNode(data, inputs)
    if (nodeType.includes('calculation')) return this.executeCalculationNode(data, inputs)
    if (nodeType.includes('query-api')) return this.executeQueryApiNode(data, inputs)
    if (nodeType.includes('query-field')) return this.executeQueryFieldNode(data, inputs)
    if (nodeType.includes('query-filter')) return this.executeQueryFilterNode(data, inputs)
    if (nodeType.includes('query-condition')) return this.executeQueryConditionNode(data, inputs)
    if (nodeType.includes('processing-extreme')) return this.executeProcessingExtremeNode(data, inputs)
    if (nodeType.includes('processing-average')) return this.executeProcessingAverageNode(data, inputs)
    if (nodeType.includes('processing-interpolation')) return this.executeProcessingInterpolationNode(data, inputs)
    if (nodeType.includes('processing-price')) return inputs[0]
    if (nodeType.includes('container-list')) return this.executeContainerListNode(data)
    if (nodeType.includes('container-dict')) return this.executeContainerDictNode(data)
    if (nodeType.includes('execution-for')) return this.executeForNode(data, inputs)
    if (nodeType.includes('comparison')) return this.executeComparisonNode(data, inputs)
    if (nodeType.includes('output')) return this.executeOutputNode(data, inputs)
    return inputs[0]
  }

  executeDataNode(data) {
    if (!data.rawData || !Array.isArray(data.rawData) || data.rawData.length === 0) {
      throw new Error(`数据节点 "${data.label}" 未上传数据`)
    }
    return data.rawData
  }

  executeLogicIfNode(data, inputs) {
    const conditions = data.conditions || []
    if (conditions.length === 0) throw new Error('IF节点未配置条件')
    const inputData = inputs[0]
    if (!Array.isArray(inputData) || inputData.length === 0) {
      throw new Error('IF节点输入数据为空')
    }
    const headers = inputData[0]
    const rows = inputData.slice(1)

    // Try each IF / ELSE IF branch in order; return first non-empty match
    for (const branch of conditions) {
      if (!branch.rules || branch.rules.length === 0) continue
      let filtered = rows.filter(row => this._evalIfRules(headers, row, branch.rules))
      // apply sub-conditions if configured (fields from a second source)
      if (branch.subRules && branch.subRules.length > 0 && branch.subRules.some(r => r.field)) {
        filtered = filtered.filter(row => this._evalIfRules(headers, row, branch.subRules))
      }
      if (filtered.length > 0) return [headers, ...filtered]
    }

    // ELSE: start from rows not matched by any branch, then optionally apply else rules
    if (data.hasElse) {
      const matchedSet = new Set()
      for (const branch of conditions) {
        if (!branch.rules || branch.rules.length === 0) continue
        rows.forEach((row, i) => {
          if (this._evalIfRules(headers, row, branch.rules)) matchedSet.add(i)
        })
      }
      let elseRows = rows.filter((_, i) => !matchedSet.has(i))
      const elseRules = data.elseBranch?.rules
      if (elseRules && elseRules.length > 0 && elseRules.some(r => r.field)) {
        elseRows = elseRows.filter(row => this._evalIfRules(headers, row, elseRules))
      }
      const elseSubRules = data.elseBranch?.subRules
      if (elseSubRules && elseSubRules.length > 0 && elseSubRules.some(r => r.field)) {
        elseRows = elseRows.filter(row => this._evalIfRules(headers, row, elseSubRules))
      }
      return [headers, ...elseRows]
    }

    return [headers]
  }

  _evalIfRules(headers, row, rules) {
    let result = this._evalIfRule(headers, row, rules[0])
    for (let i = 1; i < rules.length; i++) {
      const logic = rules[i - 1].logic || '&&'
      const next = this._evalIfRule(headers, row, rules[i])
      result = logic === '||' ? result || next : result && next
    }
    return result
  }

  _evalIfRule(headers, row, rule) {
    const fieldIndex = headers.findIndex(h => h === String(rule.field || '').trim())
    if (fieldIndex === -1) return false
    const cell = String(row[fieldIndex] ?? '').trim()
    const target = String(rule.value ?? '').trim()
    switch (rule.operator) {
      case '=': case '==': return cell === target
      case '!=': return cell !== target
      case '>': return Number(cell) > Number(target)
      case '<': return Number(cell) < Number(target)
      case '>=': return Number(cell) >= Number(target)
      case '<=': return Number(cell) <= Number(target)
      case 'contains': return cell.includes(target)
      case 'not_contains': return !cell.includes(target)
      case 'in': return target.split(',').map(s => s.trim()).includes(cell)
      case 'startsWith': return cell.startsWith(target)
      case 'endsWith': return cell.endsWith(target)
      default: return false
    }
  }

  executeConditionBelongsNode(data, inputs) {
    const value = inputs[0]
    const container = inputs[1]
    if (!Array.isArray(container)) throw new Error('集合必须是数组')
    return container.includes(value)
  }

  executeConditionCompareNode(data, inputs) {
    const [v1, v2] = inputs
    switch (data.operator) {
      case '>': return v1 > v2
      case '<': return v1 < v2
      case '>=': return v1 >= v2
      case '<=': return v1 <= v2
      case '==': return v1 === v2
      case '!=': return v1 !== v2
      default: return false
    }
  }

  executeCalculationNode(data, inputs) {
    const params = inputs.length > 0 ? inputs : (data.params || []).map(Number)
    if (params.length < 2) throw new Error('运算节点至少需要2个参数')
    return params.reduce((acc, val, idx) => {
      if (idx === 0) return val
      switch (data.operator) {
        case '+': return acc + val
        case '-': return acc - val
        case '*': return acc * val
        case '/': return val !== 0 ? acc / val : 0
        case '%': return acc % val
        case '**': return Math.pow(acc, val)
        default: return acc
      }
    })
  }

  executeQueryFilterNode(data, inputs) {
    const inputData = inputs[0]
    if (!Array.isArray(inputData) || inputData.length === 0) return []
    const headers = inputData[0]
    const rows = inputData.slice(1)
    if (!data.condition) return inputData
    const condition = data.condition
    const match = condition.match(/^\s*(.+?)\s*(==|!=|>=|<=|>|<|contains)\s*["']?(.+?)["']?\s*$/)
    if (!match) return inputData
    const [, fieldName, operator, targetValue] = match
    const fieldIndex = headers.findIndex(h => h === fieldName.trim())
    if (fieldIndex === -1) return inputData
    const filteredRows = rows.filter(row => {
      const cellValue = String(row[fieldIndex] || '').trim()
      switch (operator) {
        case '==': return cellValue === targetValue
        case '!=': return cellValue !== targetValue
        case '>': return Number(cellValue) > Number(targetValue)
        case '<': return Number(cellValue) < Number(targetValue)
        case '>=': return Number(cellValue) >= Number(targetValue)
        case '<=': return Number(cellValue) <= Number(targetValue)
        case 'contains': return cellValue.includes(targetValue)
        default: return true
      }
    })
    return [headers, ...filteredRows]
  }

  executeQueryConditionNode(data, inputs) {
    const inputData = inputs[0]
    if (!Array.isArray(inputData) || inputData.length === 0) return []
    const headers = inputData[0]
    const rows = inputData.slice(1)
    if (!data.field || !data.value) return inputData
    const fieldIndex = headers.findIndex(h => h === data.field)
    if (fieldIndex === -1) return inputData
    const filteredRows = rows.filter(row => {
      const cellValue = String(row[fieldIndex] || '').trim()
      const target = String(data.value).trim()
      switch (data.matchMode) {
        case 'exact': return cellValue === target
        case 'contains': return cellValue.includes(target)
        case 'startsWith': return cellValue.startsWith(target)
        case 'endsWith': return cellValue.endsWith(target)
        default: return cellValue === target
      }
    })
    return [headers, ...filteredRows]
  }

  executeProcessingExtremeNode(data, inputs) {
    const inputData = inputs[0]
    let values = []
    if (Array.isArray(inputData)) {
      if (Array.isArray(inputData[0])) {
        values = inputData.slice(1).flatMap(row => row.map(Number).filter(n => !isNaN(n)))
      } else {
        values = inputData.map(Number).filter(n => !isNaN(n))
      }
    }
    if (values.length === 0) return null
    const sorted = [...values].sort((a, b) => a - b)
    switch (data.method) {
      case 'max': return Math.max(...values)
      case 'min': return Math.min(...values)
      case 'median': {
        const mid = Math.floor(sorted.length / 2)
        return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
      }
      case 'second_low': return sorted.length >= 2 ? sorted[1] : sorted[0]
      case 'second_high': return sorted.length >= 2 ? sorted[sorted.length - 2] : sorted[sorted.length - 1]
      default: return Math.max(...values)
    }
  }

  executeProcessingAverageNode(data, inputs) {
    const values = (Array.isArray(inputs[0]) ? inputs[0] : []).map(Number).filter(n => !isNaN(n))
    if (values.length === 0) return 0
    if (data.method === 'arithmetic') {
      return values.reduce((a, b) => a + b, 0) / values.length
    }
    if (data.method === 'weighted') {
      const weights = (Array.isArray(inputs[1]) ? inputs[1] : []).map(Number)
      if (weights.length !== values.length) return values.reduce((a, b) => a + b, 0) / values.length
      const weightedSum = values.reduce((acc, v, i) => acc + v * (weights[i] || 1), 0)
      const totalWeight = weights.reduce((a, b) => a + b, 0)
      return totalWeight > 0 ? weightedSum / totalWeight : 0
    }
    return 0
  }

  executeProcessingInterpolationNode(data, inputs) {
    const inputData = inputs[0]
    if (!Array.isArray(inputData) || inputData.length === 0) return inputData
    if (Array.isArray(inputData[0])) {
      const headers = inputData[0]
      const rows = inputData.slice(1)
      const result = rows.map(r => [...r])
      for (let col = 0; col < headers.length; col++) {
        const colValues = rows.map(r => r[col])
        const hasMissing = colValues.some(v => v === null || v === undefined || v === '' || (typeof v === 'string' && v.trim() === ''))
        if (hasMissing) {
          const interpolated = this._interpolateValues(colValues, data.method)
          interpolated.forEach((val, rowIdx) => { result[rowIdx][col] = val })
        }
      }
      return [headers, ...result]
    }
    return this._interpolateValues(inputData, data.method)
  }

  _interpolateValues(values, method) {
    const nums = values.map(v => {
      if (v === null || v === undefined || v === '') return null
      const n = Number(v)
      return isNaN(n) ? null : n
    })
    if (method === 'nearest') {
      return nums.map((v, i) => {
        if (v !== null) return v
        let left = i - 1, right = i + 1
        while (left >= 0 && nums[left] === null) left--
        while (right < nums.length && nums[right] === null) right++
        const hasLeft = left >= 0
        const hasRight = right < nums.length
        if (hasLeft && hasRight) return (i - left) <= (right - i) ? nums[left] : nums[right]
        if (hasLeft) return nums[left]
        if (hasRight) return nums[right]
        return 0
      })
    }
    if (method === 'regression') {
      const known = []
      nums.forEach((v, i) => { if (v !== null) known.push([i, v]) })
      if (known.length === 0) return nums.map(() => 0)
      if (known.length === 1) return nums.map(v => (v !== null ? v : known[0][1]))
      const n = known.length
      const sumX = known.reduce((s, [x]) => s + x, 0)
      const sumY = known.reduce((s, [, y]) => s + y, 0)
      const sumXY = known.reduce((s, [x, y]) => s + x * y, 0)
      const sumX2 = known.reduce((s, [x]) => s + x * x, 0)
      const denom = n * sumX2 - sumX * sumX
      const b = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0
      const a = (sumY - b * sumX) / n
      return nums.map((v, i) => v !== null ? v : parseFloat((a + b * i).toFixed(4)))
    }
    return nums.map(v => (v !== null ? v : 0))
  }

  executeContainerListNode(data) {
    return data.elements || []
  }

  executeContainerDictNode(data) {
    const dict = {}
    for (const pair of (data.pairs || [])) {
      if (pair.key) dict[pair.key] = pair.value
    }
    return dict
  }

  executeForNode(data, inputs) {
    const list = inputs[0] || []
    if (!Array.isArray(list)) return { count: 0, items: [] }
    return { count: list.length, items: list }
  }

  executeComparisonNode(data, inputs) {
    const lists = inputs.filter(Boolean)
    return {
      analysisType: data.analysisType,
      dataCount: lists.length,
      message: `已接收 ${lists.length} 个数据列表，分析类型: ${data.analysisType || '未设置'}`,
    }
  }

  executeOutputNode(data, inputs) {
    const inputData = inputs[0]
    if (!Array.isArray(inputData) || inputData.length === 0) {
      throw new Error(`输出节点 "${data.label}" 输入数据为空`)
    }

    const headers = inputData[0]
    const rows = inputData.slice(1)

    // Second input may be a scalar unit price (from calculation chain after query-api)
    const externalUnitPrice = (inputs.length >= 2 && typeof inputs[1] === 'number' && !isNaN(inputs[1]))
      ? inputs[1]
      : null

    const unitPriceIdx = headers.findIndex(h => String(h).trim() === '单价')
    const quantityIdx = headers.findIndex(h => String(h).trim() === '数量')

    const outputHeaders = [...headers, '合价']

    const processedRows = rows.map(row => {
      const unitPrice = externalUnitPrice !== null
        ? externalUnitPrice
        : (unitPriceIdx !== -1 ? (parseFloat(row[unitPriceIdx]) || 0) : 0)
      const quantity = quantityIdx !== -1 ? (parseFloat(row[quantityIdx]) || 0) : 0
      const total = parseFloat((unitPrice * quantity).toFixed(4))
      return [...row, total]
    })

    return {
      headers: outputHeaders,
      rows: processedRows,
      filename: data.filename || '输出数据',
      totalRows: processedRows.length,
      unitPrice: externalUnitPrice,
    }
  }

  // ── 后端查询节点 ──────────────────────────────────────────────────
  // 取输入表格的第一条数据行，按 fieldMappings 组装请求参数，调用 API，
  // 返回 [apiHeaders, ...apiRows] 格式供后续节点处理。
  async executeQueryApiNode(data, inputs) {
    const inputData = inputs[0]
    if (!Array.isArray(inputData) || inputData.length < 2) {
      throw new Error('后端查询节点：输入数据为空，请确保上游有数据传入')
    }

    // Build params from fieldMappings [{inputField, apiParam}]
    const firstRow = inputData[1]
    const rowObj = {}
    headers.forEach((h, i) => { rowObj[h] = firstRow[i] })

    // Build params from fieldMappings [{inputField, apiParam}]
    const params = {}
    for (const mapping of (data.fieldMappings || [])) {
      if (mapping.inputField && mapping.apiParam) {
        params[mapping.apiParam] = rowObj[mapping.inputField] ?? ''
      }
    }

    const { headers: apiHeaders, rows: apiRows } = await queryPriceApi(params)

    if (apiHeaders.length === 0) {
      throw new Error('后端查询节点：API 未返回任何数据')
    }

    return [apiHeaders, ...apiRows]
  }

  // ── 字段提取节点 ──────────────────────────────────────────────────
  // 从表格数据中提取指定列，返回数值数组（可直接接处理节点）。
  // 若配置了 extractFirst=true，则只返回第一行的该字段（标量）。
  executeQueryFieldNode(data, inputs) {
    const inputData = inputs[0]
    if (!Array.isArray(inputData) || inputData.length < 2) return []

    const headers = inputData[0]
    const rows = inputData.slice(1)
    const fieldName = (data.extractField || '').trim()
    const colIdx = headers.findIndex(h => String(h).trim() === fieldName)
    if (colIdx === -1) throw new Error(`字段提取节点：找不到列 "${fieldName}"`)

    if (data.extractFirst) {
      return parseFloat(rows[0]?.[colIdx]) || 0
    }
    return rows.map(r => parseFloat(r[colIdx]) || 0)
  }
}
