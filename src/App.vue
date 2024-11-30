<template>
  <el-config-provider >
    <div class="app-container">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </el-config-provider>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useSettingsStore } from './stores/settings'

const settingsStore = useSettingsStore()
const isDarkMode = ref(settingsStore.isDarkMode)

// 监听主题变化
watch(() => settingsStore.isDarkMode, async (newValue) => {
  document.documentElement.setAttribute('data-theme', newValue ? 'dark' : 'light')
}, { immediate: true })

// 在组件挂载时初始化主题
onMounted(() => {
  document.documentElement.setAttribute('data-theme', settingsStore.isDarkMode ? 'dark' : 'light')
})
</script>
<style lang="scss">
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}


</style>

