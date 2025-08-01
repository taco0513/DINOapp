import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from '@/hooks/useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    // Clear any localStorage-related console errors
    jest.clearAllMocks()
  })

  it('should return initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    expect(result.current[0]).toBe('initial')
  })

  it('should return stored value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('stored value'))
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    expect(result.current[0]).toBe('stored value')
  })

  it('should update localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    
    act(() => {
      result.current[1]('new value')
    })

    expect(result.current[0]).toBe('new value')
    expect(JSON.parse(localStorage.getItem('test-key') || '')).toBe('new value')
  })

  it('should handle objects and arrays', () => {
    const initialObject = { name: 'test', count: 0 }
    const { result } = renderHook(() => useLocalStorage('test-obj', initialObject))
    
    expect(result.current[0]).toEqual(initialObject)

    const newObject = { name: 'updated', count: 1 }
    act(() => {
      result.current[1](newObject)
    })

    expect(result.current[0]).toEqual(newObject)
    expect(JSON.parse(localStorage.getItem('test-obj') || '')).toEqual(newObject)
  })

  it('should handle invalid JSON in localStorage', () => {
    localStorage.setItem('test-key', 'invalid json')
    const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'))
    expect(result.current[0]).toBe('fallback')
  })

  it('should sync across tabs (storage event)', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    
    // Simulate storage event from another tab
    const storageEvent = new Event('storage') as StorageEvent
    Object.defineProperty(storageEvent, 'key', { value: 'test-key' })
    Object.defineProperty(storageEvent, 'newValue', { value: JSON.stringify('value from another tab') })
    Object.defineProperty(storageEvent, 'storageArea', { value: localStorage })

    act(() => {
      window.dispatchEvent(storageEvent)
    })

    expect(result.current[0]).toBe('value from another tab')
  })

  it('should handle null value in storage event', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    
    act(() => {
      result.current[1]('some value')
    })

    // Simulate deletion from another tab
    const storageEvent = new Event('storage') as StorageEvent
    Object.defineProperty(storageEvent, 'key', { value: 'test-key' })
    Object.defineProperty(storageEvent, 'newValue', { value: null })
    Object.defineProperty(storageEvent, 'storageArea', { value: localStorage })

    act(() => {
      window.dispatchEvent(storageEvent)
    })

    expect(result.current[0]).toBe('initial')
  })

  it('should ignore storage events for different keys', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    
    const storageEvent = new Event('storage') as StorageEvent
    Object.defineProperty(storageEvent, 'key', { value: 'different-key' })
    Object.defineProperty(storageEvent, 'newValue', { value: JSON.stringify('some value') })
    Object.defineProperty(storageEvent, 'storageArea', { value: localStorage })

    act(() => {
      window.dispatchEvent(storageEvent)
    })

    expect(result.current[0]).toBe('initial')
  })
})