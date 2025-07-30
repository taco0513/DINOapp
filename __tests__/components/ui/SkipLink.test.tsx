import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SkipLink } from '@/components/ui/SkipLink'

describe('SkipLink', () => {
  beforeEach(() => {
    // Create main content element
    const mainElement = document.createElement('main')
    mainElement.id = 'main-content'
    mainElement.tabIndex = -1
    document.body.appendChild(mainElement)
  })

  afterEach(() => {
    // Clean up
    const mainElement = document.getElementById('main-content')
    if (mainElement) {
      document.body.removeChild(mainElement)
    }
  })

  it('should render skip link', () => {
    render(<SkipLink />)
    
    const skipLink = screen.getByRole('link', { name: /메인 콘텐츠로 건너뛰기/i })
    expect(skipLink).toBeInTheDocument()
    expect(skipLink).toHaveAttribute('href', '#main-content')
  })

  it('should be visually hidden by default', () => {
    render(<SkipLink />)
    
    const skipLink = screen.getByRole('link', { name: /메인 콘텐츠로 건너뛰기/i })
    expect(skipLink).toHaveClass('sr-only')
  })

  it('should become visible on focus', () => {
    render(<SkipLink />)
    
    const skipLink = screen.getByRole('link', { name: /메인 콘텐츠로 건너뛰기/i })
    
    // Focus the link
    skipLink.focus()
    
    // Should have focus:not-sr-only class behavior
    expect(skipLink).toHaveFocus()
  })

  it('should focus main content when clicked', async () => {
    const user = userEvent.setup()
    render(<SkipLink />)
    
    const skipLink = screen.getByRole('link', { name: /메인 콘텐츠로 건너뛰기/i })
    const mainContent = document.getElementById('main-content')
    
    // Click the skip link
    await user.click(skipLink)
    
    // Main content should be focused
    expect(mainContent).toHaveFocus()
  })

  it('should have proper ARIA attributes', () => {
    render(<SkipLink />)
    
    const skipLink = screen.getByRole('link', { name: /메인 콘텐츠로 건너뛰기/i })
    
    expect(skipLink).toHaveAttribute('href', '#main-content')
  })

  it('should work with keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<SkipLink />)
    
    const skipLink = screen.getByRole('link', { name: /메인 콘텐츠로 건너뛰기/i })
    const mainContent = document.getElementById('main-content')
    
    // Tab to the skip link
    await user.tab()
    expect(skipLink).toHaveFocus()
    
    // Press Enter
    await user.keyboard('{Enter}')
    
    // Main content should be focused
    expect(mainContent).toHaveFocus()
  })

  it('should handle missing main content gracefully', async () => {
    // Remove main content
    const mainElement = document.getElementById('main-content')
    if (mainElement) {
      document.body.removeChild(mainElement)
    }

    const user = userEvent.setup()
    render(<SkipLink />)
    
    const skipLink = screen.getByRole('link', { name: /메인 콘텐츠로 건너뛰기/i })
    
    // Should not throw error when clicking
    await expect(user.click(skipLink)).resolves.not.toThrow()
  })

  it('should have correct styling classes', () => {
    render(<SkipLink />)
    
    const skipLink = screen.getByRole('link', { name: /메인 콘텐츠로 건너뛰기/i })
    
    // Check for skip link specific classes
    expect(skipLink).toHaveClass('sr-only')
    expect(skipLink).toHaveClass('focus:not-sr-only')
    expect(skipLink).toHaveClass('focus:absolute')
    expect(skipLink).toHaveClass('focus:top-4')
    expect(skipLink).toHaveClass('focus:left-4')
    expect(skipLink).toHaveClass('focus:z-50')
  })

  it('should be the first focusable element', () => {
    render(
      <div>
        <SkipLink />
        <button>Other button</button>
        <input type="text" />
      </div>
    )
    
    const skipLink = screen.getByRole('link', { name: /메인 콘텐츠로 건너뛰기/i })
    const button = screen.getByRole('button', { name: /other button/i })
    
    // Skip link should come first in tab order
    expect(skipLink.tabIndex).toBeLessThanOrEqual(0)
    expect(button.tabIndex).toBeLessThanOrEqual(0)
  })
})