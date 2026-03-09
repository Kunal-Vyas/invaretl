# Skeleton UI — Requirements

## Overview

Build the foundational shell layout for the InvarETL frontend application. This feature replaces the default Vite scaffold with a production-ready app shell consisting of a top navigation bar, a collapsible sidebar drawer, a main content area with a home page, and a light/dark theme toggle.

No backend integration is required. All content is static or placeholder.

---

## Tech Constraints

| Concern        | Choice                                    |
| -------------- | ----------------------------------------- |
| Framework      | Vue 3 (Composition API + `<script setup>`)  |
| Styling        | Tailwind CSS v4 (utility-first, no component library) |
| Routing        | Vue Router v4 (`createWebHistory`)        |
| State          | Pinia (theme store only at this stage)    |
| Build          | Vite 7 / TypeScript strict                |
| Testing        | Vitest + @vue/test-utils (existing setup) |

> **Note:** Vue Router and Pinia are new dependencies that must be added to `ui/package.json`.

---

## Functional Requirements

### FR-1: App Shell Layout

The root `App.vue` must render a persistent shell layout with three regions:

1. **Top Bar** — Full-width horizontal bar fixed to the top of the viewport.
2. **Sidebar Drawer** — Vertical panel on the left side, below the top bar.
3. **Main Content Area** — Occupies the remaining space to the right of the sidebar and below the top bar. Renders the current route via `<RouterView>`.

### FR-2: Top Bar

| Element                | Position   | Behavior                                                                                      |
| ---------------------- | ---------- | --------------------------------------------------------------------------------------------- |
| Brand logo / app name  | Left       | Displays the text **"InvarETL"** (or a placeholder logo). Acts as a link to the Home route (`/`). |
| Sidebar toggle button  | Left (after brand) | Clicking collapses or expands the sidebar drawer.                                       |
| Theme toggle           | Right      | A button or switch that toggles between light and dark mode. Persists selection to `localStorage`. |

### FR-3: Sidebar Drawer

- The sidebar is **collapsible**. When collapsed it shows only icons; when expanded it shows icons + labels.
- Default state on page load: **expanded**.

#### Menu Items

| Group  | Label      | Icon (placeholder) | Route         |
| ------ | ---------- | ------------------- | ------------- |
| Top    | Home       | house icon          | `/`           |
| Top    | Projects   | folder icon         | `/projects`   |
| Top    | Help       | question-circle     | `/help`       |
| Bottom | Profile    | user icon           | `/profile`    |
| Bottom | Settings   | gear icon           | `/settings`   |
| Bottom | Logout     | sign-out icon       | n/a (no-op)   |

- Top-group items are anchored to the top of the sidebar.
- Bottom-group items are anchored to the bottom of the sidebar.
- The active route item should be visually highlighted.
- Icons can be inline SVGs or simple Unicode/emoji placeholders — no icon library is required at this stage.

### FR-4: Home Page (`/`)

The default landing route renders a **Home** view with:

1. **Hero Section** — A centered block containing:
   - A heading (e.g., *"Welcome to InvarETL"*).
   - A subheading or short paragraph of placeholder text describing the product.
   - A call-to-action button labeled **"Get Started"** (no-op, links nowhere yet).
2. **Feature Cards** (optional but recommended) — A grid of 3 placeholder cards highlighting key product capabilities (e.g., "Connect", "Transform", "Deliver"), each with a title, short description, and a placeholder icon.

### FR-5: Placeholder Pages

Each remaining route (`/projects`, `/help`, `/profile`, `/settings`) renders a minimal placeholder view with:

- A page title matching the menu item label.
- A short line of text such as *"This page is under construction."*

These exist solely so that the router and sidebar navigation are functional end-to-end.

### FR-6: Light / Dark Theme

- The app must support two themes: **light** (default) and **dark**.
- Theme preference is stored in a Pinia store and persisted to `localStorage`.
- On load, the app reads `localStorage` first; if absent, defaults to the user's system preference (`prefers-color-scheme`), falling back to light.
- Implementation: toggle the `dark` class on the `<html>` element and use Tailwind's `dark:` variant.

---

## Non-Functional Requirements

### NFR-1: Responsiveness

- The layout must be usable at common desktop widths (>=1024px).
- On viewports narrower than 768px, the sidebar should auto-collapse and be toggleable via the top bar button.
- Full mobile responsiveness is **not** in scope — basic usability is sufficient.

### NFR-2: Accessibility

- All interactive elements (buttons, links, toggles) must be keyboard-navigable.
- The sidebar toggle and theme toggle must have appropriate `aria-label` attributes.
- Semantic HTML elements (`<nav>`, `<main>`, `<header>`, `<aside>`) must be used where appropriate.

### NFR-3: Performance

- No external CSS or JS CDN dependencies at runtime.
- All styles are Tailwind utilities — no custom CSS files beyond the Tailwind entry point.
- Bundle should remain under 200 KB gzipped (easily achievable with Vue + Tailwind alone).

### NFR-4: Testing

- Unit tests for:
  - Theme store (toggle behavior, localStorage persistence).
  - Sidebar collapse/expand behavior.
  - Router renders the correct view component for each route.
- All existing tests must continue to pass (`npm test`).

---

## File Structure (suggested)

```
ui/src/
├── App.vue                  # Shell layout (top bar + sidebar + RouterView)
├── main.ts                  # App bootstrap (router, pinia, mount)
├── router/
│   └── index.ts             # Route definitions
├── stores/
│   └── theme.ts             # Pinia theme store
├── layouts/
│   ├── TopBar.vue           # Top navigation bar
│   └── SidebarDrawer.vue    # Collapsible sidebar
├── views/
│   ├── HomeView.vue         # Home page with hero section
│   ├── ProjectsView.vue     # Placeholder
│   ├── HelpView.vue         # Placeholder
│   ├── ProfileView.vue      # Placeholder
│   └── SettingsView.vue     # Placeholder
├── components/
│   ├── ThemeToggle.vue      # Light/dark mode switch
│   └── HeroSection.vue      # Hero block for home page
└── test/
    ├── setup.ts             # Existing test setup
    ├── theme.test.ts        # Theme store tests
    └── router.test.ts       # Route rendering tests
```

---

## Out of Scope

- Authentication / login flow (Logout button is a no-op).
- Backend API integration.
- Real project data or CRUD operations.
- Full mobile / tablet responsive design.
- Internationalization (i18n).
- Animations or transitions beyond basic CSS transitions for sidebar collapse.

---

## Acceptance Criteria

1. Running `npm run dev` in `ui/` opens the app with the top bar, sidebar, and home page visible.
2. Clicking each sidebar menu item navigates to the correct route and updates the URL.
3. The active menu item is visually distinguished from inactive items.
4. Collapsing the sidebar hides labels and shows only icons; expanding restores them.
5. Toggling the theme switches between light and dark mode across the entire app and persists across page reloads.
6. All placeholder pages render their title and placeholder text.
7. `npm test` passes with no failures.
8. `npm run build` completes without errors.
