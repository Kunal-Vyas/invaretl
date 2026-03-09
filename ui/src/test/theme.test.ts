import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useThemeStore } from '@/stores/theme'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setStoredTheme(value: 'dark' | 'light' | null) {
  if (value === null) {
    localStorage.removeItem('invaretl-theme')
  } else {
    localStorage.setItem('invaretl-theme', value)
  }
}

function setSystemPreference(prefersDark: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)' ? prefersDark : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useThemeStore', () => {
  beforeEach(() => {
    // Fresh Pinia + clear side-effects before every test
    setActivePinia(createPinia())
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    setSystemPreference(false)
  })

  // ── Initial state ──────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('defaults to light mode when localStorage is empty and system prefers light', () => {
      setStoredTheme(null)
      setSystemPreference(false)

      const store = useThemeStore()

      expect(store.isDark).toBe(false)
    })

    it('defaults to dark mode when localStorage is empty and system prefers dark', () => {
      setStoredTheme(null)
      setSystemPreference(true)

      const store = useThemeStore()

      expect(store.isDark).toBe(true)
    })

    it('reads "dark" from localStorage regardless of system preference', () => {
      setStoredTheme('dark')
      setSystemPreference(false) // system says light — localStorage wins

      const store = useThemeStore()

      expect(store.isDark).toBe(true)
    })

    it('reads "light" from localStorage regardless of system preference', () => {
      setStoredTheme('light')
      setSystemPreference(true) // system says dark — localStorage wins

      const store = useThemeStore()

      expect(store.isDark).toBe(false)
    })
  })

  // ── DOM side-effect ────────────────────────────────────────────────────────

  describe('dark class on <html>', () => {
    it('adds the "dark" class immediately when isDark is true on mount', () => {
      setStoredTheme('dark')

      useThemeStore() // watcher runs with { immediate: true }

      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('does not add the "dark" class when isDark is false on mount', () => {
      setStoredTheme('light')

      useThemeStore()

      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('adds "dark" class to <html> after toggling to dark', () => {
      setStoredTheme('light')
      const store = useThemeStore()

      store.toggle()

      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('removes "dark" class from <html> after toggling back to light', () => {
      setStoredTheme('dark')
      const store = useThemeStore()

      store.toggle()

      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })

  // ── toggle() ──────────────────────────────────────────────────────────────

  describe('toggle()', () => {
    it('flips isDark from false to true', () => {
      setStoredTheme('light')
      const store = useThemeStore()

      expect(store.isDark).toBe(false)
      store.toggle()
      expect(store.isDark).toBe(true)
    })

    it('flips isDark from true to false', () => {
      setStoredTheme('dark')
      const store = useThemeStore()

      expect(store.isDark).toBe(true)
      store.toggle()
      expect(store.isDark).toBe(false)
    })

    it('alternates correctly across multiple toggles', () => {
      setStoredTheme('light')
      const store = useThemeStore()

      store.toggle() // → dark
      expect(store.isDark).toBe(true)

      store.toggle() // → light
      expect(store.isDark).toBe(false)

      store.toggle() // → dark
      expect(store.isDark).toBe(true)
    })
  })

  // ── localStorage persistence ───────────────────────────────────────────────

  describe('localStorage persistence', () => {
    it('persists "dark" to localStorage when toggled to dark', () => {
      setStoredTheme('light')
      const store = useThemeStore()

      store.toggle()

      expect(localStorage.getItem('invaretl-theme')).toBe('dark')
    })

    it('persists "light" to localStorage when toggled to light', () => {
      setStoredTheme('dark')
      const store = useThemeStore()

      store.toggle()

      expect(localStorage.getItem('invaretl-theme')).toBe('light')
    })

    it('writes the initial value to localStorage on store creation', () => {
      setStoredTheme(null)
      setSystemPreference(true) // will resolve to dark

      useThemeStore()

      // The immediate watcher should have written the resolved value
      expect(localStorage.getItem('invaretl-theme')).toBe('dark')
    })

    it('overwrites a stale localStorage value after toggle', () => {
      setStoredTheme('light')
      const store = useThemeStore()

      store.toggle()
      expect(localStorage.getItem('invaretl-theme')).toBe('dark')

      store.toggle()
      expect(localStorage.getItem('invaretl-theme')).toBe('light')
    })
  })
})
