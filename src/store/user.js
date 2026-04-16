import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 状态
  const userInfo = ref({
    name: '访客',
    email: ''
  })
  const isLoggedIn = ref(false)

  // 计算属性
  const displayName = computed(() => {
    return userInfo.value.name || '未登录'
  })

  // 方法
  function setUserInfo(info) {
    userInfo.value = info
    isLoggedIn.value = true
  }

  function logout() {
    userInfo.value = {
      name: '访客',
      email: ''
    }
    isLoggedIn.value = false
  }

  return {
    userInfo,
    isLoggedIn,
    displayName,
    setUserInfo,
    logout
  }
})
