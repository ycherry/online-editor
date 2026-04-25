import { defineStore } from 'pinia'

export const useExecutionStore = defineStore('execution', {
  state: () => ({
    mode: 'normal',
    globalStatus: 'idle',
    results: {},
    breakpoints: [],
    currentNodeId: null,
    executionHistory: [],
    progress: { total: 0, completed: 0, percentage: 0 },
  }),

  getters: {
    getNodeResult: (state) => (nodeId) => state.results[nodeId],
    getNodeStatus: (state) => (nodeId) => state.results[nodeId]?.status || 'pending',
    hasBreakpoint: (state) => (nodeId) => state.breakpoints.includes(nodeId),
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
      this.results[result.nodeId] = result
      this.executionHistory.push(result)
      if (result.status === 'completed' || result.status === 'error') {
        this.progress.completed++
        this.progress.percentage = Math.round((this.progress.completed / this.progress.total) * 100)
      }
    },

    clearResults() {
      this.results = {}
      this.executionHistory = []
      this.currentNodeId = null
      this.progress = { total: 0, completed: 0, percentage: 0 }
      this.globalStatus = 'idle'
    },

    addBreakpoint(nodeId) {
      if (!this.breakpoints.includes(nodeId)) this.breakpoints.push(nodeId)
    },

    removeBreakpoint(nodeId) {
      this.breakpoints = this.breakpoints.filter((id) => id !== nodeId)
    },

    toggleBreakpoint(nodeId) {
      if (this.breakpoints.includes(nodeId)) {
        this.breakpoints = this.breakpoints.filter((id) => id !== nodeId)
      } else {
        this.breakpoints.push(nodeId)
      }
    },

    clearBreakpoints() {
      this.breakpoints = []
    },
  },
})
