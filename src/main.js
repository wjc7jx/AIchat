import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import './assets/styles/main.scss'
import router from './router'
import App from './App.vue'

// 使用深色代码主题
import 'highlight.js/styles/github-dark.css'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 挂载应用
app.mount('#app')

// Element Plus 主题适配
import { useSettingsStore } from './stores/settings'

// 在应用挂载后初始化主题系统
app.config.globalProperties.$nextTick(() => {
  const settingsStore = useSettingsStore()
  settingsStore.initTheme()
})
