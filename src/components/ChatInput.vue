<template>
  <!-- 聊天输入容器 -->
  <div class="chat-input-container">
    <!-- 输入框和按钮的组合 -->
    <div class="input-wrapper">
      <!-- 使用Element Plus的输入框组件，设置为多行文本域 -->
      <el-input
        v-model="messageText"
        type="textarea"
        :rows="3"
        :placeholder="placeholder"
        resize="none"
        @keydown.enter.exact.prevent="handleSend"
        @keydown.enter.shift.exact="newline"
      />
      <!-- 按钮组 -->
      <div class="button-group">
        <!-- 清空对话的按钮，使用Element Plus的工具提示和按钮组件 -->
        <el-tooltip content="清空对话" placement="top">
          <el-button
            circle
            type="danger"
            :icon="Delete"
            @click="handleClear"
          />
        </el-tooltip>
        <!-- 发送按钮，使用Element Plus的按钮组件 -->
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
    <!-- Token计数器 -->
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

// 定义组件的属性
const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

// 定义组件的事件
const emit = defineEmits(['send', 'clear'])

// 使用聊天存储
const chatStore = useChatStore()
// 消息文本的响应式引用
const messageText = ref('')

// 输入框的占位符
const placeholder = `输入消息，按Enter发送
Shift + Enter 换行`

// 计算属性，用于获取聊天存储中的Token计数
const tokenCount = computed(() => chatStore.tokenCount)

// 处理发送消息的函数
const handleSend = () => {
  // 如果消息文本为空或正在加载，则不执行发送操作
  if (!messageText.value.trim() || props.loading) return
  
  // 触发send事件，传递消息文本，并清空消息文本
  emit('send', messageText.value)
  messageText.value = ''//清除输入框输入文本
}

// 处理换行的函数
const newline = (e) => {
  // 在消息文本中添加换行符
  messageText.value += '\n'
}

// 处理清空对话的函数
const handleClear = async () => {
  try {
    // 使用Element Plus的消息框组件，提示用户是否确定清空对话记录
    await ElMessageBox.confirm(
      '确定要清空所有对话记录吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    // 如果用户确认清空，则触发clear事件
    emit('clear')
  } catch {
    // 如果用户取消操作，则不做任何事情
  }
}
</script>

<style lang="scss" scoped>
// 聊天输入容器的样式
.chat-input-container {
  padding: 1rem;
  background-color: var(--bg-color);
  border-top: 1px solid var(--border-color);
}

// 输入框和按钮组合的样式
.input-wrapper {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  
  .el-input {
    flex: 1;
  }
}

// 按钮组的样式
.button-group {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
}

// Token计数器的样式
.token-counter {
  font-size: 0.8rem;
  color: var(--text-color-secondary);
  text-align: right;
}
</style>