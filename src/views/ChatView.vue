<template>
    <!-- 聊天容器 -->
    <div class="chat-container">
        <!-- 聊天头部，包含标题和设置按钮 -->
        <div class="chat-header">
            <h1>AI Chat</h1>
            <el-button circle :icon="Setting" @click="showSettings = true" />
        </div>

        <!-- 消息容器，显示对话消息 -->
        <div class="messages-container" ref="messagesContainer">
            <template v-if="messages.length">
                <chat-message v-for="message in messages" :key="message.id" :message="message"
                    :loading="message.loading" @update="handleMessageUpdate" @delete="handleMessageDelete" @regenerate="handleRegenerate" />
            </template>
            <div v-else class="empty-state">
                <el-empty description="开始对话吧" />
            </div>
        </div>

        <!-- 聊天输入框 -->
        <chat-input :loading="isLoading" @send="handleSend" @clear="handleClear" />

        <!-- 设置面板 -->
        <settings-panel v-model="showSettings" />
    </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { Setting } from '@element-plus/icons-vue'
import { useChatStore } from '../stores/chat'
import { chatApi } from '../utils/api'
import { messageHandler } from '../utils/messageHandler'
import ChatMessage from '../components/ChatMessage.vue'
import ChatInput from '../components/ChatInput.vue'
import SettingsPanel from '../components/SettingsPanel.vue'
import { useSettingsStore } from '../stores/settings'

// 初始化聊天存储
const chatStore = useChatStore()
// 计算属性，获取消息列表和加载状态
const messages = computed(() => chatStore.messages)
const isLoading = computed(() => chatStore.isLoading)
// 设置面板显示状态
const showSettings = ref(false)
// 消息容器引用，用于滚动到底部
const messagesContainer = ref(null)

// 监听消息变化，滚动到底部
watch(messages, () => {
    // 涉及到页面渲染，需要使用 nextTick
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
    })
}, { deep: true })

/**
 * 发送消息处理函数
 * @param {string} content 用户输入的消息内容
 */
const handleSend = async (content) => {
    console.log('发送消息',content)

    // if (isLoading.value) return
    // 添加用户消息和助理的空消息
    chatStore.addMessage(messageHandler.formatMessage('user', content))
    chatStore.addMessage(messageHandler.formatMessage('assistant', ''))
    chatStore.isLoading = true

    try {
        // 获取设置并发送消息
        const settingsStore = useSettingsStore()
        const response = await chatApi.sendMessage(
            messages.value.slice(0, -1).map(m => ({
                role: m.role,
                content: m.content
            })),
            settingsStore.streamResponse
        )

        // 处理流式响应或同步响应
        if (settingsStore.streamResponse) {
            // 流式处理，并更新消息和token计数
            await messageHandler.processStreamResponse(response, {
                updateMessage: (content) => chatStore.updateLastMessage(content),
                updateTokenCount: (usage) => chatStore.updateTokenCount(usage)
            });
        } else {
            // 同步处理，并更新消息和token计数
            const result = await messageHandler.processSyncResponse(response, (content) => {
                chatStore.updateLastMessage(content)
            });
            if (result.usage) {
                chatStore.updateTokenCount(result.usage)
            }
        }
    } catch (error) {
        chatStore.updateLastMessage('抱歉，发生了错误，请稍后重试。')
    } finally {
        chatStore.isLoading = false
    }
}

/**
 * 清除消息处理函数
 */
const handleClear = () => {
    chatStore.clearMessages()
}

// 处理消息更新
const handleMessageUpdate = async (updatedMessage) => {

    const index = chatStore.messages.findIndex(m => m.id === updatedMessage.id)
    if (index !== -1) {
        // 删除当前消息及其后的助手回复
        chatStore.messages.splice(index, 2)
        // 重新发送更新后的消息
        await handleSend(updatedMessage.content)
    }
}

// 处理消息删除
const handleMessageDelete = (message) => {
    const index = chatStore.messages.findIndex(m => m.id === message.id)
    if (index !== -1) {
        // 删除该消息及其后的助手回复
        chatStore.messages.splice(index, 2)
    }
}

// 处理重新生成
const handleRegenerate = async (message) => {
    console.log(message)
    console.log(chatStore.messages)

    const index = chatStore.messages.findIndex(m => m.id === message.id&&m.role==="assistant")
    console.log(index)
    if (index !== -1 && index > 0) {
        // 获取上一条用户消息
        const userMessage = chatStore.messages[index - 1]
        // 删除当前的AI回复,但是删了后再发送的时候，userMessage不会指向当前这个
        chatStore.messages.splice(index-1, 2)
        // 重新发送请求前应该检查 isLoading 状态
        if (isLoading.value) return
        
        chatStore.isLoading = true
        try {
            console.log(userMessage.content)
            // 重新发送请求
            await handleSend(userMessage.content)
        } catch (error) {
            console.error('重新生成失败:', error)
            // 恢复原来的消息
            chatStore.messages.splice(index, 0, message)
        } finally {
            chatStore.isLoading = false
        }
    }
}
</script>

<style lang="scss" scoped>
/* 定义聊天容器的样式，占据整个视口高度，使用flex布局以支持列方向的布局 */
.chat-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
}

/* 设置聊天头部的样式，包括对齐方式和背景色等 */
.chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: var(--bg-color);
    border-bottom: 1px solid var(--border-color);
    transition: all 0.3s ease;

    // 深色模式下的头部增强效果
    [data-theme="dark"] & {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(8px);
    }

    /* 设置聊天头部标题的样式，无默认间距，自定义字体大小和颜色 */
    h1 {
        margin: 0;
        font-size: 1.5rem;
        color: var(--text-color-primary);
        font-weight: 600;
        transition: color 0.3s ease;
    }
    
    .el-button {
        transition: all 0.2s ease;
        
        &:hover {
            transform: rotate(90deg);
        }
    }
}

/* 定义消息容器的样式，占据剩余空间，支持滚动，自定义背景色 */
.messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    background-color: var(--bg-color-secondary);
    transition: background-color 0.3s ease;
    
    // 深色模式下的消息容器优化
    [data-theme="dark"] & {
        background: linear-gradient(180deg, var(--bg-color-secondary) 0%, rgba(26, 26, 26, 0.95) 100%);
    }
}

/* 设置空状态时的样式，占据全部高度，居中对齐内容 */
.empty-state {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>