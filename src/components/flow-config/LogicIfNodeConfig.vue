<template>
  <div class="config-form">
    <div class="form-group">
      <label class="form-label">条件分支</label>
      <div class="help-text">每个分支为独立 IF / ELSE IF，分支内可组合多个条件规则</div>
      <div class="branches-list">
        <div v-for="(branch, bIdx) in localData.conditions" :key="bIdx" class="branch-item">
          <div class="branch-header">
            <span class="branch-label">{{ bIdx === 0 ? 'IF' : `ELSE IF ${bIdx}` }}</span>
            <button
              class="btn-remove-small"
              :disabled="localData.conditions.length <= 1"
              title="删除此分支"
              @click="removeBranch(bIdx)"
            >×</button>
          </div>
          <div class="rules-list">
            <template v-for="(rule, rIdx) in branch.rules" :key="rIdx">
              <div class="rule-row">
                <input
                  v-model="rule.field"
                  class="rule-input field-input"
                  placeholder="字段名"
                  @input="emitUpdate"
                />
                <select v-model="rule.fieldType" class="rule-select type-select" @change="onTypeChange(rule)">
                  <option value="string">文本</option>
                  <option value="number">数字</option>
                  <option value="boolean">布尔</option>
                  <option value="date">日期</option>
                </select>
                <select v-model="rule.operator" class="rule-select op-select" @change="emitUpdate">
                  <option v-for="op in getOperators(rule.fieldType)" :key="op.value" :value="op.value">{{ op.label }}</option>
                </select>
                <select v-if="rule.fieldType === 'boolean'" v-model="rule.value" class="rule-select value-select" @change="emitUpdate">
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
                <input
                  v-else
                  v-model="rule.value"
                  class="rule-input value-input"
                  placeholder="值"
                  @input="emitUpdate"
                />
                <button
                  class="btn-remove-rule"
                  :disabled="branch.rules.length <= 1"
                  title="删除此规则"
                  @click="removeRule(bIdx, rIdx)"
                >×</button>
              </div>
              <div v-if="rIdx < branch.rules.length - 1" class="logic-connector-row">
                <select v-model="rule.logic" class="logic-select" @change="emitUpdate">
                  <option value="&&">AND（且）</option>
                  <option value="||">OR（或）</option>
                </select>
              </div>
            </template>
            <button class="btn-add-rule" @click="addRule(bIdx)">+ 条件</button>
          </div>
        </div>
        <button class="btn-add" @click="addBranch">+ 添加 ELSE IF 分支</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({ modelValue: Object })
const emit = defineEmits(['update:modelValue'])

const OPERATORS = {
  number:  [
    { value: '>',  label: '> 大于' },
    { value: '<',  label: '< 小于' },
    { value: '>=', label: '>= 大于等于' },
    { value: '<=', label: '<= 小于等于' },
    { value: '=',  label: '= 等于' },
    { value: '!=', label: '!= 不等于' },
  ],
  string: [
    { value: '=',           label: '= 等于' },
    { value: '!=',          label: '!= 不等于' },
    { value: 'contains',    label: 'contains 包含' },
    { value: 'not_contains',label: 'not contains 不包含' },
    { value: 'in',          label: 'in 属于列表' },
    { value: 'startsWith',  label: 'startsWith 开头为' },
    { value: 'endsWith',    label: 'endsWith 结尾为' },
  ],
  boolean: [
    { value: '=',  label: '= 等于' },
    { value: '!=', label: '!= 不等于' },
  ],
  date: [
    { value: '>',  label: '> 晚于' },
    { value: '<',  label: '< 早于' },
    { value: '>=', label: '>= 晚于等于' },
    { value: '<=', label: '<= 早于等于' },
    { value: '=',  label: '= 等于' },
    { value: '!=', label: '!= 不等于' },
  ],
}

function createRule() {
  return { field: '', fieldType: 'string', operator: '=', value: '', logic: '&&' }
}
function createBranch() {
  return { rules: [createRule()] }
}

function normalizeBranch(c) {
  if (c && Array.isArray(c.rules)) return c
  // legacy format: { condition: string, output: '' }
  return { rules: [{ field: '', fieldType: 'string', operator: '=', value: c?.condition || '', logic: '&&' }] }
}

function initConditions(raw) {
  if (!raw || raw.length === 0) return [createBranch()]
  return raw.map(normalizeBranch)
}

const localData = ref({ ...props.modelValue, conditions: initConditions(props.modelValue?.conditions) })

watch(() => props.modelValue, (v) => {
  localData.value = { ...v, conditions: initConditions(v?.conditions) }
}, { deep: true })

function getOperators(fieldType) {
  return OPERATORS[fieldType] || OPERATORS.string
}
function onTypeChange(rule) {
  const ops = getOperators(rule.fieldType)
  if (!ops.find(o => o.value === rule.operator)) rule.operator = ops[0].value
  if (rule.fieldType === 'boolean') rule.value = 'true'
  emitUpdate()
}
function emitUpdate() { emit('update:modelValue', localData.value) }

function addRule(bIdx) { localData.value.conditions[bIdx].rules.push(createRule()); emitUpdate() }
function removeRule(bIdx, rIdx) {
  const rules = localData.value.conditions[bIdx].rules
  if (rules.length > 1) { rules.splice(rIdx, 1); emitUpdate() }
}
function addBranch() { localData.value.conditions.push(createBranch()); emitUpdate() }
function removeBranch(bIdx) {
  if (localData.value.conditions.length > 1) { localData.value.conditions.splice(bIdx, 1); emitUpdate() }
}
</script>

<style scoped>
.config-form { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 13px; font-weight: 600; color: #333; }
.help-text { font-size: 12px; color: #6b7280; }
.branches-list { display: flex; flex-direction: column; gap: 10px; }

.branch-item {
  padding: 10px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.branch-header { display: flex; justify-content: space-between; align-items: center; }
.branch-label {
  font-size: 12px; font-weight: 600; color: #10b981;
  padding: 2px 10px; background: #d1fae5; border-radius: 4px;
}
.btn-remove-small {
  background: #ef4444; color: white; border: none;
  border-radius: 4px; padding: 2px 8px; cursor: pointer; font-size: 15px; line-height: 1;
}
.btn-remove-small:disabled { background: #d1d5db; cursor: not-allowed; }

.rules-list { display: flex; flex-direction: column; gap: 4px; }

.rule-row {
  display: flex; align-items: center; gap: 4px; flex-wrap: wrap;
}
.rule-input {
  padding: 5px 8px; border: 1px solid #d1d5db; border-radius: 5px;
  font-size: 12px; background: white;
}
.rule-input:focus { outline: none; border-color: #10b981; }
.field-input { flex: 1; min-width: 70px; }
.value-input { flex: 1; min-width: 70px; }
.rule-select {
  padding: 5px 4px; border: 1px solid #d1d5db; border-radius: 5px;
  font-size: 12px; background: white; cursor: pointer;
}
.rule-select:focus { outline: none; border-color: #10b981; }
.type-select { max-width: 64px; }
.op-select { max-width: 130px; }
.value-select { max-width: 70px; }
.btn-remove-rule {
  background: #fef2f2; color: #ef4444; border: 1px solid #fecaca;
  border-radius: 4px; padding: 4px 7px; cursor: pointer; font-size: 14px; line-height: 1; flex-shrink: 0;
}
.btn-remove-rule:disabled { color: #d1d5db; border-color: #e5e7eb; background: #f9fafb; cursor: not-allowed; }
.btn-remove-rule:not(:disabled):hover { background: #fee2e2; }

.logic-connector-row { display: flex; align-items: center; padding: 0 4px; }
.logic-select {
  padding: 3px 8px; border: 1px solid #a7f3d0; border-radius: 4px;
  font-size: 11px; font-weight: 600; color: #10b981; background: #ecfdf5; cursor: pointer;
}
.logic-select:focus { outline: none; }

.btn-add-rule {
  align-self: flex-start; padding: 4px 10px; background: white;
  border: 1px dashed #a7f3d0; border-radius: 5px; color: #10b981;
  cursor: pointer; font-size: 12px; margin-top: 2px;
}
.btn-add-rule:hover { background: #ecfdf5; }

.btn-add {
  padding: 8px; background: white; border: 1px dashed #d1d5db;
  border-radius: 6px; color: #6b7280; cursor: pointer; font-size: 13px; text-align: center;
}
.btn-add:hover { border-color: #10b981; color: #10b981; background: #f0fdf4; }
</style>
