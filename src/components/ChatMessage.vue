<template>
  <div 
    class="message-container"
    :class="[
      message.role === 'assistant' ? 'message-assistant' : 'message-user',
      { 'loading': loading }
    ]"
  >
    <div class="message-avatar">
      <el-avatar 
        :icon="message.role === 'assistant' ? 'ChatRound' : 'User'"
        :class="message.role"
      />
    </div>
    <div class="message-content">
      <div class="message-text" v-if="!loading">
        {{ message.content }}
      </div>
      <div class="message-loading" v-else>
        <el-icon class="is-loading"><Loading /></el-icon>
        正在思考...
      </div>
      <div class="message-meta">
        <span class="message-time">{{ formatTime(message.timestamp) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

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
  
  &.message-user {
    flex-direction: row-reverse;
    
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