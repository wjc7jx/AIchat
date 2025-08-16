import { useSettingsStore } from '../stores/settings'

const API_BASE_URL = 'https://api.siliconflow.cn/v1'

const createHeaders = () => {
    const settingsStore = useSettingsStore()
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settingsStore.apiKey}`
    }
}

export const chatApi = {
    async sendMessage(messages, stream = false) {
        const settingsStore = useSettingsStore()
        
        const payload = {
            model: settingsStore.model,
            messages,
            temperature: settingsStore.temperature,
            max_tokens: settingsStore.maxTokens,
            stream,
            top_p: settingsStore.topP,
            top_k: settingsStore.topK,
        }

        // 移除不必要的参数，避免API错误
        // frequency_penalty, n, response_format, tools 这些参数可能不是所有模型都支持

        const response = await fetch(`${API_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                ...createHeaders(),
                ...(stream && { 'Accept': 'text/event-stream' })
            },
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => null)
            throw new Error(errorData?.error?.message || `HTTP error! status: ${response.status}`)
        }

        if (stream) {
            return response
        }

        return await response.json()
    },

    async sendAsyncMessage(messages) {
        const settingsStore = useSettingsStore()
        
        const payload = {
            model: settingsStore.model,
            messages,
            temperature: settingsStore.temperature,
            max_tokens: settingsStore.maxTokens
        }

        const response = await fetch(`${API_BASE_URL}/async/chat/completions`, {
            method: 'POST',
            headers: createHeaders(),
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return await response.json()
    },

    async getAsyncResult(taskId) {
        const response = await fetch(`${API_BASE_URL}/async-result/${taskId}`, {
            method: 'GET',
            headers: createHeaders()
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return await response.json()
    }
} 