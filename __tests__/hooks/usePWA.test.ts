import { renderHook, act } from '@testing-library/react'
import { usePWA } from '@/hooks/usePWA'

// Mock navigator.serviceWorker
const mockServiceWorker = {
  register: jest.fn(() => Promise.resolve({
    installing: null,
    addEventListener: jest.fn(),
    update: jest.fn()
  })),
  addEventListener: jest.fn(),
  controller: null
}

// Mock window events
const mockWindowEventListeners: { [key: string]: any[] } = {}

beforeEach(() => {
  // Reset mocks
  jest.clearAllMocks()
  
  // Mock navigator.serviceWorker
  Object.defineProperty(navigator, 'serviceWorker', {
    value: mockServiceWorker,
    writable: true
  })
  
  // Mock navigator.onLine
  Object.defineProperty(navigator, 'onLine', {
    value: true,
    writable: true
  })
  
  // Mock window.addEventListener
  window.addEventListener = jest.fn((event, handler) => {
    if (!mockWindowEventListeners[event]) {
      mockWindowEventListeners[event] = []
    }
    mockWindowEventListeners[event].push(handler)
  })
  
  // Mock window.removeEventListener
  window.removeEventListener = jest.fn((event, handler) => {
    if (mockWindowEventListeners[event]) {
      const index = mockWindowEventListeners[event].indexOf(handler)
      if (index > -1) {
        mockWindowEventListeners[event].splice(index, 1)
      }
    }
  })
  
  // Mock window.matchMedia
  window.matchMedia = jest.fn((query) => ({
    matches: query.includes('standalone'),
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }))
  
  // Mock confirm
  window.confirm = jest.fn(() => true)
})

afterEach(() => {
  // Clear event listeners
  Object.keys(mockWindowEventListeners).forEach(key => {
    mockWindowEventListeners[key] = []
  })
})

describe('usePWA Hook', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => usePWA())
    
    expect(result.current.isInstallable).toBe(false)
    expect(result.current.isInstalled).toBe(false)
    expect(result.current.isOffline).toBe(false)
    expect(result.current.installPrompt).toBeInstanceOf(Function)
  })
  
  it('should register service worker on mount', () => {
    renderHook(() => usePWA())
    
    expect(mockServiceWorker.register).toHaveBeenCalledWith('/sw.js')
  })
  
  it('should handle service worker registration success', async () => {
    const mockRegistration = {
      installing: null,
      addEventListener: jest.fn(),
      update: jest.fn()
    }
    
    mockServiceWorker.register.mockResolvedValue(mockRegistration)
    
    const { result } = renderHook(() => usePWA())
    
    // Wait for useEffect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    
    expect(mockServiceWorker.register).toHaveBeenCalled()
  })
  
  it('should handle service worker registration failure', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
    mockServiceWorker.register.mockRejectedValue(new Error('Registration failed'))
    
    renderHook(() => usePWA())
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    
    expect(consoleSpy).toHaveBeenCalledWith('SW registration failed: ', expect.any(Error))
    consoleSpy.mockRestore()
  })
  
  it('should detect offline state', () => {
    // Mock offline state
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true
    })
    
    const { result } = renderHook(() => usePWA())
    
    expect(result.current.isOffline).toBe(true)
  })
  
  it('should handle beforeinstallprompt event', () => {
    const { result } = renderHook(() => usePWA())
    
    // Simulate beforeinstallprompt event
    const mockEvent = {
      preventDefault: jest.fn(),
      prompt: jest.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'accepted' })
    }
    
    act(() => {
      // Trigger event listener
      if (mockWindowEventListeners.beforeinstallprompt) {
        mockWindowEventListeners.beforeinstallprompt.forEach(handler => {
          handler(mockEvent)
        })
      }
    })
    
    expect(result.current.isInstallable).toBe(true)
    expect(mockEvent.preventDefault).toHaveBeenCalled()
  })
  
  it('should handle app installed event', () => {
    const { result } = renderHook(() => usePWA())
    
    // First make it installable
    const mockBeforeInstallEvent = {
      preventDefault: jest.fn()
    }
    
    act(() => {
      if (mockWindowEventListeners.beforeinstallprompt) {
        mockWindowEventListeners.beforeinstallprompt.forEach(handler => {
          handler(mockBeforeInstallEvent)
        })
      }
    })
    
    expect(result.current.isInstallable).toBe(true)
    
    // Then simulate app installed
    act(() => {
      if (mockWindowEventListeners.appinstalled) {
        mockWindowEventListeners.appinstalled.forEach(handler => {
          handler()
        })
      }
    })
    
    expect(result.current.isInstalled).toBe(true)
    expect(result.current.isInstallable).toBe(false)
  })
  
  it('should handle online/offline events', () => {
    const { result } = renderHook(() => usePWA())
    
    // Simulate going offline
    act(() => {
      if (mockWindowEventListeners.offline) {
        mockWindowEventListeners.offline.forEach(handler => {
          handler()
        })
      }
    })
    
    expect(result.current.isOffline).toBe(true)
    
    // Simulate going online
    act(() => {
      if (mockWindowEventListeners.online) {
        mockWindowEventListeners.online.forEach(handler => {
          handler()
        })
      }
    })
    
    expect(result.current.isOffline).toBe(false)
  })
  
  it('should detect standalone mode as installed', () => {
    // Mock standalone display mode
    window.matchMedia = jest.fn((query) => ({
      matches: query.includes('standalone') ? true : false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }))
    
    const { result } = renderHook(() => usePWA())
    
    expect(result.current.isInstalled).toBe(true)
  })
  
  it('should prompt for installation when installPrompt is called', async () => {
    const { result } = renderHook(() => usePWA())
    
    // Setup installable state
    const mockEvent = {
      preventDefault: jest.fn(),
      prompt: jest.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'accepted' })
    }
    
    act(() => {
      if (mockWindowEventListeners.beforeinstallprompt) {
        mockWindowEventListeners.beforeinstallprompt.forEach(handler => {
          handler(mockEvent)
        })
      }
    })
    
    expect(result.current.isInstallable).toBe(true)
    
    // Call install prompt
    await act(async () => {
      await result.current.installPrompt()
    })
    
    expect(mockEvent.prompt).toHaveBeenCalled()
  })
  
  it('should handle install prompt rejection', async () => {
    // Reset window.matchMedia to not be in standalone mode
    window.matchMedia = jest.fn((query) => ({
      matches: false, // Not in standalone mode
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }))
    
    const { result } = renderHook(() => usePWA())
    
    const mockEvent = {
      preventDefault: jest.fn(),
      prompt: jest.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'dismissed' })
    }
    
    act(() => {
      if (mockWindowEventListeners.beforeinstallprompt) {
        mockWindowEventListeners.beforeinstallprompt.forEach(handler => {
          handler(mockEvent)
        })
      }
    })
    
    await act(async () => {
      await result.current.installPrompt()
    })
    
    expect(result.current.isInstallable).toBe(false)
    expect(result.current.isInstalled).toBe(false)
  })
  
  it('should handle install prompt without available prompt', async () => {
    const { result } = renderHook(() => usePWA())
    
    // Don't set up beforeinstallprompt event
    await act(async () => {
      await result.current.installPrompt()
    })
    
    // Should not throw error
    expect(result.current.isInstallable).toBe(false)
  })
  
  it('should clean up event listeners on unmount', () => {
    const { unmount } = renderHook(() => usePWA())
    
    unmount()
    
    expect(window.removeEventListener).toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function))
    expect(window.removeEventListener).toHaveBeenCalledWith('appinstalled', expect.any(Function))
    expect(window.removeEventListener).toHaveBeenCalledWith('online', expect.any(Function))
    expect(window.removeEventListener).toHaveBeenCalledWith('offline', expect.any(Function))
  })
  
  it('should handle service worker update', async () => {
    const mockRegistration = {
      installing: {
        state: 'installing',
        addEventListener: jest.fn()
      },
      addEventListener: jest.fn(),
      update: jest.fn()
    }
    
    mockServiceWorker.register.mockResolvedValue(mockRegistration)
    mockServiceWorker.controller = {}
    
    renderHook(() => usePWA())
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    
    // Simulate updatefound event
    act(() => {
      if (mockRegistration.addEventListener.mock.calls.length > 0) {
        const updateFoundCall = mockRegistration.addEventListener.mock.calls
          .find(call => call[0] === 'updatefound')
        
        if (updateFoundCall) {
          updateFoundCall[1]() // Call the updatefound handler
        }
      }
    })
    
    expect(mockRegistration.addEventListener).toHaveBeenCalledWith('updatefound', expect.any(Function))
  })
})

// Mock environment for testing
declare global {
  interface Navigator {
    serviceWorker: typeof mockServiceWorker
  }
}