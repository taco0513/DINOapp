import { prisma } from '@/lib/prisma';
import { pushNotificationService } from '@/lib/push-notification-service';
import { checkOverstayWarnings } from '@/lib/visa/overstay-checker';
import { differenceInDays, parseISO } from 'date-fns';
import { logger } from '@/lib/logger';

// TODO: Remove unused logger import

export class NotificationScheduler {
  private static instance: NotificationScheduler;
  
  private constructor() {}
  
  static getInstance(): NotificationScheduler {
    if (!NotificationScheduler.instance) {
      NotificationScheduler.instance = new NotificationScheduler();
    }
    return NotificationScheduler.instance;
  }
  
  // Run all scheduled notification checks
  async runScheduledChecks(): Promise<void> {
    logger.info('Running scheduled notification checks...');
    
    try {
      await Promise.all([
        this.checkVisaExpiry(),
        this.checkOverstayWarnings(),
        this.sendStayReminders()
      ]);
      
      logger.info('Scheduled notification checks completed');
    } catch (error) {
      logger.error('Error running scheduled checks:', error);
    }
  }
  
  // Check for visa expiry notifications
  private async checkVisaExpiry(): Promise<void> {
    try {
      // Get all active visas
      const visas = await prisma.visa.findMany({
        where: {
          expiryDate: {
            gte: new Date() // Not expired yet
          }
        },
        include: {
          user: true
        }
      });
      
      for (const visa of visas) {
        const daysUntilExpiry = differenceInDays(
          parseISO(visa.expiryDate.toISOString()),
          new Date()
        );
        
        // Get user's notification settings
        const settings = await prisma.notificationSettings.findUnique({
          where: { userId: visa.userId }
        });
        
        if (!settings || !settings.visaExpiryDays) continue;
        
        // Parse notification days
        const notificationDays = settings.visaExpiryDays
          .split(',')
          .map(d => parseInt(d.trim()));
        
        // Check if we should send notification
        if (notificationDays.includes(daysUntilExpiry)) {
          // Check if notification was already sent
          const existingNotification = await prisma.notification.findFirst({
            where: {
              userId: visa.userId,
              type: 'visa_expiry',
              metadata: {
                path: '$.visaId',
                equals: visa.id
              },
              createdAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
              }
            }
          });
          
          if (!existingNotification) {
            // Send push notification
            await pushNotificationService.sendVisaExpiryNotification(
              visa.userId,
              visa,
              daysUntilExpiry
            );
            
            // Send email notification if enabled
            if (settings.emailEnabled) {
              // TODO: Implement email notification
              logger.info('Email notification for visa expiry: ${visa.countryName} - ${daysUntilExpiry} days');
            }
          }
        }
      }
    } catch (error) {
      logger.error('Error checking visa expiry:', error);
    }
  }
  
  // Check for overstay warnings
  private async checkOverstayWarnings(): Promise<void> {
    try {
      // Get all users with notification settings
      const users = await prisma.user.findMany({
        include: {
          notificationSettings: true
        }
      });
      
      for (const user of users) {
        if (!user.notificationSettings?.schengenWarningDays) continue;
        
        // Check overstay warnings for this user
        const warnings = await checkOverstayWarnings(user.id);
        
        for (const warning of warnings) {
          // Check if notification was already sent recently
          const existingNotification = await prisma.notification.findFirst({
            where: {
              userId: user.id,
              type: 'overstay_warning',
              metadata: {
                path: '$.warningId',
                equals: warning.id
              },
              createdAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
              }
            }
          });
          
          if (!existingNotification && warning.severity !== 'low') {
            // Send push notification for medium, high, and critical warnings
            await pushNotificationService.sendOverstayWarning(
              user.id,
              warning
            );
            
            // Send email for high and critical warnings
            if (user.notificationSettings.emailEnabled && 
                (warning.severity === 'high' || warning.severity === 'critical')) {
              // TODO: Implement email notification
              logger.info('Email notification for overstay warning: ${warning.countryName} - ${warning.severity}');
            }
          }
        }
      }
    } catch (error) {
      logger.error('Error checking overstay warnings:', error);
    }
  }
  
  // Send stay reminder notifications
  private async sendStayReminders(): Promise<void> {
    try {
      // Get users who need reminders
      const users = await prisma.user.findMany({
        where: {
          notificationSettings: {
            documentReminders: true
          }
        },
        include: {
          stayTracking: {
            where: {
              exitDate: null // Currently in a country
            },
            orderBy: {
              entryDate: 'desc'
            },
            take: 1
          }
        }
      });
      
      for (const user of users) {
        if (user.stayTracking.length === 0) continue;
        
        const currentStay = user.stayTracking[0];
        const daysSinceEntry = differenceInDays(
          new Date(),
          parseISO(currentStay.entryDate.toISOString())
        );
        
        // Send reminder every 7 days
        if (daysSinceEntry > 0 && daysSinceEntry % 7 === 0) {
          // Check if reminder was already sent today
          const existingReminder = await prisma.notification.findFirst({
            where: {
              userId: user.id,
              type: 'stay_reminder',
              createdAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
              }
            }
          });
          
          if (!existingReminder) {
            await pushNotificationService.sendStayReminder(
              user.id,
              currentStay.countryCode
            );
          }
        }
      }
    } catch (error) {
      logger.error('Error sending stay reminders:', error);
    }
  }
}

// Export singleton instance
export const notificationScheduler = NotificationScheduler.getInstance();