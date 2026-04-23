import { defineStore } from 'pinia'

export const useWorkflowStore = defineStore('workflow', {
  state: () => ({
    workflows: [],
    currentWorkflow: null,
  }),

  getters: {
    getWorkflowById: (state) => (id) => state.workflows.find(w => w.id === id),
    getAllWorkflows: (state) => state.workflows,
    getCurrentWorkflow: (state) => state.currentWorkflow,
  },

  actions: {
    initWorkflows() {
      const saved = localStorage.getItem('flow_workflows')
      if (saved) {
        try {
          this.workflows = JSON.parse(saved)
        } catch (e) {
          this.workflows = []
        }
      }
    },

    saveToLocalStorage() {
      localStorage.setItem('flow_workflows', JSON.stringify(this.workflows))
    },

    /**
     * Create a new workflow stored in backend format.
     * @param {string} name
     * @param {string} description
     * @param {object} backendData  - { streamId, nodeId, nodes[] }
     */
    createWorkflow(name, description, backendData) {
      const streamId = backendData.streamId || `wf_${Date.now()}_${Math.random().toString(36).substring(7)}`
      const workflow = {
        id: streamId,
        streamId,
        name,
        description,
        nodeId: backendData.nodeId || '',
        nodes: JSON.parse(JSON.stringify(backendData.nodes || [])),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      this.workflows.push(workflow)
      this.currentWorkflow = workflow
      this.saveToLocalStorage()
      return workflow
    },

    /**
     * Update an existing workflow. Accepts backend format fields.
     * @param {string} id
     * @param {object} updates - may include { name, description, streamId, nodeId, nodes[] }
     */
    updateWorkflow(id, updates) {
      const index = this.workflows.findIndex(w => w.id === id)
      if (index !== -1) {
        this.workflows[index] = {
          ...this.workflows[index],
          ...updates,
          id,                                    // keep original id stable
          updatedAt: new Date().toISOString(),
        }
        if (this.currentWorkflow?.id === id) {
          this.currentWorkflow = this.workflows[index]
        }
        this.saveToLocalStorage()
      }
    },

    deleteWorkflow(id) {
      const index = this.workflows.findIndex(w => w.id === id)
      if (index !== -1) {
        this.workflows.splice(index, 1)
        if (this.currentWorkflow?.id === id) {
          this.currentWorkflow = null
        }
        this.saveToLocalStorage()
      }
    },

    setCurrentWorkflow(workflow) {
      this.currentWorkflow = workflow
    },
  },
})

