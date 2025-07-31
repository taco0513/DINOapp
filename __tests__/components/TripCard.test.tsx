/**
 * TripCard Component Tests
 * 여행 정보 카드 컴포넌트 테스트 스위트
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TripCard from '@/components/trips/TripCard';
import { ApiClient } from '@/lib/api-client';
import type { CountryVisit } from '@/types/global';

// Mock ApiClient
jest.mock('@/lib/api-client', () => ({
  ApiClient: {
    deleteTrip: jest.fn(),
  },
}));

// Mock countries data
jest.mock('@/data/countries', () => ({
  getCountryByName: jest.fn((name: string) => {
    const countryMap: { [key: string]: any } = {
      France: { code: 'FR', name: 'France', flag: '🇫🇷', isSchengen: true },
      Japan: { code: 'JP', name: 'Japan', flag: '🇯🇵', isSchengen: false },
      Germany: { code: 'DE', name: 'Germany', flag: '🇩🇪', isSchengen: true },
    };
    return countryMap[name] || { flag: '🌍', isSchengen: false };
  }),
}));

const _mockApiClient = ApiClient as jest.Mocked<typeof ApiClient>;

describe('TripCard Component', () => {
  const mockTrip: CountryVisit = {
    id: '1',
    userId: 'user-1',
    country: 'France',
    entryDate: '2024-01-01T00:00:00Z',
    exitDate: '2024-01-15T00:00:00Z',
    visaType: 'Tourist',
    maxDays: 90,
    passportCountry: 'US',
    notes: 'Great vacation!',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Simple Date.now mock for consistent testing
    jest
      .spyOn(Date, 'now')
      .mockReturnValue(new Date('2024-01-20T00:00:00Z').getTime());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render trip information correctly', () => {
      render(
        <TripCard trip={mockTrip} onEdit={mockOnEdit} onDelete={mockOnDelete} />
      );

      expect(screen.getByText('🇫🇷 France')).toBeInTheDocument();
      expect(screen.getByText('셰겐')).toBeInTheDocument();
      expect(screen.getByText('Tourist')).toBeInTheDocument();
      expect(screen.getByText('Great vacation!')).toBeInTheDocument();
    });

    it('should show Schengen badge for Schengen countries', () => {
      render(
        <TripCard trip={mockTrip} onEdit={mockOnEdit} onDelete={mockOnDelete} />
      );

      expect(screen.getByText('셰겐')).toBeInTheDocument();
    });

    it('should not show Schengen badge for non-Schengen countries', () => {
      const nonSchengenTrip = { ...mockTrip, country: 'Japan' };
      render(
        <TripCard
          trip={nonSchengenTrip}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByText('셰겐')).not.toBeInTheDocument();
      expect(screen.getByText('🇯🇵 Japan')).toBeInTheDocument();
    });

    it('should display formatted dates correctly', () => {
      render(
        <TripCard trip={mockTrip} onEdit={mockOnEdit} onDelete={mockOnDelete} />
      );

      expect(screen.getByText('2024. 1. 1.')).toBeInTheDocument();
      expect(screen.getByText('2024. 1. 15.')).toBeInTheDocument();
    });

    it('should show "현재 체류 중" for ongoing trips', () => {
      const ongoingTrip = { ...mockTrip, exitDate: null };
      render(
        <TripCard
          trip={ongoingTrip}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('현재 체류 중')).toBeInTheDocument();
    });
  });

  describe('Duration Calculation', () => {
    it('should calculate days correctly for completed trips', () => {
      render(
        <TripCard trip={mockTrip} onEdit={mockOnEdit} onDelete={mockOnDelete} />
      );

      // 14 days from Jan 1 to Jan 15
      expect(screen.getByText('14일')).toBeInTheDocument();
      expect(screen.getByText('/ 90일')).toBeInTheDocument();
    });

    it('should calculate days correctly for ongoing trips', () => {
      const ongoingTrip = { ...mockTrip, exitDate: null };
      render(
        <TripCard
          trip={ongoingTrip}
          onEdit={mockOnDelete}
          onDelete={mockOnDelete}
        />
      );

      // Should show days for ongoing trips - the main days display
      const dayElements = screen.getAllByText(/\d+일/);
      expect(dayElements.length).toBeGreaterThan(0);
      expect(screen.getByText('현재 체류 중')).toBeInTheDocument();
    });

    it('should show percentage correctly', () => {
      render(
        <TripCard trip={mockTrip} onEdit={mockOnEdit} onDelete={mockOnDelete} />
      );

      // 14/90 = 15.56% -> rounded to 16%
      expect(screen.getByText('16%')).toBeInTheDocument();
    });
  });

  describe('Progress Bar Colors', () => {
    it('should show green progress bar for normal stays', () => {
      render(
        <TripCard trip={mockTrip} onEdit={mockOnEdit} onDelete={mockOnDelete} />
      );

      const progressBar = screen.getByText('16%').parentElement
        ?.firstChild as HTMLElement;
      expect(progressBar).toHaveStyle('background-color: var(--color-success)');
    });

    it('should show warning color when approaching limit', () => {
      const longTrip = {
        ...mockTrip,
        entryDate: '2024-01-01T00:00:00Z',
        exitDate: '2024-03-01T00:00:00Z',
      };
      render(
        <TripCard trip={longTrip} onEdit={mockOnEdit} onDelete={mockOnDelete} />
      );

      // 60 days = 67% of 90 days, but static mock shows warning at >80%
      // Let's test with a trip that exceeds 80%
      const warningTrip = {
        ...mockTrip,
        maxDays: 20,
        entryDate: '2024-01-01T00:00:00Z',
        exitDate: '2024-01-18T00:00:00Z',
      };
      const { rerender } = render(
        <TripCard
          trip={warningTrip}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      rerender(
        <TripCard
          trip={warningTrip}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );
      const progressBar = screen.getByText('85%').parentElement
        ?.firstChild as HTMLElement;
      expect(progressBar).toHaveStyle('background-color: var(--color-warning)');
    });

    it('should show error color and warning message when exceeding limit', () => {
      const excessiveTrip = { ...mockTrip, maxDays: 10 };
      render(
        <TripCard
          trip={excessiveTrip}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('⚠️ 최대 체류 일수 초과')).toBeInTheDocument();
      const progressBar = screen.getByText('140%').parentElement
        ?.firstChild as HTMLElement;
      expect(progressBar).toHaveStyle('background-color: var(--color-error)');
    });
  });

  describe('Actions', () => {
    it('should call onEdit when edit button is clicked', () => {
      render(
        <TripCard trip={mockTrip} onEdit={mockOnEdit} onDelete={mockOnDelete} />
      );

      fireEvent.click(screen.getByText('수정'));
      expect(mockOnEdit).toHaveBeenCalledWith(mockTrip);
    });

    it('should show confirmation dialog when delete button is clicked', () => {
      render(
        <TripCard trip={mockTrip} onEdit={mockOnEdit} onDelete={mockOnDelete} />
      );

      fireEvent.click(screen.getByText('삭제'));
      expect(
        screen.getByText('정말 이 여행 기록을 삭제하시겠습니까?')
      ).toBeInTheDocument();
      expect(screen.getByText('취소')).toBeInTheDocument();
    });

    it('should cancel delete confirmation', () => {
      render(
        <TripCard trip={mockTrip} onEdit={mockOnEdit} onDelete={mockOnDelete} />
      );

      // Show confirmation
      fireEvent.click(screen.getByText('삭제'));
      expect(
        screen.getByText('정말 이 여행 기록을 삭제하시겠습니까?')
      ).toBeInTheDocument();

      // Cancel confirmation
      fireEvent.click(screen.getByText('취소'));
      expect(
        screen.queryByText('정말 이 여행 기록을 삭제하시겠습니까?')
      ).not.toBeInTheDocument();
    });

    it('should delete trip when confirmation is accepted', async () => {
      mockApiClient.deleteTrip.mockResolvedValueOnce(undefined);

      render(
        <TripCard trip={mockTrip} onEdit={mockOnEdit} onDelete={mockOnDelete} />
      );

      // Show confirmation
      fireEvent.click(screen.getByText('삭제'));

      // Confirm deletion
      const confirmButtons = screen.getAllByText('삭제');
      const confirmButton = confirmButtons.find(button =>
        button.closest('.alert-error')
      );
      fireEvent.click(confirmButton!);

      await waitFor(() => {
        expect(mockApiClient.deleteTrip).toHaveBeenCalledWith('1');
        expect(mockOnDelete).toHaveBeenCalled();
      });
    });

    it('should handle delete error gracefully', async () => {
      mockApiClient.deleteTrip.mockRejectedValueOnce(
        new Error('Delete failed')
      );

      render(
        <TripCard trip={mockTrip} onEdit={mockOnEdit} onDelete={mockOnDelete} />
      );

      // Show confirmation
      fireEvent.click(screen.getByText('삭제'));

      // Confirm deletion
      const confirmButtons = screen.getAllByText('삭제');
      const confirmButton = confirmButtons.find(button =>
        button.closest('.alert-error')
      );
      fireEvent.click(confirmButton!);

      await waitFor(() => {
        expect(mockApiClient.deleteTrip).toHaveBeenCalledWith('1');
        // onDelete should not be called on error
        expect(mockOnDelete).not.toHaveBeenCalled();
      });
    });

    it('should show loading state during deletion', async () => {
      let resolveDelete: () => void;
      const deletePromise = new Promise<void>(resolve => {
        resolveDelete = resolve;
      });
      mockApiClient.deleteTrip.mockReturnValueOnce(deletePromise);

      render(
        <TripCard trip={mockTrip} onEdit={mockOnEdit} onDelete={mockOnDelete} />
      );

      // Show confirmation
      fireEvent.click(screen.getByText('삭제'));

      // Confirm deletion
      const confirmButtons = screen.getAllByText('삭제');
      const confirmButton = confirmButtons.find(button =>
        button.closest('.alert-error')
      );
      fireEvent.click(confirmButton!);

      // Should show loading state
      expect(screen.getByText('삭제 중...')).toBeInTheDocument();

      // Resolve the promise
      resolveDelete!();
      await waitFor(() => {
        expect(mockOnDelete).toHaveBeenCalled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle trip without notes', () => {
      const tripWithoutNotes = { ...mockTrip, notes: undefined };
      render(
        <TripCard
          trip={tripWithoutNotes}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByText('Great vacation!')).not.toBeInTheDocument();
    });

    it('should handle unknown country gracefully', () => {
      const unknownCountryTrip = { ...mockTrip, country: 'Unknown Country' };
      render(
        <TripCard
          trip={unknownCountryTrip}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('🌍 Unknown Country')).toBeInTheDocument();
    });

    it('should handle very long stay durations', () => {
      const longTrip = {
        ...mockTrip,
        entryDate: '2023-01-01T00:00:00Z',
        exitDate: '2024-12-31T00:00:00Z',
        maxDays: 365,
      };
      render(
        <TripCard trip={longTrip} onEdit={mockOnEdit} onDelete={mockOnDelete} />
      );

      expect(screen.getByText('730일')).toBeInTheDocument();
      expect(screen.getByText('/ 365일')).toBeInTheDocument();
    });

    it('should handle zero maxDays gracefully', () => {
      const zeroMaxDaysTrip = { ...mockTrip, maxDays: 0 };
      render(
        <TripCard
          trip={zeroMaxDaysTrip}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Should not crash and show infinity or NaN
      expect(screen.getByText('/ 0일')).toBeInTheDocument();
    });
  });
});
