<template>
  <a-layout-header :style="{ background: '#fff', padding: 0 }">
    <div class="header-container">
      <div class="header-left">
        <menu-unfold-outlined v-if="collapsed" class="trigger" @click="toggleSidebar" />
        <menu-fold-outlined v-else class="trigger" @click="toggleSidebar" />
        <span class="header-title">在线编辑器</span>
      </div>
      <div class="header-right">
        <a-space>
          <a-badge :count="5">
            <BellOutlined :style="{ fontSize: '18px' }" />
          </a-badge>
          <a-dropdown>
            <a-avatar :style="{ backgroundColor: '#1890ff', cursor: 'pointer' }">
              {{ userInfo.name.charAt(0) }}
            </a-avatar>
            <template #overlay>
              <a-menu>
                <a-menu-item key="profile">个人信息</a-menu-item>
                <a-menu-item key="settings">设置</a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout" @click="handleLogout">退出登录</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </a-space>
      </div>
    </div>
  </a-layout-header>
</template>

<script setup>
  import { computed } from 'vue'
  import { message } from 'ant-design-vue'
  import { MenuUnfoldOutlined, MenuFoldOutlined, BellOutlined } from '@ant-design/icons-vue'
  import { useAppStore } from '@/store/app'
  import { useUserStore } from '@/store/user'

  const appStore = useAppStore()
  const userStore = useUserStore()

  const collapsed = computed(() => appStore.collapsed)
  const userInfo = computed(() => userStore.userInfo)

  const toggleSidebar = () => {
    appStore.toggleSidebar()
  }

  const handleLogout = () => {
    userStore.logout()
    message.success('已退出登录')
  }
</script>

<style scoped>
  .header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    height: 64px;
  }

  .header-left {
    display: flex;
    align-items: center;
  }

  .trigger {
    font-size: 18px;
    cursor: pointer;
    transition: color 0.3s;
  }

  .trigger:hover {
    color: #1890ff;
  }

  .header-title {
    margin-left: 16px;
    font-size: 18px;
    font-weight: 500;
  }

  .header-right {
    display: flex;
    align-items: center;
  }
</style>
