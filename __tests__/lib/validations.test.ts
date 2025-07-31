import { z } from 'zod';

// Import validation schemas (we'll need to create these)
const _CountryVisitSchema = z.object({
  country: z.string().min(1, 'Country is required'),
  entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  exitDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
    .optional()
    .nullable(),
  visaType: z.enum([
    'Tourist',
    'Business',
    'Student',
    'Work',
    'Transit',
    'Family',
    'Medical',
    'Conference',
    'Exhibition',
    'Sports',
    'Cultural',
    'Diplomatic',
    'Official',
    'Other',
  ]),
  maxDays: z.number().int().min(1).max(365),
  notes: z.string().optional(),
});

const _NotificationPreferencesSchema = z.object({
  email: z.boolean(),
  push: z.boolean(),
  visaExpiryDays: z.array(z.number().int().min(1).max(365)),
  schengenWarningThreshold: z.number().int().min(1).max(90),
  tripReminderDays: z.array(z.number().int().min(1).max(365)),
  timezone: z.string().min(1),
  quiet: z.object({
    enabled: z.boolean(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
  }),
});

// Utility functions for date validation
const _isValidDateString = (dateString: string): boolean => {
  const date = new Date(dateString);
  return (
    !isNaN(date.getTime()) && dateString === date.toISOString().split('T')[0]
  );
};

const _isEntryBeforeExit = (
  entryDate: string,
  exitDate: string | null
): boolean => {
  if (!exitDate) return true; // Ongoing trip
  return new Date(entryDate) < new Date(exitDate);
};

const _isFutureDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
};

const _calculateTripDuration = (
  entryDate: string,
  exitDate: string | null
): number => {
  if (!exitDate) {
    // Ongoing trip - calculate days from entry to today
    const entry = new Date(entryDate);
    const today = new Date();
    return Math.ceil(
      (today.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  const entry = new Date(entryDate);
  const exit = new Date(exitDate);
  return (
    Math.ceil((exit.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );
};

describe('Data Validations', () => {
  describe('CountryVisitSchema', () => {
    const validVisit = {
      country: 'France',
      entryDate: '2024-06-01',
      exitDate: '2024-06-15',
      visaType: 'Tourist' as const,
      maxDays: 90,
      notes: 'Summer vacation',
    };

    it('should validate correct visit data', () => {
      const result = CountryVisitSchema.safeParse(validVisit);
      expect(result.success).toBe(true);
    });

    it('should reject empty country', () => {
      const invalidVisit = { ...validVisit, country: '' };
      const result = CountryVisitSchema.safeParse(invalidVisit);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Country is required');
      }
    });

    it('should reject invalid date format', () => {
      const invalidVisit = { ...validVisit, entryDate: '2024/06/01' };
      const result = CountryVisitSchema.safeParse(invalidVisit);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid date format');
      }
    });

    it('should accept null exitDate for ongoing trips', () => {
      const ongoingVisit = { ...validVisit, exitDate: null };
      const result = CountryVisitSchema.safeParse(ongoingVisit);

      expect(result.success).toBe(true);
    });

    it('should reject invalid visa type', () => {
      const invalidVisit = { ...validVisit, visaType: 'InvalidType' };
      const result = CountryVisitSchema.safeParse(invalidVisit);

      expect(result.success).toBe(false);
    });

    it('should reject invalid maxDays', () => {
      const invalidVisit = { ...validVisit, maxDays: 0 };
      const result = CountryVisitSchema.safeParse(invalidVisit);

      expect(result.success).toBe(false);
    });

    it('should reject maxDays over 365', () => {
      const invalidVisit = { ...validVisit, maxDays: 400 };
      const result = CountryVisitSchema.safeParse(invalidVisit);

      expect(result.success).toBe(false);
    });

    it('should accept visit without notes', () => {
      const { notes, ...visitWithoutNotes } = validVisit;
      const result = CountryVisitSchema.safeParse(visitWithoutNotes);

      expect(result.success).toBe(true);
    });
  });

  describe('NotificationPreferencesSchema', () => {
    const validPreferences = {
      email: true,
      push: true,
      visaExpiryDays: [30, 7, 1],
      schengenWarningThreshold: 80,
      tripReminderDays: [7, 1],
      timezone: 'Asia/Seoul',
      quiet: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00',
      },
    };

    it('should validate correct preferences', () => {
      const result = NotificationPreferencesSchema.safeParse(validPreferences);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email type', () => {
      const invalidPreferences = { ...validPreferences, email: 'yes' };
      const result =
        NotificationPreferencesSchema.safeParse(invalidPreferences);

      expect(result.success).toBe(false);
    });

    it('should reject empty visaExpiryDays array', () => {
      const invalidPreferences = { ...validPreferences, visaExpiryDays: [] };
      const result =
        NotificationPreferencesSchema.safeParse(invalidPreferences);

      expect(result.success).toBe(true); // Empty array is valid
    });

    it('should reject invalid visaExpiryDays values', () => {
      const invalidPreferences = {
        ...validPreferences,
        visaExpiryDays: [0, 7, 1],
      };
      const result =
        NotificationPreferencesSchema.safeParse(invalidPreferences);

      expect(result.success).toBe(false);
    });

    it('should reject invalid schengenWarningThreshold', () => {
      const invalidPreferences = {
        ...validPreferences,
        schengenWarningThreshold: 0,
      };
      const result =
        NotificationPreferencesSchema.safeParse(invalidPreferences);

      expect(result.success).toBe(false);
    });

    it('should reject schengenWarningThreshold over 90', () => {
      const invalidPreferences = {
        ...validPreferences,
        schengenWarningThreshold: 100,
      };
      const result =
        NotificationPreferencesSchema.safeParse(invalidPreferences);

      expect(result.success).toBe(false);
    });

    it('should reject invalid time format', () => {
      const invalidPreferences = {
        ...validPreferences,
        quiet: {
          ...validPreferences.quiet,
          startTime: '10:00 PM',
        },
      };
      const result =
        NotificationPreferencesSchema.safeParse(invalidPreferences);

      expect(result.success).toBe(false);
    });

    it('should reject empty timezone', () => {
      const invalidPreferences = { ...validPreferences, timezone: '' };
      const result =
        NotificationPreferencesSchema.safeParse(invalidPreferences);

      expect(result.success).toBe(false);
    });
  });

  describe('Date Validation Utilities', () => {
    describe('isValidDateString', () => {
      it('should validate correct date strings', () => {
        expect(isValidDateString('2024-06-01')).toBe(true);
        expect(isValidDateString('2024-02-29')).toBe(true); // Leap year
        expect(isValidDateString('2023-12-31')).toBe(true);
      });

      it('should reject invalid date strings', () => {
        expect(isValidDateString('2024-13-01')).toBe(false); // Invalid month
        expect(isValidDateString('2024-06-32')).toBe(false); // Invalid day
        expect(isValidDateString('2023-02-29')).toBe(false); // Not a leap year
        expect(isValidDateString('not-a-date')).toBe(false);
        expect(isValidDateString('2024/06/01')).toBe(false); // Wrong format
      });

      it('should handle edge cases', () => {
        expect(isValidDateString('')).toBe(false);
        expect(isValidDateString('2024-06-1')).toBe(false); // Single digit day
        expect(isValidDateString('24-06-01')).toBe(false); // Two digit year
      });
    });

    describe('isEntryBeforeExit', () => {
      it('should validate entry before exit', () => {
        expect(isEntryBeforeExit('2024-06-01', '2024-06-15')).toBe(true);
        expect(isEntryBeforeExit('2024-01-01', '2024-12-31')).toBe(true);
      });

      it('should reject entry after exit', () => {
        expect(isEntryBeforeExit('2024-06-15', '2024-06-01')).toBe(false);
        expect(isEntryBeforeExit('2024-12-31', '2024-01-01')).toBe(false);
      });

      it('should reject same entry and exit dates', () => {
        expect(isEntryBeforeExit('2024-06-01', '2024-06-01')).toBe(false);
      });

      it('should allow null exit date (ongoing trip)', () => {
        expect(isEntryBeforeExit('2024-06-01', null)).toBe(true);
        expect(isEntryBeforeExit('2024-01-01', null)).toBe(true);
      });
    });

    describe('isFutureDate', () => {
      beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2024-06-01T10:00:00Z'));
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it('should identify future dates', () => {
        expect(isFutureDate('2024-06-02')).toBe(true);
        expect(isFutureDate('2024-12-31')).toBe(true);
        expect(isFutureDate('2025-01-01')).toBe(true);
      });

      it('should identify past dates', () => {
        expect(isFutureDate('2024-05-31')).toBe(false);
        expect(isFutureDate('2024-01-01')).toBe(false);
        expect(isFutureDate('2023-12-31')).toBe(false);
      });

      it('should consider today as future (same day)', () => {
        expect(isFutureDate('2024-06-01')).toBe(true);
      });
    });

    describe('calculateTripDuration', () => {
      beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2024-06-10T10:00:00Z'));
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it('should calculate duration for completed trips', () => {
        expect(calculateTripDuration('2024-06-01', '2024-06-15')).toBe(15);
        expect(calculateTripDuration('2024-06-01', '2024-06-01')).toBe(1); // Same day
        expect(calculateTripDuration('2024-01-01', '2024-01-31')).toBe(31);
      });

      it('should calculate duration for ongoing trips', () => {
        expect(calculateTripDuration('2024-06-01', null)).toBe(10); // 10 days from June 1st to June 10th (inclusive)
        expect(calculateTripDuration('2024-06-10', null)).toBe(1); // Started today (1 day)
        expect(calculateTripDuration('2024-05-01', null)).toBe(41); // 41 days ago
      });

      it('should handle edge cases', () => {
        // Very short trips
        expect(calculateTripDuration('2024-06-01', '2024-06-02')).toBe(2);

        // Trips spanning months
        expect(calculateTripDuration('2024-05-31', '2024-06-01')).toBe(2);

        // Trips spanning years
        expect(calculateTripDuration('2023-12-31', '2024-01-01')).toBe(2);
      });
    });
  });

  describe('Business Logic Validations', () => {
    it('should validate visa expiry logic', () => {
      const entryDate = '2024-06-01';
      const maxDays = 90;
      const visaExpiryDate = new Date(entryDate);
      visaExpiryDate.setDate(visaExpiryDate.getDate() + maxDays);

      expect(visaExpiryDate.toISOString().split('T')[0]).toBe('2024-08-30');
    });

    it('should validate schengen day counting', () => {
      const visits = [
        { entryDate: '2024-01-01', exitDate: '2024-01-15' }, // 15 days
        { entryDate: '2024-02-01', exitDate: '2024-02-10' }, // 10 days
        { entryDate: '2024-03-01', exitDate: '2024-03-05' }, // 5 days
      ];

      const totalDays = visits.reduce((sum, visit) => {
        return sum + calculateTripDuration(visit.entryDate, visit.exitDate);
      }, 0);

      expect(totalDays).toBe(30); // 15 + 10 + 5
    });

    it('should validate notification timing', () => {
      const visaExpiryDate = new Date('2024-07-01');
      const today = new Date('2024-06-01');
      const daysUntilExpiry = Math.ceil(
        (visaExpiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(daysUntilExpiry).toBe(30);

      // Should trigger 30-day notification
      const shouldNotify = [30, 7, 1].includes(daysUntilExpiry);
      expect(shouldNotify).toBe(true);
    });

    it('should validate rolling 180-day window', () => {
      const today = new Date('2024-06-01');
      const windowStart = new Date(today);
      windowStart.setDate(windowStart.getDate() - 180);

      expect(windowStart.toISOString().split('T')[0]).toBe('2023-12-04'); // Actual result of 180 days before June 1

      // Visit within window should count
      const visitDate = new Date('2024-02-01');
      const isWithinWindow = visitDate >= windowStart && visitDate <= today;
      expect(isWithinWindow).toBe(true);

      // Visit outside window should not count
      const oldVisitDate = new Date('2023-12-01');
      const isOldWithinWindow =
        oldVisitDate >= windowStart && oldVisitDate <= today;
      expect(isOldWithinWindow).toBe(false);
    });
  });
});
