<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">
        <div class="modal-header">
          <h3>保存工作流</h3>
          <button class="close-btn" @click="$emit('close')">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">工作流名称 *</label>
            <input v-model="workflowName" type="text" class="form-input" placeholder="请输入工作流名称" @keyup.enter="handleSave" />
          </div>
          <div class="form-group">
            <label class="form-label">描述信息</label>
            <textarea v-model="workflowDescription" class="form-textarea" placeholder="可选描述" rows="3"></textarea>
          </div>
          <div class="info-box">
            <p>节点数量: {{ nodeCount }} &nbsp; 连接数量: {{ edgeCount }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-cancel" @click="$emit('close')">取消</button>
          <button class="btn btn-primary" @click="handleSave" :disabled="!workflowName.trim()">保存</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ show: Boolean, nodeCount: Number, edgeCount: Number, defaultName: String, defaultDescription: String })
const emit = defineEmits(['close', 'save'])
const workflowName = ref('')
const workflowDescription = ref('')
watch(() => props.show, (v) => {
  if (v) { workflowName.value = props.defaultName || ''; workflowDescription.value = props.defaultDescription || '' }
})
function handleSave() {
  if (workflowName.value.trim()) emit('save', workflowName.value.trim(), workflowDescription.value.trim())
}
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; z-index: 2000; }
.modal-content { background: white; border-radius: 12px; width: 90%; max-width: 480px; box-shadow: 0 20px 60px rgba(0,0,0,.3); }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #e5e7eb; }
.modal-header h3 { margin: 0; font-size: 17px; font-weight: 600; }
.close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 4px; }
.close-btn:hover { background: #f3f4f6; }
.modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 13px; font-weight: 600; color: #374151; }
.form-input, .form-textarea { width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; font-family: inherit; box-sizing: border-box; }
.form-input:focus, .form-textarea:focus { outline: none; border-color: #4a90e2; }
.info-box { padding: 10px 14px; background: #f3f4f6; border-radius: 6px; font-size: 12px; color: #6b7280; }
.info-box p { margin: 0; }
.modal-footer { padding: 16px 24px; border-top: 1px solid #e5e7eb; display: flex; gap: 10px; justify-content: flex-end; }
.btn { padding: 9px 20px; border-radius: 6px; font-size: 14px; cursor: pointer; border: 1px solid #d1d5db; }
.btn-cancel { background: white; color: #374151; }
.btn-cancel:hover { background: #f9fafb; }
.btn-primary { background: #4a90e2; color: white; border-color: #4a90e2; }
.btn-primary:hover:not(:disabled) { background: #357abd; }
.btn-primary:disabled { opacity: .5; cursor: not-allowed; }
</style>
