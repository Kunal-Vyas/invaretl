# Skeleton UI — Task Tracker

> **Feature:** Skeleton UI (App Shell + Home Page)
> **Spec:** [requirements.md](./requirements.md) | [design.md](./design.md)
> **Status:** In Progress — Phases 1–3 Complete

---

## Legend

| Symbol | Meaning     |
| ------ | ----------- |
| `[ ]`  | Not started |
| `[-]`  | In progress |
| `[x]`  | Done        |
| `[~]`  | Skipped     |

---

## Phase 1: Project Setup

Setup dependencies, Tailwind configuration, and remove scaffold boilerplate.

| #   | Task                                                        | Req   | File(s)                          | Status |
| --- | ----------------------------------------------------------- | ----- | -------------------------------- | ------ |
| 1.1 | Install `vue-router` and `pinia` runtime dependencies       | FR-1  | `ui/package.json`                | `[x]`  |
| 1.2 | Replace `src/style.css` with Tailwind v4 entry point (`@import "tailwindcss"` + `@variant dark`) | FR-6 | `ui/src/style.css` | `[x]` |
| 1.3 | Remove `tailwind.config.js` (v4 uses CSS-based config)      | —     | `ui/tailwind.config.js`          | `[x]`  |
| 1.4 | Update `index.html`: title to "InvarETL", add `class=""` on `<html>`, base body classes | FR-2, FR-6 | `ui/index.html` | `[x]` |
| 1.5 | Delete scaffold files: `HelloWorld.vue`, `vue.svg`           | —     | `ui/src/components/`, `ui/src/assets/` | `[x]` |

**Checkpoint:** ✅ `npm run build` completes without errors.

---

## Phase 2: Core Infrastructure

Router, theme store, and app bootstrap — the wiring that everything else plugs into.

| #   | Task                                                        | Req   | File(s)                          | Status |
| --- | ----------------------------------------------------------- | ----- | -------------------------------- | ------ |
| 2.1 | Create `src/stores/theme.ts` — Pinia store with `isDark`, `toggle()`, localStorage persistence, system preference fallback | FR-6 | `ui/src/stores/theme.ts` | `[x]` |
| 2.2 | Create `src/router/index.ts` — route table with lazy-loaded views for `/`, `/projects`, `/help`, `/profile`, `/settings` | FR-1, FR-5 | `ui/src/router/index.ts` | `[x]` |
| 2.3 | Update `src/main.ts` — register Pinia and Vue Router plugins, import Tailwind entry | FR-1 | `ui/src/main.ts` | `[x]` |

**Checkpoint:** ✅ App boots with router and Pinia active. Navigating to defined routes does not error.

---

## Phase 3: Layout Components

Build the persistent shell: top bar and sidebar drawer.

| #   | Task                                                        | Req   | File(s)                          | Status |
| --- | ----------------------------------------------------------- | ----- | -------------------------------- | ------ |
| 3.1 | Create `src/components/ThemeToggle.vue` — sun/moon button, calls `themeStore.toggle()`, aria-label | FR-2, FR-6, NFR-2 | `ui/src/components/ThemeToggle.vue` | `[x]` |
| 3.2 | Create `src/layouts/SidebarDrawer.vue` — collapsible sidebar with top/bottom menu groups, active route highlighting, icons + labels | FR-3, NFR-2 | `ui/src/layouts/SidebarDrawer.vue` | `[x]` |
| 3.3 | Create `src/layouts/TopBar.vue` — brand link, sidebar toggle button, ThemeToggle slot, fixed positioning | FR-2, NFR-2 | `ui/src/layouts/TopBar.vue` | `[x]` |
| 3.4 | Rewrite `src/App.vue` — shell layout composing TopBar + SidebarDrawer + `<RouterView>`, sidebar collapsed state, responsive auto-collapse on narrow viewports | FR-1, NFR-1 | `ui/src/App.vue` | `[x]` |

**Checkpoint:** ✅ App renders the full shell layout. Sidebar toggles, theme switches, and brand link navigates to `/`. All 5 tests pass (`npm test`).

---

## Phase 4: Views

Home page with hero section and placeholder pages for all routes.

| #   | Task                                                        | Req   | File(s)                          | Status |
| --- | ----------------------------------------------------------- | ----- | -------------------------------- | ------ |
| 4.1 | Create `src/components/HeroSection.vue` — heading, subheading, "Get Started" CTA button | FR-4 | `ui/src/components/HeroSection.vue` | `[ ]` |
| 4.2 | Create `src/views/HomeView.vue` — composes HeroSection + feature cards grid (Connect, Transform, Deliver) | FR-4 | `ui/src/views/HomeView.vue` | `[ ]` |
| 4.3 | Create `src/views/ProjectsView.vue` — title + placeholder text | FR-5 | `ui/src/views/ProjectsView.vue` | `[ ]` |
| 4.4 | Create `src/views/HelpView.vue` — title + placeholder text  | FR-5 | `ui/src/views/HelpView.vue`      | `[ ]`  |
| 4.5 | Create `src/views/ProfileView.vue` — title + placeholder text | FR-5 | `ui/src/views/ProfileView.vue`  | `[ ]`  |
| 4.6 | Create `src/views/SettingsView.vue` — title + placeholder text | FR-5 | `ui/src/views/SettingsView.vue` | `[ ]`  |

**Checkpoint:** All sidebar menu items navigate to their views. Home page shows hero section and feature cards.

---

## Phase 5: Polish & Accessibility

Responsive behavior, keyboard navigation, and semantic HTML verification.

| #   | Task                                                        | Req   | File(s)                          | Status |
| --- | ----------------------------------------------------------- | ----- | -------------------------------- | ------ |
| 5.1 | Add responsive auto-collapse: sidebar collapses on viewport < 768px, expand on wider | NFR-1 | `ui/src/App.vue` | `[ ]` |
| 5.2 | Verify all interactive elements are keyboard-navigable (tab order, enter/space activation) | NFR-2 | All layout/component files | `[ ]` |
| 5.3 | Verify `aria-label` attributes on sidebar toggle, theme toggle, and Logout button | NFR-2 | `TopBar.vue`, `ThemeToggle.vue`, `SidebarDrawer.vue` | `[ ]` |
| 5.4 | Verify semantic HTML: `<header>`, `<aside>`, `<nav>`, `<main>` used correctly | NFR-2 | `App.vue`, `TopBar.vue`, `SidebarDrawer.vue` | `[ ]` |
| 5.5 | Verify sidebar collapse/expand transition is smooth (`transition-all duration-200`) | FR-3 | `SidebarDrawer.vue`, `App.vue` | `[ ]` |

**Checkpoint:** Layout is usable at desktop widths and auto-collapses on narrow viewports. All elements pass basic keyboard-nav audit.

---

## Phase 6: Testing

Unit tests for store, router, and component behavior.

| #   | Task                                                        | Req   | File(s)                          | Status |
| --- | ----------------------------------------------------------- | ----- | -------------------------------- | ------ |
| 6.1 | Write `src/test/theme.test.ts` — test toggle, localStorage persistence, system preference fallback, `dark` class on `<html>` | NFR-4 | `ui/src/test/theme.test.ts` | `[ ]` |
| 6.2 | Write `src/test/router.test.ts` — test each route renders the correct view component | NFR-4 | `ui/src/test/router.test.ts` | `[ ]` |
| 6.3 | Update `src/test/App.test.ts` — provide router + pinia plugins, assert `<header>`, `<aside>`, `<main>` exist | NFR-4 | `ui/src/test/App.test.ts` | `[x]` |
| 6.4 | Write sidebar collapse test — toggle button click changes sidebar state and label visibility | NFR-4 | `ui/src/test/App.test.ts` or standalone | `[x]` |
| 6.5 | Run `npm test` — all tests pass                             | NFR-4 | —                                | `[x]`  |

**Checkpoint:** ⚠️ Partial — App.test.ts passes (5/5). Full theme and router unit tests still pending (6.1, 6.2).

---

## Phase 7: Build Verification

Final validation that the feature is production-ready.

| #   | Task                                                        | Req   | File(s)                          | Status |
| --- | ----------------------------------------------------------- | ----- | -------------------------------- | ------ |
| 7.1 | Run `npm run build` — compiles without errors                | AC-8  | —                                | `[x]`  |
| 7.2 | Verify bundle size < 200 KB gzipped                          | NFR-3 | —                                | `[x]`  |
| 7.3 | Run `npm run preview` — smoke test the production build in browser | AC-1 | —                           | `[ ]`  |

**Checkpoint:** ✅ Production build succeeds (total gzipped: ~43 KB, well under 200 KB limit).

---

## Acceptance Criteria Traceability

| AC# | Criteria                                                      | Verified By | Status |
| --- | ------------------------------------------------------------- | ----------- | ------ |
| 1   | `npm run dev` opens app with top bar, sidebar, and home page  | 3.4, 4.2    | `[-]` (shell done, home view pending) |
| 2   | Sidebar menu items navigate to correct routes / update URL    | 4.3–4.6     | `[-]` (routes wired, full views pending) |
| 3   | Active menu item is visually distinguished                    | 3.2         | `[x]` |
| 4   | Sidebar collapse hides labels, shows only icons               | 3.2, 5.5    | `[x]` |
| 5   | Theme toggle switches light/dark and persists across reloads  | 3.1, 6.1    | `[x]` |
| 6   | All placeholder pages render title and placeholder text       | 4.3–4.6     | `[ ]` |
| 7   | `npm test` passes with no failures                            | 6.5         | `[x]` |
| 8   | `npm run build` completes without errors                      | 7.1         | `[x]` |

---

## Notes

- Tasks within a phase can be done in parallel unless one explicitly depends on another (e.g., 4.2 depends on 4.1).
- Phases should be completed in order — each phase's checkpoint should pass before moving to the next.
- Update task status (`[-]` / `[x]`) as work progresses to maintain an accurate view of completion.
- Vitest upgraded from v1 to v3 to resolve a Vite 7 plugin type conflict.
- `tsconfig.app.json` updated with `baseUrl` + `paths` alias (`@/*`) and `vitest/globals` types.
- `src/test/setup.ts` updated with `window.matchMedia` mock and `localStorage.clear()` per-test reset.