<template>
  <div class="chat-input-container">
    <div class="input-wrapper">
      <el-input
        v-model="messageText"
        type="textarea"
        :rows="3"
        :placeholder="placeholder"
        resize="none"
        @keydown.enter.exact.prevent="handleSend"
        @keydown.enter.shift.exact="newline"
      />
      <div class="button-group">
        <el-tooltip content="清空对话" placement="top">
          <el-button
            circle
            type="danger"
            :icon="Delete"
            @click="handleClear"
          />
        </el-tooltip>
        <el-button
          type="primary"
          :loading="loading"
          @click="handleSend"
        >
          <template #icon>
            <el-icon><Position /></el-icon>
          </template>
          发送
        </el-button>
      </div>
    </div>
    <div class="token-counter">
      已使用 Token: {{ tokenCount.total }} (提示: {{ tokenCount.prompt }}, 回复: {{ tokenCount.completion }})
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import { useChatStore } from '../stores/chat'
import { ElMessageBox } from 'element-plus'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['send', 'clear'])

const chatStore = useChatStore()
const messageText = ref('')

const placeholder = `输入消息，按Enter发送
Shift + Enter 换行`

const tokenCount = computed(() => chatStore.tokenCount)

const handleSend = () => {
  if (!messageText.value.trim() || props.loading) return
  
  emit('send', messageText.value)
  messageText.value = ''
}

const newline = (e) => {
  messageText.value += '\n'
}

const handleClear = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有对话记录吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    emit('clear')
  } catch {
    // 用户取消操作
  }
}
</script>

<style lang="scss" scoped>
.chat-input-container {
  padding: 1rem;
  background-color: var(--bg-color);
  border-top: 1px solid var(--border-color);
}

.input-wrapper {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  
  .el-input {
    flex: 1;
  }
}

.button-group {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
}

.token-counter {
  font-size: 0.8rem;
  color: var(--text-color-secondary);
  text-align: right;
}
</style> 