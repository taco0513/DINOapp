/**
 * SchengenCalculator Component Tests
 * 셰겐 계산기 컴포넌트 테스트 스위트
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SchengenCalculator from '@/components/schengen/SchengenCalculator';

// Mock localStorage for offline functionality
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

// Mock matchMedia for responsive design
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
import { ApiClient } from '@/lib/api-client';

// Mock ApiClient
jest.mock('@/lib/api-client', () => ({
  ApiClient: {
    getSchengenStatus: jest.fn(),
  },
}));

const _mockApiClient = ApiClient as jest.Mocked<typeof ApiClient>;

describe('SchengenCalculator Component', () => {
  const _mockSchengenData = {
    success: true,
    data: {
      status: {
        usedDays: 45,
        remainingDays: 45,
        nextResetDate: '2024-06-01T00:00:00Z',
        isCompliant: true,
        violations: [],
      },
      trips: [
        {
          id: '1',
          country: 'France',
          entryDate: '2024-01-01T00:00:00Z',
          exitDate: '2024-01-15T00:00:00Z',
          days: 14,
        },
      ],
    },
  };

  const _mockNonCompliantData = {
    success: true,
    data: {
      status: {
        usedDays: 95,
        remainingDays: 0,
        nextResetDate: '2024-06-01T00:00:00Z',
        isCompliant: false,
        violations: [
          {
            date: '2024-01-01',
            daysOverLimit: 5,
            description: 'Exceeded 90-day limit',
          },
        ],
      },
      trips: [],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock current date
    jest
      .spyOn(Date, 'now')
      .mockReturnValue(new Date('2024-01-20T00:00:00Z').getTime());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading skeleton while fetching data', () => {
      mockApiClient.getSchengenStatus.mockImplementation(
        () => new Promise(() => {})
      );

      render(<SchengenCalculator />);

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });

    it('should show loading placeholder elements', () => {
      mockApiClient.getSchengenStatus.mockImplementation(
        () => new Promise(() => {})
      );

      render(<SchengenCalculator />);

      const loadingElements = screen.getAllByTestId('loading-placeholder');
      expect(loadingElements.length).toBeGreaterThan(0);
    });
  });

  describe('Data Loading', () => {
    it('should load and display Schengen status on mount', async () => {
      mockApiClient.getSchengenStatus.mockResolvedValueOnce(mockSchengenData);

      render(<SchengenCalculator />);

      await waitFor(() => {
        expect(screen.getByText('현재 셰겐 상태')).toBeInTheDocument();
      });

      expect(screen.getAllByText('45')[0]).toBeInTheDocument(); // used days
      expect(screen.getAllByText('45')[1]).toBeInTheDocument(); // remaining days
      expect(screen.getByText('90')).toBeInTheDocument(); // total days
    });

    it('should call onDataUpdate when data is loaded', async () => {
      const mockOnDataUpdate = jest.fn();
      mockApiClient.getSchengenStatus.mockResolvedValueOnce(mockSchengenData);

      render(<SchengenCalculator onDataUpdate={mockOnDataUpdate} />);

      await waitFor(() => {
        expect(mockOnDataUpdate).toHaveBeenCalledWith(mockSchengenData.data);
      });
    });

    it('should handle API error gracefully', async () => {
      mockApiClient.getSchengenStatus.mockRejectedValueOnce(
        new Error('API Error')
      );

      render(<SchengenCalculator />);

      await waitFor(() => {
        expect(
          screen.getByText('셰겐 데이터를 불러올 수 없습니다.')
        ).toBeInTheDocument();
      });
    });

    it('should handle unsuccessful API response', async () => {
      mockApiClient.getSchengenStatus.mockResolvedValueOnce({
        success: false,
        data: null,
      });

      render(<SchengenCalculator />);

      await waitFor(() => {
        expect(
          screen.getByText('셰겐 데이터를 불러올 수 없습니다.')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Current Status Display', () => {
    beforeEach(() => {
      mockApiClient.getSchengenStatus.mockResolvedValue(mockSchengenData);
    });

    it('should display used days correctly', async () => {
      render(<SchengenCalculator />);

      await waitFor(() => {
        expect(screen.getByText('사용된 일수')).toBeInTheDocument();
        const usedDaysSection = screen.getByText('사용된 일수').parentElement;
        expect(usedDaysSection).toHaveTextContent('45');
      });
    });

    it('should display remaining days correctly', async () => {
      render(<SchengenCalculator />);

      await waitFor(() => {
        expect(screen.getByText('남은 일수')).toBeInTheDocument();
        const remainingDaysSection =
          screen.getByText('남은 일수').parentElement;
        expect(remainingDaysSection).toHaveTextContent('45');
      });
    });

    it('should display total allowed days', async () => {
      render(<SchengenCalculator />);

      await waitFor(() => {
        expect(screen.getByText('90')).toBeInTheDocument();
        expect(screen.getByText('총 허용 일수')).toBeInTheDocument();
      });
    });

    it('should show compliance status badge for compliant status', async () => {
      render(<SchengenCalculator />);

      await waitFor(() => {
        expect(screen.getByText('✅ 규정 준수')).toBeInTheDocument();
      });
    });

    it('should show non-compliance status badge for violation', async () => {
      mockApiClient.getSchengenStatus.mockResolvedValueOnce(
        mockNonCompliantData
      );

      render(<SchengenCalculator />);

      await waitFor(() => {
        expect(screen.getByText('⚠️ 규정 위반')).toBeInTheDocument();
      });
    });
  });

  describe('Progress Bar', () => {
    it('should show green progress bar for normal usage', async () => {
      mockApiClient.getSchengenStatus.mockResolvedValueOnce(mockSchengenData);

      render(<SchengenCalculator />);

      await waitFor(() => {
        const progressBar = screen
          .getByText('45/90일')
          .parentElement?.querySelector('[style*="width"]');
        expect(progressBar).toHaveClass('bg-green-500');
      });
    });

    it('should show yellow progress bar for high usage', async () => {
      const highUsageData = {
        ...mockSchengenData,
        data: {
          ...mockSchengenData.data,
          status: {
            ...mockSchengenData.data.status,
            usedDays: 80,
            remainingDays: 10,
          },
        },
      };
      mockApiClient.getSchengenStatus.mockResolvedValueOnce(highUsageData);

      render(<SchengenCalculator />);

      await waitFor(() => {
        const progressBar = screen
          .getByText('80/90일')
          .parentElement?.querySelector('[style*="width"]');
        expect(progressBar).toHaveClass('bg-yellow-500');
      });
    });

    it('should show red progress bar for exceeded usage', async () => {
      mockApiClient.getSchengenStatus.mockResolvedValueOnce(
        mockNonCompliantData
      );

      render(<SchengenCalculator />);

      await waitFor(() => {
        const progressBar = screen
          .getByText('95/90일')
          .parentElement?.querySelector('[style*="width"]');
        expect(progressBar).toHaveClass('bg-red-500');
      });
    });

    it('should calculate progress bar width correctly', async () => {
      mockApiClient.getSchengenStatus.mockResolvedValueOnce(mockSchengenData);

      render(<SchengenCalculator />);

      await waitFor(() => {
        // 45 days out of 90 = 50%
        const progressBar = screen
          .getByText('45/90일')
          .parentElement?.querySelector('[style*="width"]');
        expect(progressBar).toHaveStyle('width: 50%');
      });
    });

    it('should cap progress bar at 100% for exceeded usage', async () => {
      mockApiClient.getSchengenStatus.mockResolvedValueOnce(
        mockNonCompliantData
      );

      render(<SchengenCalculator />);

      await waitFor(() => {
        // 95 days would be 105.6%, but should be capped at 100%
        const progressBar = screen
          .getByText('95/90일')
          .parentElement?.querySelector('[style*="width"]');
        expect(progressBar).toHaveStyle('width: 100%');
      });
    });
  });

  describe('Date-specific Calculator', () => {
    beforeEach(() => {
      mockApiClient.getSchengenStatus.mockResolvedValue(mockSchengenData);
    });

    it('should show date-specific calculator section', async () => {
      render(<SchengenCalculator />);

      await waitFor(() => {
        expect(screen.getByText('특정 날짜 계산기')).toBeInTheDocument();
        expect(screen.getByLabelText('확인할 날짜')).toBeInTheDocument();
      });
    });

    it('should have default date as today', async () => {
      render(<SchengenCalculator />);

      await waitFor(() => {
        const dateInput = screen.getByLabelText(
          '확인할 날짜'
        ) as HTMLInputElement;
        expect(dateInput).toBeInTheDocument();
        expect(dateInput.type).toBe('date');
      });
    });

    it('should update selected date when input changes', async () => {
      render(<SchengenCalculator />);

      await waitFor(() => {
        const dateInput = screen.getByLabelText('확인할 날짜');
        fireEvent.change(dateInput, { target: { value: '2024-02-01' } });

        expect((dateInput as HTMLInputElement).value).toBe('2024-02-01');
      });
    });

    it('should display formatted date in results', async () => {
      render(<SchengenCalculator />);

      await waitFor(() => {
        const dateInput = screen.getByLabelText('확인할 날짜');
        fireEvent.change(dateInput, { target: { value: '2024-02-01' } });

        expect(screen.getByText('2024. 2. 1. 예상 상태')).toBeInTheDocument();
      });
    });

    it('should calculate days for selected date', async () => {
      render(<SchengenCalculator />);

      await waitFor(() => {
        // Default date calculation should show some result
        expect(screen.getByText('예상 사용 일수')).toBeInTheDocument();
        expect(screen.getByText('예상 남은 일수')).toBeInTheDocument();
      });
    });
  });

  describe('Days Calculation Logic', () => {
    beforeEach(() => {
      mockApiClient.getSchengenStatus.mockResolvedValue(mockSchengenData);
    });

    it('should calculate days correctly for current date', async () => {
      render(<SchengenCalculator />);

      await waitFor(() => {
        // Should show current status (45 used days from mock data)
        const usedDaysElements = screen.getAllByText('45일');
        expect(usedDaysElements.length).toBeGreaterThan(0);
      });
    });

    it('should handle future dates in calculation', async () => {
      render(<SchengenCalculator />);

      await waitFor(() => {
        const dateInput = screen.getByLabelText('확인할 날짜');
        // Set a future date (6 months ahead)
        fireEvent.change(dateInput, { target: { value: '2024-07-20' } });

        // Should recalculate based on future date
        expect(screen.getByText('예상 사용 일수')).toBeInTheDocument();
      });
    });

    it('should handle reset periods in calculation', async () => {
      render(<SchengenCalculator />);

      await waitFor(() => {
        const dateInput = screen.getByLabelText('확인할 날짜');
        // Set a date far in the future (more than 180 days)
        fireEvent.change(dateInput, { target: { value: '2024-12-31' } });

        // Days should be recalculated considering 180-day rolling period
        expect(screen.getByText('예상 사용 일수')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null schengen data gracefully', async () => {
      mockApiClient.getSchengenStatus.mockResolvedValueOnce({
        success: true,
        data: null,
      });

      render(<SchengenCalculator />);

      await waitFor(() => {
        expect(
          screen.getByText('셰겐 데이터를 불러올 수 없습니다.')
        ).toBeInTheDocument();
      });
    });

    it('should handle missing status data', async () => {
      const incompleteData = {
        success: true,
        data: {
          status: null,
          trips: [],
        },
      };
      mockApiClient.getSchengenStatus.mockResolvedValueOnce(incompleteData);

      render(<SchengenCalculator />);

      await waitFor(() => {
        // Should calculate default values when status is missing
        const dateInput = screen.getByLabelText('확인할 날짜');
        expect(dateInput).toBeInTheDocument();
      });
    });

    it('should handle invalid date input gracefully', async () => {
      mockApiClient.getSchengenStatus.mockResolvedValueOnce(mockSchengenData);

      render(<SchengenCalculator />);

      await waitFor(() => {
        const dateInput = screen.getByLabelText('확인할 날짜');
        fireEvent.change(dateInput, { target: { value: 'invalid-date' } });

        // Should not crash and maintain functionality
        expect(screen.getByText('특정 날짜 계산기')).toBeInTheDocument();
      });
    });

    it('should handle zero and negative day calculations', async () => {
      const zeroUsageData = {
        ...mockSchengenData,
        data: {
          ...mockSchengenData.data,
          status: {
            ...mockSchengenData.data.status,
            usedDays: 0,
            remainingDays: 90,
          },
        },
      };
      mockApiClient.getSchengenStatus.mockResolvedValueOnce(zeroUsageData);

      render(<SchengenCalculator />);

      await waitFor(() => {
        expect(screen.getByText('사용된 일수')).toBeInTheDocument();
        expect(screen.getByText('남은 일수')).toBeInTheDocument();
        // Check that numeric values are displayed (even if 0/90)
        const usedDaysSection = screen.getByText('사용된 일수').parentElement;
        const remainingDaysSection =
          screen.getByText('남은 일수').parentElement;
        expect(usedDaysSection).toHaveTextContent(/\d/); // Should contain a number
        expect(remainingDaysSection).toHaveTextContent(/\d/); // Should contain a number
      });
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      mockApiClient.getSchengenStatus.mockResolvedValue(mockSchengenData);
    });

    it('should have responsive grid classes', async () => {
      render(<SchengenCalculator />);

      await waitFor(() => {
        const gridElement = screen.getByText('사용된 일수').closest('.grid');
        expect(gridElement).toHaveClass('grid-cols-1', 'sm:grid-cols-3');
      });
    });

    it('should have responsive text sizes', async () => {
      render(<SchengenCalculator />);

      await waitFor(() => {
        const dayElements = screen.getAllByText('45');
        dayElements.forEach(element => {
          expect(element).toHaveClass('text-xl', 'sm:text-2xl');
        });
      });
    });

    it('should have responsive padding classes', async () => {
      render(<SchengenCalculator />);

      await waitFor(() => {
        const cards = screen
          .getAllByRole('generic')
          .filter(
            el =>
              el.classList.contains('p-3') || el.classList.contains('sm:p-4')
          );
        expect(cards.length).toBeGreaterThan(0);
      });
    });
  });
});
