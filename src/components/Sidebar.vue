<template>
  <a-layout-sider v-model:collapsed="collapsed" :trigger="null" collapsible>
    <div class="logo">
      <span v-if="!collapsed">Editor</span>
      <span v-else>E</span>
    </div>
    <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline" @click="handleMenuClick">
      <a-menu-item key="/">
        <template #icon><HomeOutlined /></template>
        <span>首页</span>
      </a-menu-item>
      <a-menu-item key="/editor">
        <template #icon><EditOutlined /></template>
        <span>编辑器</span>
      </a-menu-item>
      <a-menu-item key="/about">
        <template #icon><InfoCircleOutlined /></template>
        <span>关于</span>
      </a-menu-item>
    </a-menu>
  </a-layout-sider>
</template>

<script setup>
  import { ref, computed, watch } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { HomeOutlined, EditOutlined, InfoCircleOutlined } from '@ant-design/icons-vue'
  import { useAppStore } from '@/store/app'

  const router = useRouter()
  const route = useRoute()
  const appStore = useAppStore()

  const collapsed = computed({
    get: () => appStore.collapsed,
    set: (value) => {
      if (value !== appStore.collapsed) {
        appStore.toggleSidebar()
      }
    },
  })

  const selectedKeys = ref([route.path])

  watch(
    () => route.path,
    (newPath) => {
      selectedKeys.value = [newPath]
    }
  )

  const handleMenuClick = ({ key }) => {
    router.push(key)
  }
</script>

<style scoped>
  .logo {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 20px;
    font-weight: bold;
    background: rgba(255, 255, 255, 0.1);
  }
</style>
