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

    createWorkflow(name, description, nodes, edges) {
      const workflow = {
        id: `workflow_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        name,
        description,
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges)),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      this.workflows.push(workflow)
      this.currentWorkflow = workflow
      this.saveToLocalStorage()
      return workflow
    },

    updateWorkflow(id, updates) {
      const index = this.workflows.findIndex(w => w.id === id)
      if (index !== -1) {
        this.workflows[index] = {
          ...this.workflows[index],
          ...updates,
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
