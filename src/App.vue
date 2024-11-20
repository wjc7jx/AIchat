<template>
  <el-config-provider >
    <div class="app-container" :class="{ 'dark-mode': isDarkMode }">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </el-config-provider>
</template>

<script setup>
import { ref } from 'vue'
import { useSettingsStore } from './stores/settings'

const settingsStore = useSettingsStore()
const isDarkMode = ref(settingsStore.isDarkMode)
</script>

<style lang="scss">
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.dark-mode {
  background-color: var(--bg-color);
  color: var(--text-color-primary);
}
</style>
