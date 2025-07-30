// Optional: configure or set up a testing framework before each test
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
}))

// Mock environment variables
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-secret'

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: (() => {
    let store = {}
    return {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => {
        store[key] = value
      },
      removeItem: (key) => {
        delete store[key]
      },
      clear: () => {
        store = {}
      }
    }
  })(),
  writable: true
})

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: (() => {
    let store = {}
    return {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => {
        store[key] = value
      },
      removeItem: (key) => {
        delete store[key]
      },
      clear: () => {
        store = {}
      }
    }
  })(),
  writable: true
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Polyfill for Next.js Request/Response
global.Request = global.Request || class Request {
  constructor(url, init = {}) {
    this.url = url
    this.method = init.method || 'GET'
    this.headers = new Map()
    if (init.headers) {
      Object.entries(init.headers).forEach(([key, value]) => {
        this.headers.set(key.toLowerCase(), value)
      })
    }
    this.body = init.body
  }
}

global.Response = global.Response || class Response {
  constructor(body, init = {}) {
    this.body = body
    this.status = init.status || 200
    this.statusText = init.statusText || 'OK'
    this.headers = new Map()
    if (init.headers) {
      Object.entries(init.headers).forEach(([key, value]) => {
        this.headers.set(key.toLowerCase(), value)
      })
    }
  }
  
  async json() {
    return JSON.parse(this.body)
  }
}