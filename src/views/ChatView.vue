<template>
    <div class="chat-container">
        <div class="chat-header">
            <h1>AI Chat</h1>
            <el-button circle :icon="Setting" @click="showSettings = true" />
        </div>

        <div class="messages-container" ref="messagesContainer">
            <template v-if="messages.length">
                <chat-message v-for="message in messages" :key="message.id" :message="message"
                    :loading="message.loading" />
            </template>
            <div v-else class="empty-state">
                <el-empty description="开始对话吧" />
            </div>
        </div>

        <chat-input :loading="isLoading" @send="handleSend" @clear="handleClear" />

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

const chatStore = useChatStore()
const messages = computed(() => chatStore.messages)
const isLoading = computed(() => chatStore.isLoading)
const showSettings = ref(false)
const messagesContainer = ref(null)

watch(messages, () => {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
    })
}, { deep: true })

const handleSend = async (content) => {
    if (isLoading.value) return

    chatStore.addMessage(messageHandler.formatMessage('user', content))
    chatStore.addMessage(messageHandler.formatMessage('assistant', ''))
    chatStore.isLoading = true

    try {
        const settingsStore = useSettingsStore()
        const response = await chatApi.sendMessage(
            messages.value.slice(0, -1).map(m => ({
                role: m.role,
                content: m.content
            })), 
            settingsStore.streamResponse
        )

        if (settingsStore.streamResponse) {
            console.log('streamResponse', response)
            await messageHandler.processStreamResponse(response, {
                updateMessage: (content) => chatStore.updateLastMessage(content),
                updateTokenCount: (usage) => chatStore.updateTokenCount(usage)
            });
        } 
        else {
            const result = await messageHandler.processSyncResponse(response, (content) => {
                chatStore.updateLastMessage(content)
            });

            if (result.usage) {
                chatStore.updateTokenCount(result.usage)
            }
        }
    } catch (error) {
        console.error('发送消息失败:', error)
        chatStore.updateLastMessage('抱歉，发生了错误，请稍后重试。')
    } finally {
        chatStore.isLoading = false
    }
}

const handleClear = () => {
    chatStore.clearMessages()
}
</script>

<style lang="scss" scoped>
.chat-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
}

.chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: var(--bg-color);
    border-bottom: 1px solid var(--border-color);

    h1 {
        margin: 0;
        font-size: 1.5rem;
        color: var(--text-color-primary);
    }
}

.messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    background-color: var(--bg-color-secondary);
}

.empty-state {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>