<template>
  <a-config-provider :locale="zhCN">
    <a-layout style="min-height: 100vh">
      <Sidebar />
      <a-layout>
        <Header />
        <a-layout-content
          :style="{
            margin: '24px 16px',
            padding: '24px',
            background: '#fff',
            minHeight: '280px'
          }"
        >
          <router-view />
        </a-layout-content>
        <a-layout-footer style="text-align: center">
          Online Editor ©{{ currentYear }} Created with Vue 3 + Ant Design Vue
        </a-layout-footer>
      </a-layout>
    </a-layout>
  </a-config-provider>
</template>

<script setup>
import { computed } from 'vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
}

body {
  margin: 0;
  padding: 0;
}
</style>
