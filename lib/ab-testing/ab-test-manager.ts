import { cookies } from 'next/headers';
import crypto from 'crypto';
// import prisma from '@/lib/prisma';

export interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: ABVariant[];
  startDate: Date;
  endDate?: Date;
  targetAudience?: {
    percentage?: number;
    segments?: string[];
  };
  status: 'draft' | 'active' | 'paused' | 'completed';
}

export interface ABVariant {
  id: string;
  name: string;
  weight: number; // 0-100 percentage
  config: Record<string, any>;
}

export interface ABTestResult {
  testId: string;
  variantId: string;
  userId: string;
  event: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export class ABTestManager {
  private static instance: ABTestManager;

  private constructor() {}

  public static getInstance(): ABTestManager {
    if (!ABTestManager.instance) {
      ABTestManager.instance = new ABTestManager();
    }
    return ABTestManager.instance;
  }

  // 사용자에게 변형 할당
  public async assignVariant(
    testId: string,
    userId?: string
  ): Promise<ABVariant | null> {
    const test = await this.getActiveTest(testId);
    if (!test) return null;

    // 쿠키에서 기존 할당 확인
    const cookieStore = cookies();
    const existingAssignment = cookieStore.get(`ab_${testId}`);

    if (existingAssignment) {
      const variant = test.variants.find(
        v => v.id === existingAssignment.value
      );
      if (variant) return variant;
    }

    // 새로운 변형 할당
    const variant = this.selectVariant(test.variants, userId);
    if (!variant) return null;

    // 쿠키에 저장 (30일)
    cookieStore.set(`ab_${testId}`, variant.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60,
    });

    // 할당 기록
    if (userId) {
      await this.recordAssignment(testId, variant.id, userId);
    }

    return variant;
  }

  // 변형 선택 알고리즘
  private selectVariant(
    variants: ABVariant[],
    userId?: string
  ): ABVariant | null {
    if (variants.length === 0) return null;

    // 가중치 기반 랜덤 선택
    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
    if (totalWeight === 0) return variants[0];

    // 사용자 ID 기반 일관된 해시 (동일 사용자는 항상 같은 변형)
    let random: number;
    if (userId) {
      const hash = crypto.createHash('md5').update(userId).digest('hex');
      random = parseInt(hash.substring(0, 8), 16) / 0xffffffff;
    } else {
      random = Math.random();
    }

    const target = random * totalWeight;
    let accumulated = 0;

    for (const variant of variants) {
      accumulated += variant.weight;
      if (target <= accumulated) {
        return variant;
      }
    }

    return variants[variants.length - 1];
  }

  // 활성 테스트 가져오기
  private async getActiveTest(_testId: string): Promise<ABTest | null> {
    // TODO: Implement AB testing when Prisma models are ready
    return null;

    // const test = await prisma.aBTest.findFirst({
    //   where: {
    //     id: testId,
    //     status: 'active',
    //     startDate: { lte: new Date() },
    //     OR: [
    //       { endDate: null },
    //       { endDate: { gte: new Date() } },
    //     ],
    //   },
    //   include: {
    //     variants: true,
    //   },
    // });
    // return test as unknown as ABTest;
  }

  // 할당 기록
  private async recordAssignment(
    _testId: string,
    _variantId: string,
    _userId: string
  ) {
    // TODO: Implement AB testing assignment when Prisma models are ready
    return;

    // await prisma.aBTestAssignment.create({
    //   data: {
    //     testId,
    //     variantId,
    //     userId,
    //     assignedAt: new Date(),
    //   },
    // });
  }

  // 이벤트 추적
  public async trackEvent(
    _testId: string,
    _event: string,
    _userId?: string,
    _metadata?: Record<string, any>
  ) {
    // TODO: Implement AB testing event tracking when Prisma models are ready
    return;

    // const cookieStore = cookies();
    // const variantCookie = cookieStore.get(`ab_${testId}`);
    //
    // if (!variantCookie) return;
    //
    // await prisma.aBTestEvent.create({
    //   data: {
    //     testId,
    //     variantId: variantCookie.value,
    //     userId: userId || 'anonymous',
    //     event,
    //     metadata: metadata || {},
    //     timestamp: new Date(),
    //   },
    // });
  }

  // 테스트 결과 분석
  public async analyzeTest(_testId: string) {
    // TODO: Implement AB testing analysis when Prisma models are ready
    return null;

    // const test = await prisma.aBTest.findUnique({
    //   where: { id: testId },
    //   include: {
    //     variants: true,
    //     assignments: true,
    //     events: true,
    //   },
    // });
    //
    // if (!test) return null;

    // const results = test.variants.map(variant => {
    //   const assignments = test.assignments.filter(a => a.variantId === variant.id);
    //   const events = test.events.filter(e => e.variantId === variant.id);
    //
    //   const conversionEvents = events.filter(e => e.event === 'conversion');
    //   const conversionRate = assignments.length > 0
    //     ? (conversionEvents.length / assignments.length) * 100
    //     : 0;
    //
    //   return {
    //     variant: variant.name,
    //     assignments: assignments.length,
    //     conversions: conversionEvents.length,
    //     conversionRate,
    //     events: events.reduce((acc, e) => {
    //       acc[e.event] = (acc[e.event] || 0) + 1;
    //       return acc;
    //     }, {} as Record<string, number>),
    //   };
    // });
    //
    // // 통계적 유의성 계산 (간단한 z-test)
    // const control = results[0];
    // const variations = results.slice(1);
    //
    // const significance = variations.map(variation => {
    //   const z = this.calculateZScore(
    //     control.conversionRate / 100,
    //     variation.conversionRate / 100,
    //     control.assignments,
    //     variation.assignments
    //   );
    //   const pValue = this.calculatePValue(z);
    //
    //   return {
    //     ...variation,
    //     zScore: z,
    //     pValue,
    //     significant: pValue < 0.05,
    //   };
    // });
    //
    // return {
    //   test: {
    //     id: test.id,
    //     name: test.name,
    //     status: test.status,
    //   },
    //   results: [control, ...significance],
    // };
  }

  // Z-score 계산
  // private calculateZScore(
  //   p1: number,
  //   p2: number,
  //   n1: number,
  //   n2: number
  // ): number {
  //   const p = (p1 * n1 + p2 * n2) / (n1 + n2);
  //   const se = Math.sqrt(p * (1 - p) * (1 / n1 + 1 / n2));
  //   return (p2 - p1) / se;
  // }

  // P-value 계산 (간단한 근사)
  // private calculatePValue(z: number): number {
  //   const a1 = 0.254829592;
  //   const a2 = -0.284496736;
  //   const a3 = 1.421413741;
  //   const a4 = -1.453152027;
  //   const a5 = 1.061405429;
  //   const p = 0.3275911;

  //   const sign = z < 0 ? -1 : 1;
  //   z = Math.abs(z) / Math.sqrt(2.0);

  //   const t = 1.0 / (1.0 + p * z);
  //   const y =
  //     1.0 -
  //     ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);

  //   return 1 - sign * y;
  // }

  // 테스트 생성
  public async createTest(
    _name: string,
    _description: string,
    _variants: Omit<ABVariant, 'id'>[],
    _startDate?: Date,
    _endDate?: Date
  ): Promise<ABTest> {
    // TODO: Implement AB testing creation when Prisma models are ready
    throw new Error('AB testing not yet implemented');

    // const test = await prisma.aBTest.create({
    //   data: {
    //     name,
    //     description,
    //     status: 'draft',
    //     startDate: startDate || new Date(),
    //     endDate,
    //     variants: {
    //       create: variants.map(v => ({
    //         name: v.name,
    //         weight: v.weight,
    //         config: v.config,
    //       })),
    //     },
    //   },
    //   include: {
    //     variants: true,
    //   },
    // });
    //
    // return test as unknown as ABTest;
  }

  // 테스트 시작
  public async startTest(_testId: string) {
    // TODO: Implement AB testing start when Prisma models are ready
    return;

    // await prisma.aBTest.update({
    //   where: { id: testId },
    //   data: { status: 'active' },
    // });
  }

  // 테스트 중지
  public async pauseTest(_testId: string) {
    // TODO: Implement AB testing pause when Prisma models are ready
    return;

    // await prisma.aBTest.update({
    //   where: { id: testId },
    //   data: { status: 'paused' },
    // });
  }

  // 테스트 종료
  public async completeTest(_testId: string) {
    // TODO: Implement AB testing completion when Prisma models are ready
    return;

    // await prisma.aBTest.update({
    //   where: { id: testId },
    //   data: {
    //     status: 'completed',
    //     endDate: new Date(),
    //   },
    // });
  }
}

// 싱글톤 인스턴스 export
export const abTestManager = ABTestManager.getInstance();
