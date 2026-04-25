<template>
  <div class="config-form">
    <div class="form-section-title">条件分支配置</div>

    <!-- IF / ELSE IF branches -->
    <div
      v-for="(branch, bIdx) in localData.branches"
      :key="branch.id"
      class="branch-block"
    >
      <div class="branch-block-header">
        <span class="branch-label-tag" :class="bIdx === 0 ? 'tag-if' : 'tag-elseif'">
          {{ bIdx === 0 ? 'IF' : `ELSE IF ${bIdx}` }}
        </span>
        <button
          class="btn-remove-branch"
          :disabled="localData.branches.length <= 1"
          @click="removeBranch(bIdx)"
          title="删除此分支"
        >
          ×
        </button>
      </div>

      <!-- Rules -->
      <div class="rules-list">
        <template v-for="(rule, rIdx) in branch.rules" :key="rIdx">
          <div class="rule-row">
            <!-- Field -->
            <input
              v-model="rule.field"
              class="rule-input field-input"
              placeholder="字段名"
              @input="emitUpdate"
            />
            <!-- Field type -->
            <select v-model="rule.fieldType" class="rule-select type-select" @change="onTypeChange(rule)">
              <option value="string">文本</option>
              <option value="number">数字</option>
              <option value="boolean">布尔</option>
              <option value="date">日期</option>
            </select>
            <!-- Operator -->
            <select v-model="rule.operator" class="rule-select op-select" @change="emitUpdate">
              <option
                v-for="op in getOperators(rule.fieldType)"
                :key="op.value"
                :value="op.value"
              >
                {{ op.label }}
              </option>
            </select>
            <!-- Value -->
            <select
              v-if="rule.fieldType === 'boolean'"
              v-model="rule.value"
              class="rule-select value-select"
              @change="emitUpdate"
            >
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
            <!-- Remove rule -->
            <button
              class="btn-remove-rule"
              :disabled="branch.rules.length <= 1"
              @click="removeRule(bIdx, rIdx)"
            >
              ×
            </button>
          </div>
          <!-- AND / OR connector between rules -->
          <div v-if="rIdx < branch.rules.length - 1" class="logic-connector-row">
            <select v-model="rule.logic" class="logic-select" @change="emitUpdate">
              <option value="&&">AND（且）</option>
              <option value="||">OR（或）</option>
            </select>
          </div>
        </template>
        <button class="btn-add-rule" @click="addRule(bIdx)">+ 添加条件</button>
      </div>
    </div>

    <button class="btn-add-branch" @click="addBranch">+ 添加 ELSE IF 分支</button>

    <!-- ELSE branch -->
    <div v-if="!localData.hasElse" class="btn-add-branch btn-add-else" @click="enableElse">
      + 添加 ELSE 分支（兜底）
    </div>
    <div v-else class="branch-block else-block">
      <div class="branch-block-header">
        <span class="branch-label-tag tag-else">ELSE</span>
        <button class="btn-remove-branch" @click="disableElse" title="移除 ELSE 分支">×</button>
      </div>
      <!-- ELSE Rules -->
      <div class="rules-list">
        <template v-for="(rule, rIdx) in (localData.elseBranch?.rules || [])" :key="rIdx">
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
              <option v-for="op in getOperators(rule.fieldType)" :key="op.value" :value="op.value">
                {{ op.label }}
              </option>
            </select>
            <select
              v-if="rule.fieldType === 'boolean'"
              v-model="rule.value"
              class="rule-select value-select"
              @change="emitUpdate"
            >
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
              :disabled="(localData.elseBranch?.rules || []).length <= 1"
              @click="removeElseRule(rIdx)"
            >
              ×
            </button>
          </div>
          <div v-if="rIdx < (localData.elseBranch?.rules || []).length - 1" class="logic-connector-row">
            <select v-model="rule.logic" class="logic-select" @change="emitUpdate">
              <option value="&&">AND（且）</option>
              <option value="||">OR（或）</option>
            </select>
          </div>
        </template>
        <button class="btn-add-rule" @click="addElseRule">+ 添加条件</button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, watch } from 'vue'

  const props = defineProps({ modelValue: Object })
  const emit = defineEmits(['update:modelValue'])

  const OPERATORS = {
    number: [
      { value: '>', label: '> 大于' },
      { value: '<', label: '< 小于' },
      { value: '>=', label: '>= 大于等于' },
      { value: '<=', label: '<= 小于等于' },
      { value: '=', label: '= 等于' },
      { value: '!=', label: '!= 不等于' },
    ],
    string: [
      { value: '=', label: '= 等于' },
      { value: '!=', label: '!= 不等于' },
      { value: 'contains', label: 'contains 包含' },
      { value: 'not_contains', label: 'not contains 不包含' },
      { value: 'startsWith', label: 'startsWith 开头为' },
      { value: 'endsWith', label: 'endsWith 结尾为' },
      { value: 'in', label: 'in 属于列表' },
    ],
    boolean: [
      { value: '=', label: '= 等于' },
      { value: '!=', label: '!= 不等于' },
    ],
    date: [
      { value: '>', label: '> 晚于' },
      { value: '<', label: '< 早于' },
      { value: '>=', label: '>= 晚于等于' },
      { value: '<=', label: '<= 早于等于' },
      { value: '=', label: '= 等于' },
      { value: '!=', label: '!= 不等于' },
    ],
  }

  function createRule() {
    return { field: '', fieldType: 'string', operator: '=', value: '', logic: '&&' }
  }

  function createBranch(idx) {
    return { id: `branch-${idx}-${Date.now()}`, rules: [createRule()] }
  }

  function initData(raw) {
    const data = { ...raw }
    if (!data.branches || data.branches.length === 0) {
      data.branches = [createBranch(0)]
    } else {
      data.branches = data.branches.map((b, i) => ({
        id: b.id || `branch-${i}`,
        rules: b.rules && b.rules.length ? b.rules : [createRule()],
      }))
    }
    if (data.hasElse === undefined) data.hasElse = false
    if (data.hasElse && !data.elseBranch) {
      data.elseBranch = { id: 'branch-else', rules: [createRule()] }
    }
    return data
  }

  const localData = ref(initData(props.modelValue || {}))

  watch(
    () => props.modelValue,
    (v) => {
      localData.value = initData(v || {})
    },
    { deep: true }
  )

  function getOperators(fieldType) {
    return OPERATORS[fieldType] || OPERATORS.string
  }

  function onTypeChange(rule) {
    const ops = getOperators(rule.fieldType)
    if (!ops.find((o) => o.value === rule.operator)) rule.operator = ops[0].value
    if (rule.fieldType === 'boolean') rule.value = 'true'
    emitUpdate()
  }

  function addRule(bIdx) {
    localData.value.branches[bIdx].rules.push(createRule())
    emitUpdate()
  }

  function removeRule(bIdx, rIdx) {
    const rules = localData.value.branches[bIdx].rules
    if (rules.length > 1) {
      rules.splice(rIdx, 1)
      emitUpdate()
    }
  }

  function addBranch() {
    const idx = localData.value.branches.length
    localData.value.branches.push(createBranch(idx))
    emitUpdate()
  }

  function removeBranch(bIdx) {
    if (localData.value.branches.length > 1) {
      localData.value.branches.splice(bIdx, 1)
      emitUpdate()
    }
  }

  function enableElse() {
    localData.value.hasElse = true
    if (!localData.value.elseBranch) {
      localData.value.elseBranch = { id: 'branch-else', rules: [createRule()] }
    }
    emitUpdate()
  }

  function disableElse() {
    localData.value.hasElse = false
    localData.value.elseBranch = null
    emitUpdate()
  }

  function addElseRule() {
    if (!localData.value.elseBranch) {
      localData.value.elseBranch = { id: 'branch-else', rules: [] }
    }
    localData.value.elseBranch.rules.push(createRule())
    emitUpdate()
  }

  function removeElseRule(rIdx) {
    const rules = localData.value.elseBranch?.rules
    if (rules && rules.length > 1) {
      rules.splice(rIdx, 1)
      emitUpdate()
    }
  }

  function emitUpdate() {
    emit('update:modelValue', localData.value)
  }
</script>

<style scoped>
  .config-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .form-section-title {
    font-size: 12px;
    font-weight: 600;
    color: #7c3aed;
    border-bottom: 1px solid #ede9fe;
    padding-bottom: 6px;
    margin-bottom: 2px;
  }
  .branch-block {
    border: 1px solid #e9d5ff;
    border-radius: 6px;
    padding: 8px 10px;
    background: #faf5ff;
  }
  .else-block {
    background: #fff0f6;
    border-color: #fbcfe8;
  }
  .branch-block-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  .branch-label-tag {
    font-size: 11px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 4px;
  }
  .tag-if {
    background: #ede9fe;
    color: #7c3aed;
  }
  .tag-elseif {
    background: #ddd6fe;
    color: #6d28d9;
  }
  .tag-else {
    background: #fce7f3;
    color: #be185d;
  }
  .btn-remove-branch {
    background: none;
    border: none;
    color: #ef4444;
    font-size: 16px;
    cursor: pointer;
    padding: 0 4px;
    line-height: 1;
  }
  .btn-remove-branch:disabled {
    color: #d1d5db;
    cursor: not-allowed;
  }
  .rules-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .rule-row {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
  }
  .rule-input {
    padding: 4px 6px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 12px;
    background: white;
    outline: none;
  }
  .rule-input:focus {
    border-color: #8b5cf6;
  }
  .field-input {
    flex: 1;
    min-width: 70px;
  }
  .value-input {
    flex: 1;
    min-width: 60px;
  }
  .rule-select {
    padding: 4px 4px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 11px;
    background: white;
    outline: none;
    cursor: pointer;
  }
  .rule-select:focus {
    border-color: #8b5cf6;
  }
  .type-select {
    width: 54px;
  }
  .op-select {
    min-width: 80px;
  }
  .value-select {
    width: 60px;
  }
  .btn-remove-rule {
    background: none;
    border: none;
    color: #ef4444;
    font-size: 14px;
    cursor: pointer;
    padding: 0 2px;
    flex-shrink: 0;
  }
  .btn-remove-rule:disabled {
    color: #d1d5db;
    cursor: not-allowed;
  }
  .logic-connector-row {
    display: flex;
    align-items: center;
    padding-left: 4px;
  }
  .logic-select {
    padding: 2px 6px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 11px;
    background: #f3f4f6;
    cursor: pointer;
  }
  .btn-add-rule {
    font-size: 11px;
    color: #7c3aed;
    background: none;
    border: 1px dashed #c4b5fd;
    border-radius: 4px;
    padding: 3px 8px;
    cursor: pointer;
    align-self: flex-start;
    margin-top: 2px;
  }
  .btn-add-rule:hover {
    background: #f5f3ff;
  }
  .btn-add-branch {
    font-size: 12px;
    color: #7c3aed;
    background: none;
    border: 1px dashed #c4b5fd;
    border-radius: 6px;
    padding: 6px 12px;
    cursor: pointer;
    text-align: center;
  }
  .btn-add-branch:hover {
    background: #f5f3ff;
  }
  .btn-add-else {
    color: #be185d;
    border-color: #fbcfe8;
  }
  .btn-add-else:hover {
    background: #fff0f6;
  }
  .else-hint {
    font-size: 11px;
    color: #9ca3af;
    margin: 0;
  }
</style>
