<template>
  <el-drawer
    v-model="visible"
    title="设置"
    direction="rtl"
    size="400px"
  >
    <div class="settings-container">
      <el-form :model="settings" label-width="120px">
        <el-form-item label="深色模式">
          <el-switch
            v-model="settings.isDarkMode"
            @change="handleDarkModeChange"
          />
        </el-form-item>

        <el-form-item label="模型">
          <el-select v-model="settings.model" class="w-full">
            <el-option
              v-for="model in modelOptions"
              :key="model.value"
              :label="model.label"
              :value="model.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Temperature">
          <el-slider
            v-model="settings.temperature"
            :min="0"
            :max="1"
            :step="0.1"
            show-input
          />
        </el-form-item>

        <el-form-item label="最大Token">
          <el-input-number
            v-model="settings.maxTokens"
            :min="1"
            :max="4096"
            :step="1"
          />
        </el-form-item>

        <el-form-item label="API Key">
          <el-input
            v-model="settings.apiKey"
            type="password"
            show-password
            placeholder="请输入API Key"
          />
        </el-form-item>

        <el-form-item label="流式响应">
          <el-switch
            v-model="settings.streamResponse"
          />
          <div class="form-item-tip">开启后将实时显示AI回复</div>
        </el-form-item>
      </el-form>

      <div class="settings-footer">
        <el-button type="primary" @click="handleSave">保存设置</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useSettingsStore } from '../stores/settings'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])

const settingsStore = useSettingsStore()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const modelOptions = [
  { label: 'GLM-4', value: 'glm-4' },
  { label: 'GLM-4-FLASH', value: 'glm-4-flash' },
  { label: 'GLM-3-Turbo', value: 'glm-3-turbo' }
]

const settings = reactive({
  isDarkMode: settingsStore.isDarkMode,
  model: settingsStore.model,
  temperature: settingsStore.temperature,
  maxTokens: settingsStore.maxTokens,
  apiKey: settingsStore.apiKey,
  streamResponse: settingsStore.streamResponse
})

const handleDarkModeChange = (value) => {
  settingsStore.toggleDarkMode()
}

const handleSave = () => {
  settingsStore.updateSettings(settings)
  ElMessage.success('设置已保存')
  visible.value = false
}
</script>

<style lang="scss" scoped>
.settings-container {
  padding: 1rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.settings-footer {
  margin-top: auto;
  padding-top: 1rem;
  text-align: right;
}

.w-full {
  width: 100%;
}

.form-item-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style> 