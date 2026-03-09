<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import TopBar from '@/layouts/TopBar.vue'
import SidebarDrawer from '@/layouts/SidebarDrawer.vue'
import { RouterView } from 'vue-router'
import { useUiPreferencesStore } from '@/stores/uiPreferences'

const uiPrefs = useUiPreferencesStore()

let resizeTimer: ReturnType<typeof setTimeout> | null = null

function handleResize() {
  if (window.innerWidth < 768) {
    uiPrefs.collapseSidebar()
  } else {
    uiPrefs.expandSidebar()
  }
}

function debouncedResize() {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(handleResize, 150)
}

onMounted(() => {
  window.addEventListener('resize', debouncedResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', debouncedResize)
  if (resizeTimer) clearTimeout(resizeTimer)
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <!-- Top Bar -->
    <TopBar
      :sidebar-collapsed="uiPrefs.sidebarCollapsed"
      @toggle-sidebar="uiPrefs.toggleSidebar()"
    />

    <!-- Sidebar Drawer -->
    <SidebarDrawer :collapsed="uiPrefs.sidebarCollapsed" />

    <!-- Main Content Area -->
    <main
      :class="[
        'pt-14 min-h-screen transition-all duration-200 ease-in-out',
        uiPrefs.sidebarCollapsed ? 'pl-16' : 'pl-64',
      ]"
    >
      <div class="p-6">
        <RouterView />
      </div>
    </main>
  </div>
</template>
