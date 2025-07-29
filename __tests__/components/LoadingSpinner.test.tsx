/**
 * LoadingSpinner Component Tests
 * 로딩 스피너 컴포넌트 테스트 스위트
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

describe('LoadingSpinner Component', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(<LoadingSpinner />)
      
      const spinner = container.firstChild
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('animate-spin', 'rounded-full', 'h-8', 'w-8')
    })

    it('should apply default medium size', () => {
      const { container } = render(<LoadingSpinner />)
      
      const spinner = container.firstChild
      expect(spinner).toHaveClass('h-8', 'w-8')
    })

    it('should have correct styling', () => {
      const { container } = render(<LoadingSpinner />)
      
      const spinner = container.firstChild
      expect(spinner).toHaveStyle({
        border: '2px solid var(--color-border)',
        borderTopColor: 'var(--color-primary)'
      })
    })
  })

  describe('Size Variants', () => {
    it('should apply small size correctly', () => {
      const { container } = render(<LoadingSpinner size="sm" />)
      
      const spinner = container.firstChild
      expect(spinner).toHaveClass('h-4', 'w-4')
      expect(spinner).not.toHaveClass('h-8', 'w-8', 'h-12', 'w-12')
    })

    it('should apply medium size correctly', () => {
      const { container } = render(<LoadingSpinner size="md" />)
      
      const spinner = container.firstChild
      expect(spinner).toHaveClass('h-8', 'w-8')
      expect(spinner).not.toHaveClass('h-4', 'w-4', 'h-12', 'w-12')
    })

    it('should apply large size correctly', () => {
      const { container } = render(<LoadingSpinner size="lg" />)
      
      const spinner = container.firstChild
      expect(spinner).toHaveClass('h-12', 'w-12')
      expect(spinner).not.toHaveClass('h-4', 'w-4', 'h-8', 'w-8')
    })
  })

  describe('Custom className', () => {
    it('should apply custom className', () => {
      const { container } = render(<LoadingSpinner className="custom-class" />)
      
      const spinner = container.firstChild
      expect(spinner).toHaveClass('custom-class')
    })

    it('should combine custom className with default classes', () => {
      const { container } = render(<LoadingSpinner className="custom-class" />)
      
      const spinner = container.firstChild
      expect(spinner).toHaveClass(
        'animate-spin',
        'rounded-full',
        'h-8',
        'w-8',
        'custom-class'
      )
    })

    it('should handle multiple custom classes', () => {
      const { container } = render(<LoadingSpinner className="class1 class2 class3" />)
      
      const spinner = container.firstChild
      expect(spinner).toHaveClass('class1', 'class2', 'class3')
    })

    it('should handle empty className gracefully', () => {
      const { container } = render(<LoadingSpinner className="" />)
      
      const spinner = container.firstChild
      expect(spinner).toHaveClass('animate-spin', 'rounded-full', 'h-8', 'w-8')
    })
  })

  describe('Prop Combinations', () => {
    it('should handle size and className together', () => {
      const { container } = render(<LoadingSpinner size="lg" className="text-blue-500" />)
      
      const spinner = container.firstChild
      expect(spinner).toHaveClass(
        'animate-spin',
        'rounded-full',
        'h-12',
        'w-12',
        'text-blue-500'
      )
    })

    it('should prioritize specified size over default', () => {
      const { container } = render(<LoadingSpinner size="sm" />)
      
      const spinner = container.firstChild
      expect(spinner).toHaveClass('h-4', 'w-4')
      expect(spinner).not.toHaveClass('h-8', 'w-8')
    })
  })

  describe('Accessibility', () => {
    it('should be identifiable as a loading indicator', () => {
      const { container } = render(<LoadingSpinner />)
      
      const spinner = container.firstChild
      expect(spinner).toBeInTheDocument()
    })

    it('should have animation class for screen readers', () => {
      const { container } = render(<LoadingSpinner />)
      
      const spinner = container.firstChild
      expect(spinner).toHaveClass('animate-spin')
    })
  })

  describe('CSS Custom Properties', () => {
    it('should use CSS custom properties for colors', () => {
      const { container } = render(<LoadingSpinner />)
      
      const spinner = container.firstChild
      expect(spinner).toHaveStyle({
        border: '2px solid var(--color-border)',
        borderTopColor: 'var(--color-primary)'
      })
    })
  })

  describe('Type Safety', () => {
    it('should accept valid size values', () => {
      // These should not cause TypeScript errors
      expect(() => render(<LoadingSpinner size="sm" />)).not.toThrow()
      expect(() => render(<LoadingSpinner size="md" />)).not.toThrow()
      expect(() => render(<LoadingSpinner size="lg" />)).not.toThrow()
    })

    it('should accept className as string', () => {
      expect(() => render(<LoadingSpinner className="test" />)).not.toThrow()
    })

    it('should accept undefined props', () => {
      expect(() => render(<LoadingSpinner size={undefined} className={undefined} />)).not.toThrow()
    })
  })
})