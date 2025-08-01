// TODO: Remove unused logger import

// Visa Email Service
// 비자 관련 이메일 발송 서비스

import { generateVisaExpiryEmail, generateWeeklySummaryEmail, generateRenewalSuccessEmail } from './visa-templates';
import { prisma } from '@/lib/prisma';
import { differenceInDays, format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface EmailConfig {
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  fromEmail: string;
  fromName: string;
}

interface VisaEmailData {
  id: string;
  userId: string;
  countryName: string;
  visaType: string;
  expiryDate: Date;
  status: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export class VisaEmailService {
  private emailConfig: EmailConfig;

  constructor(config?: Partial<EmailConfig>) {
    this.emailConfig = {
      smtpHost: process.env.SMTP_HOST,
      smtpPort: parseInt(process.env.SMTP_PORT || '587'),
      smtpUser: process.env.SMTP_USER,
      smtpPass: process.env.SMTP_PASSWORD,
      fromEmail: process.env.FROM_EMAIL || 'noreply@dino-app.com',
      fromName: process.env.FROM_NAME || 'DINO Travel Manager',
      ...config
    };
  }

  /**
   * 비자 만료 알림 이메일 발송
   */
  async sendVisaExpiryAlert(visaData: VisaEmailData): Promise<boolean> {
    try {
      const daysUntilExpiry = differenceInDays(visaData.expiryDate, new Date());
      
      let urgencyLevel: 'reminder' | 'warning' | 'urgent' | 'expired' = 'reminder';
      if (daysUntilExpiry < 0) {
        urgencyLevel = 'expired';
      } else if (daysUntilExpiry <= 7) {
        urgencyLevel = 'urgent';
      } else if (daysUntilExpiry <= 30) {
        urgencyLevel = 'warning';
      }

      // 예정된 여행 확인
      const upcomingTrips = await prisma.countryVisit.findMany({
        where: {
          userId: visaData.userId,
          country: visaData.countryName,
          entryDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90일 내
          }
        },
        orderBy: {
          entryDate: 'asc'
        },
        take: 1
      });

      const templateData = {
        userName: visaData.user.name,
        countryName: visaData.countryName,
        visaType: visaData.visaType,
        expiryDate: format(visaData.expiryDate, 'yyyy년 M월 d일', { locale: ko }),
        daysUntilExpiry,
        urgencyLevel,
        tripInfo: upcomingTrips.length > 0 ? {
          hasUpcomingTrip: true,
          tripDate: format(upcomingTrips[0].entryDate, 'yyyy년 M월 d일', { locale: ko }),
          destination: upcomingTrips[0].country
        } : undefined
      };

      const emailContent = generateVisaExpiryEmail(templateData);

      // 실제 이메일 발송 (여기서는 콘솔 로그로 대체)
      await this.sendEmail({
        to: visaData.user.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
      });

      console.info('Visa expiry email sent to ${visaData.user.email} for ${visaData.countryName} visa');
      return true;

    } catch (error) {
      console.error('Failed to send visa expiry email:', error);
      return false;
    }
  }

  /**
   * 주간 비자 요약 이메일 발송
   */
  async sendWeeklySummary(userId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          userVisas: {
            where: {
              status: {
                in: ['active', 'expiring_soon']
              }
            },
            orderBy: {
              expiryDate: 'asc'
            }
          }
        }
      });

      if (!user || user.userVisas.length === 0) {
        console.info('No active visas found for user ${userId}, skipping weekly summary');
        return true;
      }

      const visasData = user.userVisas.map(visa => ({
        userName: user.name,
        countryName: visa.countryName,
        visaType: visa.visaType,
        expiryDate: format(visa.expiryDate, 'yyyy년 M월 d일', { locale: ko }),
        daysUntilExpiry: differenceInDays(visa.expiryDate, new Date()),
        urgencyLevel: 'reminder' as const
      }));

      const emailContent = generateWeeklySummaryEmail(visasData);

      await this.sendEmail({
        to: user.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
      });

      console.info('Weekly visa summary sent to ${user.email}');
      return true;

    } catch (error) {
      console.error('Failed to send weekly visa summary:', error);
      return false;
    }
  }

  /**
   * 모든 사용자에게 주간 요약 발송
   */
  async sendWeeklySummaryToAll(): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    try {
      const usersWithVisas = await prisma.user.findMany({
        where: {
          userVisas: {
            some: {
              status: {
                in: ['active', 'expiring_soon']
              }
            }
          }
        },
        select: {
          id: true
        }
      });

      console.info('Sending weekly summaries to ${usersWithVisas.length} users');

      for (const user of usersWithVisas) {
        try {
          await this.sendWeeklySummary(user.id);
          success++;
        } catch (error) {
          console.error('Failed to send weekly summary to user ${user.id}:', error);
          failed++;
        }
      }

    } catch (error) {
      console.error('Failed to send weekly summaries:', error);
      failed++;
    }

    return { success, failed };
  }

  /**
   * 비자 갱신 성공 확인 이메일 발송
   */
  async sendRenewalSuccess(visaData: VisaEmailData): Promise<boolean> {
    try {
      const templateData = {
        userName: visaData.user.name,
        countryName: visaData.countryName,
        visaType: visaData.visaType,
        expiryDate: format(visaData.expiryDate, 'yyyy년 M월 d일', { locale: ko }),
        daysUntilExpiry: differenceInDays(visaData.expiryDate, new Date()),
        urgencyLevel: 'reminder' as const
      };

      const emailContent = generateRenewalSuccessEmail(templateData);

      await this.sendEmail({
        to: visaData.user.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
      });

      console.info('Visa renewal success email sent to ${visaData.user.email} for ${visaData.countryName} visa');
      return true;

    } catch (error) {
      console.error('Failed to send visa renewal success email:', error);
      return false;
    }
  }

  /**
   * 실제 이메일 발송 (SMTP 또는 이메일 서비스 연동)
   */
  private async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<void> {
    // 실제 구현에서는 nodemailer, SendGrid, SES 등을 사용
    // 현재는 개발 환경을 위해 콘솔 로그만 출력
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email would be sent:', {
        to: options.to,
        subject: options.subject,
        preview: options.text.substring(0, 200) + '...'
      });
      return;
    }

    // 운영 환경에서는 실제 이메일 발송
    // 예: nodemailer, SendGrid, AWS SES 등
    try {
      // const transporter = nodemailer.createTransporter({...});
      // await transporter.sendMail({
      //   from: `${this.emailConfig.fromName} <${this.emailConfig.fromEmail}>`,
      //   to: options.to,
      //   subject: options.subject,
      //   html: options.html,
      //   text: options.text
      // });

      console.info('Email sent to ${options.to}: ${options.subject}');
    } catch (error) {
      console.error('SMTP send failed:', error);
      throw error;
    }
  }

  /**
   * 이메일 발송 통계
   */
  async getEmailStats(days = 7): Promise<{
    totalSent: number;
    expiryAlerts: number;
    weeklySummaries: number;
    renewalConfirmations: number;
  }> {
    // 실제 구현에서는 이메일 발송 로그를 DB에 저장하고 조회
    // 현재는 더미 데이터 반환
    return {
      totalSent: 0,
      expiryAlerts: 0,
      weeklySummaries: 0,
      renewalConfirmations: 0
    };
  }
}

// 싱글톤 인스턴스 내보내기
export const visaEmailService = new VisaEmailService();