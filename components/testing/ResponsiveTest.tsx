'use client'

import { Icon } from '@/components/icons'

export function ResponsiveTest() {
  return (
    <div className="container mx-auto" style={{ padding: 'var(--space-4)' }}>
      <h1 className="text-2xl font-bold mb-8">Responsive Design Test</h1>
      
      {/* Breakpoint Indicator */}
      <div className="mb-8 p-4 bg-muted rounded-lg">
        <h2 className="font-semibold mb-2">Current Breakpoint:</h2>
        <div className="sm:hidden">📱 Mobile (&lt; 640px)</div>
        <div className="hidden sm:block md:hidden">📱 Small (640px - 768px)</div>
        <div className="hidden md:block lg:hidden">💻 Medium (768px - 1024px)</div>
        <div className="hidden lg:block xl:hidden">🖥️ Large (1024px - 1280px)</div>
        <div className="hidden xl:block">🖥️ Extra Large (&gt; 1280px)</div>
      </div>

      {/* Grid Test */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Grid Layout Test</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-primary/10 p-4 rounded-lg text-center">
              <Icon name="globe" size="lg" className="mb-2" />
              <p>Item {i}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Flexbox Test */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Flexbox Layout Test</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 bg-success/10 p-4 rounded-lg">
            <Icon name="check-circle" size="lg" className="mb-2" />
            <p>Flex Item 1</p>
          </div>
          <div className="flex-1 bg-warning/10 p-4 rounded-lg">
            <Icon name="alert-circle" size="lg" className="mb-2" />
            <p>Flex Item 2</p>
          </div>
          <div className="flex-1 bg-destructive/10 p-4 rounded-lg">
            <Icon name="x-circle" size="lg" className="mb-2" />
            <p>Flex Item 3</p>
          </div>
        </div>
      </div>

      {/* Spacing Test */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Spacing Test</h2>
        <div className="bg-muted/50 p-2 sm:p-4 md:p-6 lg:p-8 rounded-lg">
          <p>This container has responsive padding</p>
          <div className="mt-2 sm:mt-4 md:mt-6 lg:mt-8 bg-white p-4 rounded">
            <p>And this has responsive margin</p>
          </div>
        </div>
      </div>

      {/* Typography Test */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Typography Test</h2>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
          Responsive Heading
        </h1>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl">
          This text scales based on screen size to ensure optimal readability across all devices.
        </p>
      </div>

      {/* Visibility Test */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Visibility Test</h2>
        <div className="space-y-2">
          <div className="sm:hidden bg-red-100 p-4 rounded">
            Visible only on mobile
          </div>
          <div className="hidden sm:block md:hidden bg-yellow-100 p-4 rounded">
            Visible only on small screens
          </div>
          <div className="hidden md:block lg:hidden bg-green-100 p-4 rounded">
            Visible only on medium screens
          </div>
          <div className="hidden lg:block bg-blue-100 p-4 rounded">
            Visible on large screens and up
          </div>
        </div>
      </div>

      {/* Button Test */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Button Responsiveness</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="w-full sm:w-auto px-4 py-2 bg-primary text-white rounded-lg">
            Full width on mobile
          </button>
          <button className="w-full sm:w-auto px-4 py-2 bg-secondary text-secondary-foreground rounded-lg">
            Auto width on desktop
          </button>
        </div>
      </div>
    </div>
  )
}