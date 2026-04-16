import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 状态
  const collapsed = ref(false)
  const theme = ref('light')

  // 方法
  function toggleSidebar() {
    collapsed.value = !collapsed.value
  }

  function setTheme(newTheme) {
    theme.value = newTheme
  }

  return {
    collapsed,
    theme,
    toggleSidebar,
    setTheme
  }
})
