<template>
  <div class="editor-page">
    <a-card title="在线编辑器">
      <a-space direction="vertical" size="large" style="width: 100%">
        <a-form layout="vertical">
          <a-form-item label="文档标题">
            <a-input v-model:value="title" placeholder="请输入标题" />
          </a-form-item>
          <a-form-item label="内容">
            <a-textarea
              v-model:value="content"
              placeholder="请输入内容"
              :rows="10"
              show-count
              :maxlength="1000"
            />
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-button type="primary" @click="handleSave">
                <template #icon><SaveOutlined /></template>
                保存
              </a-button>
              <a-button @click="handleClear">清空</a-button>
              <a-button @click="handlePreview">预览</a-button>
            </a-space>
          </a-form-item>
        </a-form>

        <a-card v-if="showPreview" title="预览" size="small">
          <a-typography-title :level="3">{{ title || '未命名文档' }}</a-typography-title>
          <a-typography-paragraph>{{ content || '暂无内容' }}</a-typography-paragraph>
        </a-card>
      </a-space>
    </a-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { SaveOutlined } from '@ant-design/icons-vue'

const title = ref('')
const content = ref('')
const showPreview = ref(false)

const handleSave = () => {
  if (!title.value || !content.value) {
    message.warning('请填写标题和内容')
    return
  }
  message.success('保存成功！')
}

const handleClear = () => {
  title.value = ''
  content.value = ''
  showPreview.value = false
  message.info('已清空')
}

const handlePreview = () => {
  showPreview.value = !showPreview.value
}
</script>

<style scoped>
.editor-page {
  padding: 24px;
}
</style>
