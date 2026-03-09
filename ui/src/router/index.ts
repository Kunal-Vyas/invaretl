import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: () => import("@/views/HomeView.vue"),
  },
  {
    path: "/projects",
    name: "projects",
    component: () => import("@/views/ProjectsView.vue"),
  },
  {
    path: "/help",
    name: "help",
    component: () => import("@/views/HelpView.vue"),
  },
  {
    path: "/profile",
    name: "profile",
    component: () => import("@/views/ProfileView.vue"),
  },
  {
    path: "/settings",
    name: "settings",
    component: () => import("@/views/SettingsView.vue"),
  },
  {
    // Catch-all 404 route — must be last.
    // Vue Router matches routes in order; this entry is only reached when no
    // other route matches, so it acts as the client-side "Not Found" handler.
    // The server-side SpaController forwards every unknown path to index.html,
    // so this component is what the user actually sees for bad deep-links.
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/views/NotFoundView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
