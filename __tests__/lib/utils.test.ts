// Utils Tests - Utility Functions Testing

import { cn } from '@/lib/utils'

describe('Utils', () => {
  describe('cn (className utility)', () => {
    it('should merge className strings', () => {
      const result = cn('text-red-500', 'bg-blue-500')
      expect(result).toContain('text-red-500')
      expect(result).toContain('bg-blue-500')
    })

    it('should handle conditional classes', () => {
      const result = cn('base-class', false && 'hidden-class', 'visible-class')
      expect(result).toContain('base-class')
      expect(result).toContain('visible-class')
      expect(result).not.toContain('hidden-class')
    })

    it('should handle object syntax', () => {
      const result = cn({
        'active': true,
        'disabled': false,
        'loading': true
      })
      expect(result).toContain('active')
      expect(result).toContain('loading')
      expect(result).not.toContain('disabled')
    })

    it('should merge conflicting Tailwind classes properly', () => {
      const result = cn('text-red-500', 'text-blue-500')
      // twMerge should resolve conflicts, keeping the last one
      expect(result).toBe('text-blue-500')
    })

    it('should handle array inputs', () => {
      const result = cn(['text-lg', 'font-bold'], 'text-center')
      expect(result).toContain('text-lg')
      expect(result).toContain('font-bold')
      expect(result).toContain('text-center')
    })

    it('should handle undefined and null values', () => {
      const result = cn('base', undefined, null, 'end')
      expect(result).toContain('base')
      expect(result).toContain('end')
    })

    it('should handle empty inputs', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('should handle nested arrays and objects', () => {
      const result = cn(
        'base',
        ['nested', { conditional: true }],
        { another: false, active: true }
      )
      expect(result).toContain('base')
      expect(result).toContain('nested')
      expect(result).toContain('conditional')
      expect(result).toContain('active')
      expect(result).not.toContain('another')
    })
  })
})