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
      <!-- 显示模式 -->
      <div class="message-text" v-if="!loading && !isEditing">
        <!-- 使用 v-html 渲染 Markdown 内容 -->
        <div class="markdown-body" v-html="renderedContent" ref="markdownBody" @click="handleCodeBlockClick"></div>
      </div>

      <!-- 编辑模式 -->
      <div class="message-edit" v-if="isEditing">
        <el-input
          v-model="editContent"
          type="textarea"
          :rows="2"
          :autosize="{ minRows: 2, maxRows: 6 }"
          ref="editInputRef"
          @keydown.enter.exact.prevent="handleEditKeydown"
          @keydown.esc="cancelEdit"
        />
        <div class="edit-actions">
          <el-button size="small" @click="cancelEdit">取消</el-button>
          <el-button type="primary" size="small" @click="saveEdit">保存</el-button>
        </div>
      </div>

      <div class="message-loading" v-if="loading">
        <el-icon class="is-loading"><Loading /></el-icon>
        正在思考...
      </div>

      <!-- 消息底部区域：时间和操作按钮 -->
      <div class="message-footer">
        <span class="message-time">{{ formatTime(message.timestamp) }}</span>
        <!-- 用户消息的操作按钮 -->
        <div class="message-actions" v-if="!loading && message.role === 'user' && !isEditing">
          <el-button-group>
            <el-button type="text" size="small" @click="startEdit">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button type="text" size="small" @click="handleDelete">
              <el-icon><Delete /></el-icon>
            </el-button>
          </el-button-group>
        </div>
        <!-- AI助手消息的操作按钮 -->
        <div class="message-actions" v-if="!loading && message.role === 'assistant'">
          <el-button-group>
            <el-button 
              type="text" 
              size="small" 
              @click="handleRegenerate" 
              :title="'重新生成'"
              :disabled="isLoading"
            >
              <el-icon><RefreshRight /></el-icon>
            </el-button>
            <el-button 
              type="text" 
              size="small" 
              @click="handleCopyAll" 
              :title="'复制全部'"
            >
              <el-icon><CopyDocument /></el-icon>
            </el-button>
          </el-button-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, nextTick } from 'vue'
import { renderMarkdown } from '../utils/markdown'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete, RefreshRight, CopyDocument } from '@element-plus/icons-vue'
import { useChatStore } from '../stores/chat'

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

const emit = defineEmits(['update', 'delete', 'regenerate'])

const markdownBody = ref(null)
const isEditing = ref(false)
const editContent = ref('')
const editInputRef = ref(null)

// 从 store 中获取 loading 状态
const chatStore = useChatStore()
const isLoading = computed(() => chatStore.isLoading)

// 开始编辑
const startEdit = async () => {
  editContent.value = props.message.content
  isEditing.value = true
  // 等待 DOM 更新后聚焦输入框
  await nextTick()
  editInputRef.value?.input?.focus()
}

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
  editContent.value = ''
}

// 保存编辑
const saveEdit = () => {
  if (!editContent.value.trim()) {
    ElMessage.warning('消息内容不能为空')
    return
  }
  emit('update', {
    ...props.message,
    content: editContent.value.trim()
  })
  isEditing.value = false
}

// 删除消息
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条消息吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    emit('delete', props.message)
  } catch {
    // 用户取消删除操作
  }
}

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

// 处理编辑时的按键事件
const handleEditKeydown = (e) => {
  if (e.shiftKey) return // 如果按住 Shift，允许换行
  saveEdit() // 直接保存并发送
}

// 处理重新生成
const handleRegenerate = () => {
  console.log('重新生成')
  emit('regenerate', props.message)
}

// 复制全部内容
const handleCopyAll = async () => {
  try {
    await navigator.clipboard.writeText(props.message.content)
    ElMessage.success('内容已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
    ElMessage.error('复制失败')
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
        font-family: var(--code-font-family);
        padding: 0.2em 0.4em;
        margin: 0;
        font-size: 85%;
        background-color: var(--code-bg);
        border-radius: 3px;
        color: var(--code-text);
      }

      pre {
        position: relative;
        padding: 2rem 1rem 1rem;
        overflow: auto;
        font-size: 85%;
        line-height: 1.45;
        background-color: var(--code-block-bg);
        border-radius: var(--border-radius);
        margin: 0.5rem 0;
        border: 1px solid var(--border-color);
        
        // 代码头部样式
        .code-header {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          padding: 0.3rem 1rem;
          background-color: var(--code-header-bg);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: var(--code-font-family);
          
          .code-lang {
            font-size: 0.8rem;
            color: var(--text-color-secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
        }

        &::after {
          content: "点击复制";
          position: absolute;
          top: 0.3rem;
          right: 1rem;
          padding: 0.2rem 0.5rem;
          font-size: 0.75rem;
          color: var(--text-color-secondary);
          opacity: 0;
          transition: opacity 0.3s;
          font-family: system-ui, -apple-system, sans-serif;
        }

        &:hover::after {
          opacity: 0.8;
        }

        code {
          padding: 0;
          background-color: transparent;
          color: inherit;
          display: block;
          font-family: var(--code-font-family);
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
        max-height: 300px;
        object-fit: contain;
        margin: 0.5rem 0;
        border-radius: var(--border-radius);
        cursor: pointer;
        
        &:hover {
          opacity: 0.9;
        }
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
  gap: 0.25rem;
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

.message-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.5rem;
  font-size: 0.8rem;
  color: var(--text-color-secondary);
}

.message-time {
  margin-right: 0.5rem;
}

.message-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0.6;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 1;
  }
  
  .el-button {
    padding: 2px 4px;
    height: 20px;
    
    .el-icon {
      font-size: 14px;
    }
    
    &:hover {
      color: var(--primary-color);
      background-color: var(--bg-color-secondary);
    }
  }
}

.message-edit {
  background-color: var(--bg-color);
  padding: 0.75rem;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);

  .el-input {
    margin-bottom: 0.5rem;
    
    :deep(.el-textarea__inner) {
      background-color: var(--bg-color-secondary);
      border-color: var(--border-color);
      resize: none; // 禁用手动调整大小
      
      &:focus {
        border-color: var(--primary-color);
      }
    }
  }

  .edit-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
}
</style>