<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'

interface NavIcon {
  viewBox: string
  d: string | string[]
}

interface MenuItem {
  label: string
  route?: string
  group: 'top' | 'bottom'
  icon: NavIcon
}

const props = defineProps<{
  collapsed: boolean
}>()

const route = useRoute()

const menuItems: MenuItem[] = [
  {
    label: 'Home',
    route: '/',
    group: 'top',
    icon: {
      viewBox: '0 0 24 24',
      d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    },
  },
  {
    label: 'Projects',
    route: '/projects',
    group: 'top',
    icon: {
      viewBox: '0 0 24 24',
      d: 'M3 7a2 2 0 012-2h3.586a1 1 0 01.707.293L10.414 6.5A1 1 0 0011.121 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z',
    },
  },
  {
    label: 'Help',
    route: '/help',
    group: 'top',
    icon: {
      viewBox: '0 0 24 24',
      d: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
  },
  {
    label: 'Profile',
    route: '/profile',
    group: 'bottom',
    icon: {
      viewBox: '0 0 24 24',
      d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    },
  },
  {
    label: 'Settings',
    route: '/settings',
    group: 'bottom',
    icon: {
      viewBox: '0 0 24 24',
      d: [
        'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
        'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      ],
    },
  },
  {
    label: 'Logout',
    group: 'bottom',
    icon: {
      viewBox: '0 0 24 24',
      d: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
    },
  },
]

const topItems    = computed(() => menuItems.filter(i => i.group === 'top'))
const bottomItems = computed(() => menuItems.filter(i => i.group === 'bottom'))

function isActive(itemRoute?: string): boolean {
  if (!itemRoute) return false
  return route.path === itemRoute
}

function linkClasses(itemRoute?: string): string {
  const base =
    'flex items-center gap-3 px-3 py-2 rounded-md transition-colors w-full text-left'
  const active =
    'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold'
  const inactive =
    'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
  return `${base} ${isActive(itemRoute) ? active : inactive}`
}
</script>

<template>
  <aside
    :class="[
      'fixed top-14 left-0 bottom-0 z-40 flex flex-col',
      'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700',
      'transition-all duration-200 ease-in-out overflow-hidden',
      collapsed ? 'w-16' : 'w-64',
    ]"
    aria-label="Sidebar navigation"
  >
    <!-- Top menu group -->
    <nav class="flex flex-col gap-1 p-2 flex-1" aria-label="Main navigation">
      <template v-for="item in topItems" :key="item.label">
        <RouterLink
          :to="item.route!"
          :class="linkClasses(item.route)"
          :aria-label="collapsed ? item.label : undefined"
          :aria-current="isActive(item.route) ? 'page' : undefined"
        >
          <span class="w-5 h-5 shrink-0 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5"
              fill="none"
              :viewBox="item.icon.viewBox"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path
                v-if="typeof item.icon.d === 'string'"
                stroke-linecap="round"
                stroke-linejoin="round"
                :d="item.icon.d"
              />
              <path
                v-for="(segment, idx) in (Array.isArray(item.icon.d) ? item.icon.d : [])"
                :key="idx"
                stroke-linecap="round"
                stroke-linejoin="round"
                :d="segment"
              />
            </svg>
          </span>
          <span
            v-show="!collapsed"
            class="whitespace-nowrap text-sm overflow-hidden"
          >
            {{ item.label }}
          </span>
        </RouterLink>
      </template>
    </nav>

    <!-- Bottom menu group -->
    <nav
      class="flex flex-col gap-1 p-2 border-t border-gray-200 dark:border-gray-700"
      aria-label="Account navigation"
    >
      <template v-for="item in bottomItems" :key="item.label">
        <!-- Logout is a no-op button (no route) -->
        <button
          v-if="!item.route"
          :class="linkClasses()"
          :aria-label="collapsed ? item.label : undefined"
          type="button"
        >
          <span class="w-5 h-5 shrink-0 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5"
              fill="none"
              :viewBox="item.icon.viewBox"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path
                v-if="typeof item.icon.d === 'string'"
                stroke-linecap="round"
                stroke-linejoin="round"
                :d="item.icon.d"
              />
              <path
                v-for="(segment, idx) in (Array.isArray(item.icon.d) ? item.icon.d : [])"
                :key="idx"
                stroke-linecap="round"
                stroke-linejoin="round"
                :d="segment"
              />
            </svg>
          </span>
          <span v-show="!collapsed" class="whitespace-nowrap text-sm overflow-hidden">
            {{ item.label }}
          </span>
        </button>

        <!-- RouterLink items (have a route) -->
        <RouterLink
          v-else
          :to="item.route!"
          :class="linkClasses(item.route)"
          :aria-label="collapsed ? item.label : undefined"
          :aria-current="isActive(item.route) ? 'page' : undefined"
        >
          <span class="w-5 h-5 shrink-0 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5"
              fill="none"
              :viewBox="item.icon.viewBox"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path
                v-if="typeof item.icon.d === 'string'"
                stroke-linecap="round"
                stroke-linejoin="round"
                :d="item.icon.d"
              />
              <path
                v-for="(segment, idx) in (Array.isArray(item.icon.d) ? item.icon.d : [])"
                :key="idx"
                stroke-linecap="round"
                stroke-linejoin="round"
                :d="segment"
              />
            </svg>
          </span>
          <span
            v-show="!collapsed"
            class="whitespace-nowrap text-sm overflow-hidden"
          >
            {{ item.label }}
          </span>
        </RouterLink>
      </template>
    </nav>
  </aside>
</template>
