import {
  AlertManager,
  Alert,
  AlertLevel,
  AlertChannel,
  AlertConfig,
  AlertRule,
  AlertStatus,
} from '@/lib/monitoring/alerts-v2';

// Mock notification channels
const mockEmailChannel = {
  send: jest.fn().mockResolvedValue(true),
  type: 'email' as const,
};

const mockSlackChannel = {
  send: jest.fn().mockResolvedValue(true),
  type: 'slack' as const,
};

const mockWebhookChannel = {
  send: jest.fn().mockResolvedValue(true),
  type: 'webhook' as const,
};

describe('AlertManager', () => {
  let alertManager: AlertManager;
  let config: AlertConfig;

  beforeEach(() => {
    jest.clearAllMocks();

    config = {
      channels: {
        email: mockEmailChannel,
        slack: mockSlackChannel,
        webhook: mockWebhookChannel,
      },
      defaultChannel: 'email',
      rules: [
        {
          name: 'High Error Rate',
          condition: metrics => metrics.errorRate > 0.05,
          level: AlertLevel.ERROR,
          channels: ['email', 'slack'],
          cooldown: 300000, // 5 minutes
        },
        {
          name: 'Critical System Down',
          condition: metrics => metrics.systemUp === false,
          level: AlertLevel.CRITICAL,
          channels: ['email', 'slack', 'webhook'],
          cooldown: 60000, // 1 minute
        },
      ],
    };

    alertManager = new AlertManager(config);
  });

  describe('Alert creation and sending', () => {
    it('should send alert to default channel', async () => {
      const alert: Alert = {
        id: 'test-1',
        title: 'Test Alert',
        message: 'This is a test alert',
        level: AlertLevel.INFO,
        timestamp: new Date(),
        status: AlertStatus.NEW,
      };

      await alertManager.send(alert);

      expect(mockEmailChannel.send).toHaveBeenCalledWith(alert);
      expect(mockSlackChannel.send).not.toHaveBeenCalled();
    });

    it('should send alert to multiple channels', async () => {
      const alert: Alert = {
        id: 'test-2',
        title: 'Multi-channel Alert',
        message: 'Alert for multiple channels',
        level: AlertLevel.WARNING,
        timestamp: new Date(),
        channels: ['email', 'slack'],
        status: AlertStatus.NEW,
      };

      await alertManager.send(alert);

      expect(mockEmailChannel.send).toHaveBeenCalledWith(alert);
      expect(mockSlackChannel.send).toHaveBeenCalledWith(alert);
      expect(mockWebhookChannel.send).not.toHaveBeenCalled();
    });

    it('should handle channel send failures gracefully', async () => {
      mockEmailChannel.send.mockRejectedValueOnce(new Error('Email failed'));

      const alert: Alert = {
        id: 'test-3',
        title: 'Failing Alert',
        message: 'This alert will fail on email',
        level: AlertLevel.ERROR,
        timestamp: new Date(),
        channels: ['email', 'slack'],
        status: AlertStatus.NEW,
      };

      await alertManager.send(alert);

      // Should still send to other channels
      expect(mockSlackChannel.send).toHaveBeenCalledWith(alert);
    });

    it('should include metadata in alerts', async () => {
      const alert: Alert = {
        id: 'test-4',
        title: 'Alert with Metadata',
        message: 'Contains additional data',
        level: AlertLevel.WARNING,
        timestamp: new Date(),
        metadata: {
          server: 'api-01',
          region: 'us-east-1',
          errorCount: 150,
        },
        status: AlertStatus.NEW,
      };

      await alertManager.send(alert);

      expect(mockEmailChannel.send).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            server: 'api-01',
            errorCount: 150,
          }),
        })
      );
    });
  });

  describe('Alert rules evaluation', () => {
    it('should trigger alert when rule condition is met', async () => {
      const metrics = {
        errorRate: 0.08, // Above 5% threshold
        responseTime: 200,
        systemUp: true,
      };

      await alertManager.evaluate(metrics);

      expect(mockEmailChannel.send).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'High Error Rate',
          level: AlertLevel.ERROR,
        })
      );
      expect(mockSlackChannel.send).toHaveBeenCalled();
    });

    it('should trigger critical alert immediately', async () => {
      const metrics = {
        errorRate: 0.02,
        responseTime: 100,
        systemUp: false, // System is down
      };

      await alertManager.evaluate(metrics);

      // Should send to all three channels
      expect(mockEmailChannel.send).toHaveBeenCalled();
      expect(mockSlackChannel.send).toHaveBeenCalled();
      expect(mockWebhookChannel.send).toHaveBeenCalled();

      const sentAlert = mockEmailChannel.send.mock.calls[0][0];
      expect(sentAlert.level).toBe(AlertLevel.CRITICAL);
      expect(sentAlert.title).toBe('Critical System Down');
    });

    it('should not trigger alert when conditions are not met', async () => {
      const metrics = {
        errorRate: 0.01, // Below threshold
        responseTime: 100,
        systemUp: true,
      };

      await alertManager.evaluate(metrics);

      expect(mockEmailChannel.send).not.toHaveBeenCalled();
      expect(mockSlackChannel.send).not.toHaveBeenCalled();
      expect(mockWebhookChannel.send).not.toHaveBeenCalled();
    });

    it('should respect cooldown period', async () => {
      const metrics = {
        errorRate: 0.08, // Trigger condition
        responseTime: 200,
        systemUp: true,
      };

      // First evaluation - should trigger
      await alertManager.evaluate(metrics);
      expect(mockEmailChannel.send).toHaveBeenCalledTimes(1);

      // Second evaluation immediately after - should not trigger
      await alertManager.evaluate(metrics);
      expect(mockEmailChannel.send).toHaveBeenCalledTimes(1);

      // Fast forward past cooldown
      jest.advanceTimersByTime(300001);

      // Third evaluation - should trigger again
      await alertManager.evaluate(metrics);
      expect(mockEmailChannel.send).toHaveBeenCalledTimes(2);
    });
  });

  describe('Alert levels and priorities', () => {
    it('should handle different alert levels appropriately', async () => {
      const levels = [
        AlertLevel.DEBUG,
        AlertLevel.INFO,
        AlertLevel.WARNING,
        AlertLevel.ERROR,
        AlertLevel.CRITICAL,
      ];

      for (const level of levels) {
        const alert: Alert = {
          id: `level-${level}`,
          title: `${level} Alert`,
          message: `Alert with ${level} level`,
          level,
          timestamp: new Date(),
          status: AlertStatus.NEW,
        };

        await alertManager.send(alert);
      }

      expect(mockEmailChannel.send).toHaveBeenCalledTimes(levels.length);
    });

    it('should filter alerts by minimum level', async () => {
      const filteringManager = new AlertManager({
        ...config,
        minimumLevel: AlertLevel.WARNING,
      });

      // Send INFO alert - should be filtered
      await filteringManager.send({
        id: 'info-1',
        title: 'Info Alert',
        message: 'This should be filtered',
        level: AlertLevel.INFO,
        timestamp: new Date(),
        status: AlertStatus.NEW,
      });

      expect(mockEmailChannel.send).not.toHaveBeenCalled();

      // Send WARNING alert - should pass
      await filteringManager.send({
        id: 'warning-1',
        title: 'Warning Alert',
        message: 'This should pass',
        level: AlertLevel.WARNING,
        timestamp: new Date(),
        status: AlertStatus.NEW,
      });

      expect(mockEmailChannel.send).toHaveBeenCalledTimes(1);
    });
  });

  describe('Alert history and status', () => {
    it('should track alert history', async () => {
      const alert: Alert = {
        id: 'history-1',
        title: 'Historical Alert',
        message: 'This alert will be tracked',
        level: AlertLevel.WARNING,
        timestamp: new Date(),
        status: AlertStatus.NEW,
      };

      await alertManager.send(alert);

      const history = alertManager.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].id).toBe('history-1');
    });

    it('should update alert status', async () => {
      const alert: Alert = {
        id: 'status-1',
        title: 'Status Alert',
        message: 'Alert with status tracking',
        level: AlertLevel.ERROR,
        timestamp: new Date(),
        status: AlertStatus.NEW,
      };

      await alertManager.send(alert);

      // Acknowledge the alert
      await alertManager.acknowledge('status-1', 'user-123');

      const acknowledged = alertManager.getAlert('status-1');
      expect(acknowledged?.status).toBe(AlertStatus.ACKNOWLEDGED);
      expect(acknowledged?.acknowledgedBy).toBe('user-123');
      expect(acknowledged?.acknowledgedAt).toBeDefined();
    });

    it('should resolve alerts', async () => {
      const alert: Alert = {
        id: 'resolve-1',
        title: 'Resolvable Alert',
        message: 'This alert will be resolved',
        level: AlertLevel.ERROR,
        timestamp: new Date(),
        status: AlertStatus.NEW,
      };

      await alertManager.send(alert);
      await alertManager.resolve('resolve-1', 'Issue was fixed');

      const resolved = alertManager.getAlert('resolve-1');
      expect(resolved?.status).toBe(AlertStatus.RESOLVED);
      expect(resolved?.resolution).toBe('Issue was fixed');
      expect(resolved?.resolvedAt).toBeDefined();
    });

    it('should limit history size', async () => {
      const historyManager = new AlertManager({
        ...config,
        maxHistorySize: 5,
      });

      // Send 10 alerts
      for (let i = 0; i < 10; i++) {
        await historyManager.send({
          id: `history-${i}`,
          title: `Alert ${i}`,
          message: 'Test',
          level: AlertLevel.INFO,
          timestamp: new Date(),
          status: AlertStatus.NEW,
        });
      }

      const history = historyManager.getHistory();
      expect(history).toHaveLength(5);
      // Should keep the most recent alerts
      expect(history[0].id).toBe('history-5');
      expect(history[4].id).toBe('history-9');
    });
  });

  describe('Alert grouping and deduplication', () => {
    it('should group similar alerts', async () => {
      const groupingManager = new AlertManager({
        ...config,
        groupingSimilarAlerts: true,
        groupingWindow: 60000, // 1 minute
      });

      // Send similar alerts
      for (let i = 0; i < 5; i++) {
        await groupingManager.send({
          id: `similar-${i}`,
          title: 'Database Connection Error',
          message: 'Failed to connect to database',
          level: AlertLevel.ERROR,
          timestamp: new Date(),
          groupKey: 'db-connection-error',
          status: AlertStatus.NEW,
        });
      }

      // Should send only one grouped alert
      expect(mockEmailChannel.send).toHaveBeenCalledTimes(1);
      const sentAlert = mockEmailChannel.send.mock.calls[0][0];
      expect(sentAlert.metadata?.count).toBe(5);
    });

    it('should deduplicate identical alerts', async () => {
      const dedupeManager = new AlertManager({
        ...config,
        deduplication: true,
        deduplicationWindow: 300000, // 5 minutes
      });

      const alert: Alert = {
        id: 'dedupe-1',
        title: 'Duplicate Alert',
        message: 'This is a duplicate',
        level: AlertLevel.WARNING,
        timestamp: new Date(),
        deduplicationKey: 'duplicate-key',
        status: AlertStatus.NEW,
      };

      // Send the same alert multiple times
      await dedupeManager.send(alert);
      await dedupeManager.send({ ...alert, id: 'dedupe-2' });
      await dedupeManager.send({ ...alert, id: 'dedupe-3' });

      // Should only send once
      expect(mockEmailChannel.send).toHaveBeenCalledTimes(1);
    });
  });

  describe('Custom alert handlers', () => {
    it('should support custom alert handlers', async () => {
      const customHandler = jest.fn();

      const customManager = new AlertManager({
        ...config,
        customHandlers: [
          {
            name: 'custom-handler',
            handler: customHandler,
            filter: alert => alert.level >= AlertLevel.ERROR,
          },
        ],
      });

      // Send INFO alert - should not trigger custom handler
      await customManager.send({
        id: 'custom-1',
        title: 'Info Alert',
        message: 'Low priority',
        level: AlertLevel.INFO,
        timestamp: new Date(),
        status: AlertStatus.NEW,
      });

      expect(customHandler).not.toHaveBeenCalled();

      // Send ERROR alert - should trigger custom handler
      await customManager.send({
        id: 'custom-2',
        title: 'Error Alert',
        message: 'High priority',
        level: AlertLevel.ERROR,
        timestamp: new Date(),
        status: AlertStatus.NEW,
      });

      expect(customHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'custom-2',
          level: AlertLevel.ERROR,
        })
      );
    });
  });

  describe('Performance and resource management', () => {
    it('should handle high volume of alerts efficiently', async () => {
      const startTime = Date.now();

      // Send 1000 alerts
      const promises = [];
      for (let i = 0; i < 1000; i++) {
        promises.push(
          alertManager.send({
            id: `perf-${i}`,
            title: `Performance Alert ${i}`,
            message: 'Testing high volume',
            level: AlertLevel.INFO,
            timestamp: new Date(),
            status: AlertStatus.NEW,
          })
        );
      }

      await Promise.all(promises);
      const duration = Date.now() - startTime;

      // Should complete within reasonable time
      expect(duration).toBeLessThan(1000); // 1 second for 1000 alerts
      expect(mockEmailChannel.send).toHaveBeenCalledTimes(1000);
    });

    it('should clean up old alerts from memory', async () => {
      const cleanupManager = new AlertManager({
        ...config,
        maxHistorySize: 100,
        cleanupInterval: 100, // 100ms for testing
      });

      // Send alerts
      for (let i = 0; i < 150; i++) {
        await cleanupManager.send({
          id: `cleanup-${i}`,
          title: 'Cleanup Test',
          message: 'Test',
          level: AlertLevel.INFO,
          timestamp: new Date(Date.now() - i * 1000), // Older timestamps
          status: AlertStatus.NEW,
        });
      }

      // Wait for cleanup
      await new Promise(resolve => setTimeout(resolve, 200));

      const history = cleanupManager.getHistory();
      expect(history.length).toBeLessThanOrEqual(100);
    });
  });
});
