// 引入 Pinia 的 defineStore 方法，用于定义一个新的 store
import { defineStore } from 'pinia'

// 定义一个名为 'settings' 的 store
export const useSettingsStore = defineStore('settings', {
    // 定义 store 的状态
    state: () => ({
        // 是否启用深色模式，默认为 false
        isDarkMode: false,
        // 温度参数，控制生成文本的随机性，默认值为 0.7
        temperature: 0.7,
        // 最大 token 数量，默认值为 1000
        maxTokens: 1000,
        // 使用的模型名称，默认为 'THUDM/glm-4-9b-chat'
        model: 'THUDM/glm-4-9b-chat',
        // API 密钥，默认为空字符串
        apiKey: '',
        // 是否启用流式响应，默认为 true
        streamResponse: true,
        // Top P 参数
        topP: 0.7,
        // Top K 参数
        topK: 50,
    }),

    // 定义 store 的动作
    actions: {
        // 切换深色模式
        toggleDarkMode() {
            this.isDarkMode = !this.isDarkMode
            // 根据当前的深色模式状态设置 HTML 元素的 data-theme 属性
            document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light')
        },

        // 更新设置
        updateSettings(settings) {
            // 使用 Object.assign 方法将传入的设置对象合并到当前 store 的状态中
            Object.assign(this.$state, settings)
        },
    },

    // 配置持久化选项
    persist: {
        // 启用持久化功能
        enabled: true,
        // 持久化策略数组
        strategies: [
            {
                // 存储键名
                key: 'ai-chat-settings',
                // 存储方式，这里使用的是 localStorage
                storage: localStorage,
            },
        ],
    },
})

// 导出模型选项供其他组件使用
export const modelOptions = [
    { label: 'GLM-4-9B', value: 'THUDM/glm-4-9b-chat' },
    { label: 'Qwen2.5-7B', value: 'Qwen/Qwen2.5-7B-Instruct' },
    { label: 'Qwen2.5-Coder-7B', value: 'Qwen/Qwen2.5-Coder-7B-Instruct' },
    { label: 'Meta-Llama-3.1-8B', value: 'meta-llama/Meta-Llama-3.1-8B-Instruct' },
    // { label: 'Gemma-2-9B', value: 'google/gemma-2-9b-it' },  //不知道为什么用不了
    { label: 'DeepSeek-V2.5', value: 'deepseek-ai/DeepSeek-V2.5' },
]