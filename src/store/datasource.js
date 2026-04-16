import { defineStore } from 'pinia'

export const useDataSourceStore = defineStore('datasource', {
  state: () => ({
    dataSources: [],
    activeDataSourceId: null,
  }),

  getters: {
    getDataSourceById: (state) => (id) => state.dataSources.find(ds => ds.id === id),
    getAllDataSources: (state) => state.dataSources,
    getActiveDataSource: (state) => {
      if (!state.activeDataSourceId) return null
      return state.dataSources.find(ds => ds.id === state.activeDataSourceId)
    },
  },

  actions: {
    addDataSource(dataSource) {
      const newDs = {
        ...dataSource,
        id: `ds_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        createdAt: new Date().toISOString(),
      }
      this.dataSources.push(newDs)
      this.activeDataSourceId = newDs.id
      return newDs
    },

    removeDataSource(id) {
      const index = this.dataSources.findIndex(ds => ds.id === id)
      if (index !== -1) {
        this.dataSources.splice(index, 1)
        if (this.activeDataSourceId === id) {
          this.activeDataSourceId = this.dataSources.length > 0 ? this.dataSources[0].id : null
        }
      }
    },

    setActiveDataSource(id) {
      if (this.dataSources.find(ds => ds.id === id)) {
        this.activeDataSourceId = id
      }
    },

    clearDataSources() {
      this.dataSources = []
      this.activeDataSourceId = null
    },
  },
})
