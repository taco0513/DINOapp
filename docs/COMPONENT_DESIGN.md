# DINO Component Design Specifications

## 🎨 Component Design System

### Design Principles
1. **Atomic Design**: Build from atoms to organisms
2. **Composition over Inheritance**: Use compound components
3. **Accessibility First**: WCAG 2.1 AA compliance
4. **Performance Optimized**: Lazy loading and code splitting
5. **Type Safety**: Full TypeScript coverage

## 🧩 Component Hierarchy

### Level 1: Atomic Components (UI Primitives)
```
ui/
├── button.tsx          # Base button with variants
├── input.tsx           # Form input with validation
├── card.tsx            # Container component
├── badge.tsx           # Status indicators
├── alert.tsx           # Notification messages
├── progress.tsx        # Progress indicators
├── tabs.tsx            # Tab navigation
└── checkbox.tsx        # Form checkbox
```

### Level 2: Molecular Components
```
components/
├── forms/
│   ├── TripDatePicker.tsx    # Date range selector
│   ├── CountrySelector.tsx    # Searchable country dropdown
│   ├── VisaTypeSelector.tsx   # Visa type selection
│   └── FormField.tsx          # Field wrapper with label/error
├── display/
│   ├── StatCard.tsx           # Statistics display
│   ├── TripTimeline.tsx       # Visual timeline
│   ├── CountryFlag.tsx        # Flag display component
│   └── DaysCounter.tsx        # Days calculation display
└── feedback/
    ├── LoadingState.tsx       # Loading indicators
    ├── ErrorMessage.tsx       # Error display
    ├── EmptyState.tsx         # Empty data states
    └── SuccessToast.tsx       # Success notifications
```

### Level 3: Organism Components
```
features/
├── trips/
│   ├── TripCard.tsx           # Complete trip display
│   ├── TripForm.tsx           # Trip creation/edit form
│   ├── TripList.tsx           # List of trips
│   └── TripFilters.tsx        # Filtering controls
├── schengen/
│   ├── SchengenCalculator.tsx # Main calculator
│   ├── DaysRemaining.tsx      # Days left display
│   ├── WarningBanner.tsx      # Warning messages
│   └── HistoryChart.tsx       # Visual history
└── dashboard/
    ├── QuickStats.tsx         # Dashboard statistics
    ├── RecentActivity.tsx     # Recent trips
    ├── UpcomingAlerts.tsx     # Alert preview
    └── QuickActions.tsx       # Action buttons
```

## 📐 Component Specifications

### Base Component Template
```typescript
// Component: Button
// Location: /components/ui/button.tsx
// Purpose: Reusable button component with multiple variants

import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
```

### Complex Component Example: TripCard
```typescript
// Component: TripCard
// Location: /components/features/trips/TripCard.tsx
// Purpose: Display individual trip information with actions

interface TripCardProps {
  trip: Trip
  onEdit?: (trip: Trip) => void
  onDelete?: (trip: Trip) => void
  showActions?: boolean
  variant?: 'default' | 'compact'
}

export const TripCard = ({ 
  trip, 
  onEdit, 
  onDelete, 
  showActions = true,
  variant = 'default' 
}: TripCardProps) => {
  const schengenStatus = useSchengenStatus(trip)
  
  return (
    <Card className={cn(
      'transition-all hover:shadow-md',
      variant === 'compact' && 'p-3'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CountryFlag country={trip.country} />
            <CardTitle className="text-lg">{trip.country}</CardTitle>
          </div>
          {showActions && (
            <TripActions 
              trip={trip}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          <TripDates 
            entry={trip.entryDate} 
            exit={trip.exitDate}
            variant={variant}
          />
          
          <div className="flex items-center space-x-4">
            <Badge variant={getVisaVariant(trip.visaType)}>
              {trip.visaType}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Max {trip.maxDays} days
            </span>
          </div>
          
          {schengenStatus && (
            <SchengenIndicator status={schengenStatus} />
          )}
          
          {trip.notes && variant === 'default' && (
            <p className="text-sm text-muted-foreground mt-2">
              {trip.notes}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Sub-components
const TripActions = ({ trip, onEdit, onDelete }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={() => onEdit?.(trip)}>
        <Edit className="mr-2 h-4 w-4" />
        Edit
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem 
        onClick={() => onDelete?.(trip)}
        className="text-destructive"
      >
        <Trash className="mr-2 h-4 w-4" />
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)

const TripDates = ({ entry, exit, variant }) => (
  <div className={cn(
    'flex items-center',
    variant === 'compact' ? 'space-x-2' : 'space-x-4'
  )}>
    <div className="flex items-center text-sm">
      <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
      <span>{formatDate(entry)}</span>
    </div>
    {exit && (
      <>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">{formatDate(exit)}</span>
      </>
    )}
  </div>
)
```

## 🎯 Component Patterns

### 1. Compound Components Pattern
```typescript
// Usage example
<TripForm>
  <TripForm.Country />
  <TripForm.DateRange />
  <TripForm.VisaType />
  <TripForm.Notes />
  <TripForm.Actions />
</TripForm>
```

### 2. Render Props Pattern
```typescript
<DataProvider
  render={({ data, loading, error }) => (
    loading ? <Spinner /> :
    error ? <ErrorMessage error={error} /> :
    <TripList trips={data} />
  )}
/>
```

### 3. Custom Hooks Pattern
```typescript
// useTripFilters.ts
export const useTripFilters = () => {
  const [filters, setFilters] = useState<TripFilters>({
    country: null,
    dateRange: null,
    visaType: null,
  })
  
  const filteredTrips = useMemo(() => {
    return trips.filter(trip => {
      // Apply filters
    })
  }, [trips, filters])
  
  return {
    filters,
    setFilters,
    filteredTrips,
    resetFilters: () => setFilters({}),
  }
}
```

## 🌈 Styling System

### Design Tokens
```css
/* CSS Variables */
:root {
  /* Colors */
  --primary: 220 80% 50%;
  --secondary: 200 20% 95%;
  --destructive: 0 84% 60%;
  --muted: 210 40% 96%;
  
  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  
  /* Typography */
  --font-sans: 'Inter', sans-serif;
  --font-mono: 'Fira Code', monospace;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  
  /* Animations */
  --animation-fast: 150ms;
  --animation-base: 300ms;
  --animation-slow: 500ms;
}
```

### Responsive Design
```typescript
// Breakpoint utilities
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

// Responsive component example
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {trips.map(trip => (
    <TripCard key={trip.id} trip={trip} />
  ))}
</div>
```

## ♿ Accessibility Guidelines

### Required Attributes
- All interactive elements must have accessible labels
- Form inputs must have associated labels
- Images must have alt text
- Color contrast must meet WCAG AA standards

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Focus indicators must be visible
- Tab order must be logical
- Skip links for main content

### ARIA Implementation
```typescript
<Button
  aria-label="Delete trip"
  aria-describedby="delete-trip-description"
  onClick={handleDelete}
>
  <Trash className="h-4 w-4" />
</Button>
<span id="delete-trip-description" className="sr-only">
  This will permanently delete your trip to {trip.country}
</span>
```

## 🧪 Component Testing

### Unit Testing Template
```typescript
// TripCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { TripCard } from './TripCard'

describe('TripCard', () => {
  const mockTrip = {
    id: '1',
    country: 'France',
    entryDate: new Date('2024-01-01'),
    exitDate: new Date('2024-01-10'),
    visaType: 'Tourist',
    maxDays: 90,
  }
  
  it('renders trip information correctly', () => {
    render(<TripCard trip={mockTrip} />)
    
    expect(screen.getByText('France')).toBeInTheDocument()
    expect(screen.getByText('Tourist')).toBeInTheDocument()
    expect(screen.getByText('Max 90 days')).toBeInTheDocument()
  })
  
  it('calls onEdit when edit button is clicked', () => {
    const handleEdit = jest.fn()
    render(<TripCard trip={mockTrip} onEdit={handleEdit} />)
    
    fireEvent.click(screen.getByLabelText('Edit trip'))
    expect(handleEdit).toHaveBeenCalledWith(mockTrip)
  })
})
```

## 📦 Component Documentation

### Storybook Integration
```typescript
// TripCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { TripCard } from './TripCard'

const meta: Meta<typeof TripCard> = {
  title: 'Features/Trips/TripCard',
  component: TripCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    trip: {
      id: '1',
      country: 'France',
      entryDate: new Date('2024-01-01'),
      exitDate: new Date('2024-01-10'),
      visaType: 'Tourist',
      maxDays: 90,
    },
  },
}

export const Compact: Story = {
  args: {
    ...Default.args,
    variant: 'compact',
  },
}

export const WithoutActions: Story = {
  args: {
    ...Default.args,
    showActions: false,
  },
}
```

## 🚀 Performance Optimization

### Code Splitting
```typescript
// Lazy load heavy components
const SchengenCalculator = lazy(() => 
  import('@/components/features/schengen/SchengenCalculator')
)

// Usage with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <SchengenCalculator />
</Suspense>
```

### Memoization
```typescript
// Memoize expensive computations
const SchengenStatus = memo(({ trips }: { trips: Trip[] }) => {
  const status = useMemo(() => 
    calculateSchengenStatus(trips), [trips]
  )
  
  return <StatusDisplay status={status} />
})
```

### Virtual Scrolling
```typescript
// For large lists
import { FixedSizeList } from 'react-window'

const TripListVirtualized = ({ trips }: { trips: Trip[] }) => (
  <FixedSizeList
    height={600}
    itemCount={trips.length}
    itemSize={120}
    width="100%"
  >
    {({ index, style }) => (
      <div style={style}>
        <TripCard trip={trips[index]} variant="compact" />
      </div>
    )}
  </FixedSizeList>
)
```

---

This component design system ensures consistency, reusability, and maintainability across the DINO application while providing excellent developer experience and user interface quality.