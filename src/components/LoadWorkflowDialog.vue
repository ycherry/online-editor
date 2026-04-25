<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">
        <div class="modal-header">
          <h3>加载工作流</h3>
          <button class="close-btn" @click="$emit('close')">×</button>
        </div>
        <div class="modal-body">
          <div v-if="workflows.length === 0" class="empty-state">
            <div class="empty-icon">📭</div>
            <p>还没有保存的工作流</p>
            <p class="hint">创建并保存您的第一个工作流</p>
          </div>
          <div v-else class="workflow-list">
            <div
              v-for="wf in workflows"
              :key="wf.id"
              class="workflow-item"
              @click="handleSelect(wf)"
            >
              <div class="workflow-info">
                <div class="workflow-name">{{ wf.name }}</div>
                <div class="workflow-desc">{{ wf.description || '无描述' }}</div>
                <div class="workflow-meta">
                  <span>📊 {{ wf.nodes.length }} 个节点</span>
                  <span>🔗 {{ wf.edges.length }} 个连接</span>
                  <span>📅 {{ formatDate(wf.updatedAt) }}</span>
                </div>
              </div>
              <div class="workflow-actions">
                <button class="action-btn" @click.stop="handleSelect(wf)" title="加载">📂</button>
                <button class="action-btn danger" @click.stop="handleDelete(wf.id)" title="删除">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn" @click="$emit('close')">关闭</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
  const props = defineProps({ show: Boolean, workflows: Array })
  const emit = defineEmits(['close', 'select', 'delete'])
  function handleSelect(wf) {
    emit('select', wf)
  }
  function handleDelete(id) {
    if (confirm('确定要删除这个工作流吗？')) emit('delete', id)
  }
  function formatDate(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24))
    if (diff === 0) return '今天'
    if (diff === 1) return '昨天'
    if (diff < 7) return `${diff}天前`
    return date.toLocaleDateString('zh-CN')
  }
</script>

<style scoped>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  }
  .modal-content {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 680px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
  }
  .modal-header h3 {
    margin: 0;
    font-size: 17px;
    font-weight: 600;
  }
  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #6b7280;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
  }
  .close-btn:hover {
    background: #f3f4f6;
  }
  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px 24px;
    min-height: 200px;
  }
  .empty-state {
    text-align: center;
    padding: 32px;
    color: #6b7280;
  }
  .empty-icon {
    font-size: 40px;
    margin-bottom: 12px;
  }
  .empty-state p {
    margin: 4px 0;
  }
  .empty-state .hint {
    font-size: 12px;
    color: #9ca3af;
  }
  .workflow-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .workflow-item {
    display: flex;
    align-items: center;
    padding: 14px 16px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .workflow-item:hover {
    border-color: #4a90e2;
    background: #f0f7ff;
  }
  .workflow-info {
    flex: 1;
  }
  .workflow-name {
    font-size: 15px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 4px;
  }
  .workflow-desc {
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 6px;
  }
  .workflow-meta {
    display: flex;
    gap: 12px;
    font-size: 11px;
    color: #9ca3af;
  }
  .workflow-actions {
    display: flex;
    gap: 6px;
  }
  .action-btn {
    background: none;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 6px 10px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
  }
  .action-btn:hover {
    background: #f3f4f6;
  }
  .action-btn.danger:hover {
    background: #fef2f2;
    border-color: #fecaca;
  }
  .modal-footer {
    padding: 14px 24px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
  }
  .btn {
    padding: 9px 20px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    background: white;
  }
  .btn:hover {
    background: #f9fafb;
  }
</style>
