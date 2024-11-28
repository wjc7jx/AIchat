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
        <!-- 使用 v-html 渲染 Markdown 内容 -->
        <div class="markdown-body" v-html="renderedContent" ref="markdownBody" @click="handleCodeBlockClick"></div>
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
import { computed, ref } from 'vue'
import { renderMarkdown } from '../utils/markdown'
import { ElMessage } from 'element-plus'

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

const markdownBody = ref(null)

// 格式化时间函数
const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString()
}

// 计算属性：渲染 Markdown 内容
const renderedContent = computed(() => {
  return renderMarkdown(props.message.content)
})

// 复制文本到剪贴板
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('代码已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
    ElMessage.error('复制失败')
  }
}

// 处理代码块点击事件
const handleCodeBlockClick = (event) => {
  const preElement = event.target.closest('pre')
  if (preElement) {
    const codeElement = preElement.querySelector('code')
    if (codeElement) {
      copyToClipboard(codeElement.textContent)
    }
  }
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

  .markdown-body {
    :deep() {
      // Markdown 内容样式
      h1, h2, h3, h4, h5, h6 {
        margin: 0.5rem 0;
        font-weight: 600;
        line-height: 1.25;
      }

      p {
        margin: 0.25rem 0;
      }

      code {
        padding: 0.2em 0.4em;
        margin: 0;
        font-size: 85%;
        background-color: var(--code-bg-light);
        border-radius: 3px;
        color: var(--code-text-light);
      }

      pre {
        position: relative;
        padding: 0.75rem;
        overflow: auto;
        font-size: 85%;
        line-height: 1.45;
        background-color: var(--code-block-bg-light);
        border-radius: var(--border-radius);
        margin: 0.25rem 0;
        cursor: pointer;
        border: 1px solid var(--border-color);
        
        &::after {
          content: "点击复制";
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          padding: 0.2rem 0.5rem;
          font-size: 0.75rem;
          color: var(--text-color-secondary);
          background-color: var(--bg-color);
          border-radius: var(--border-radius);
          opacity: 0;
          transition: opacity 0.3s;
        }

        &:hover::after {
          opacity: 1;
        }

        &:active {
          opacity: 0.8;
        }

        code {
          padding: 0;
          background-color: transparent;
          color: inherit;
        }
      }

      blockquote {
        margin: 0.25rem 0;
        padding: 0 0.75rem;
        color: var(--text-color-secondary);
        border-left: 0.25rem solid var(--border-color);
      }

      ul, ol {
        margin: 0.25rem 0;
        padding-left: 1.5rem;
      }

      table {
        border-collapse: collapse;
        width: 100%;
        margin: 0.25rem 0;

        th, td {
          padding: 0.5rem;
          border: 1px solid var(--border-color);
        }

        th {
          background-color: var(--bg-color-secondary);
        }
      }

      img {
        max-width: 100%;
        height: auto;
      }

      a {
        color: var(--primary-color);
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }

      > *:last-child {
        margin-bottom: 0;
      }
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
  background-color: var(--bg-color);
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