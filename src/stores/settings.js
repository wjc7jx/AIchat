import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        isDarkMode: false,
        temperature: 0.7,
        maxTokens: 1000,
        model: 'glm-4-flash',
        apiKey: '',
        streamResponse: true,
    }),

    actions: {
        toggleDarkMode() {
            this.isDarkMode = !this.isDarkMode
            document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light')
        },

        updateSettings(settings) {
            Object.assign(this.$state, settings)
        },
    },

    persist: {
        enabled: true,
        strategies: [
            {
                key: 'ai-chat-settings',
                storage: localStorage,
            },
        ],
    },
}) 