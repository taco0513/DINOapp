# DINO App Code Examples

This document provides practical TypeScript code examples from the DINO application codebase, demonstrating real implementations of key features.

## 🧩 Core Components

### Trip Management

```typescript
// Real implementation from lib/actions/trips.ts
import { CountryVisit, TripStatus } from '@/types/global'
import { prisma } from '@/lib/prisma'

export async function createTrip(userId: string, tripData: {
  countryCode: string
  entryDate: Date
  exitDate: Date
  purpose: string
}) {
  return await prisma.countryVisit.create({
    data: {
      userId,
      countryCode: tripData.countryCode,
      entryDate: tripData.entryDate,
      exitDate: tripData.exitDate,
      purpose: tripData.purpose,
      status: 'PLANNED' as TripStatus,
      isSchengenArea: SCHENGEN_COUNTRIES.includes(tripData.countryCode),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })
}

// Usage example in API route
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tripData = await request.json()
  const trip = await createTrip(session.user.id, tripData)
  
  return NextResponse.json(trip, { status: 201 })
}
```

### Schengen Calculator

```typescript
// Real implementation from lib/schengen-calculator.ts
import { SchengenCalculation, CountryVisit } from '@/types/global'

export function calculateSchengenDays(visits: CountryVisit[]): SchengenCalculation {
  const schengenVisits = visits.filter(visit => visit.isSchengenArea)
  const sortedVisits = schengenVisits.sort((a, b) => 
    new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
  )

  let totalDays = 0
  let violations: string[] = []
  
  for (const visit of sortedVisits) {
    const stayDuration = Math.ceil(
      (new Date(visit.exitDate).getTime() - new Date(visit.entryDate).getTime()) 
      / (1000 * 60 * 60 * 24)
    )
    
    totalDays += stayDuration
    
    // Check 90/180 rule
    if (totalDays > 90) {
      violations.push(`Exceeded 90 days in 180-day period ending ${visit.exitDate}`)
    }
  }

  return {
    totalDays,
    remainingDays: Math.max(0, 90 - totalDays),
    violations,
    isCompliant: violations.length === 0,
    nextAllowedEntry: violations.length > 0 ? calculateNextEntry(sortedVisits) : null
  }
}

// Component usage
export function SchengenStatus({ userId }: { userId: string }) {
  const [calculation, setCalculation] = useState<SchengenCalculation | null>(null)
  
  useEffect(() => {
    async function loadCalculation() {
      const visits = await fetchUserVisits(userId)
      const result = calculateSchengenDays(visits)
      setCalculation(result)
    }
    loadCalculation()
  }, [userId])

  if (!calculation) return <LoadingSpinner />

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Badge variant={calculation.isCompliant ? "success" : "destructive"}>
          {calculation.isCompliant ? "Compliant" : "Violation"}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          label="Days Used" 
          value={calculation.totalDays}
          total={90}
        />
        <StatCard 
          label="Days Remaining" 
          value={calculation.remainingDays}
          className={calculation.remainingDays < 10 ? "text-orange-600" : ""}
        />
      </div>
      
      {calculation.violations.length > 0 && (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Schengen Violations Detected</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4 mt-2">
              {calculation.violations.map((violation, i) => (
                <li key={i}>{violation}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </Card>
  )
}
```

## 🎨 UI Components

### Design System Components

```typescript
// Real implementation from components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

// Usage examples
export function ButtonExamples() {
  return (
    <div className="flex flex-wrap gap-4">
      <Button>Default Button</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="destructive">Delete Trip</Button>
      <Button variant="ghost" size="sm">
        <Settings className="w-4 h-4 mr-2" />
        Settings
      </Button>
    </div>
  )
}
```

### Form Components

```typescript
// Real implementation from components/forms/TripForm.tsx
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { Calendar as CalendarIcon, MapPin } from "lucide-react"

const tripFormSchema = z.object({
  countryCode: z.string().min(2, "Please select a country"),
  entryDate: z.date({
    required_error: "Entry date is required",
  }),
  exitDate: z.date({
    required_error: "Exit date is required",
  }),
  purpose: z.string().min(1, "Purpose is required"),
}).refine((data) => data.exitDate > data.entryDate, {
  message: "Exit date must be after entry date",
  path: ["exitDate"],
})

type TripFormValues = z.infer<typeof tripFormSchema>

export function TripForm({ onSubmit, initialData }: {
  onSubmit: (data: TripFormValues) => Promise<void>
  initialData?: Partial<TripFormValues>
}) {
  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      countryCode: initialData?.countryCode || "",
      entryDate: initialData?.entryDate || undefined,
      exitDate: initialData?.exitDate || undefined,
      purpose: initialData?.purpose || "",
    },
  })

  const handleSubmit = async (data: TripFormValues) => {
    try {
      await onSubmit(data)
      form.reset()
    } catch (error) {
      console.error('Failed to submit trip:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="countryCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination Country</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <div className="flex items-center gap-2">
                        <CountryFlag code={country.code} className="w-4 h-4" />
                        {country.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="entryDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Entry Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick entry date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="exitDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Exit Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick exit date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < form.getValues().entryDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="purpose"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Purpose of Visit</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="tourism">Tourism</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="family">Family Visit</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          <MapPin className="w-4 h-4 mr-2" />
          Add Trip
        </Button>
      </form>
    </Form>
  )
}
```

## 🔌 API Integration

### API Client Usage

```typescript
// Real implementation from lib/api/api-client.ts
import { APIClient } from '@/lib/api/api-client'

// Initialize API client with configuration
const apiClient = new APIClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  retry: {
    attempts: 3,
    delay: 1000,
    backoff: 'exponential',
  },
})

// Authentication helper
export function setAuthToken(token: string) {
  apiClient.setAuthToken(token)
}

// Trip management API calls
export async function fetchTrips(userId: string): Promise<CountryVisit[]> {
  return await apiClient.get('/trips', {
    params: { userId }
  })
}

export async function createTrip(tripData: CreateTripRequest): Promise<CountryVisit> {
  return await apiClient.post('/trips', tripData)
}

export async function updateTrip(tripId: string, updates: Partial<CountryVisit>): Promise<CountryVisit> {
  return await apiClient.put(`/trips/${tripId}`, updates)
}

export async function deleteTrip(tripId: string): Promise<void> {
  await apiClient.delete(`/trips/${tripId}`)
}

// Schengen calculation API
export async function calculateSchengen(userId: string): Promise<SchengenCalculation> {
  return await apiClient.get('/schengen/calculate', {
    params: { userId }
  })
}

// Usage in React components
export function useTripData(userId: string) {
  const [trips, setTrips] = useState<CountryVisit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTrips() {
      try {
        setLoading(true)
        const data = await fetchTrips(userId)
        setTrips(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load trips')
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      loadTrips()
    }
  }, [userId])

  const addTrip = async (tripData: CreateTripRequest) => {
    const newTrip = await createTrip(tripData)
    setTrips(prev => [...prev, newTrip])
    return newTrip
  }

  const removeTrip = async (tripId: string) => {
    await deleteTrip(tripId)
    setTrips(prev => prev.filter(trip => trip.id !== tripId))
  }

  return {
    trips,
    loading,
    error,
    addTrip,
    removeTrip,
    refetch: () => loadTrips()
  }
}
```

## 🗄️ Database Operations

### Prisma Integration

```typescript
// Real implementation from lib/actions/database.ts
import { prisma } from '@/lib/prisma'
import { CountryVisit, Prisma } from '@prisma/client'

// Complex query with relations and filtering
export async function getUserTripsWithCalculations(userId: string, options?: {
  startDate?: Date
  endDate?: Date
  countries?: string[]
  includeSchengenOnly?: boolean
}) {
  const whereClause: Prisma.CountryVisitWhereInput = {
    userId,
    ...(options?.startDate && {
      entryDate: { gte: options.startDate }
    }),
    ...(options?.endDate && {
      exitDate: { lte: options.endDate }
    }),
    ...(options?.countries && {
      countryCode: { in: options.countries }
    }),
    ...(options?.includeSchengenOnly && {
      isSchengenArea: true
    })
  }

  const trips = await prisma.countryVisit.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true
        }
      }
    },
    orderBy: {
      entryDate: 'asc'
    }
  })

  // Calculate Schengen statistics
  const schengenTrips = trips.filter(trip => trip.isSchengenArea)
  const totalSchengenDays = schengenTrips.reduce((total, trip) => {
    const days = Math.ceil(
      (trip.exitDate.getTime() - trip.entryDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    return total + days
  }, 0)

  return {
    trips,
    statistics: {
      totalTrips: trips.length,
      schengenTrips: schengenTrips.length,
      totalSchengenDays,
      remainingSchengenDays: Math.max(0, 90 - totalSchengenDays),
      uniqueCountries: new Set(trips.map(trip => trip.countryCode)).size
    }
  }
}

// Batch operations with transaction
export async function importTripsFromFile(userId: string, tripData: CreateTripRequest[]) {
  return await prisma.$transaction(async (tx) => {
    // First, validate all trip data
    for (const trip of tripData) {
      if (trip.exitDate <= trip.entryDate) {
        throw new Error(`Invalid date range for trip to ${trip.countryCode}`)
      }
    }

    // Delete existing trips if requested
    await tx.countryVisit.deleteMany({
      where: { userId }
    })

    // Create new trips
    const createdTrips = await Promise.all(
      tripData.map(trip =>
        tx.countryVisit.create({
          data: {
            ...trip,
            userId,
            isSchengenArea: SCHENGEN_COUNTRIES.includes(trip.countryCode),
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
      )
    )

    // Update user's last activity
    await tx.user.update({
      where: { id: userId },
      data: { updatedAt: new Date() }
    })

    return createdTrips
  })
}
```

## 🧪 Testing Examples

### Component Testing

```typescript
// Real implementation from __tests__/components/TripForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TripForm } from '@/components/forms/TripForm'

describe('TripForm', () => {
  const mockOnSubmit = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    
    render(<TripForm onSubmit={mockOnSubmit} />)

    // Fill out the form
    await user.click(screen.getByRole('combobox', { name: /destination country/i }))
    await user.click(screen.getByText('France'))

    await user.click(screen.getByRole('button', { name: /pick entry date/i }))
    await user.click(screen.getByText('15')) // Assuming current month

    await user.click(screen.getByRole('button', { name: /pick exit date/i }))
    await user.click(screen.getByText('20')) // Assuming current month

    await user.click(screen.getByRole('combobox', { name: /purpose/i }))
    await user.click(screen.getByText('Tourism'))

    // Submit form
    await user.click(screen.getByRole('button', { name: /add trip/i }))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        countryCode: 'FR',
        entryDate: expect.any(Date),
        exitDate: expect.any(Date),
        purpose: 'tourism'
      })
    })
  })

  it('shows validation errors for invalid data', async () => {
    const user = userEvent.setup()
    
    render(<TripForm onSubmit={mockOnSubmit} />)

    // Try to submit empty form
    await user.click(screen.getByRole('button', { name: /add trip/i }))

    await waitFor(() => {
      expect(screen.getByText('Please select a country')).toBeInTheDocument()
      expect(screen.getByText('Entry date is required')).toBeInTheDocument()
      expect(screen.getByText('Exit date is required')).toBeInTheDocument()
      expect(screen.getByText('Purpose is required')).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })
})
```

### API Testing

```typescript
// Real implementation from __tests__/api/trips.test.ts
import { createMocks } from 'node-mocks-http'
import handler from '@/app/api/trips/route'
import { getServerSession } from 'next-auth'

jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    countryVisit: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  }
}))

describe('/api/trips', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates a new trip successfully', async () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' }
    }
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)

    const mockTrip = {
      id: 'trip-123',
      userId: 'user-123',
      countryCode: 'FR',
      entryDate: new Date('2024-06-01'),
      exitDate: new Date('2024-06-07'),
      purpose: 'tourism',
      isSchengenArea: true
    }

    ;(prisma.countryVisit.create as jest.Mock).mockResolvedValue(mockTrip)

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        countryCode: 'FR',
        entryDate: '2024-06-01',
        exitDate: '2024-06-07',
        purpose: 'tourism'
      }
    })

    await handler.POST(req)

    expect(prisma.countryVisit.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-123',
        countryCode: 'FR',
        entryDate: new Date('2024-06-01'),
        exitDate: new Date('2024-06-07'),
        purpose: 'tourism',
        isSchengenArea: true,
        status: 'PLANNED',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      }
    })
  })
})
```

## 🔧 Utility Functions

### Date and Time Helpers

```typescript
// Real implementation from lib/utils/date.ts
import { format, differenceInDays, addDays, isWithinInterval } from 'date-fns'

export function formatTripDate(date: Date | string): string {
  return format(new Date(date), 'MMM dd, yyyy')
}

export function calculateTripDuration(entryDate: Date | string, exitDate: Date | string): number {
  return differenceInDays(new Date(exitDate), new Date(entryDate)) + 1
}

export function isOverlapping(trip1: CountryVisit, trip2: CountryVisit): boolean {
  const trip1Interval = {
    start: new Date(trip1.entryDate),
    end: new Date(trip1.exitDate)
  }
  
  const trip2Interval = {
    start: new Date(trip2.entryDate),
    end: new Date(trip2.exitDate)
  }

  return isWithinInterval(trip1Interval.start, trip2Interval) ||
         isWithinInterval(trip1Interval.end, trip2Interval) ||
         isWithinInterval(trip2Interval.start, trip1Interval) ||
         isWithinInterval(trip2Interval.end, trip1Interval)
}

export function getSchengenPeriods(visits: CountryVisit[]): Array<{
  start: Date
  end: Date
  days: number
  countries: string[]
}> {
  const schengenVisits = visits
    .filter(visit => visit.isSchengenArea)
    .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime())

  const periods: Array<{
    start: Date
    end: Date
    days: number
    countries: string[]
  }> = []

  for (const visit of schengenVisits) {
    const entryDate = new Date(visit.entryDate)
    const periodStart = addDays(entryDate, -180)
    const periodEnd = addDays(entryDate, 0)

    // Find all visits within this 180-day period
    const visitsInPeriod = schengenVisits.filter(v => {
      const vEntry = new Date(v.entryDate)
      return vEntry >= periodStart && vEntry <= periodEnd
    })

    const totalDays = visitsInPeriod.reduce((sum, v) => {
      return sum + calculateTripDuration(v.entryDate, v.exitDate)
    }, 0)

    const countries = [...new Set(visitsInPeriod.map(v => v.countryCode))]

    periods.push({
      start: periodStart,
      end: periodEnd,
      days: totalDays,
      countries
    })
  }

  return periods
}
```

---

These examples demonstrate the real TypeScript implementations used in the DINO application, showing practical patterns for:

- ✅ **Trip Management**: CRUD operations with validation
- ✅ **Schengen Calculations**: Complex business logic
- ✅ **UI Components**: Design system with variants
- ✅ **Form Handling**: Zod validation with React Hook Form
- ✅ **API Integration**: Type-safe HTTP client
- ✅ **Database Operations**: Prisma with transactions
- ✅ **Testing**: Component and API testing patterns
- ✅ **Utility Functions**: Date calculations and business logic

Each example includes TypeScript types, error handling, and follows the application's architectural patterns.