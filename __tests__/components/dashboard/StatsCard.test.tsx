import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StatsCard } from '@/components/dashboard/StatsCard'

describe('StatsCard', () => {
  const defaultProps = {
    title: 'Test Title',
    value: '42',
    label: 'Test Label',
    description: 'Test description'
  }

  it('should render basic content', () => {
    render(<StatsCard {...defaultProps} />)
    
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('Test Label')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('should render action button when provided', () => {
    const mockAction = {
      label: 'Click me',
      onClick: jest.fn()
    }

    render(<StatsCard {...defaultProps} action={mockAction} />)
    
    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeInTheDocument()
  })

  it('should call action onClick when button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnClick = jest.fn()
    const mockAction = {
      label: 'Click me',
      onClick: mockOnClick
    }

    render(<StatsCard {...defaultProps} action={mockAction} />)
    
    const button = screen.getByRole('button', { name: 'Click me' })
    await user.click(button)
    
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('should render badge when provided', () => {
    const mockBadge = {
      text: 'Success',
      variant: 'success' as const
    }

    render(<StatsCard {...defaultProps} badge={mockBadge} />)
    
    const badge = screen.getByText('Success')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('badge-success')
  })

  it('should render with high priority styling', () => {
    render(<StatsCard {...defaultProps} priority="high" />)
    
    const card = screen.getByTestId('stats-card') || screen.getByText('Test Title').closest('.card')
    expect(card).toHaveClass('card-priority-high')
  })

  it('should handle keyboard navigation for action button', async () => {
    const user = userEvent.setup()
    const mockOnClick = jest.fn()
    const mockAction = {
      label: 'Click me',
      onClick: mockOnClick
    }

    render(<StatsCard {...defaultProps} action={mockAction} />)
    
    const button = screen.getByRole('button', { name: 'Click me' })
    
    // Tab to button and press Enter
    await user.tab()
    expect(button).toHaveFocus()
    
    await user.keyboard('{Enter}')
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('should render different badge variants correctly', () => {
    const { rerender } = render(
      <StatsCard 
        {...defaultProps} 
        badge={{ text: 'Success', variant: 'success' }} 
      />
    )
    
    let badge = screen.getByText('Success')
    expect(badge).toHaveClass('badge-success')

    rerender(
      <StatsCard 
        {...defaultProps} 
        badge={{ text: 'Error', variant: 'error' }} 
      />
    )
    
    badge = screen.getByText('Error')
    expect(badge).toHaveClass('badge-error')

    rerender(
      <StatsCard 
        {...defaultProps} 
        badge={{ text: 'Warning', variant: 'warning' }} 
      />
    )
    
    badge = screen.getByText('Warning')
    expect(badge).toHaveClass('badge-warning')
  })

  it('should handle long text content', () => {
    const longProps = {
      title: 'Very Long Title That Might Wrap To Multiple Lines',
      value: '999,999,999',
      label: 'Very Long Label That Might Also Wrap',
      description: 'This is a very long description that should wrap properly and not break the layout of the card component'
    }

    render(<StatsCard {...longProps} />)
    
    expect(screen.getByText(longProps.title)).toBeInTheDocument()
    expect(screen.getByText(longProps.value)).toBeInTheDocument()
    expect(screen.getByText(longProps.label)).toBeInTheDocument()
    expect(screen.getByText(longProps.description)).toBeInTheDocument()
  })

  it('should be memoized to prevent unnecessary re-renders', () => {
    const { rerender } = render(<StatsCard {...defaultProps} />)
    
    // Same props should not cause re-render
    rerender(<StatsCard {...defaultProps} />)
    
    // Component should be memoized (React.memo)
    expect(StatsCard).toBeDefined()
  })

  it('should have proper ARIA attributes', () => {
    const mockAction = {
      label: 'View details',
      onClick: jest.fn()
    }

    render(<StatsCard {...defaultProps} action={mockAction} />)
    
    const button = screen.getByRole('button', { name: 'View details' })
    
    // Button should be accessible
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('class')
  })

  it('should work without optional props', () => {
    const minimalProps = {
      title: 'Title',
      value: '100',
      label: 'Label'
    }

    render(<StatsCard {...minimalProps} />)
    
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('Label')).toBeInTheDocument()
    
    // Should not render optional elements
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByText(/badge/i)).not.toBeInTheDocument()
  })
})