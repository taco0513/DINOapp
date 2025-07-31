import {
  addDays,
  differenceInDays,
  format,
  isAfter,
  isBefore,
  isValid,
  parseISO,
} from 'date-fns';
import { ko } from 'date-fns/locale';

// Date utility functions that would be in lib/date-utils.ts
const _formatDate = (
  date: Date | string,
  formatString: string = 'yyyy-MM-dd'
): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString);
};

const _formatDateKorean = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy년 MM월 dd일', { locale: ko });
};

const _getDaysBetween = (
  startDate: Date | string,
  endDate: Date | string
): number => {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  return differenceInDays(end, start);
};

const _addDaysToDate = (date: Date | string, days: number): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return addDays(dateObj, days);
};

const _isDateInRange = (
  date: Date | string,
  startDate: Date | string,
  endDate: Date | string
): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;

  return !isBefore(dateObj, start) && !isAfter(dateObj, end);
};

const _getDateRangeOverlap = (
  range1Start: Date | string,
  range1End: Date | string,
  range2Start: Date | string,
  range2End: Date | string
): number => {
  const r1Start =
    typeof range1Start === 'string' ? parseISO(range1Start) : range1Start;
  const r1End = typeof range1End === 'string' ? parseISO(range1End) : range1End;
  const r2Start =
    typeof range2Start === 'string' ? parseISO(range2Start) : range2Start;
  const r2End = typeof range2End === 'string' ? parseISO(range2End) : range2End;

  // No overlap if one range ends before the other starts
  if (isBefore(r1End, r2Start) || isBefore(r2End, r1Start)) {
    return 0;
  }

  // Calculate overlap
  const overlapStart = isAfter(r1Start, r2Start) ? r1Start : r2Start;
  const overlapEnd = isBefore(r1End, r2End) ? r1End : r2End;

  return getDaysBetween(overlapStart, overlapEnd) + 1;
};

const _getSchengenWindow = (
  referenceDate: Date | string = new Date()
): { start: Date; end: Date } => {
  const end =
    typeof referenceDate === 'string' ? parseISO(referenceDate) : referenceDate;
  const start = addDays(end, -179); // 180 days including today

  return { start, end };
};

const _isDateValid = (dateString: string): boolean => {
  try {
    const date = parseISO(dateString);
    return isValid(date) && dateString === format(date, 'yyyy-MM-dd');
  } catch {
    return false;
  }
};

describe('Date Utilities', () => {
  describe('formatDate', () => {
    it('should format dates correctly', () => {
      expect(formatDate(new Date('2024-06-01'))).toBe('2024-06-01');
      expect(formatDate('2024-06-01')).toBe('2024-06-01');
      expect(formatDate(new Date('2024-12-31'))).toBe('2024-12-31');
    });

    it('should format with custom format string', () => {
      expect(formatDate('2024-06-01', 'MM/dd/yyyy')).toBe('06/01/2024');
      expect(formatDate('2024-06-01', 'dd-MM-yyyy')).toBe('01-06-2024');
      expect(formatDate('2024-06-01', 'MMMM d, yyyy')).toBe('June 1, 2024');
    });
  });

  describe('formatDateKorean', () => {
    it('should format dates in Korean', () => {
      expect(formatDateKorean('2024-06-01')).toBe('2024년 06월 01일');
      expect(formatDateKorean('2024-01-01')).toBe('2024년 01월 01일');
      expect(formatDateKorean('2024-12-31')).toBe('2024년 12월 31일');
    });
  });

  describe('getDaysBetween', () => {
    it('should calculate days between dates correctly', () => {
      expect(getDaysBetween('2024-06-01', '2024-06-15')).toBe(14);
      expect(getDaysBetween('2024-06-01', '2024-06-01')).toBe(0);
      expect(getDaysBetween('2024-01-01', '2024-12-31')).toBe(365); // 2024 is a leap year
    });

    it('should handle Date objects', () => {
      const start = new Date('2024-06-01');
      const end = new Date('2024-06-10');
      expect(getDaysBetween(start, end)).toBe(9);
    });

    it('should return negative values for reversed dates', () => {
      expect(getDaysBetween('2024-06-15', '2024-06-01')).toBe(-14);
    });
  });

  describe('addDaysToDate', () => {
    it('should add days correctly', () => {
      const result = addDaysToDate('2024-06-01', 10);
      expect(formatDate(result)).toBe('2024-06-11');
    });

    it('should handle negative days', () => {
      const result = addDaysToDate('2024-06-01', -10);
      expect(formatDate(result)).toBe('2024-05-22');
    });

    it('should handle month boundaries', () => {
      const result = addDaysToDate('2024-06-30', 1);
      expect(formatDate(result)).toBe('2024-07-01');
    });

    it('should handle year boundaries', () => {
      const result = addDaysToDate('2024-12-31', 1);
      expect(formatDate(result)).toBe('2025-01-01');
    });
  });

  describe('isDateInRange', () => {
    it('should check if date is in range', () => {
      expect(isDateInRange('2024-06-15', '2024-06-01', '2024-06-30')).toBe(
        true
      );
      expect(isDateInRange('2024-06-01', '2024-06-01', '2024-06-30')).toBe(
        true
      );
      expect(isDateInRange('2024-06-30', '2024-06-01', '2024-06-30')).toBe(
        true
      );
    });

    it('should return false for dates outside range', () => {
      expect(isDateInRange('2024-05-31', '2024-06-01', '2024-06-30')).toBe(
        false
      );
      expect(isDateInRange('2024-07-01', '2024-06-01', '2024-06-30')).toBe(
        false
      );
    });
  });

  describe('getDateRangeOverlap', () => {
    it('should calculate overlap correctly', () => {
      // Complete overlap
      expect(
        getDateRangeOverlap(
          '2024-06-01',
          '2024-06-10',
          '2024-06-01',
          '2024-06-10'
        )
      ).toBe(10);

      // Partial overlap
      expect(
        getDateRangeOverlap(
          '2024-06-01',
          '2024-06-10',
          '2024-06-05',
          '2024-06-15'
        )
      ).toBe(6);

      // One range inside another
      expect(
        getDateRangeOverlap(
          '2024-06-01',
          '2024-06-30',
          '2024-06-10',
          '2024-06-20'
        )
      ).toBe(11);
    });

    it('should return 0 for non-overlapping ranges', () => {
      expect(
        getDateRangeOverlap(
          '2024-06-01',
          '2024-06-10',
          '2024-06-11',
          '2024-06-20'
        )
      ).toBe(0);
      expect(
        getDateRangeOverlap(
          '2024-06-11',
          '2024-06-20',
          '2024-06-01',
          '2024-06-10'
        )
      ).toBe(0);
    });

    it('should handle touching ranges', () => {
      // Ranges that touch at boundaries
      expect(
        getDateRangeOverlap(
          '2024-06-01',
          '2024-06-10',
          '2024-06-10',
          '2024-06-20'
        )
      ).toBe(1);
    });
  });

  describe('getSchengenWindow', () => {
    it('should calculate 180-day window correctly', () => {
      const referenceDate = '2024-06-01';
      const window = getSchengenWindow(referenceDate);

      expect(formatDate(window.start)).toBe('2023-12-05'); // 179 days before June 1
      expect(formatDate(window.end)).toBe('2024-06-01');

      // Verify it's exactly 180 days
      expect(getDaysBetween(window.start, window.end)).toBe(179); // 180 days including both ends
    });

    it('should use current date if no reference provided', () => {
      const window = getSchengenWindow();
      const today = new Date();

      expect(formatDate(window.end)).toBe(formatDate(today));
    });
  });

  describe('isDateValid', () => {
    it('should validate correct date strings', () => {
      expect(isDateValid('2024-06-01')).toBe(true);
      expect(isDateValid('2024-02-29')).toBe(true); // Leap year
      expect(isDateValid('2023-12-31')).toBe(true);
    });

    it('should reject invalid date strings', () => {
      expect(isDateValid('2024-13-01')).toBe(false); // Invalid month
      expect(isDateValid('2024-06-32')).toBe(false); // Invalid day
      expect(isDateValid('2023-02-29')).toBe(false); // Not a leap year
      expect(isDateValid('not-a-date')).toBe(false);
      expect(isDateValid('2024/06/01')).toBe(false); // Wrong format
      expect(isDateValid('')).toBe(false);
    });
  });

  describe('Real-world Schengen Calculations', () => {
    it('should handle multiple trips in 180-day window', () => {
      const trips = [
        { entry: '2024-01-15', exit: '2024-01-25' }, // 11 days
        { entry: '2024-03-01', exit: '2024-03-10' }, // 10 days
        { entry: '2024-05-20', exit: '2024-06-01' }, // 13 days
      ];

      const referenceDate = '2024-06-01';
      const window = getSchengenWindow(referenceDate);

      const totalDays = trips.reduce((sum, trip) => {
        if (isDateInRange(trip.entry, window.start, window.end)) {
          return sum + getDaysBetween(trip.entry, trip.exit) + 1;
        }
        return sum;
      }, 0);

      expect(totalDays).toBe(34); // All trips are within window
    });

    it('should handle trips partially in window', () => {
      const referenceDate = '2024-06-01';
      const window = getSchengenWindow(referenceDate);

      // Trip that starts before window but ends inside
      const tripStart = '2023-12-01';
      const tripEnd = '2023-12-10';

      const overlap = getDateRangeOverlap(
        tripStart,
        tripEnd,
        formatDate(window.start),
        formatDate(window.end)
      );

      expect(overlap).toBe(6); // Dec 5-10 (6 days)
    });
  });
});
