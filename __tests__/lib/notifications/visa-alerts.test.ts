// Visa Alerts System Tests

import { visaAlerts } from '@/lib/notifications/visa-alerts';

// Mock the alert manager
jest.mock('@/lib/notifications/alert-manager', () => ({
  alertManager: {
    sendAlert: jest.fn().mockResolvedValue(true),
    sendDirectAlert: jest.fn().mockResolvedValue(true),
  },
  systemAlert: {
    warning: jest.fn().mockResolvedValue(true),
    error: jest.fn().mockResolvedValue(true),
  },
}));

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    visa: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

describe('VisaAlerts', () => {
  const mockPrisma = require('@/lib/prisma').prisma;
  const _mockAlertManager = require('@/lib/notifications/alert-manager');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Visa expiry monitoring', () => {
    it('should identify visas expiring soon', async () => {
      const mockVisas = [
        {
          id: 'visa1',
          userId: 'user1',
          countryName: 'France',
          expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          status: 'active',
        },
        {
          id: 'visa2',
          userId: 'user2',
          countryName: 'Germany',
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          status: 'active',
        },
      ];

      mockPrisma.visa.findMany.mockResolvedValue(mockVisas);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user1',
        email: 'test@example.com',
        name: 'Test User',
      });

      await visaAlerts.checkExpiringVisas();

      // Should find expiring visas
      expect(mockPrisma.visa.findMany).toHaveBeenCalledWith({
        where: {
          status: 'active',
          expiryDate: {
            lte: expect.any(Date),
          },
        },
        include: {
          user: true,
        },
      });

      // Should send alerts for expiring visas
      expect(mockAlertManager.alertManager.sendDirectAlert).toHaveBeenCalled();
    });

    it('should categorize alerts by urgency', async () => {
      const urgentVisa = {
        id: 'visa1',
        userId: 'user1',
        countryName: 'Spain',
        expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        status: 'active',
        user: { id: 'user1', email: 'user@test.com', name: 'User' },
      };

      const normalVisa = {
        id: 'visa2',
        userId: 'user2',
        countryName: 'Italy',
        expiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days
        status: 'active',
        user: { id: 'user2', email: 'user2@test.com', name: 'User2' },
      };

      mockPrisma.visa.findMany.mockResolvedValue([urgentVisa, normalVisa]);

      await visaAlerts.checkExpiringVisas();

      // Should prioritize urgent visas differently
      const calls = mockAlertManager.alertManager.sendDirectAlert.mock.calls;
      expect(calls.length).toBeGreaterThan(0);

      // Check that urgent visa alerts have higher priority
      const urgentCall = calls.find(
        call =>
          call[0].title.includes('Spain') && call[0].severity === 'critical'
      );
      expect(urgentCall).toBeDefined();
    });

    it('should handle different visa types', async () => {
      const visas = [
        {
          id: 'visa1',
          userId: 'user1',
          countryName: 'UK',
          type: 'tourist',
          expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          status: 'active',
          user: { id: 'user1', email: 'user@test.com' },
        },
        {
          id: 'visa2',
          userId: 'user1',
          countryName: 'USA',
          type: 'business',
          expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          status: 'active',
          user: { id: 'user1', email: 'user@test.com' },
        },
      ];

      mockPrisma.visa.findMany.mockResolvedValue(visas);

      await visaAlerts.checkExpiringVisas();

      // Should handle different visa types appropriately
      expect(
        mockAlertManager.alertManager.sendDirectAlert
      ).toHaveBeenCalledTimes(2);
    });
  });

  describe('Alert scheduling', () => {
    it('should schedule reminders at different intervals', async () => {
      const visa = {
        id: 'visa1',
        userId: 'user1',
        countryName: 'France',
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        status: 'active',
        user: { id: 'user1', email: 'user@test.com' },
      };

      await visaAlerts.scheduleVisaReminders(visa);

      // Should schedule multiple reminders
      expect(mockAlertManager.alertManager.sendDirectAlert).toHaveBeenCalled();
    });

    it('should not duplicate alerts for same visa', async () => {
      const visa = {
        id: 'visa1',
        userId: 'user1',
        countryName: 'Germany',
        expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: 'active',
        lastAlertSent: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        user: { id: 'user1', email: 'user@test.com' },
      };

      const result = await visaAlerts.shouldSendAlert(visa);

      // Should not send duplicate alerts too soon
      expect(result).toBe(false);
    });

    it('should send alert if enough time has passed', async () => {
      const visa = {
        id: 'visa1',
        userId: 'user1',
        countryName: 'Netherlands',
        expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: 'active',
        lastAlertSent: new Date(Date.now() - 48 * 60 * 60 * 1000), // 48 hours ago
        user: { id: 'user1', email: 'user@test.com' },
      };

      const result = await visaAlerts.shouldSendAlert(visa);

      // Should allow sending alert after cooldown period
      expect(result).toBe(true);
    });
  });

  describe('Alert customization', () => {
    it('should customize alerts based on visa details', async () => {
      const visa = {
        id: 'visa1',
        userId: 'user1',
        countryName: 'Japan',
        type: 'work',
        duration: 90,
        expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'active',
        user: {
          id: 'user1',
          email: 'user@test.com',
          name: 'John Doe',
          preferences: {
            language: 'en',
            timezone: 'UTC',
          },
        },
      };

      await visaAlerts.createCustomAlert(visa);

      // Should create customized alert
      expect(
        mockAlertManager.alertManager.sendDirectAlert
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('Japan'),
          message: expect.stringContaining('work visa'),
          metadata: expect.objectContaining({
            visaId: 'visa1',
            countryName: 'Japan',
            visaType: 'work',
          }),
        })
      );
    });

    it('should include renewal information', async () => {
      const visa = {
        id: 'visa1',
        userId: 'user1',
        countryName: 'Canada',
        type: 'tourist',
        renewalEligible: true,
        renewalDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        status: 'active',
        user: { id: 'user1', email: 'user@test.com' },
      };

      await visaAlerts.createRenewalAlert(visa);

      // Should include renewal information
      expect(
        mockAlertManager.alertManager.sendDirectAlert
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('renewal'),
          metadata: expect.objectContaining({
            renewalEligible: true,
            renewalDeadline: expect.any(Date),
          }),
        })
      );
    });
  });

  describe('Batch processing', () => {
    it('should process multiple users efficiently', async () => {
      const visas = Array.from({ length: 50 }, (_, i) => ({
        id: `visa${i}`,
        userId: `user${i}`,
        countryName: 'Schengen',
        expiryDate: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000),
        status: 'active',
        user: { id: `user${i}`, email: `user${i}@test.com` },
      }));

      mockPrisma.visa.findMany.mockResolvedValue(visas);

      const startTime = Date.now();
      await visaAlerts.checkExpiringVisas();
      const duration = Date.now() - startTime;

      // Should process efficiently
      expect(duration).toBeLessThan(1000); // Under 1 second
      expect(mockAlertManager.alertManager.sendDirectAlert).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockPrisma.visa.findMany.mockRejectedValue(new Error('Database error'));

      // Should not throw
      await expect(visaAlerts.checkExpiringVisas()).resolves.not.toThrow();

      // Should log error
      expect(mockAlertManager.systemAlert.error).toHaveBeenCalledWith(
        expect.stringContaining('Database error'),
        'visa-alerts'
      );
    });
  });

  describe('Alert templates', () => {
    it('should use appropriate templates for different scenarios', async () => {
      const scenarios = [
        {
          visa: {
            id: 'visa1',
            countryName: 'Australia',
            expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            user: { email: 'user@test.com' },
          },
          expectedTemplate: 'visa_urgent',
        },
        {
          visa: {
            id: 'visa2',
            countryName: 'New Zealand',
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            user: { email: 'user@test.com' },
          },
          expectedTemplate: 'visa_reminder',
        },
      ];

      for (const scenario of scenarios) {
        await visaAlerts.sendTemplatedAlert(
          scenario.visa,
          scenario.expectedTemplate
        );
      }

      expect(mockAlertManager.alertManager.sendAlert).toHaveBeenCalledTimes(2);
    });

    it('should support multi-language alerts', async () => {
      const visa = {
        id: 'visa1',
        countryName: '한국',
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        user: {
          email: 'user@test.com',
          preferences: { language: 'ko' },
        },
      };

      await visaAlerts.sendLocalizedAlert(visa, 'ko');

      expect(mockAlertManager.alertManager.sendAlert).toHaveBeenCalledWith(
        'visa_expiry_ko',
        expect.any(Object)
      );
    });
  });

  describe('Integration with travel plans', () => {
    it('should consider upcoming trips when prioritizing alerts', async () => {
      const visa = {
        id: 'visa1',
        userId: 'user1',
        countryName: 'Thailand',
        expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // Expires in 10 days
        status: 'active',
        user: { id: 'user1', email: 'user@test.com' },
      };

      const upcomingTrip = {
        id: 'trip1',
        userId: 'user1',
        destination: 'Thailand',
        departureDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Trip in 15 days
      };

      await visaAlerts.checkVisaForTrip(visa, upcomingTrip);

      // Should prioritize visa that conflicts with trip (visa expires before trip)
      expect(
        mockAlertManager.alertManager.sendDirectAlert
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'critical',
          title: expect.stringContaining('URGENT'),
          metadata: expect.objectContaining({
            hasUpcomingTrip: true,
            tripDepartureDate: upcomingTrip.departureDate,
          }),
        })
      );
    });
  });
});
