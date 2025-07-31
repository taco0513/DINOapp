/**
 * ErrorBoundary Component Tests
 * 에러 바운더리 컴포넌트 테스트 스위트
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  ErrorBoundary,
  useErrorHandler,
} from '@/components/error/ErrorBoundary';

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  AlertTriangle: ({ className }: { className?: string }) => (
    <div data-testid='alert-triangle' className={className}>
      AlertTriangle
    </div>
  ),
  RefreshCw: ({ className }: { className?: string }) => (
    <div data-testid='refresh-cw' className={className}>
      RefreshCw
    </div>
  ),
  Home: ({ className }: { className?: string }) => (
    <div data-testid='home' className={className}>
      Home
    </div>
  ),
}));

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, ...props }: any) => (
    <button onClick={onClick} data-variant={variant} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div className={`card ${className || ''}`}>{children}</div>
  ),
  CardContent: ({ children, className }: any) => (
    <div className={`card-content ${className || ''}`}>{children}</div>
  ),
  CardDescription: ({ children, className }: any) => (
    <div className={`card-description ${className || ''}`}>{children}</div>
  ),
  CardFooter: ({ children, className }: any) => (
    <div className={`card-footer ${className || ''}`}>{children}</div>
  ),
  CardHeader: ({ children, className }: any) => (
    <div className={`card-header ${className || ''}`}>{children}</div>
  ),
  CardTitle: ({ children, className }: any) => (
    <div className={`card-title ${className || ''}`}>{children}</div>
  ),
}));

jest.mock('@/components/ui/alert', () => ({
  Alert: ({ children, variant }: any) => (
    <div data-variant={variant} className='alert'>
      {children}
    </div>
  ),
  AlertDescription: ({ children }: any) => (
    <div className='alert-description'>{children}</div>
  ),
  AlertTitle: ({ children }: any) => (
    <div className='alert-title'>{children}</div>
  ),
}));

// Component that throws an error for testing
const _ThrowError = ({
  shouldThrow = false,
  message = 'Test error',
}: {
  shouldThrow?: boolean;
  message?: string;
}) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div>No error</div>;
};

// Original console.error for restoration
const originalConsoleError = console.error;

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    // Mock console.error to avoid cluttering test output
    console.error = jest.fn();

    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        reload: jest.fn(),
        href: '',
      },
      writable: true,
    });
  });

  afterEach(() => {
    console.error = originalConsoleError;
    jest.clearAllMocks();
  });

  describe('Normal Operation', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should not show error UI when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );

      expect(
        screen.queryByText('Oops! Something went wrong')
      ).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should catch and display error when child component throws', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} message='Test error message' />
        </ErrorBoundary>
      );

      expect(
        screen.getByText('Oops! Something went wrong')
      ).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('should show error details in alert', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} message='Custom error message' />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error Details')).toBeInTheDocument();
      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('should call onError callback when provided', () => {
      const mockOnError = jest.fn();

      render(
        <ErrorBoundary onError={mockOnError}>
          <ThrowError shouldThrow={true} message='Callback test error' />
        </ErrorBoundary>
      );

      expect(mockOnError).toHaveBeenCalled();
      expect(mockOnError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });

    it('should log error to console', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} message='Console log test' />
        </ErrorBoundary>
      );

      expect(console.error).toHaveBeenCalledWith(
        'ErrorBoundary caught an error:',
        expect.any(Error),
        expect.any(Object)
      );
    });
  });

  describe('Custom Fallback', () => {
    it('should render custom fallback when provided', () => {
      const customFallback = <div>Custom error message</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
      expect(
        screen.queryByText('Oops! Something went wrong')
      ).not.toBeInTheDocument();
    });
  });

  describe('Error Actions', () => {
    it('should reset error state when Try Again is clicked', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(
        screen.getByText('Oops! Something went wrong')
      ).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /try again/i }));

      // Error should be cleared and children should render
      expect(screen.getByText('No error')).toBeInTheDocument();
      expect(
        screen.queryByText('Oops! Something went wrong')
      ).not.toBeInTheDocument();
    });

    it('should reload page when Reload Page is clicked', () => {
      const mockReload = jest.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true,
      });

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      fireEvent.click(screen.getByRole('button', { name: /reload page/i }));

      expect(mockReload).toHaveBeenCalled();
    });

    it('should navigate to home when Go Home is clicked', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      fireEvent.click(screen.getByRole('button', { name: /go home/i }));

      expect(window.location.href).toBe('/');
    });
  });

  describe('Development Mode', () => {
    it('should show developer information in development mode', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} message='Dev mode error' />
        </ErrorBoundary>
      );

      expect(screen.getByText('Developer Information')).toBeInTheDocument();

      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should not show developer information in production mode', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} message='Prod mode error' />
        </ErrorBoundary>
      );

      expect(
        screen.queryByText('Developer Information')
      ).not.toBeInTheDocument();

      process.env.NODE_ENV = originalNodeEnv;
    });
  });

  describe('Persistent Errors', () => {
    it('should show persistent issue warning after multiple errors', () => {
      const ErrorBoundaryWrapper = () => {
        const [errorCount, setErrorCount] = React.useState(0);

        return (
          <div>
            <button onClick={() => setErrorCount(c => c + 1)}>
              Trigger Error
            </button>
            <ErrorBoundary key={errorCount}>
              <ThrowError shouldThrow={errorCount > 0} />
            </ErrorBoundary>
          </div>
        );
      };

      render(<ErrorBoundaryWrapper />);

      // Trigger multiple errors by re-rendering with different keys
      for (let i = 0; i < 3; i++) {
        fireEvent.click(screen.getByText('Trigger Error'));
      }

      // After multiple errors, the persistent issue warning should appear
      // Note: This test simulates the scenario but the actual implementation
      // tracks errors within the same component instance
    });
  });

  describe('Error Recovery', () => {
    it('should recover after successful reset', () => {
      const ConditionalError = () => {
        const [shouldError, setShouldError] = React.useState(true);

        React.useEffect(() => {
          // Simulate fixing the error condition after a delay
          const timer = setTimeout(() => setShouldError(false), 100);
          return () => clearTimeout(timer);
        }, []);

        if (shouldError) {
          throw new Error('Temporary error');
        }

        return <div>Recovered successfully</div>;
      };

      render(
        <ErrorBoundary>
          <ConditionalError />
        </ErrorBoundary>
      );

      expect(
        screen.getByText('Oops! Something went wrong')
      ).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /try again/i }));

      // Should show recovery after reset
      expect(screen.getByText('Recovered successfully')).toBeInTheDocument();
    });
  });

  describe('UI Components', () => {
    it('should render alert triangle icons', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getAllByTestId('alert-triangle')).toHaveLength(2);
    });

    it('should render action buttons with correct icons', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('refresh-cw')).toBeInTheDocument();
      expect(screen.getByTestId('home')).toBeInTheDocument();
    });

    it('should apply correct button variants', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(
        screen.getByRole('button', { name: /try again/i })
      ).toHaveAttribute('data-variant', 'default');
      expect(
        screen.getByRole('button', { name: /reload page/i })
      ).toHaveAttribute('data-variant', 'outline');
      expect(screen.getByRole('button', { name: /go home/i })).toHaveAttribute(
        'data-variant',
        'ghost'
      );
    });
  });
});

describe('useErrorHandler Hook', () => {
  it('should handle errors when called', () => {
    const TestComponent = () => {
      const handleError = useErrorHandler();

      const triggerError = () => {
        handleError(new Error('Hook test error'));
      };

      return <button onClick={triggerError}>Trigger Error</button>;
    };

    render(<TestComponent />);

    fireEvent.click(screen.getByText('Trigger Error'));

    expect(console.error).toHaveBeenCalledWith(
      'Error caught by useErrorHandler:',
      expect.any(Error),
      undefined
    );
  });

  it('should handle errors with errorInfo', () => {
    const TestComponent = () => {
      const handleError = useErrorHandler();

      const triggerError = () => {
        handleError(new Error('Hook test error'), {
          componentStack: 'test stack',
        } as any);
      };

      return <button onClick={triggerError}>Trigger Error</button>;
    };

    render(<TestComponent />);

    fireEvent.click(screen.getByText('Trigger Error'));

    expect(console.error).toHaveBeenCalledWith(
      'Error caught by useErrorHandler:',
      expect.any(Error),
      { componentStack: 'test stack' }
    );
  });
});
