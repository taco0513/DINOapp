# Schengen Calculator Component Documentation

## Overview

The Schengen Calculator (`SchengenCalculator.tsx`) is a critical component in the DINO application that helps users track their compliance with the Schengen Area's 90/180-day rule. This component provides real-time calculations, future trip planning, and visual feedback to ensure users stay within legal visa limits.

## Component Details

**Location**: `/components/schengen/SchengenCalculator.tsx`  
**Type**: Client Component  
**Category**: Core Feature Component

## Features

### 1. Current Status Display

- Shows used days, remaining days, and total allowed days (90)
- Visual progress bar with color-coded warnings
- Compliance status indicator (✅ 규정 준수 / ⚠️ 규정 위반)

### 2. Date-Specific Calculator

- Allows users to check their Schengen status on any specific date
- Automatically calculates projected used/remaining days
- Accounts for the rolling 180-day window

### 3. Future Trip Planner

- Interactive tool for planning future Schengen area trips
- Country selection for major Schengen countries
- Entry/exit date inputs with validation
- Real-time violation warnings if trip would exceed 90-day limit

### 4. Educational Tips Section

- Provides important information about Schengen rules
- Clarifies common misconceptions
- Helps users understand the rolling window calculation

## Technical Implementation

### Props Interface

```typescript
interface SchengenCalculatorProps {
  onDataUpdate?: (data: any) => void; // Callback for parent component updates
}
```

### State Management

- `schengenData`: Current Schengen status from API
- `selectedDate`: Date for status calculation
- `loading`: Loading state indicator
- `futureTrip`: Object containing future trip planning data

### Key Functions

#### `loadSchengenStatus()`

- Fetches current Schengen status from API
- Updates parent component via `onDataUpdate` callback
- Handles loading states and errors gracefully

#### `calculateDaysOnDate(date: string)`

- Calculates Schengen status for a specific date
- Implements basic rolling window logic
- Returns used days and remaining days

#### `handleFutureTripCalculation()`

- Calculates impact of a planned future trip
- Determines if trip would violate 90-day rule
- Provides detailed breakdown of trip impact

## API Integration

The component integrates with the DINO API through the `ApiClient`:

```typescript
const response = await ApiClient.getSchengenStatus();
```

**Expected Response Structure**:

```typescript
{
  success: boolean,
  data: {
    status: {
      usedDays: number,
      remainingDays: number,
      isCompliant: boolean
    }
  }
}
```

## Styling & Responsiveness

### Mobile Optimization

- Responsive grid layouts (1 column on mobile, 3 columns on desktop)
- Touch-friendly input fields with increased padding on mobile
- Text size adjustments for better mobile readability
- Centered text on mobile, left-aligned on desktop

### Color Scheme

- **Green** (bg-green-500): Compliant status, safe usage levels
- **Yellow** (bg-yellow-500): Warning zone (>75 days used)
- **Red** (bg-red-500): Violation or danger zone (>90 days)
- **Blue**: Informational sections and primary actions
- **Purple**: Accent color for total allowed days

### Visual Indicators

- Progress bar shows percentage of 90-day allowance used
- Dynamic color changes based on usage levels
- Status badges with icons for quick comprehension

## Usage Example

```tsx
import SchengenCalculator from '@/components/schengen/SchengenCalculator';

function SchengenPage() {
  const handleDataUpdate = data => {
    console.log('Schengen data updated:', data);
    // Update parent state or trigger other actions
  };

  return <SchengenCalculator onDataUpdate={handleDataUpdate} />;
}
```

## Business Logic

### 90/180-Day Rule Implementation

The component implements a simplified version of the Schengen 90/180-day rule:

1. **Rolling Window**: Each day, the system looks back 180 days
2. **Day Counting**: Counts all days spent in Schengen area within that window
3. **Limit Check**: Ensures total doesn't exceed 90 days
4. **Future Projections**: Estimates how past days will "expire" from the window

### Calculation Accuracy

- Entry and exit days both count as full days
- Timezone considerations for midnight crossings
- Conservative estimates for user safety

## Error Handling

- **Loading States**: Skeleton UI during data fetch
- **API Failures**: Graceful fallback with user-friendly message
- **Invalid Inputs**: Prevented through HTML5 date inputs
- **Edge Cases**: Handles missing data with sensible defaults

## Performance Considerations

- **Client-side Rendering**: Uses 'use client' directive for interactivity
- **Efficient Re-renders**: State updates are localized
- **API Caching**: Leverages ApiClient's built-in caching
- **Lightweight Calculations**: All date math is performed client-side

## Accessibility

- **Semantic HTML**: Proper heading hierarchy and form labels
- **Focus Management**: All interactive elements are keyboard accessible
- **Color Contrast**: Meets WCAG standards for text/background combinations
- **Screen Reader Support**: Descriptive labels and status announcements

## Future Enhancements

### Planned Features

1. **Multi-passport Support**: Handle different visa rules per passport
2. **Historical Analysis**: Show usage patterns over time
3. **Advanced Warnings**: Predictive alerts before violations
4. **Export Functionality**: Generate reports for visa applications

### Technical Improvements

1. **More Accurate Calculations**: Factor in visa types and special agreements
2. **Offline Support**: Cache calculations for offline use
3. **Real-time Sync**: Update when new trips are added elsewhere
4. **Enhanced Validation**: More sophisticated date validation

## Testing Considerations

### Unit Tests

- Date calculation accuracy
- Edge case handling (e.g., leap years, timezone changes)
- State management logic

### Integration Tests

- API communication
- Error scenario handling
- Parent component callbacks

### E2E Tests

- User workflow completion
- Mobile responsiveness
- Visual regression testing

## Dependencies

- **React**: State management and UI rendering
- **ApiClient**: Server communication
- **Tailwind CSS**: Styling and responsive design

## Related Components

- `SchengenChart`: Visual representation of Schengen history
- `TripCard`: Individual trip display
- `WireframeTripForm`: Trip creation interface

## Legal Disclaimer

This component provides estimates based on the standard 90/180-day rule. Users should:

- Verify calculations with official sources
- Consider special visa agreements
- Account for country-specific rules
- Consult immigration lawyers for complex cases

The DINO app and this component do not constitute legal advice.
