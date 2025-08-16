<template>
  <!-- 聊天输入容器 -->
  <div class="chat-input-container">
    <!-- 输入框和按钮的组合 -->
    <div class="input-wrapper">
      <!-- 添加文件上传区域 -->
      <div class="upload-area" v-if="showUpload">
        <div class="upload-tip" v-if="isVLMModel">
          <el-alert
            title="图片上传提示"
            type="info"
            show-icon
            :closable="false"
          >
            <template #default>
              <p>当前模型支持图像识别，建议最多上传2张图片</p>
              <p>支持格式：JPEG、PNG、GIF、WebP</p>
              <p>图片大小：建议小于10MB</p>
              <p>细节模式：{{ settingsStore.imageDetail === 'high' ? '高分辨率（消耗更多Token）' : settingsStore.imageDetail === 'low' ? '低分辨率（消耗较少Token）' : '自动选择' }}</p>
            </template>
          </el-alert>
        </div>
        
        <el-upload
          class="upload-component"
          :action="null"
          :auto-upload="false"
          :on-change="handleFileChange"
          :show-file-list="false"
          :accept="isVLMModel ? 'image/*' : '*'"
          multiple
        >
        <!-- trigger	触发文件选择框的内容 -->
          <template #trigger>
            <el-button type="primary" :icon="Plus">
              {{ isVLMModel ? '添加图片' : '添加文件' }}
            </el-button>
          </template>
        </el-upload>
        
        <!-- 预览区域 -->
        <div class="preview-list" v-if="selectedFiles.length">
          <div v-for="(file, index) in selectedFiles" :key="index" class="preview-item">
            <!-- 图片预览 -->
            <img v-if="isImage(file)" :src="getPreviewUrl(index)" class="preview-image"/>
            <!-- 文件名预览 -->
            <div v-else class="file-preview">
              <el-icon><Document /></el-icon>
              <span>{{ file.name }}</span>
            </div>
            <!-- 删除按钮 -->
            <el-button 
              class="delete-btn" 
              type="danger" 
              :icon="Delete" 
              circle
              @click="removeFile(index)"
            />
          </div>
        </div>
      </div>

      <el-input
        v-model="messageText"
        type="textarea"
        :rows="2"
        :autosize="{ minRows: 2, maxRows: 5 }"
        :placeholder="placeholder"
        resize="none"
        @keydown.enter.exact.prevent="handleSend"
        @keydown.enter.shift.exact="newline"
        @input="adjustHeight"
        ref="inputRef"
      />
      
      <div class="button-group">
        <!-- 添加切换上传区域的按钮 -->
        <el-tooltip content="上传文件" placement="top">
          <el-button
            circle
            :icon="Upload"
            @click="toggleUpload"
          />
        </el-tooltip>
        
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
    <!-- Token计数器 -->
    <div class="token-counter">
      已使用 Token: {{ tokenCount.total }} (提示: {{ tokenCount.prompt }}, 回复: {{ tokenCount.completion }})
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Delete, Position, Upload, Plus, Document } from '@element-plus/icons-vue'
import { useChatStore } from '../stores/chat'
import { useSettingsStore } from '../stores/settings'
import { ElMessageBox, ElMessage } from 'element-plus'
import { 
  buildVLMMessage, 
  isValidImageFormat, 
  checkImageSize, 
  getImagePreviewUrl, 
  revokeImagePreviewUrl 
} from '../utils/imageUtils'

// 定义组件的属性
const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

// 定义组件的事件
const emit = defineEmits(['send', 'clear'])

// 使用聊天存储和设置存储
const chatStore = useChatStore()
const settingsStore = useSettingsStore()
// 消息文本的响应式引用
const messageText = ref('')

// 输入框的占位符
const placeholder = `输入消息，按Enter发送
Shift + Enter 换行`

// 计算属性，用于获取聊天存储中的Token计数
const tokenCount = computed(() => chatStore.tokenCount)

// 计算属性：判断当前模型是否支持图片
const isVLMModel = computed(() => {
  return settingsStore.model.includes('VL') || 
         settingsStore.model.includes('vision') || 
         settingsStore.model.includes('Qwen2.5-VL')
})

const showUpload = ref(false)
const selectedFiles = ref([])
const previewUrls = ref([])

// 切换上传区域显示
const toggleUpload = () => {
  showUpload.value = !showUpload.value
}

// 处理文件选择
const handleFileChange = (file) => {
  // 如果是VLM模型，只允许图片文件
  if (isVLMModel.value && !isValidImageFormat(file.raw)) {
    ElMessage.error('当前模型只支持图片文件')
    return
  }
  
  // 检查图片大小
  if (isValidImageFormat(file.raw) && !checkImageSize(file.raw)) {
    ElMessage.error('图片文件过大，请选择小于10MB的图片')
    return
  }
  
  selectedFiles.value.push(file.raw)
  
  // 为图片创建预览URL
  if (isImage(file.raw)) {
    previewUrls.value.push(getImagePreviewUrl(file.raw))
  } else {
    previewUrls.value.push(null)
  }
}

// 移除文件
const removeFile = (index) => {
  // 释放预览URL内存
  if (previewUrls.value[index]) {
    revokeImagePreviewUrl(previewUrls.value[index])
  }
  
  selectedFiles.value.splice(index, 1)
  previewUrls.value.splice(index, 1)
}

// 判断是否为图片文件
const isImage = (file) => {
  return file.type.startsWith('image/')
}

// 获取预览URL（使用缓存的URL）
const getPreviewUrl = (index) => {
  return previewUrls.value[index] || getImagePreviewUrl(selectedFiles.value[index])
}

// 修改发送处理函数
const handleSend = async () => {
  if ((!messageText.value.trim() && selectedFiles.value.length === 0) || props.loading) return
  
  try {
    let messageContent
    
    // 如果是VLM模型且有图片文件，使用VLM消息格式
    if (isVLMModel.value && selectedFiles.value.some(file => isImage(file))) {
      const imageFiles = selectedFiles.value.filter(file => isImage(file))
      const textFiles = selectedFiles.value.filter(file => !isImage(file))
      
      // 处理文本文件内容
      let textContent = messageText.value
      if (textFiles.length > 0) {
        const fileContents = await Promise.all(
          textFiles.map(file => readFileContent(file))
        )
        textContent = textContent + '\n' + fileContents.join('\n')
      }
      
      // 构建VLM消息
      messageContent = await buildVLMMessage(
        textContent, 
        imageFiles, 
        settingsStore.imageDetail
      )
    } else {
      // 传统文本模式
      const fileContents = await Promise.all(
        selectedFiles.value.map(async (file) => {
          if (isImage(file)) {
            return await convertImageToBase64(file)
          } else {
            return await readFileContent(file)
          }
        })
      )

      let content = messageText.value
      if (fileContents.length > 0) {
        content = content + '\n' + fileContents.join('\n')
      }
      
      messageContent = content
    }

    emit('send', messageContent)
    
    // 清理状态
    messageText.value = ''
    // 释放所有预览URL
    previewUrls.value.forEach(url => {
      if (url) revokeImagePreviewUrl(url)
    })
    selectedFiles.value = []
    previewUrls.value = []
    showUpload.value = false
  } catch (error) {
    console.error('发送失败:', error)
    ElMessage.error(error.message || '发送失败，请重试')
  }
}

// 将图片转换为base64（兼容旧版本）
const convertImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(`![${file.name}](${e.target.result})`)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// 读取文件内容
const readFileContent = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(`\`\`\`\n${e.target.result}\n\`\`\``)
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
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

const inputRef = ref(null)

// 调整输入框高度的方法
const adjustHeight = () => {
  if (inputRef.value) {
    // 获取输入框的DOM元素,因为是 ref，需要通过$el获取DOM元素
    const textarea = inputRef.value.$el.querySelector('textarea')
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }
}

</script>

<style lang="scss" scoped>
// 聊天输入容器的样式
.chat-input-container {
  padding: 1rem;
  background-color: var(--bg-color);
  border-top: 1px solid var(--border-color);
  transition: all 0.3s ease;
  
  // 深色模式下增强边框效果
  [data-theme="dark"] & {
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  }
}

// 输入框和按钮组合的样式
.input-wrapper {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  
  .el-input {
    flex: 1;
    
    :deep(.el-textarea__inner) {
      transition: all 0.3s;
      line-height: 1.5;
      padding: 8px 12px;
      overflow-y: auto;
    }
  }
}

// 按钮组的样式
.button-group {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
  
  .el-button {
    transition: all 0.2s ease;
    
    &:hover {
      transform: translateY(-1px);
    }
    
    // 深色模式下的按钮增强效果
    [data-theme="dark"] & {
      &:hover {
        box-shadow: 0 4px 8px rgba(92, 174, 253, 0.3);
      }
      
      &.el-button--primary {
        background: linear-gradient(135deg, var(--primary-color), #409eff);
        border-color: var(--primary-color);
      }
    }
  }
}

// Token计数器的样式
.token-counter {
  font-size: 0.8rem;
  color: var(--text-color-secondary);
  text-align: right;
}

.upload-area {
  margin-bottom: 1rem;
  padding: 1rem;
  border: 2px dashed var(--border-color);
  border-radius: var(--border-radius);
  
  .upload-tip {
    margin-bottom: 1rem;
    
    :deep(.el-alert__content) {
      p {
        margin: 0.25rem 0;
        font-size: 0.9rem;
      }
    }
  }
  
  .preview-list {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 1rem;
    
    .preview-item {
      position: relative;
      width: 100px;
      height: 100px;
      
      .preview-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: var(--border-radius);
      }
      
      .file-preview {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: var(--bg-color-secondary);
        border-radius: var(--border-radius);
        
        .el-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        
        span {
          font-size: 0.8rem;
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          width: 90%;
        }
      }
      
      .delete-btn {
        position: absolute;
        top: -0.5rem;
        right: -0.5rem;
        padding: 0.25rem;
        transform: scale(0.8);
      }
    }
  }
}
</style>