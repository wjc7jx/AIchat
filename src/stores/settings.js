// 引入 Pinia 的 defineStore 方法，用于定义一个新的 store
import { defineStore } from 'pinia'

// 定义一个名为 'settings' 的 store
export const useSettingsStore = defineStore('settings', {
    // 定义 store 的状态
    state: () => ({
        // 主题模式：'light', 'dark', 'system'
        themeMode: 'system',
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
        // 图片细节控制参数：'low', 'high', 'auto'
        imageDetail: 'high',
    }),

    // 定义 store 的动作
    actions: {
        // 检测系统主题
        detectSystemTheme() {
            if (typeof window !== 'undefined') {
                const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
                return isDarkMode
            }
            return false
        },

        // 应用主题
        applyTheme(isDark) {
            this.isDarkMode = isDark
            document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
        },

        // 设置主题模式
        setThemeMode(mode) {
            this.themeMode = mode
            
            if (mode === 'system') {
                const isDark = this.detectSystemTheme()
                this.applyTheme(isDark)
            } else {
                const isDark = mode === 'dark'
                this.applyTheme(isDark)
            }
        },

        // 切换深色模式（保留原有方法以兼容现有代码）
        toggleDarkMode() {
            if (this.themeMode === 'system') {
                // 如果当前是系统模式，切换到手动模式
                this.setThemeMode(this.isDarkMode ? 'light' : 'dark')
            } else {
                // 在手动模式间切换
                this.setThemeMode(this.isDarkMode ? 'light' : 'dark')
            }
        },

        // 初始化主题
        initTheme() {
            // 应用当前主题
            if (this.themeMode === 'system') {
                const isDark = this.detectSystemTheme()
                this.applyTheme(isDark)
            } else {
                const isDark = this.themeMode === 'dark'
                this.applyTheme(isDark)
            }

            // 监听系统主题变化（仅在浏览器环境中）
            if (typeof window !== 'undefined') {
                const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
                const handleChange = (e) => {
                    if (this.themeMode === 'system') {
                        this.applyTheme(e.matches)
                    }
                }
                
                // 使用新的 addEventListener 方法
                if (mediaQuery.addEventListener) {
                    mediaQuery.addEventListener('change', handleChange)
                } else {
                    // 兼容旧版浏览器
                    mediaQuery.addListener(handleChange)
                }
            }
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
    // VLM 模型
    { label: 'Qwen2.5-VL-7B (支持图像)', value: 'Pro/Qwen/Qwen2.5-VL-7B-Instruct', isVLM: true },
]