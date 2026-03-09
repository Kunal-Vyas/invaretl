<script setup lang="ts">
import { RouterLink } from 'vue-router'
import ThemeToggle from '@/components/ThemeToggle.vue'

defineProps<{
  sidebarCollapsed: boolean
}>()

defineEmits<{
  'toggle-sidebar': []
}>()
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-4
           bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
  >
    <div class="flex items-center gap-3">
      <!-- Brand link -->
      <RouterLink
        to="/"
        class="text-xl font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        InvarETL
      </RouterLink>

      <!-- Sidebar toggle button -->
      <button
        @click="$emit('toggle-sidebar')"
        :aria-label="sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        :aria-expanded="!sidebarCollapsed"
        type="button"
        class="p-2 rounded-md text-gray-600 dark:text-gray-400
               hover:bg-gray-100 dark:hover:bg-gray-800
               transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <!-- Hamburger icon -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>

    <!-- Right side: theme toggle -->
    <div class="flex items-center gap-2">
      <ThemeToggle />
    </div>
  </header>
</template>
