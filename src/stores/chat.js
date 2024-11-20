import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useChatStore = defineStore('chat', {
    state: () => ({
        messages: [],
        isLoading: false,
        tokenCount: {
            total: 0,
            prompt: 0,
            completion: 0
        }
    }),

    actions: {
        addMessage(message) {
            this.messages.push({
                id: Date.now(),
                timestamp: new Date().toISOString(),
                ...message
            })
        },

        updateLastMessage(content) {
            if (this.messages.length > 0) {
                const lastMessage = this.messages[this.messages.length - 1]
                lastMessage.content = content
            }
        },

        updateTokenCount(usage) {
            this.tokenCount.prompt += usage.prompt_tokens
            this.tokenCount.completion += usage.completion_tokens
            this.tokenCount.total += usage.total_tokens
        },

        clearMessages() {
            this.messages = []
        }
    },

    persist: {
        enabled: true,
        strategies: [
            {
                key: 'ai-chat-history',
                storage: localStorage,
            },
        ],
    },
}) 