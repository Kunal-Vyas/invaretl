import { vi } from 'vitest'

// Mock any global APIs needed for testing
global.fetch = vi.fn()

// Set up test environment
beforeEach(() => {
  vi.clearAllMocks()
})