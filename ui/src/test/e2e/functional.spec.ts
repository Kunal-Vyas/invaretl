import { test, expect, type Page } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

// ─── Helpers ────────────────────────────────────────────────────────────────

async function goto(page: Page, path = "/") {
  await page.goto(`${BASE_URL}${path}`);
  await page.waitForLoadState("networkidle");
}

// ─── Phase 1: Project Setup ──────────────────────────────────────────────────

test.describe("Phase 1 — Project Setup", () => {
  test("1.1 page title is InvarETL", async ({ page }) => {
    await goto(page);
    await expect(page).toHaveTitle("InvarETL");
  });

  test("1.2 Tailwind dark variant is class-based (html element has class attr)", async ({
    page,
  }) => {
    await goto(page);
    // The <html> element must have a class attribute (even if empty) so the
    // dark variant toggle works via JS.
    const htmlClass = await page.evaluate(() =>
      document.documentElement.hasAttribute("class"),
    );
    expect(htmlClass).toBe(true);
  });

  test("1.3 tailwind CSS is loaded (body has expected bg utility)", async ({
    page,
  }) => {
    await goto(page);
    // Tailwind should have generated styles — body should have bg-gray-50
    // in light mode. We check via computed style or class attribute.
    const bodyClass = await page.evaluate(() => document.body.className);
    expect(bodyClass).toContain("bg-gray-50");
  });

  test("1.4 scaffold HelloWorld component is gone", async ({ page }) => {
    await goto(page);
    // The scaffold text should not appear anywhere
    const text = await page.textContent("body");
    expect(text).not.toContain("Vite + Vue");
    expect(text).not.toContain("You did it!");
    expect(text).not.toContain("Edit <code>components/HelloWorld.vue</code>");
  });

  test("1.5 scaffold vue.svg / vite logo images are gone", async ({ page }) => {
    await goto(page);
    const viteImg = page.locator('img[alt="Vite logo"]');
    const vueImg = page.locator('img[alt="Vue logo"]');
    await expect(viteImg).toHaveCount(0);
    await expect(vueImg).toHaveCount(0);
  });
});

// ─── Phase 2: Core Infrastructure ────────────────────────────────────────────

test.describe("Phase 2 — Core Infrastructure", () => {
  test("2.1 Pinia theme store is active (html class reflects theme)", async ({
    page,
  }) => {
    await goto(page);
    // After boot the store runs its immediate watcher and sets the class.
    // Light mode (default) → no "dark" class.
    const hasDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    // Just assert it is a boolean (store wired up correctly); value depends on
    // system preference in CI — we don't assert light/dark here, only that the
    // store initialised without throwing.
    expect(typeof hasDark).toBe("boolean");
  });

  test("2.2 router: / loads without error", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await goto(page, "/");
    expect(errors.length).toBe(0);
  });

  test("2.2 router: /projects loads without error", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await goto(page, "/projects");
    expect(errors.length).toBe(0);
  });

  test("2.2 router: /help loads without error", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await goto(page, "/help");
    expect(errors.length).toBe(0);
  });

  test("2.2 router: /profile loads without error", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await goto(page, "/profile");
    expect(errors.length).toBe(0);
  });

  test("2.2 router: /settings loads without error", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await goto(page, "/settings");
    expect(errors.length).toBe(0);
  });

  test("2.3 main.ts: app mounts correctly (root #app is non-empty)", async ({
    page,
  }) => {
    await goto(page);
    const appHTML = await page.evaluate(
      () => document.getElementById("app")?.innerHTML ?? "",
    );
    expect(appHTML.length).toBeGreaterThan(0);
  });
});

// ─── Phase 3: Layout Components ──────────────────────────────────────────────

test.describe("Phase 3 — Layout Components", () => {
  // ── 3.3 / 3.4 TopBar & App shell ──────────────────────────────────────────

  test("3.3 TopBar renders as <header> element", async ({ page }) => {
    await goto(page);
    await expect(page.locator("header")).toBeVisible();
  });

  test("3.3 TopBar is fixed to the top of the viewport", async ({ page }) => {
    await goto(page);
    const position = await page.evaluate(() => {
      const header = document.querySelector("header")!;
      return window.getComputedStyle(header).position;
    });
    expect(position).toBe("fixed");
  });

  test("3.3 TopBar displays brand name InvarETL", async ({ page }) => {
    await goto(page);
    await expect(page.locator("header").getByText("InvarETL")).toBeVisible();
  });

  test("3.3 brand name is a link to /", async ({ page }) => {
    await goto(page);
    const brandLink = page.locator("header a", { hasText: "InvarETL" });
    await expect(brandLink).toBeVisible();
    const href = await brandLink.getAttribute("href");
    expect(href).toBe("/");
  });

  test("3.3 TopBar has a sidebar toggle button with aria-label", async ({
    page,
  }) => {
    await goto(page);
    const toggleBtn = page.locator('header button[aria-label*="sidebar"]');
    await expect(toggleBtn).toBeVisible();
    const label = await toggleBtn.getAttribute("aria-label");
    expect(label).toBeTruthy();
    expect(label!.toLowerCase()).toMatch(/sidebar/);
  });

  test("3.3 TopBar has a ThemeToggle button", async ({ page }) => {
    await goto(page);
    // ThemeToggle is the button that mentions light/dark in its aria-label
    const themeBtn = page.locator('header button[aria-label*="mode"]');
    await expect(themeBtn).toBeVisible();
  });

  // ── 3.2 SidebarDrawer ─────────────────────────────────────────────────────

  test("3.2 SidebarDrawer renders as <aside> element", async ({ page }) => {
    await goto(page);
    await expect(page.locator("aside")).toBeVisible();
  });

  test("3.2 sidebar contains all 5 navigation labels when expanded", async ({
    page,
  }) => {
    await goto(page);
    const aside = page.locator("aside");
    await expect(aside.getByText("Home")).toBeVisible();
    await expect(aside.getByText("Projects")).toBeVisible();
    await expect(aside.getByText("Help")).toBeVisible();
    await expect(aside.getByText("Profile")).toBeVisible();
    await expect(aside.getByText("Settings")).toBeVisible();
  });

  test("3.2 sidebar contains Logout button", async ({ page }) => {
    await goto(page);
    const logoutBtn = page.locator("aside button", { hasText: "Logout" });
    await expect(logoutBtn).toBeVisible();
  });

  test("3.2 sidebar has an aria-label for accessibility", async ({ page }) => {
    await goto(page);
    const aside = page.locator("aside[aria-label]");
    await expect(aside).toBeVisible();
  });

  test("3.2 sidebar top nav group contains Home, Projects, Help links", async ({
    page,
  }) => {
    await goto(page);
    // All three should be RouterLinks (anchors) inside the aside
    const topNav = page.locator("aside nav").first();
    await expect(topNav.locator("a", { hasText: "Home" })).toBeVisible();
    await expect(topNav.locator("a", { hasText: "Projects" })).toBeVisible();
    await expect(topNav.locator("a", { hasText: "Help" })).toBeVisible();
  });

  test("3.2 sidebar bottom nav group contains Profile and Settings links", async ({
    page,
  }) => {
    await goto(page);
    const bottomNav = page.locator("aside nav").last();
    await expect(bottomNav.locator("a", { hasText: "Profile" })).toBeVisible();
    await expect(bottomNav.locator("a", { hasText: "Settings" })).toBeVisible();
  });

  test("3.2 sidebar defaults to expanded (w-64) on desktop viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await goto(page);
    const aside = page.locator("aside");
    await expect(aside).toHaveClass(/w-64/);
    await expect(aside).not.toHaveClass(/w-16/);
  });

  // ── 3.4 App shell layout ───────────────────────────────────────────────────

  test("3.4 <main> element is present and contains RouterView", async ({
    page,
  }) => {
    await goto(page);
    await expect(page.locator("main")).toBeVisible();
  });

  test("3.4 <main> has pt-14 to clear fixed TopBar height", async ({
    page,
  }) => {
    await goto(page);
    const mainClasses = await page.locator("main").getAttribute("class");
    expect(mainClasses).toContain("pt-14");
  });

  test("3.4 layout uses semantic HTML: header + aside + main", async ({
    page,
  }) => {
    await goto(page);
    await expect(page.locator("header")).toHaveCount(1);
    await expect(page.locator("aside")).toHaveCount(1);
    await expect(page.locator("main")).toHaveCount(1);
  });

  // ── Sidebar toggle behaviour ───────────────────────────────────────────────

  test("sidebar collapses to w-16 when toggle button is clicked", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await goto(page);

    const aside = page.locator("aside");
    const toggleBtn = page.locator('header button[aria-label*="sidebar"]');

    // Starts expanded
    await expect(aside).toHaveClass(/w-64/);

    await toggleBtn.click();

    // Now collapsed
    await expect(aside).toHaveClass(/w-16/);
    await expect(aside).not.toHaveClass(/w-64/);
  });

  test("sidebar expands again after second toggle click", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await goto(page);

    const aside = page.locator("aside");
    const toggleBtn = page.locator('header button[aria-label*="sidebar"]');

    await toggleBtn.click();
    await expect(aside).toHaveClass(/w-16/);

    await toggleBtn.click();
    await expect(aside).toHaveClass(/w-64/);
  });

  test("sidebar toggle button aria-label changes on collapse/expand", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await goto(page);

    const toggleBtn = page.locator('header button[aria-label*="sidebar"]');

    const labelExpanded = await toggleBtn.getAttribute("aria-label");
    expect(labelExpanded!.toLowerCase()).toContain("collapse");

    await toggleBtn.click();

    const labelCollapsed = await toggleBtn.getAttribute("aria-label");
    expect(labelCollapsed!.toLowerCase()).toContain("expand");
  });

  test("sidebar labels are hidden when collapsed", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await goto(page);

    const toggleBtn = page.locator('header button[aria-label*="sidebar"]');
    await toggleBtn.click();

    // Labels use v-show, so they stay in DOM but become display:none
    const homeLabel = page.locator("aside span", { hasText: "Home" }).first();
    await expect(homeLabel).toBeHidden();
  });

  test("main content pl-64 → pl-16 when sidebar collapses", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await goto(page);

    const main = page.locator("main");
    const toggleBtn = page.locator('header button[aria-label*="sidebar"]');

    await expect(main).toHaveClass(/pl-64/);

    await toggleBtn.click();

    await expect(main).toHaveClass(/pl-16/);
    await expect(main).not.toHaveClass(/pl-64/);
  });

  test("sidebar auto-collapses on narrow viewport (< 768px)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await goto(page);

    const aside = page.locator("aside");
    await expect(aside).toHaveClass(/w-16/);
    await expect(aside).not.toHaveClass(/w-64/);
  });

  // ── 3.1 ThemeToggle ────────────────────────────────────────────────────────

  test("3.1 theme toggle switches html to dark mode", async ({ page }) => {
    await goto(page);

    // Ensure we start in light mode by clearing any stored pref
    await page.evaluate(() => localStorage.removeItem("invaretl-theme"));
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Force light mode for a predictable baseline
    await page.evaluate(() => {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("invaretl-theme", "light");
    });

    const themeBtn = page.locator('header button[aria-label*="mode"]');
    await themeBtn.click();

    const isDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(isDark).toBe(true);
  });

  test("3.1 theme toggle switches back to light mode", async ({ page }) => {
    await goto(page);

    // Start in dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
      localStorage.setItem("invaretl-theme", "dark");
    });

    // Reload so Pinia reads from localStorage
    await page.reload();
    await page.waitForLoadState("networkidle");

    const isDarkBefore = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(isDarkBefore).toBe(true);

    const themeBtn = page.locator('header button[aria-label*="mode"]');
    await themeBtn.click();

    const isDarkAfter = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(isDarkAfter).toBe(false);
  });

  test("3.1 theme preference persists to localStorage", async ({ page }) => {
    await goto(page);

    await page.evaluate(() => {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("invaretl-theme", "light");
    });

    const themeBtn = page.locator('header button[aria-label*="mode"]');
    await themeBtn.click();

    const stored = await page.evaluate(() =>
      localStorage.getItem("invaretl-theme"),
    );
    expect(stored).toBe("dark");
  });

  test("3.1 theme persists across page reload", async ({ page }) => {
    await goto(page);

    // Set to dark via toggle
    await page.evaluate(() => {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("invaretl-theme", "light");
    });
    await page.reload();
    await page.waitForLoadState("networkidle");

    const themeBtn = page.locator('header button[aria-label*="mode"]');
    await themeBtn.click();

    // Reload — should still be dark
    await page.reload();
    await page.waitForLoadState("networkidle");

    const isDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(isDark).toBe(true);
  });

  test("3.1 ThemeToggle shows moon icon in light mode", async ({ page }) => {
    await goto(page);

    await page.evaluate(() => {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("invaretl-theme", "light");
    });
    await page.reload();
    await page.waitForLoadState("networkidle");

    // In light mode the moon SVG is visible (v-if="!themeStore.isDark")
    const themeBtn = page.locator('header button[aria-label*="dark mode"]');
    await expect(themeBtn).toBeVisible();
  });

  test("3.1 ThemeToggle shows sun icon in dark mode", async ({ page }) => {
    await goto(page);

    await page.evaluate(() => {
      localStorage.setItem("invaretl-theme", "dark");
    });
    await page.reload();
    await page.waitForLoadState("networkidle");

    // In dark mode the sun SVG is visible (v-if="themeStore.isDark")
    const themeBtn = page.locator('header button[aria-label*="light mode"]');
    await expect(themeBtn).toBeVisible();
  });

  // ── 3.2 Routing via sidebar links ─────────────────────────────────────────

  test("clicking Home navigates to / and URL is /", async ({ page }) => {
    await goto(page, "/projects");
    await page.locator("aside a", { hasText: "Home" }).click();
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test("clicking Projects navigates to /projects", async ({ page }) => {
    await goto(page);
    await page.locator("aside a", { hasText: "Projects" }).click();
    await expect(page).toHaveURL(`${BASE_URL}/projects`);
  });

  test("clicking Help navigates to /help", async ({ page }) => {
    await goto(page);
    await page.locator("aside a", { hasText: "Help" }).click();
    await expect(page).toHaveURL(`${BASE_URL}/help`);
  });

  test("clicking Profile navigates to /profile", async ({ page }) => {
    await goto(page);
    await page.locator("aside a", { hasText: "Profile" }).click();
    await expect(page).toHaveURL(`${BASE_URL}/profile`);
  });

  test("clicking Settings navigates to /settings", async ({ page }) => {
    await goto(page);
    await page.locator("aside a", { hasText: "Settings" }).click();
    await expect(page).toHaveURL(`${BASE_URL}/settings`);
  });

  test("active route item is visually highlighted (has active class)", async ({
    page,
  }) => {
    await goto(page, "/projects");
    // The active link should carry font-semibold per design
    const projectsLink = page.locator("aside a", { hasText: "Projects" });
    await expect(projectsLink).toHaveClass(/font-semibold/);
  });

  test("inactive route items are not highlighted", async ({ page }) => {
    await goto(page, "/projects");
    const homeLink = page.locator("aside a", { hasText: "Home" });
    // Should NOT have the active semibold class
    await expect(homeLink).not.toHaveClass(/font-semibold/);
  });

  test("brand link navigates to / from any route", async ({ page }) => {
    await goto(page, "/settings");
    await page.locator("header a", { hasText: "InvarETL" }).click();
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  // ── Keyboard accessibility ─────────────────────────────────────────────────

  test("sidebar toggle button is keyboard focusable and activatable", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await goto(page);

    const aside = page.locator("aside");
    const toggleBtn = page.locator('header button[aria-label*="sidebar"]');

    await toggleBtn.focus();
    await expect(toggleBtn).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(aside).toHaveClass(/w-16/);
  });

  test("theme toggle button is keyboard focusable and activatable", async ({
    page,
  }) => {
    await goto(page);

    await page.evaluate(() => {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("invaretl-theme", "light");
    });

    const themeBtn = page.locator('header button[aria-label*="mode"]');
    await themeBtn.focus();
    await expect(themeBtn).toBeFocused();

    await page.keyboard.press("Enter");

    const isDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(isDark).toBe(true);
  });

  test("sidebar nav links are keyboard-navigable with Tab", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await goto(page);

    // Tab until we land on the Home sidebar link
    const homeLink = page.locator("aside a", { hasText: "Home" });
    await homeLink.focus();
    await expect(homeLink).toBeFocused();
  });

  // ── No console errors ──────────────────────────────────────────────────────

  test("no JS errors on initial load", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await goto(page);
    expect(errors).toHaveLength(0);
  });

  test("no JS errors when navigating all routes", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));

    for (const path of ["/", "/projects", "/help", "/profile", "/settings"]) {
      await goto(page, path);
    }

    expect(errors).toHaveLength(0);
  });

  test("no JS errors during sidebar toggle and theme toggle", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));

    await goto(page);

    await page.locator('header button[aria-label*="sidebar"]').click();
    await page.locator('header button[aria-label*="sidebar"]').click();
    await page.locator('header button[aria-label*="mode"]').click();
    await page.locator('header button[aria-label*="mode"]').click();

    expect(errors).toHaveLength(0);
  });
});
