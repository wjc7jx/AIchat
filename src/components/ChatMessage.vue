<template>
  <!-- 消息容器，根据消息角色和加载状态动态调整样式 -->
  <div 
    class="message-container"
    :class="[
      message.role === 'assistant' ? 'message-assistant' : 'message-user',
      { 'loading': loading }
    ]"
  >
    <!-- 消息头像，根据消息角色显示不同图标 -->
    <div class="message-avatar">
      <el-avatar 
        :icon="message.role === 'assistant' ? 'ChatRound' : 'User'"
        :class="message.role"
      />
    </div>
    <!-- 消息内容，根据加载状态显示不同内容 -->
    <div class="message-content">
      <div class="message-text" v-if="!loading">
        {{ message.content }}
      </div>
      <div class="message-loading" v-else>
        <el-icon class="is-loading"><Loading /></el-icon>
        正在思考...
      </div>
      <!-- 消息时间 -->
      <div class="message-meta">
        <span class="message-time">{{ formatTime(message.timestamp) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// 定义组件属性
const props = defineProps({
  message: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// 格式化时间函数
const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString()
}
</script>

<style lang="scss" scoped>
.message-container {
  display: flex;
  margin: 1rem 0;
  padding: 0.5rem;
  gap: 1rem;
  transition: all 0.3s ease;
  
  // 用户消息样式
  &.message-user {
    flex-direction: row-reverse;
    //翻转实现用户布局在右侧
    .message-content {
      align-items: flex-end;
    }
  }
}

.message-avatar {
  flex-shrink: 0;
  
  .el-avatar {
    background-color: var(--primary-color);
    
    &.assistant {
      background-color: var(--success-color);
    }
  }
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 80%;
}

.message-text {
  background-color: var(--bg-color-secondary);
  padding: 1rem;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  white-space: pre-wrap;
}

.message-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-color-secondary);
  
  .el-icon {
    font-size: 1.2rem;
  }
}

.message-meta {
  font-size: 0.8rem;
  color: var(--text-color-secondary);
}
</style>