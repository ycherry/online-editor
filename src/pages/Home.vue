<template>
  <div class="home-page">
    <a-card title="欢迎使用在线编辑器">
      <a-space direction="vertical" size="large" style="width: 100%">
        <a-alert
          message="欢迎"
          :description="`你好，${displayName}！`"
          type="success"
          show-icon
        />
        
        <a-row :gutter="16">
          <a-col :span="8">
            <a-statistic title="活跃用户" :value="112893" />
          </a-col>
          <a-col :span="8">
            <a-statistic title="文档数量" :value="1128" />
          </a-col>
          <a-col :span="8">
            <a-statistic title="在线人数" :value="93" suffix="/ 100" />
          </a-col>
        </a-row>

        <a-descriptions title="系统信息" bordered>
          <a-descriptions-item label="框架">Vue 3</a-descriptions-item>
          <a-descriptions-item label="UI库">Ant Design Vue</a-descriptions-item>
          <a-descriptions-item label="路由">Vue Router</a-descriptions-item>
          <a-descriptions-item label="状态管理">Pinia</a-descriptions-item>
          <a-descriptions-item label="构建工具">Vite</a-descriptions-item>
        </a-descriptions>
      </a-space>
    </a-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const displayName = computed(() => userStore.displayName)
</script>

<style scoped>
.home-page {
  padding: 24px;
}
</style>
