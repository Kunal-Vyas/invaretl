import { describe, it, expect } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";
import { createPinia } from "pinia";
import appRouter from "@/router/index";

// ---------------------------------------------------------------------------
// Factory: creates a fresh isolated router for each test so route state never
// bleeds between tests.
// ---------------------------------------------------------------------------
function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: appRouter.options.routes,
  });
}

// Minimal shell that mounts <RouterView> so we can assert which component
// is rendered for a given path.
const Shell = {
  template: "<RouterView />",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Route → expected path assertions (structural, not visual)
// ---------------------------------------------------------------------------

describe("Vue Router", () => {
  // ── Route existence ────────────────────────────────────────────────────────

  describe("route table", () => {
    it("defines a route for /", () => {
      const router = createTestRouter();
      const match = router.resolve("/");
      expect(match.matched).toHaveLength(1);
      expect(match.name).toBe("home");
    });

    it("defines a route for /projects", () => {
      const router = createTestRouter();
      const match = router.resolve("/projects");
      expect(match.matched).toHaveLength(1);
      expect(match.name).toBe("projects");
    });

    it("defines a route for /help", () => {
      const router = createTestRouter();
      const match = router.resolve("/help");
      expect(match.matched).toHaveLength(1);
      expect(match.name).toBe("help");
    });

    it("defines a route for /profile", () => {
      const router = createTestRouter();
      const match = router.resolve("/profile");
      expect(match.matched).toHaveLength(1);
      expect(match.name).toBe("profile");
    });

    it("defines a route for /settings", () => {
      const router = createTestRouter();
      const match = router.resolve("/settings");
      expect(match.matched).toHaveLength(1);
      expect(match.name).toBe("settings");
    });

    it("defines a catch-all route for unknown paths", () => {
      const router = createTestRouter();
      const match = router.resolve("/this/does/not/exist");
      expect(match.matched).toHaveLength(1);
      expect(match.name).toBe("not-found");
    });
  });

  // ── Navigation ─────────────────────────────────────────────────────────────

  describe("navigation", () => {
    it("starts at / and resolves to the home route", async () => {
      const router = createTestRouter();
      await router.push("/");
      await router.isReady();
      expect(router.currentRoute.value.name).toBe("home");
    });

    it("navigates to /projects", async () => {
      const router = createTestRouter();
      await router.push("/projects");
      await router.isReady();
      expect(router.currentRoute.value.fullPath).toBe("/projects");
      expect(router.currentRoute.value.name).toBe("projects");
    });

    it("navigates to /help", async () => {
      const router = createTestRouter();
      await router.push("/help");
      await router.isReady();
      expect(router.currentRoute.value.fullPath).toBe("/help");
      expect(router.currentRoute.value.name).toBe("help");
    });

    it("navigates to /profile", async () => {
      const router = createTestRouter();
      await router.push("/profile");
      await router.isReady();
      expect(router.currentRoute.value.fullPath).toBe("/profile");
      expect(router.currentRoute.value.name).toBe("profile");
    });

    it("navigates to /settings", async () => {
      const router = createTestRouter();
      await router.push("/settings");
      await router.isReady();
      expect(router.currentRoute.value.fullPath).toBe("/settings");
      expect(router.currentRoute.value.name).toBe("settings");
    });

    it("routes unknown path to the not-found route", async () => {
      const router = createTestRouter();
      await router.push("/does-not-exist");
      await router.isReady();
      expect(router.currentRoute.value.name).toBe("not-found");
    });

    it("routes deeply unknown path to the not-found route", async () => {
      const router = createTestRouter();
      await router.push("/foo/bar/baz");
      await router.isReady();
      expect(router.currentRoute.value.name).toBe("not-found");
    });
  });

  // ── Sequential navigation ──────────────────────────────────────────────────

  describe("sequential navigation", () => {
    it("can navigate between multiple routes in sequence", async () => {
      const router = createTestRouter();

      await router.push("/");
      await router.isReady();
      expect(router.currentRoute.value.name).toBe("home");

      await router.push("/projects");
      await flushPromises();
      expect(router.currentRoute.value.name).toBe("projects");

      await router.push("/settings");
      await flushPromises();
      expect(router.currentRoute.value.name).toBe("settings");

      await router.push("/");
      await flushPromises();
      expect(router.currentRoute.value.name).toBe("home");
    });

    it("falls back to not-found after navigating from a valid route", async () => {
      const router = createTestRouter();

      await router.push("/help");
      await router.isReady();
      expect(router.currentRoute.value.name).toBe("help");

      await router.push("/unknown-page");
      await flushPromises();
      expect(router.currentRoute.value.name).toBe("not-found");
    });
  });

  // ── Lazy loading ───────────────────────────────────────────────────────────

  describe("lazy-loaded components", () => {
    it("each route component resolves without throwing", async () => {
      const router = createTestRouter();
      const pinia = createPinia();

      const paths = [
        "/",
        "/projects",
        "/help",
        "/profile",
        "/settings",
        "/unknown",
      ];

      for (const path of paths) {
        const wrapper = mount(Shell, {
          global: { plugins: [pinia, router] },
        });

        await router.push(path);
        await router.isReady();
        await flushPromises();

        // The RouterView rendered without throwing; component is present
        expect(wrapper.exists()).toBe(true);
        wrapper.unmount();
      }
    });
  });

  // ── Route meta / params ────────────────────────────────────────────────────

  describe("route params", () => {
    it("catch-all captures the full unmatched path as pathMatch param", async () => {
      const router = createTestRouter();
      await router.push("/some/nested/unknown/path");
      await router.isReady();

      expect(router.currentRoute.value.name).toBe("not-found");
      expect(router.currentRoute.value.params.pathMatch).toEqual([
        "some",
        "nested",
        "unknown",
        "path",
      ]);
    });
  });
});
