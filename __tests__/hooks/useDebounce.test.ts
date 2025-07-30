import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '@/hooks/useDebounce'

// Mock timers
jest.useFakeTimers()

describe('useDebounce', () => {
  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    jest.useFakeTimers()
  })

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))
    expect(result.current).toBe('initial')
  })

  it('should debounce value updates', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 }
      }
    )

    // Initial value
    expect(result.current).toBe('initial')

    // Update value
    rerender({ value: 'updated', delay: 500 })
    
    // Should still be initial value immediately after update
    expect(result.current).toBe('initial')

    // Advance timers
    act(() => {
      jest.advanceTimersByTime(500)
    })

    // Now should be updated
    expect(result.current).toBe('updated')
  })

  it('should cancel previous timeout on rapid updates', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 }
      }
    )

    // Update value multiple times rapidly
    rerender({ value: 'update1', delay: 500 })
    
    act(() => {
      jest.advanceTimersByTime(300)
    })

    rerender({ value: 'update2', delay: 500 })
    
    act(() => {
      jest.advanceTimersByTime(300)
    })

    rerender({ value: 'update3', delay: 500 })

    // Still initial value
    expect(result.current).toBe('initial')

    // Advance to complete the last timeout
    act(() => {
      jest.advanceTimersByTime(500)
    })

    // Should be the last value only
    expect(result.current).toBe('update3')
  })

  it('should handle different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 1000 }
      }
    )

    rerender({ value: 'updated', delay: 1000 })

    // Advance less than delay
    act(() => {
      jest.advanceTimersByTime(999)
    })
    expect(result.current).toBe('initial')

    // Advance to exactly delay
    act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(result.current).toBe('updated')
  })

  it('should update immediately when delay is 0', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 0 }
      }
    )

    rerender({ value: 'updated', delay: 0 })

    act(() => {
      jest.advanceTimersByTime(0)
    })

    expect(result.current).toBe('updated')
  })

  it('should handle different value types', () => {
    // Number
    const { result: numberResult, rerender: numberRerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 123, delay: 500 }
      }
    )

    numberRerender({ value: 456, delay: 500 })
    act(() => {
      jest.advanceTimersByTime(500)
    })
    expect(numberResult.current).toBe(456)

    // Object
    const { result: objectResult, rerender: objectRerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: { name: 'initial' }, delay: 500 }
      }
    )

    const newObject = { name: 'updated' }
    objectRerender({ value: newObject, delay: 500 })
    act(() => {
      jest.advanceTimersByTime(500)
    })
    expect(objectResult.current).toEqual(newObject)
  })

  it('should cleanup timeout on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')
    
    const { unmount, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 }
      }
    )

    rerender({ value: 'updated', delay: 500 })
    
    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()
    clearTimeoutSpy.mockRestore()
  })
})