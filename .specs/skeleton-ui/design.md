# Skeleton UI — Design Document

## 1. Introduction

This document describes the technical design for the **Skeleton UI** feature defined in [`requirements.md`](./requirements.md). It covers dependency changes, component architecture, data flow, theming strategy, routing configuration, and the migration plan away from the default Vite scaffold.

---

## 2. Dependency Changes

### 2.1 New Runtime Dependencies

| Package      | Version | Purpose                          |
| ------------ | ------- | -------------------------------- |
| `vue-router` | ^4.5    | Client-side routing              |
| `pinia`      | ^3.0    | State management (theme store)   |

Install command:

```bash
npm install vue-router pinia
```

### 2.2 Tailwind CSS v4 — Dark Mode

Tailwind v4 uses CSS-based configuration. The `darkMode` strategy uses the `dark` variant which checks for a `.dark` class on an ancestor element. In Tailwind v4 this works out of the box with the `dark:` variant — no explicit `darkMode: 'class'` config is needed since v4 uses `@dark` internally. However, to ensure the class-based strategy works (instead of `prefers-color-scheme`), the Tailwind CSS entry point must include:

```css
@import "tailwindcss";
@variant dark (&:where(.dark, .dark *));
```

This overrides the default media-query dark mode to use the `.dark` class on `<html>`.

### 2.3 Files to Remove

| File                              | Reason                                          |
| --------------------------------- | ----------------------------------------------- |
| `src/components/HelloWorld.vue`   | Default scaffold component — replaced by shell  |
| `src/assets/vue.svg`             | Scaffold logo — no longer referenced             |
| `src/style.css`                  | Scaffold styles — replaced by Tailwind entry     |

### 2.4 Files to Modify

| File              | Changes                                                          |
| ----------------- | ---------------------------------------------------------------- |
| `index.html`      | Update `<title>` to "InvarETL", add `class` attribute on `<html>` for dark mode toggling |
| `src/main.ts`     | Register Vue Router and Pinia plugins, import Tailwind CSS entry |
| `src/App.vue`     | Replace scaffold template with shell layout                      |
| `tailwind.config.js` | Can be removed entirely — Tailwind v4 uses CSS-based config via `@import "tailwindcss"` |

---

## 3. Architecture Overview

### 3.1 Component Tree

```
App.vue
├── <TopBar>
│   ├── Brand link (RouterLink to "/")
│   ├── Sidebar toggle button
│   └── <ThemeToggle>
├── <SidebarDrawer :collapsed="sidebarCollapsed">
│   ├── Top menu group
│   │   ├── MenuItem (Home)
│   │   ├── MenuItem (Projects)
│   │   └── MenuItem (Help)
│   └── Bottom menu group
│       ├── MenuItem (Profile)
│       ├── MenuItem (Settings)
│       └── MenuItem (Logout)
└── <main>
    └── <RouterView />
        ├── HomeView        (route: /)
        ├── ProjectsView    (route: /projects)
        ├── HelpView        (route: /help)
        ├── ProfileView     (route: /profile)
        └── SettingsView    (route: /settings)
```

### 3.2 Final File Structure

```
ui/src/
├── App.vue
├── main.ts
├── style.css                    # Tailwind entry point (replaces scaffold CSS)
├── router/
│   └── index.ts
├── stores/
│   └── theme.ts
├── layouts/
│   ├── TopBar.vue
│   └── SidebarDrawer.vue
├── views/
│   ├── HomeView.vue
│   ├── ProjectsView.vue
│   ├── HelpView.vue
│   ├── ProfileView.vue
│   └── SettingsView.vue
├── components/
│   ├── ThemeToggle.vue
│   └── HeroSection.vue
└── test/
    ├── setup.ts                 # Existing — no changes
    ├── App.test.ts              # Updated for new App.vue
    ├── theme.test.ts
    └── router.test.ts
```

---

## 4. Detailed Component Design

### 4.1 `App.vue` — Shell Layout

**Responsibility:** Owns the sidebar collapsed/expanded state and composes the three layout regions.

```
┌──────────────────────────────────────────────────┐
│  TopBar (fixed, h-14, full width)                │
│  [Brand] [☰ toggle]              [🌙 theme]     │
├────────────┬─────────────────────────────────────┤
│  Sidebar   │                                     │
│  (w-64     │   <main> — <RouterView />           │
│   or w-16  │                                     │
│   when     │                                     │
│   collapsed│                                     │
│  )         │                                     │
│            │                                     │
│  --------- │                                     │
│  Profile   │                                     │
│  Settings  │                                     │
│  Logout    │                                     │
└────────────┴─────────────────────────────────────┘
```

**State:**

```ts
const sidebarCollapsed = ref(false)

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
```

- `sidebarCollapsed` is local to `App.vue` (not in a store) since only `App.vue`, `TopBar`, and `SidebarDrawer` need it.
- Passed to children via props. No global state needed.

**Responsive behavior (NFR-1):** On mount, check `window.innerWidth < 768` and auto-collapse if true. Also listen to `resize` events with a debounce.

**Template structure (semantic HTML):**

```html
<header> <!-- TopBar --> </header>
<aside>  <!-- SidebarDrawer --> </aside>
<main>   <!-- RouterView --> </main>
```

### 4.2 `TopBar.vue`

**Props:**

| Prop               | Type      | Description                    |
| ------------------ | --------- | ------------------------------ |
| `sidebarCollapsed` | `boolean` | Current sidebar state          |

**Emits:**

| Event            | Payload | Description                |
| ---------------- | ------- | -------------------------- |
| `toggle-sidebar` | none    | Requests sidebar toggle    |

**Template layout:**

```html
<header class="fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-4
               bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
  <div class="flex items-center gap-3">
    <RouterLink to="/" class="text-xl font-bold">InvarETL</RouterLink>
    <button @click="$emit('toggle-sidebar')" aria-label="Toggle sidebar">
      <!-- hamburger icon (inline SVG) -->
    </button>
  </div>
  <ThemeToggle />
</header>
```

### 4.3 `SidebarDrawer.vue`

**Props:**

| Prop        | Type      | Description                         |
| ----------- | --------- | ----------------------------------- |
| `collapsed` | `boolean` | Whether sidebar is in collapsed state |

**Internal data:**

Menu items are defined as a static array of objects:

```ts
interface MenuItem {
  label: string
  icon: string        // inline SVG path or Unicode character
  route?: string      // undefined for Logout (no-op)
  group: 'top' | 'bottom'
}

const menuItems: MenuItem[] = [
  { label: 'Home',     icon: '⌂', route: '/',         group: 'top' },
  { label: 'Projects', icon: '📁', route: '/projects', group: 'top' },
  { label: 'Help',     icon: '❓', route: '/help',     group: 'top' },
  { label: 'Profile',  icon: '👤', route: '/profile',  group: 'bottom' },
  { label: 'Settings', icon: '⚙', route: '/settings', group: 'bottom' },
  { label: 'Logout',   icon: '🚪',                     group: 'bottom' },
]
```

> **Note:** Unicode icons are placeholders. These can be swapped for inline SVGs or an icon library in a future iteration without changing the component API.

**Layout strategy:**

- Uses `flex flex-col` with `justify-between` to push bottom items down.
- Width transitions via `transition-all duration-200`: `w-64` (expanded) / `w-16` (collapsed).
- When collapsed, labels are hidden with `overflow-hidden` and the container width constrains to icon-only.

**Active route highlighting:**

Use `useRoute()` from `vue-router` and compare `route.path` to each menu item's `route` to apply an active class (e.g., `bg-gray-100 dark:bg-gray-800`).

```html
<RouterLink
  v-for="item in topItems"
  :key="item.label"
  :to="item.route"
  :class="[
    'flex items-center gap-3 px-4 py-2 rounded-md transition-colors',
    route.path === item.route
      ? 'bg-gray-100 dark:bg-gray-800 font-semibold'
      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
  ]"
>
  <span class="w-6 text-center shrink-0">{{ item.icon }}</span>
  <span v-show="!collapsed" class="whitespace-nowrap">{{ item.label }}</span>
</RouterLink>
```

**Logout item:** Rendered as a `<button>` (not a `<RouterLink>`) that emits no event for now (no-op per requirements).

### 4.4 `ThemeToggle.vue`

**Dependencies:** `useThemeStore` from `@/stores/theme`.

**Template:**

A single button that displays a sun icon (in dark mode) or moon icon (in light mode) and calls `themeStore.toggle()` on click.

```html
<button
  @click="themeStore.toggle()"
  :aria-label="`Switch to ${themeStore.isDark ? 'light' : 'dark'} mode`"
  class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
>
  <span v-if="themeStore.isDark">☀️</span>
  <span v-else>🌙</span>
</button>
```

### 4.5 `HeroSection.vue`

**Props:** None. All content is static.

**Template:**

```html
<section class="text-center py-16 px-4 max-w-3xl mx-auto">
  <h1 class="text-4xl font-bold mb-4">Welcome to InvarETL</h1>
  <p class="text-lg text-gray-600 dark:text-gray-400 mb-8">
    Your no-code data fabric for connecting, transforming,
    and delivering data across your organization.
  </p>
  <button class="px-6 py-3 bg-blue-600 text-white rounded-lg
                 hover:bg-blue-700 transition-colors font-medium">
    Get Started
  </button>
</section>
```

### 4.6 `HomeView.vue`

Composes `HeroSection` and an optional feature cards grid.

**Feature cards data:**

```ts
const features = [
  { icon: '🔗', title: 'Connect',   description: 'Integrate with any data source in minutes.' },
  { icon: '🔄', title: 'Transform', description: 'Build powerful data pipelines visually.' },
  { icon: '📤', title: 'Deliver',   description: 'Push clean data to any destination.' },
]
```

**Layout:** A responsive `grid grid-cols-1 md:grid-cols-3 gap-6` below the hero section, with each card as a bordered rounded box.

### 4.7 Placeholder Views

`ProjectsView.vue`, `HelpView.vue`, `ProfileView.vue`, `SettingsView.vue` all follow the same pattern:

```html
<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-2">{{ title }}</h1>
    <p class="text-gray-600 dark:text-gray-400">This page is under construction.</p>
  </div>
</template>
```

Each defines its own `title` constant matching the route name.

---

## 5. Router Design

### 5.1 Route Table (`router/index.ts`)

```ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/',         name: 'home',     component: () => import('@/views/HomeView.vue') },
  { path: '/projects', name: 'projects', component: () => import('@/views/ProjectsView.vue') },
  { path: '/help',     name: 'help',     component: () => import('@/views/HelpView.vue') },
  { path: '/profile',  name: 'profile',  component: () => import('@/views/ProfileView.vue') },
  { path: '/settings', name: 'settings', component: () => import('@/views/SettingsView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
```

**Design decisions:**

- **Lazy loading:** All view components use dynamic `import()` so they are code-split into separate chunks. This keeps the initial bundle small and is the standard Vue Router pattern.
- **`createWebHistory`:** Uses clean URLs (`/projects` not `/#/projects`). The Vite dev server and the Spring Boot backend (which serves the SPA from `resources/static`) both need to handle fallback routing. Vite handles this automatically; the backend will need a catch-all controller eventually (out of scope for this feature).
- **No catch-all / 404 route** at this stage — can be added later.

### 5.2 Vite SPA Fallback

Vite's dev server already handles SPA fallback for `createWebHistory` out of the box. No changes to `vite.config.ts` are needed.

---

## 6. State Management — Theme Store

### 6.1 Store Definition (`stores/theme.ts`)

```ts
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'invaretl-theme'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(resolveInitialTheme())

  // Sync to DOM and localStorage whenever isDark changes
  watch(isDark, (dark) => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light')
  }, { immediate: true })

  function toggle() {
    isDark.value = !isDark.value
  }

  return { isDark, toggle }
})

function resolveInitialTheme(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'dark') return true
  if (stored === 'light') return false
  // Fall back to system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}
```

### 6.2 Theme Resolution Order

```
localStorage('invaretl-theme')
  ├── 'dark'  → isDark = true
  ├── 'light' → isDark = false
  └── null    → window.matchMedia('prefers-color-scheme: dark')
                  ├── matches → isDark = true
                  └── no match → isDark = false (light default)
```

### 6.3 DOM Side Effect

The `watch` with `{ immediate: true }` ensures the `dark` class is applied on `<html>` during app initialization — before the first paint. This avoids a flash of the wrong theme.

---

## 7. Styling Strategy

### 7.1 Tailwind CSS Entry Point

Replace the current `src/style.css` with a Tailwind v4 entry point:

```css
@import "tailwindcss";
@variant dark (&:where(.dark, .dark *));
```

This is the **only** CSS file in the project. All component styles use Tailwind utility classes directly in templates.

### 7.2 Color Palette

Use Tailwind's default color palette. Key semantic mappings:

| Element              | Light                     | Dark                        |
| -------------------- | ------------------------- | --------------------------- |
| Page background      | `bg-gray-50`              | `dark:bg-gray-950`          |
| Top bar background   | `bg-white`                | `dark:bg-gray-900`          |
| Sidebar background   | `bg-white`                | `dark:bg-gray-900`          |
| Primary text         | `text-gray-900`           | `dark:text-gray-100`        |
| Secondary text       | `text-gray-600`           | `dark:text-gray-400`        |
| Borders              | `border-gray-200`         | `dark:border-gray-700`      |
| Active menu item bg  | `bg-gray-100`             | `dark:bg-gray-800`          |
| CTA button           | `bg-blue-600 text-white`  | Same (sufficient contrast)  |

### 7.3 Layout Dimensions

| Element         | Value                   | Notes                              |
| --------------- | ----------------------- | ---------------------------------- |
| Top bar height  | `h-14` (3.5rem / 56px) | Fixed position                     |
| Sidebar width   | `w-64` (16rem / 256px)  | Expanded                           |
| Sidebar width   | `w-16` (4rem / 64px)    | Collapsed                          |
| Content offset  | `pt-14` + `pl-64/pl-16` | Accounts for fixed top bar + sidebar |

### 7.4 Transitions

Sidebar collapse/expand uses `transition-all duration-200 ease-in-out` on the `width` property. The main content area's `padding-left` transitions in sync.

---

## 8. Bootstrap Sequence (`main.ts`)

```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
```

**Order matters:**
1. Pinia is registered first so stores are available during router navigation guards (not needed now, but correct ordering for the future).
2. Router is registered second.
3. `style.css` (Tailwind entry) is imported for side effects.

---

## 9. `index.html` Changes

```html
<!doctype html>
<html lang="en" class="">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>InvarETL</title>
  </head>
  <body class="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- `<html class="">` — empty class attribute; the theme store adds/removes `dark` at runtime.
- `<body>` gets base background and text colors so the page looks correct even before Vue mounts.
- `<title>` updated from "ui" to "InvarETL".

---

## 10. Testing Strategy

### 10.1 Theme Store Tests (`test/theme.test.ts`)

| Test Case                                    | Assertion                                                    |
| -------------------------------------------- | ------------------------------------------------------------ |
| Default state when localStorage is empty     | `isDark` matches `prefers-color-scheme` or falls back to `false` |
| Toggle flips `isDark`                        | `isDark` changes from `false` to `true` and vice versa       |
| Toggle persists to localStorage              | `localStorage.getItem('invaretl-theme')` equals `'dark'`     |
| Respects localStorage on init                | Set `localStorage` to `'dark'` before creating store → `isDark === true` |
| Applies `dark` class on `<html>`             | `document.documentElement.classList.contains('dark')` after toggle |

**Setup:** Each test creates a fresh Pinia instance and mocks `localStorage` and `matchMedia`.

### 10.2 Router Tests (`test/router.test.ts`)

| Test Case                        | Assertion                                        |
| -------------------------------- | ------------------------------------------------ |
| `/` renders HomeView             | Component contains "Welcome to InvarETL"         |
| `/projects` renders ProjectsView | Component contains "Projects"                    |
| `/help` renders HelpView         | Component contains "Help"                        |
| `/profile` renders ProfileView   | Component contains "Profile"                     |
| `/settings` renders SettingsView | Component contains "Settings"                    |

**Setup:** Use `createMemoryHistory` (not `createWebHistory`) in tests to avoid needing a browser history API. Mount `App` with the test router.

### 10.3 Updated `App.test.ts`

The existing smoke test must be updated to provide `router` and `pinia` plugins to the mount call since `App.vue` now depends on them:

```ts
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from '../App.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/', component: { template: '<div>Home</div>' } }],
})

describe('App.vue', () => {
  it('renders the shell layout', async () => {
    const wrapper = mount(App, {
      global: { plugins: [createPinia(), router] },
    })
    await router.isReady()
    expect(wrapper.find('header').exists()).toBe(true)
    expect(wrapper.find('aside').exists()).toBe(true)
    expect(wrapper.find('main').exists()).toBe(true)
  })
})
```

### 10.4 Sidebar Tests

Sidebar collapse/expand can be tested either:
- **Within `App.test.ts`** — click the toggle button and assert sidebar width class changes.
- **As a standalone `SidebarDrawer` test** — mount with `collapsed` prop and verify label visibility.

Both approaches are acceptable. The standalone approach is preferred for isolation.

---

## 11. Implementation Order

The following sequence minimizes broken intermediate states:

| Step | Task                                        | Depends On |
| ---- | ------------------------------------------- | ---------- |
| 1    | Install `vue-router` and `pinia`            | —          |
| 2    | Replace `src/style.css` with Tailwind entry | —          |
| 3    | Update `index.html`                         | —          |
| 4    | Create `stores/theme.ts`                    | Step 1     |
| 5    | Create `router/index.ts` with all routes    | Step 1     |
| 6    | Create placeholder views                    | Step 5     |
| 7    | Create `ThemeToggle.vue`                    | Step 4     |
| 8    | Create `SidebarDrawer.vue`                  | Step 5     |
| 9    | Create `TopBar.vue`                         | Step 7, 8  |
| 10   | Create `HeroSection.vue`                    | Step 2     |
| 11   | Create `HomeView.vue`                       | Step 10    |
| 12   | Rewrite `App.vue` (shell layout)            | Step 9, 11 |
| 13   | Update `main.ts` (register plugins)         | Step 4, 5, 12 |
| 14   | Delete scaffold files (`HelloWorld.vue`, `vue.svg`) | Step 12 |
| 15   | Update / write tests                        | Step 13    |
| 16   | Verify `npm run build` succeeds             | Step 15    |

---

## 12. Risk & Mitigations

| Risk                                         | Likelihood | Mitigation                                                        |
| -------------------------------------------- | ---------- | ----------------------------------------------------------------- |
| Tailwind v4 `@variant dark` not working      | Low        | Verified in Tailwind v4 docs; fallback is `@custom-variant`       |
| Flash of unstyled content (FOUC) on theme    | Medium     | `watch({ immediate: true })` applies class before first render    |
| SPA routing breaks on page refresh in prod   | Medium     | Out of scope; backend catch-all controller needed later           |
| Test breakage from removing HelloWorld       | Low        | `App.test.ts` is rewritten in the same step                      |
| `tailwind.config.js` conflicts with v4 CSS config | Low   | Remove `tailwind.config.js` entirely; v4 uses CSS-only config    |
