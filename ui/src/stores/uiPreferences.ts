import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const SIDEBAR_KEY = 'invaretl-sidebar-collapsed'

function resolveInitialSidebarState(): boolean {
  const stored = localStorage.getItem(SIDEBAR_KEY)
  if (stored === 'true') return true
  if (stored === 'false') return false
  // Default: collapsed on narrow viewports, expanded on wide
  return window.innerWidth < 768
}

export const useUiPreferencesStore = defineStore('uiPreferences', () => {
  const sidebarCollapsed = ref(resolveInitialSidebarState())

  watch(sidebarCollapsed, (collapsed) => {
    localStorage.setItem(SIDEBAR_KEY, String(collapsed))
  })

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function collapseSidebar() {
    sidebarCollapsed.value = true
  }

  function expandSidebar() {
    sidebarCollapsed.value = false
  }

  return { sidebarCollapsed, toggleSidebar, collapseSidebar, expandSidebar }
})
