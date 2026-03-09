import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { createRouter, createMemoryHistory } from "vue-router";
import App from "../App.vue";

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [{ path: "/", component: { template: "<div>Home</div>" } }],
  });
}

describe("App.vue", () => {
  it("renders the shell layout with header, aside, and main", async () => {
    const router = createTestRouter();
    const pinia = createPinia();

    const wrapper = mount(App, {
      global: {
        plugins: [pinia, router],
      },
    });

    await router.isReady();

    expect(wrapper.find("header").exists()).toBe(true);
    expect(wrapper.find("aside").exists()).toBe(true);
    expect(wrapper.find("main").exists()).toBe(true);
  });

  it("renders the brand name InvarETL", async () => {
    const router = createTestRouter();
    const pinia = createPinia();

    const wrapper = mount(App, {
      global: {
        plugins: [pinia, router],
      },
    });

    await router.isReady();

    expect(wrapper.text()).toContain("InvarETL");
  });

  it("sidebar is expanded by default on wide viewport", async () => {
    const router = createTestRouter();
    const pinia = createPinia();

    // jsdom defaults to innerWidth 1024, which is >= 768 so sidebar stays expanded
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const wrapper = mount(App, {
      global: {
        plugins: [pinia, router],
      },
    });

    await router.isReady();

    const aside = wrapper.find("aside");
    expect(aside.classes()).toContain("w-64");
    expect(aside.classes()).not.toContain("w-16");
  });

  it("sidebar collapses when toggle button is clicked", async () => {
    const router = createTestRouter();
    const pinia = createPinia();

    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const wrapper = mount(App, {
      global: {
        plugins: [pinia, router],
      },
    });

    await router.isReady();

    // Sidebar starts expanded
    expect(wrapper.find("aside").classes()).toContain("w-64");

    // Click the toggle button (second button in header — after brand link)
    const toggleButton = wrapper.find("header button");
    await toggleButton.trigger("click");

    expect(wrapper.find("aside").classes()).toContain("w-16");
    expect(wrapper.find("aside").classes()).not.toContain("w-64");
  });

  it("main content area adjusts padding when sidebar is collapsed", async () => {
    const router = createTestRouter();
    const pinia = createPinia();

    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const wrapper = mount(App, {
      global: {
        plugins: [pinia, router],
      },
    });

    await router.isReady();

    const main = wrapper.find("main");
    expect(main.classes()).toContain("pl-64");

    const toggleButton = wrapper.find("header button");
    await toggleButton.trigger("click");

    expect(main.classes()).toContain("pl-16");
    expect(main.classes()).not.toContain("pl-64");
  });
});
