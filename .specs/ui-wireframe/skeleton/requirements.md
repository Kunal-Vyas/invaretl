# Specification: Skeleton UI Wireframe — InvarETL

## Overview
Build a standalone, single-file HTML/CSS/JavaScript skeleton wireframe that
represents the InvarETL application shell. No build tooling is required; the
file must open directly in a browser.

---

## 1. Technology Constraints
- **Single file** — all HTML, CSS, and JavaScript in one `.html` file.
- No external frameworks (no Vue, React, Tailwind CDN, etc.).
- Vanilla CSS for layout and theming; vanilla JavaScript for interactivity.
- Must work in the latest versions of Chrome, Firefox, and Edge.

---

## 2. Brand & Visual Identity
- **Product name:** InvarETL
- **Logo:** Text-based wordmark: `Invar` (regular weight) + `ETL` (bold /
  accent colour). Displayed top-left inside the top navigation bar.
- **Accent colour:** `#E84A1F` (orange-red, matching the Invartek brand family).
- **Typography:** System font stack (`-apple-system, BlinkMacSystemFont,
  "Segoe UI", Roboto, sans-serif`). Monospace (`Consolas, "Courier New",
  monospace`) for code-style labels or metadata values.
- **Colour tokens** (defined as CSS custom properties on `:root`):

  | Token            | Light       | Dark        |
  |------------------|-------------|-------------|
  | `--bg-primary`   | `#F5F2EB`   | `#0A0A0F`   |
  | `--bg-surface`   | `#FFFFFF`   | `#14141C`   |
  | `--bg-sidebar`   | `#EFEFEA`   | `#111118`   |
  | `--text-primary` | `#0A0A0F`   | `#F5F2EB`   |
  | `--text-muted`   | `#6B6B78`   | `#9191A0`   |
  | `--border`       | `#D0CDC4`   | `#2A2A38`   |
  | `--accent`       | `#E84A1F`   | `#E84A1F`   |

---

## 3. Layout — Application Shell

### 3.1 Top Navigation Bar
- Fixed at the top, full width, `48px` tall.
- **Left section:** Brand logo / wordmark (`InvarETL`).
- **Center section:** (empty — reserved for future global search bar).
- **Right section:**
  - User avatar / initials dropdown button (placeholder circle with initials `KV`). Clicking toggles dropdown menu.
  - Light/Dark mode toggle — icon button (sun ↔ moon). Clicking it switches
    the theme by toggling a `data-theme="dark"` attribute on `<html>`.
- **User Dropdown Menu:** Contains Profile, Account, and Logout items with icons.
- The nav bar must always be visible; content below scrolls independently.

### 3.2 Collapsible Left Sidebar / Drawer
- Fixed on the left, below the top nav bar, full remaining height.
- **Expanded width:** `220px`. **Collapsed width:** `56px` (icon-only).
- A collapse/expand toggle button sits at the bottom of the sidebar.
- Navigation items (icon + label):
  1. Dashboard *(default active)*
  2. Projects
  3. Data Sources
  4. Pipelines
  5. Transforms
- Settings, Profile, and Account are accessible via the user dropdown menu in the top navigation bar.
- When collapsed, labels are hidden; icons remain visible.
- Active item is highlighted with the accent colour left border + tinted background.
- Sidebar collapse/expand state is persisted in `localStorage`.

### 3.3 Main Content Area
- Fills remaining width to the right of the sidebar.
- Top padding accounts for the fixed nav bar (`48px`).
- Scrollable independently of the sidebar.
- Renders the active page section (see Section 4).

---

## 4. Page Sections (Placeholder Content)

Each nav item reveals a corresponding content section. Inactive sections are
hidden (`display: none`). Section switching is handled by JavaScript click
handlers on nav items.

### 4.0 Dashboard *(default)*
- **Page title:** "Dashboard"
- **Summary cards row — 7 cards:**
  - Projects, Data Sources, Pipelines, Transforms, Executions, Amount Spent, Errors Today.
  - Each card: icon placeholder (SVG outline), large number with actual values, label.
  - **Executions** card (pipeline executions) appears immediately after Transforms and before Amount Spent.
  - **Amount Spent** card appears immediately before the Errors Today card.
- **Recent Activity table:**
  - Columns: Project, Status, Last Run, Duration, Cost.
  - 15 rows with real data across 3 pages (5 rows per page).
  - Status badges: Running (green), Idle (grey), Error (red).
  - Pagination controls: Previous/Next buttons and page number buttons (1, 2, 3).

### 4.1 Projects
- **Page title:** "Projects"
- Placeholder content indicating a project list / grid (no further detail required at skeleton stage).

### 4.2 Pipelines
- **Page title:** "Pipelines"
- **Toolbar:** "New Pipeline" button (accent colour; non-functional placeholder).
- **Table:**
  - Columns: Pipeline Name, Status badge (Running / Idle / Error),
    Source, Destination, Last Run.
  - 5 placeholder rows.

### 4.3 Data Sources
- **Page title:** "Data Sources"
- **Connector card grid (3 per row):**
  - Cards for: PostgreSQL, Amazon S3, REST API, Apache Kafka, MySQL, Snowflake.
  - Each card: icon placeholder, connector name, "Configure" link (non-functional).

### 4.4 Transforms
- **Page title:** "Transforms"
- **Transform library list — 4 items:**
  - Filter, Map, Join, Aggregate.
  - Each item: icon, name, short description placeholder text.

### 4.5 Settings
- **Page title:** "Settings"
- Accessible via user dropdown menu in top navigation.
- **Two grouped form sections:**
  1. General — fields: Application Name, Time Zone (both `disabled`).
  2. Security — fields: API Key (masked `••••••••`), Session Timeout (both `disabled`).
- "Save Changes" button (visible but `disabled` — skeleton state).

### 4.6 Profile
- **Page title:** "Profile"
- Accessible via user dropdown menu in top navigation.
- **Two grouped form sections:**
  1. Personal Information — fields: Full Name, Email Address, Company, Role (all `disabled`).
  2. Profile Picture — avatar preview with initials, file upload info, "Upload New Picture" and "Remove Picture" buttons (both `disabled`).
- "Save Changes" button (visible but `disabled` — skeleton state).

### 4.7 Account
- **Page title:** "Account Settings"
- Accessible via user dropdown menu in top navigation.
- **Three grouped form sections:**
  1. Account Details — fields: Account ID, Plan, Status, Created (all `disabled`).
  2. Billing Information — fields: Billing Email, Billing Address, Payment Method (all `disabled`).
  3. Security — fields: Last Password Change, Two-Factor Authentication, Active Sessions (all `disabled`).
- "Save Changes" button (visible but `disabled` — skeleton state).

---

## 5. Interactivity Requirements

| Behaviour                  | Detail                                                                 |
|----------------------------|------------------------------------------------------------------------|
| Sidebar collapse / expand  | Toggle CSS class; adjust main area margin; persist in `localStorage`   |
| Theme toggle               | Toggle `data-theme="dark"` on `<html>`; persist in `localStorage`      |
| Nav item selection         | Add active class to clicked item; show corresponding content section   |
| User dropdown toggle       | Show/hide dropdown menu; close on click outside or Escape key         |
| Dashboard card navigation | Click card links to navigate to corresponding section                 |
| Table pagination           | Switch between pages; update visibility of rows based on `data-page`   |
| Mobile hamburger           | Show/hide sidebar overlay on screens narrower than `768px`             |
| Browser history           | Support back/forward navigation via URL hash                           |

---

## 6. Responsive Behaviour

| Breakpoint      | Sidebar behaviour                                                  |
|-----------------|--------------------------------------------------------------------|
| ≥ 1024 px       | Expanded by default (`220px`)                                      |
| 768 px–1023 px  | Collapsed by default (`56px`); user can expand                     |
| < 768 px        | Hidden; hamburger icon in top nav opens it as a full-height overlay |

---

## 7. Accessibility (Minimum Bar)
- Semantic HTML elements: `<header>`, `<nav>`, `<aside>`, `<main>`.
- All interactive elements keyboard-focusable with a visible focus ring.
- `aria-label` attributes on icon-only buttons (collapse toggle, theme toggle, hamburger).
- User dropdown uses `aria-expanded`, `aria-haspopup`, and `role="menu"` attributes.
- Navigation items use `aria-current="page"` to indicate active section.
- Pagination buttons use `aria-label` attributes (e.g., "Previous page", "Page 1", "Next page").
- Sufficient colour contrast in both light and dark modes (WCAG AA target).
- Skip link for keyboard users to jump directly to main content.

---

## 8. Additional Features (Beyond Original Spec)
- **User Dropdown Menu:** Expandable menu in top navigation with Profile, Account, and Logout options.
- **Dashboard Table Pagination:** Full pagination system with 3 pages of data, prev/next buttons, and page number indicators.
- **Profile Page:** User profile management with personal information and profile picture sections.
- **Account Page:** Account settings with details, billing information, and security settings.
- **Browser History Support:** Back/forward navigation works correctly using URL hash fragments.
- **Card Navigation:** Dashboard cards are clickable and navigate to their respective sections.
- **Enhanced Error Handling:** Try-catch blocks for localStorage operations and console logging for debugging.

---

## 9. Deliverable
- **File:** `.specs/ui-wireframe/skeleton/index.html`
- Must render without any server or build step — open directly via `file://`.
- No external network requests (no CDN fonts, no remote assets).
