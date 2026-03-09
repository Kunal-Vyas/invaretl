import { defineStore } from "pinia";
import { ref, watch } from "vue";

const STORAGE_KEY = "invaretl-theme";

function resolveInitialTheme(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "dark") return true;
  if (stored === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export const useThemeStore = defineStore("theme", () => {
  const isDark = ref(resolveInitialTheme());

  watch(
    isDark,
    (dark) => {
      document.documentElement.classList.toggle("dark", dark);
      localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");
    },
    { immediate: true, flush: "sync" },
  );

  function toggle() {
    isDark.value = !isDark.value;
  }

  return { isDark, toggle };
});
