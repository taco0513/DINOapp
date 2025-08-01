// TODO: Remove unused logger import

// Visa Expiry Scheduler
// 비자 만료 알림 스케줄러 - Vercel Cron Jobs 또는 Node-cron과 통합

import { visaAlerts } from '@/lib/notifications/visa-alerts';
import { logger } from '@/lib/logger';

/**
 * 매일 오전 9시에 실행되는 비자 만료 확인 스케줄러
 * Vercel Cron Jobs와 연동하여 사용
 */
export class VisaExpiryScheduler {
  private static instance: VisaExpiryScheduler;
  private isRunning = false;

  private constructor() {}

  public static getInstance(): VisaExpiryScheduler {
    if (!VisaExpiryScheduler.instance) {
      VisaExpiryScheduler.instance = new VisaExpiryScheduler();
    }
    return VisaExpiryScheduler.instance;
  }

  /**
   * 일일 비자 만료 확인 실행
   */
  async runDailyCheck(): Promise<void> {
    if (this.isRunning) {
      logger.info('Visa expiry check is already running, skipping...');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      logger.info('[${new Date().toISOString()}] Starting daily visa expiry check...');

      // 만료 예정 비자 확인 및 알림 발송
      await visaAlerts.checkExpiringVisas();

      const duration = Date.now() - startTime;
      logger.info('[${new Date().toISOString()}] Daily visa expiry check completed in ${duration}ms');

    } catch (error) {
      logger.error('[${new Date().toISOString()}] Error in daily visa expiry check:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * 특정 시간대별 맞춤 알림 실행
   * - 오전 9시: 일반 알림
   * - 오후 6시: 긴급 알림만
   */
  async runTimeBasedCheck(timeSlot: 'morning' | 'evening'): Promise<void> {
    if (this.isRunning) {
      logger.info('Visa expiry check is already running, skipping...');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      logger.info('[${new Date().toISOString()}] Starting ${timeSlot} visa expiry check...');

      if (timeSlot === 'morning') {
        // 오전: 모든 만료 예정 비자 확인
        await visaAlerts.checkExpiringVisas();
      } else {
        // 오후: 긴급 알림만 (7일 이내 만료)
        await this.runUrgentOnlyCheck();
      }

      const duration = Date.now() - startTime;
      logger.info('[${new Date().toISOString()}] ${timeSlot} visa expiry check completed in ${duration}ms');

    } catch (error) {
      logger.error('[${new Date().toISOString()}] Error in ${timeSlot} visa expiry check:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * 긴급 알림만 확인 (7일 이내 만료)
   */
  private async runUrgentOnlyCheck(): Promise<void> {
    // TODO: 긴급 알림만 필터링하는 로직 구현
    // 현재는 전체 체크를 실행하지만, 향후 필터링 로직 추가 가능
    await visaAlerts.checkExpiringVisas();
  }

  /**
   * 주간 요약 알림 (매주 월요일 오전 9시)
   */
  async runWeeklySummary(): Promise<void> {
    if (this.isRunning) {
      logger.info('Visa expiry check is already running, skipping...');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      logger.info('[${new Date().toISOString()}] Starting weekly visa summary...');

      // 주간 요약 로직 (향후 구현)
      // - 이번 주 만료되는 비자 목록
      // - 다음 주 만료 예정 비자 목록
      // - 갱신이 필요한 비자 통계
      await visaAlerts.checkExpiringVisas();

      const duration = Date.now() - startTime;
      logger.info('[${new Date().toISOString()}] Weekly visa summary completed in ${duration}ms');

    } catch (error) {
      logger.error('[${new Date().toISOString()}] Error in weekly visa summary:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * 스케줄러 상태 확인
   */
  getStatus(): { isRunning: boolean; lastRun?: Date } {
    return {
      isRunning: this.isRunning,
      // TODO: 마지막 실행 시간 추가
    };
  }
}

// Singleton 인스턴스 내보내기
export const visaScheduler = VisaExpiryScheduler.getInstance();

// 스케줄러 함수들 (Vercel Cron Jobs에서 직접 호출 가능)
export const runDailyVisaCheck = () => visaScheduler.runDailyCheck();
export const runMorningVisaCheck = () => visaScheduler.runTimeBasedCheck('morning');
export const runEveningVisaCheck = () => visaScheduler.runTimeBasedCheck('evening');
export const runWeeklyVisaSummary = () => visaScheduler.runWeeklySummary();