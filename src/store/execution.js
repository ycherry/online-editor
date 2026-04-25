import { defineStore } from 'pinia'

export const useExecutionStore = defineStore('execution', {
  state: () => ({
    mode: 'normal',
    globalStatus: 'idle',
    results: new Map(),
    breakpoints: new Set(),
    currentNodeId: null,
    executionHistory: [],
    progress: { total: 0, completed: 0, percentage: 0 },
  }),

  getters: {
    getNodeResult: (state) => (nodeId) => state.results.get(nodeId),
    getNodeStatus: (state) => (nodeId) => state.results.get(nodeId)?.status || 'pending',
    hasBreakpoint: (state) => (nodeId) => state.breakpoints.has(nodeId),
    isDebugging: (state) => state.mode === 'debug' || state.mode === 'step',
    canContinue: (state) => state.globalStatus === 'paused',
    isRunning: (state) => state.globalStatus === 'running',
  },

  actions: {
    setMode(mode) {
      this.mode = mode
    },

    startExecution(totalNodes) {
      this.globalStatus = 'running'
      this.progress.total = totalNodes
      this.progress.completed = 0
      this.progress.percentage = 0
      this.executionHistory = []
    },

    pauseExecution() {
      this.globalStatus = 'paused'
    },

    resumeExecution() {
      this.globalStatus = 'running'
    },

    stopExecution() {
      this.globalStatus = 'idle'
      this.currentNodeId = null
    },

    completeExecution() {
      this.globalStatus = 'completed'
      this.currentNodeId = null
      this.progress.percentage = 100
    },

    errorExecution() {
      this.globalStatus = 'error'
    },

    setCurrentNode(nodeId) {
      this.currentNodeId = nodeId
    },

    setNodeResult(result) {
      this.results.set(result.nodeId, result)
      this.executionHistory.push(result)
      if (result.status === 'completed' || result.status === 'error') {
        this.progress.completed++
        this.progress.percentage = Math.round((this.progress.completed / this.progress.total) * 100)
      }
    },

    clearResults() {
      this.results.clear()
      this.executionHistory = []
      this.currentNodeId = null
      this.progress = { total: 0, completed: 0, percentage: 0 }
      this.globalStatus = 'idle'
    },

    addBreakpoint(nodeId) {
      this.breakpoints.add(nodeId)
    },

    removeBreakpoint(nodeId) {
      this.breakpoints.delete(nodeId)
    },

    toggleBreakpoint(nodeId) {
      if (this.breakpoints.has(nodeId)) {
        this.breakpoints.delete(nodeId)
      } else {
        this.breakpoints.add(nodeId)
      }
    },

    clearBreakpoints() {
      this.breakpoints.clear()
    },

    getExecutionOrder(nodes, edges) {
      const inDegree = new Map()
      const adjacency = new Map()

      nodes.forEach((node) => {
        inDegree.set(node.id, 0)
        adjacency.set(node.id, [])
      })

      edges.forEach((edge) => {
        adjacency.get(edge.source)?.push(edge.target)
        inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1)
      })

      const queue = []
      const result = []

      inDegree.forEach((degree, nodeId) => {
        if (degree === 0) queue.push(nodeId)
      })

      while (queue.length > 0) {
        const nodeId = queue.shift()
        result.push(nodeId)
        const neighbors = adjacency.get(nodeId) || []
        for (const neighbor of neighbors) {
          const newDegree = (inDegree.get(neighbor) || 0) - 1
          inDegree.set(neighbor, newDegree)
          if (newDegree === 0) queue.push(neighbor)
        }
      }

      return result
    },
  },
})
