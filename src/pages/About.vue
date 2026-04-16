<template>
  <div class="about-page">
    <a-card title="关于我们">
      <a-space direction="vertical" size="large" style="width: 100%">
        <a-typography-paragraph>
          这是一个基于 Vue 3 + Ant Design Vue 构建的在线编辑器项目。
        </a-typography-paragraph>

        <a-divider />

        <a-timeline>
          <a-timeline-item color="green">
            <p>2026-04 项目初始化</p>
            <p>创建基础项目结构</p>
          </a-timeline-item>
          <a-timeline-item color="blue">
            <p>集成路由系统</p>
            <p>配置 Vue Router</p>
          </a-timeline-item>
          <a-timeline-item color="blue">
            <p>集成状态管理</p>
            <p>配置 Pinia Store</p>
          </a-timeline-item>
          <a-timeline-item>
            <p>持续开发中...</p>
          </a-timeline-item>
        </a-timeline>

        <a-divider />

        <a-space>
          <a-tag color="blue">Vue 3</a-tag>
          <a-tag color="green">Ant Design Vue</a-tag>
          <a-tag color="orange">Vite</a-tag>
          <a-tag color="purple">Pinia</a-tag>
          <a-tag color="cyan">Vue Router</a-tag>
        </a-space>
      </a-space>
    </a-card>
  </div>
</template>

<script setup>
</script>

<style scoped>
.about-page {
  padding: 24px;
}
</style>
