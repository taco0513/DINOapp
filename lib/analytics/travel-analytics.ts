/**
 * Advanced Travel Analytics Engine for DINO App
 * Comprehensive travel patterns, visa usage, and insights generation
 */

// import { Trip, User, Country } from '@prisma/client';
import { differenceInDays } from 'date-fns';

// Local Trip interface to replace Prisma import
interface Trip {
  id: string;
  startDate: string | Date;
  endDate: string | Date;
  country: string;
}

export interface TravelPattern {
  id: string;
  userId: string;
  patternType: 'seasonal' | 'regional' | 'visa_optimization' | 'nomad_circuit' | 'business_travel';
  confidence: number; // 0-1
  description: string;
  countries: string[];
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  avgDuration: number; // days
  lastDetected: Date;
  recommendations: string[];
}

export interface TravelInsight {
  id: string;
  type: 'cost_optimization' | 'visa_efficiency' | 'travel_timing' | 'destination_suggestion' | 'risk_alert';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  actionItems: string[];
  potentialSavings?: {
    amount: number;
    currency: string;
    type: 'money' | 'days' | 'visa_fees';
  };
  data: Record<string, any>;
  createdAt: Date;
  expiresAt?: Date;
}

export interface TravelStats {
  totalTrips: number;
  totalDays: number;
  totalCountries: number;
  avgTripDuration: number;
  longestTrip: number;
  shortestTrip: number;
  mostVisitedCountry: string;
  travelFrequency: number; // trips per month
  
  // Schengen specific
  schengenDaysUsed: number;
  schengenDaysRemaining: number;
  schengenEfficiency: number; // 0-1
  
  // Visa analysis
  visaFreeCountries: number;
  visaRequiredCountries: number;
  eVisaCountries: number;
  visaOnArrivalCountries: number;
  
  // Cost analysis
  estimatedVisaCosts: number;
  averageCostPerTrip: number;
  costEfficiencyScore: number;
  
  // Timing patterns
  peakTravelMonths: number[];
  offSeasonMonths: number[];
  
  // Risk factors
  riskScore: number; // 0-1
  riskFactors: string[];
}

export interface CountryAnalytics {
  countryCode: string;
  countryName: string;
  visits: number;
  totalDays: number;
  avgStayDuration: number;
  lastVisit: Date;
  seasonalPattern: Record<number, number>; // month -> visit count
  visaRequirement: string;
  visaCost: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export interface TimelineAnalytics {
  year: number;
  month: number;
  trips: number;
  days: number;
  countries: string[];
  visaCosts: number;
  schengenDays: number;
  highlights: string[];
}

/**
 * Travel Analytics Engine
 */
export class TravelAnalyticsEngine {
  private static instance: TravelAnalyticsEngine;

  private constructor() {}

  static getInstance(): TravelAnalyticsEngine {
    if (!TravelAnalyticsEngine.instance) {
      TravelAnalyticsEngine.instance = new TravelAnalyticsEngine();
    }
    return TravelAnalyticsEngine.instance;
  }

  /**
   * Generate comprehensive travel statistics
   */
  async generateTravelStats(
    trips: Trip[],
    userPassportCountry: string = 'KR'
  ): Promise<TravelStats> {
    if (trips.length === 0) {
      return this.getEmptyStats();
    }

    const totalTrips = trips.length;
    const totalDays = trips.reduce((sum, trip) => 
      sum + differenceInDays(new Date(trip.endDate), new Date(trip.startDate)) + 1, 0
    );

    const durations = trips.map(trip => 
      differenceInDays(new Date(trip.endDate), new Date(trip.startDate)) + 1
    );

    const countries = [...new Set(trips.map(trip => trip.country))];
    const countryVisits = this.countryVisitFrequency(trips);
    const mostVisitedCountry = Object.entries(countryVisits)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    // Schengen analysis
    const schengenCountries = ['DE', 'FR', 'ES', 'IT', 'NL', 'AT', 'BE', 'PT', 'CH', 'GR'];
    const schengenTrips = trips.filter(trip => schengenCountries.includes(trip.country));
    const schengenAnalysis = this.calculateSchengenUsage(schengenTrips);

    // Visa analysis
    const visaAnalysis = await this.analyzeVisaRequirements(trips, userPassportCountry);

    // Timing patterns
    const monthlyDistribution = this.calculateMonthlyDistribution(trips);
    const peakMonths = Object.entries(monthlyDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([month]) => parseInt(month));

    // Risk assessment
    const riskAssessment = this.assessTravelRisk(trips);

    return {
      totalTrips,
      totalDays,
      totalCountries: countries.length,
      avgTripDuration: totalDays / totalTrips,
      longestTrip: Math.max(...durations),
      shortestTrip: Math.min(...durations),
      mostVisitedCountry,
      travelFrequency: this.calculateTravelFrequency(trips),
      
      schengenDaysUsed: schengenAnalysis.daysUsed,
      schengenDaysRemaining: Math.max(0, 90 - schengenAnalysis.daysUsed),
      schengenEfficiency: schengenAnalysis.efficiency,
      
      visaFreeCountries: visaAnalysis.visaFree,
      visaRequiredCountries: visaAnalysis.visaRequired,
      eVisaCountries: visaAnalysis.eVisa,
      visaOnArrivalCountries: visaAnalysis.visaOnArrival,
      
      estimatedVisaCosts: visaAnalysis.totalCosts,
      averageCostPerTrip: visaAnalysis.totalCosts / totalTrips,
      costEfficiencyScore: visaAnalysis.efficiencyScore,
      
      peakTravelMonths: peakMonths,
      offSeasonMonths: this.getOffSeasonMonths(peakMonths),
      
      riskScore: riskAssessment.score,
      riskFactors: riskAssessment.factors
    };
  }

  /**
   * Detect travel patterns using ML-like algorithms
   */
  async detectTravelPatterns(trips: Trip[], userId: string): Promise<TravelPattern[]> {
    const patterns: TravelPattern[] = [];

    // Seasonal patterns
    const seasonalPattern = this.detectSeasonalPattern(trips);
    if (seasonalPattern.confidence > 0.6) {
      patterns.push(seasonalPattern);
    }

    // Regional patterns
    const regionalPattern = this.detectRegionalPattern(trips);
    if (regionalPattern.confidence > 0.5) {
      patterns.push(regionalPattern);
    }

    // Visa optimization patterns
    const visaPattern = this.detectVisaOptimizationPattern(trips);
    if (visaPattern.confidence > 0.4) {
      patterns.push(visaPattern);
    }

    // Nomad circuit patterns
    const nomadPattern = this.detectNomadCircuitPattern(trips);
    if (nomadPattern.confidence > 0.5) {
      patterns.push(nomadPattern);
    }

    // Business travel patterns
    const businessPattern = this.detectBusinessTravelPattern(trips);
    if (businessPattern.confidence > 0.6) {
      patterns.push(businessPattern);
    }

    return patterns.map(pattern => ({ ...pattern, userId, lastDetected: new Date() }));
  }

  /**
   * Generate actionable travel insights
   */
  async generateTravelInsights(
    trips: Trip[],
    stats: TravelStats,
    patterns: TravelPattern[]
  ): Promise<TravelInsight[]> {
    const insights: TravelInsight[] = [];
    const now = new Date();

    // Cost optimization insights
    if (stats.estimatedVisaCosts > 1000) {
      insights.push({
        id: `cost-opt-${now.getTime()}`,
        type: 'cost_optimization',
        priority: 'medium',
        title: '비자 비용 최적화 기회',
        description: `연간 예상 비자 비용이 $${stats.estimatedVisaCosts}입니다. 비자프리 국가 활용을 늘려 비용을 절감할 수 있습니다.`,
        actionItems: [
          '비자프리 국가 목록 확인하기',
          '여행 루트 최적화로 비자 비용 줄이기',
          '장기 체류 비자 고려하기'
        ],
        potentialSavings: {
          amount: Math.round(stats.estimatedVisaCosts * 0.3),
          currency: 'USD',
          type: 'money'
        },
        data: { currentCost: stats.estimatedVisaCosts },
        createdAt: now
      });
    }

    // Schengen efficiency insights
    if (stats.schengenEfficiency < 0.7 && stats.schengenDaysUsed > 0) {
      insights.push({
        id: `schengen-eff-${now.getTime()}`,
        type: 'visa_efficiency',
        priority: 'high',
        title: '셰겐 체류 효율성 개선',
        description: `셰겐 지역 체류 효율성이 ${Math.round(stats.schengenEfficiency * 100)}%입니다. 더 효율적인 활용이 가능합니다.`,
        actionItems: [
          '셰겐 외 유럽 국가 방문 고려',
          '체류 기간 최적화',
          '90일 한도 활용 극대화'
        ],
        data: { 
          currentEfficiency: stats.schengenEfficiency,
          daysUsed: stats.schengenDaysUsed,
          daysRemaining: stats.schengenDaysRemaining
        },
        createdAt: now
      });
    }

    // Travel timing insights
    const upcomingPeakSeason = this.getUpcomingPeakSeason(stats.peakTravelMonths);
    if (upcomingPeakSeason) {
      insights.push({
        id: `timing-${now.getTime()}`,
        type: 'travel_timing',
        priority: 'low',
        title: '여행 시기 최적화',
        description: `${upcomingPeakSeason.month}월은 귀하의 피크 시즌입니다. 미리 계획하여 더 나은 조건을 확보하세요.`,
        actionItems: [
          '항공료 및 숙박 가격 모니터링',
          '비자 신청 일정 조정',
          '대안 목적지 고려'
        ],
        data: { peakMonth: upcomingPeakSeason.month },
        createdAt: now,
        expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });
    }

    // Risk alerts
    if (stats.riskScore > 0.7) {
      insights.push({
        id: `risk-${now.getTime()}`,
        type: 'risk_alert',
        priority: 'critical',
        title: '여행 리스크 경고',
        description: '현재 여행 패턴에 높은 리스크 요소가 감지되었습니다.',
        actionItems: [
          '여행 보험 검토',
          '비상 연락처 업데이트',
          '리스크 요소 개선 방안 수립'
        ],
        data: { 
          riskScore: stats.riskScore,
          riskFactors: stats.riskFactors
        },
        createdAt: now
      });
    }

    // Destination suggestions based on patterns
    if (patterns.length > 0) {
      const suggestions = this.generateDestinationSuggestions(trips, patterns);
      if (suggestions.length > 0) {
        insights.push({
          id: `dest-sug-${now.getTime()}`,
          type: 'destination_suggestion',
          priority: 'low',
          title: '맞춤 목적지 추천',
          description: '귀하의 여행 패턴을 기반으로 새로운 목적지를 추천합니다.',
          actionItems: [
            '추천 목적지 상세 정보 확인',
            '비자 요구사항 검토',
            '여행 일정 계획'
          ],
          data: { suggestions },
          createdAt: now
        });
      }
    }

    return insights.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Generate country-specific analytics
   */
  generateCountryAnalytics(trips: Trip[]): CountryAnalytics[] {
    const countryGroups = trips.reduce((groups, trip) => {
      if (!groups[trip.country]) {
        groups[trip.country] = [];
      }
      groups[trip.country].push(trip);
      return groups;
    }, {} as Record<string, Trip[]>);

    return Object.entries(countryGroups).map(([countryCode, countryTrips]) => {
      const totalDays = countryTrips.reduce((sum, trip) => 
        sum + differenceInDays(new Date(trip.endDate), new Date(trip.startDate)) + 1, 0
      );

      const seasonalPattern = countryTrips.reduce((pattern, trip) => {
        const month = new Date(trip.startDate).getMonth() + 1;
        pattern[month] = (pattern[month] || 0) + 1;
        return pattern;
      }, {} as Record<number, number>);

      const lastVisit = new Date(Math.max(...countryTrips.map(trip => 
        new Date(trip.endDate).getTime()
      )));

      return {
        countryCode,
        countryName: this.getCountryName(countryCode),
        visits: countryTrips.length,
        totalDays,
        avgStayDuration: totalDays / countryTrips.length,
        lastVisit,
        seasonalPattern,
        visaRequirement: this.getVisaRequirement(countryCode),
        visaCost: this.getVisaCost(countryCode),
        riskLevel: this.getCountryRiskLevel(countryCode),
        recommendations: this.generateCountryRecommendations(countryCode, countryTrips)
      };
    }).sort((a, b) => b.totalDays - a.totalDays);
  }

  /**
   * Generate timeline analytics
   */
  generateTimelineAnalytics(trips: Trip[]): TimelineAnalytics[] {
    const timelineMap = new Map<string, TimelineAnalytics>();

    trips.forEach(trip => {
      const startDate = new Date(trip.startDate);
      const endDate = new Date(trip.endDate);
      const year = startDate.getFullYear();
      const month = startDate.getMonth() + 1;
      const key = `${year}-${month}`;

      if (!timelineMap.has(key)) {
        timelineMap.set(key, {
          year,
          month,
          trips: 0,
          days: 0,
          countries: [],
          visaCosts: 0,
          schengenDays: 0,
          highlights: []
        });
      }

      const entry = timelineMap.get(key)!;
      entry.trips += 1;
      entry.days += differenceInDays(endDate, startDate) + 1;
      
      if (!entry.countries.includes(trip.country)) {
        entry.countries.push(trip.country);
      }

      // Add visa cost estimation
      entry.visaCosts += this.getVisaCost(trip.country);

      // Add Schengen days if applicable
      const schengenCountries = ['DE', 'FR', 'ES', 'IT', 'NL', 'AT', 'BE', 'PT', 'CH', 'GR'];
      if (schengenCountries.includes(trip.country)) {
        entry.schengenDays += differenceInDays(endDate, startDate) + 1;
      }
    });

    return Array.from(timelineMap.values())
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      })
      .map(entry => ({
        ...entry,
        highlights: this.generateMonthlyHighlights(entry)
      }));
  }

  // Private helper methods

  private getEmptyStats(): TravelStats {
    return {
      totalTrips: 0,
      totalDays: 0,
      totalCountries: 0,
      avgTripDuration: 0,
      longestTrip: 0,
      shortestTrip: 0,
      mostVisitedCountry: '',
      travelFrequency: 0,
      schengenDaysUsed: 0,
      schengenDaysRemaining: 90,
      schengenEfficiency: 0,
      visaFreeCountries: 0,
      visaRequiredCountries: 0,
      eVisaCountries: 0,
      visaOnArrivalCountries: 0,
      estimatedVisaCosts: 0,
      averageCostPerTrip: 0,
      costEfficiencyScore: 0,
      peakTravelMonths: [],
      offSeasonMonths: [],
      riskScore: 0,
      riskFactors: []
    };
  }

  private countryVisitFrequency(trips: Trip[]): Record<string, number> {
    return trips.reduce((freq, trip) => {
      freq[trip.country] = (freq[trip.country] || 0) + 1;
      return freq;
    }, {} as Record<string, number>);
  }

  private calculateSchengenUsage(schengenTrips: Trip[]) {
    // This is a simplified calculation
    // In reality, you'd need to implement the rolling 180-day window
    const totalDays = schengenTrips.reduce((sum, trip) => 
      sum + differenceInDays(new Date(trip.endDate), new Date(trip.startDate)) + 1, 0
    );

    return {
      daysUsed: Math.min(totalDays, 90),
      efficiency: totalDays > 0 ? Math.min(totalDays / 90, 1) : 0
    };
  }

  private async analyzeVisaRequirements(trips: Trip[], passportCountry: string) {
    // This would integrate with the visa database
    // For now, using simplified logic
    let visaFree = 0, visaRequired = 0, eVisa = 0, visaOnArrival = 0;
    let totalCosts = 0;

    trips.forEach(trip => {
      const requirement = this.getVisaRequirement(trip.country, passportCountry);
      switch (requirement) {
        case 'visa_free': visaFree++; break;
        case 'visa_required': visaRequired++; totalCosts += this.getVisaCost(trip.country); break;
        case 'evisa': eVisa++; totalCosts += this.getVisaCost(trip.country); break;
        case 'visa_on_arrival': visaOnArrival++; totalCosts += this.getVisaCost(trip.country); break;
      }
    });

    const total = trips.length;
    const efficiencyScore = total > 0 ? visaFree / total : 0;

    return {
      visaFree,
      visaRequired,
      eVisa,
      visaOnArrival,
      totalCosts,
      efficiencyScore
    };
  }

  private calculateMonthlyDistribution(trips: Trip[]): Record<number, number> {
    return trips.reduce((dist, trip) => {
      const month = new Date(trip.startDate).getMonth() + 1;
      dist[month] = (dist[month] || 0) + 1;
      return dist;
    }, {} as Record<number, number>);
  }

  private calculateTravelFrequency(trips: Trip[]): number {
    if (trips.length < 2) return 0;
    
    const firstTrip = new Date(Math.min(...trips.map(t => new Date(t.startDate).getTime())));
    const lastTrip = new Date(Math.max(...trips.map(t => new Date(t.endDate).getTime())));
    const monthsDiff = differenceInDays(lastTrip, firstTrip) / 30;
    
    return trips.length / Math.max(monthsDiff, 1);
  }

  private assessTravelRisk(trips: Trip[]): { score: number; factors: string[] } {
    const factors: string[] = [];
    let score = 0;

    // High frequency travel
    const frequency = this.calculateTravelFrequency(trips);
    if (frequency > 2) {
      factors.push('높은 여행 빈도');
      score += 0.2;
    }

    // Multiple visa requirements
    const visaRequiredCount = trips.filter(trip => 
      this.getVisaRequirement(trip.country) === 'visa_required'
    ).length;
    
    if (visaRequiredCount > trips.length * 0.5) {
      factors.push('비자 요구사항이 많은 국가들');
      score += 0.3;
    }

    // Schengen overuse risk
    const schengenCountries = ['DE', 'FR', 'ES', 'IT', 'NL', 'AT', 'BE', 'PT', 'CH', 'GR'];
    const schengenTrips = trips.filter(trip => schengenCountries.includes(trip.country));
    const schengenDays = schengenTrips.reduce((sum, trip) => 
      sum + differenceInDays(new Date(trip.endDate), new Date(trip.startDate)) + 1, 0
    );

    if (schengenDays > 80) {
      factors.push('셰겐 한도 근접');
      score += 0.4;
    }

    return { score: Math.min(score, 1), factors };
  }

  private getOffSeasonMonths(peakMonths: number[]): number[] {
    const allMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    return allMonths.filter(month => !peakMonths.includes(month));
  }

  private getUpcomingPeakSeason(peakMonths: number[]): { month: number } | null {
    const currentMonth = new Date().getMonth() + 1;
    const nextPeakMonth = peakMonths.find(month => month > currentMonth) || 
                         peakMonths[0]; // wrap around to next year
    
    return nextPeakMonth ? { month: nextPeakMonth } : null;
  }

  // Pattern detection methods (simplified implementations)
  
  private detectSeasonalPattern(trips: Trip[]): TravelPattern {
    const monthlyDist = this.calculateMonthlyDistribution(trips);
    const peak = Math.max(...Object.values(monthlyDist));
    const total = Object.values(monthlyDist).reduce((sum, count) => sum + count, 0);
    const confidence = peak / total;

    return {
      id: '',
      userId: '',
      patternType: 'seasonal',
      confidence,
      description: '계절별 여행 패턴 감지됨',
      countries: [...new Set(trips.map(t => t.country))],
      frequency: 'yearly',
      avgDuration: trips.reduce((sum, t) => sum + differenceInDays(new Date(t.endDate), new Date(t.startDate)), 0) / trips.length,
      lastDetected: new Date(),
      recommendations: ['계절별 최적 목적지 고려', '성수기 요금 회피 전략']
    };
  }

  private detectRegionalPattern(trips: Trip[]): TravelPattern {
    // Simplified: check if trips are clustered in specific regions
    const regions = this.groupTripsByRegion(trips);
    const maxRegion = Object.entries(regions).sort(([,a], [,b]) => b - a)[0];
    const confidence = maxRegion ? maxRegion[1] / trips.length : 0;

    return {
      id: '',
      userId: '',
      patternType: 'regional',
      confidence,
      description: '지역별 여행 선호도 패턴',
      countries: [...new Set(trips.map(t => t.country))],
      frequency: 'quarterly',
      avgDuration: 0,
      lastDetected: new Date(),
      recommendations: ['지역 내 다른 국가 탐색', '지역별 패스 활용']
    };
  }

  private detectVisaOptimizationPattern(trips: Trip[]): TravelPattern {
    const visaFreeRatio = trips.filter(trip => 
      this.getVisaRequirement(trip.country) === 'visa_free'
    ).length / trips.length;

    return {
      id: '',
      userId: '',
      patternType: 'visa_optimization',
      confidence: visaFreeRatio,
      description: '비자 최적화 여행 패턴',
      countries: [],
      frequency: 'monthly',
      avgDuration: 0,
      lastDetected: new Date(),
      recommendations: ['비자프리 국가 확대', '비자 비용 절감 방안']
    };
  }

  private detectNomadCircuitPattern(trips: Trip[]): TravelPattern {
    // Detect if user follows common nomad routes
    const nomadHubs = ['TH', 'MY', 'SG', 'ID', 'VN', 'PT', 'ES', 'MX', 'CO'];
    const nomadTrips = trips.filter(trip => nomadHubs.includes(trip.country));
    const confidence = nomadTrips.length / trips.length;

    return {
      id: '',
      userId: '',
      patternType: 'nomad_circuit',
      confidence,
      description: '디지털 노마드 서킷 패턴',
      countries: nomadTrips.map(t => t.country),
      frequency: 'monthly',
      avgDuration: 0,
      lastDetected: new Date(),
      recommendations: ['노마드 친화적 도시 추천', '장기 체류 비자 고려']
    };
  }

  private detectBusinessTravelPattern(trips: Trip[]): TravelPattern {
    // Detect short, frequent trips (typical of business travel)
    const shortTrips = trips.filter(trip => 
      differenceInDays(new Date(trip.endDate), new Date(trip.startDate)) <= 7
    );
    const confidence = shortTrips.length / trips.length;

    return {
      id: '',
      userId: '',
      patternType: 'business_travel',
      confidence,
      description: '비즈니스 여행 패턴',
      countries: [...new Set(shortTrips.map(t => t.country))],
      frequency: 'monthly',
      avgDuration: 0,
      lastDetected: new Date(),
      recommendations: ['비즈니스 라운지 패스', '빠른 입출국 서비스']
    };
  }

  // Helper methods for country/visa information (would integrate with visa database)
  
  private getCountryName(countryCode: string): string {
    const countryNames: Record<string, string> = {
      'KR': '대한민국', 'US': '미국', 'JP': '일본', 'CN': '중국',
      'DE': '독일', 'FR': '프랑스', 'ES': '스페인', 'IT': '이탈리아',
      'TH': '태국', 'MY': '말레이시아', 'SG': '싱가포르'
    };
    return countryNames[countryCode] || countryCode;
  }

  private getVisaRequirement(countryCode: string, _passportCountry: string = 'KR'): string {
    // Simplified visa requirements for Korean passport
    const visaFree = ['US', 'JP', 'DE', 'FR', 'ES', 'IT', 'TH', 'MY', 'SG'];
    const visaRequired = ['CN', 'IN', 'RU'];
    
    if (visaFree.includes(countryCode)) return 'visa_free';
    if (visaRequired.includes(countryCode)) return 'visa_required';
    return 'evisa';
  }

  private getVisaCost(countryCode: string): number {
    const costs: Record<string, number> = {
      'CN': 140, 'IN': 80, 'RU': 160, 'VN': 50, 'KH': 30
    };
    return costs[countryCode] || 0;
  }

  private getCountryRiskLevel(countryCode: string): 'low' | 'medium' | 'high' {
    const highRisk = ['AF', 'SY', 'IQ'];
    const mediumRisk = ['PK', 'BD', 'MM'];
    
    if (highRisk.includes(countryCode)) return 'high';
    if (mediumRisk.includes(countryCode)) return 'medium';
    return 'low';
  }

  private groupTripsByRegion(trips: Trip[]): Record<string, number> {
    const regions: Record<string, string[]> = {
      'Europe': ['DE', 'FR', 'ES', 'IT', 'NL', 'AT', 'BE', 'PT', 'CH', 'GR'],
      'Asia': ['TH', 'MY', 'SG', 'ID', 'VN', 'PH', 'JP', 'KR', 'CN'],
      'Americas': ['US', 'CA', 'MX', 'BR', 'AR', 'CO', 'PE'],
      'Africa': ['ZA', 'KE', 'MA', 'EG'],
      'Oceania': ['AU', 'NZ']
    };

    const regionCounts: Record<string, number> = {};
    
    trips.forEach(trip => {
      for (const [region, countries] of Object.entries(regions)) {
        if (countries.includes(trip.country)) {
          regionCounts[region] = (regionCounts[region] || 0) + 1;
          break;
        }
      }
    });

    return regionCounts;
  }

  private generateDestinationSuggestions(trips: Trip[], _patterns: TravelPattern[]): string[] {
    // This would use ML to suggest destinations based on patterns
    // Simplified implementation
    const visitedCountries = new Set(trips.map(t => t.country));
    const suggestions = ['PT', 'EE', 'CO', 'CR', 'GE', 'UA'];
    
    return suggestions.filter(country => !visitedCountries.has(country)).slice(0, 3);
  }

  private generateCountryRecommendations(countryCode: string, trips: Trip[]): string[] {
    const recommendations: string[] = [];
    
    if (trips.length > 3) {
      recommendations.push('단골 목적지로 장기 체류 비자 고려');
    }
    
    if (this.getVisaCost(countryCode) > 100) {
      recommendations.push('비자 비용 절감 방안 검토');
    }
    
    return recommendations;
  }

  private generateMonthlyHighlights(entry: TimelineAnalytics): string[] {
    const highlights: string[] = [];
    
    if (entry.trips > 3) {
      highlights.push('높은 여행 활동');
    }
    
    if (entry.countries.length > 2) {
      highlights.push('다양한 국가 방문');
    }
    
    if (entry.schengenDays > 20) {
      highlights.push('집중적인 셰겐 체류');
    }
    
    return highlights;
  }
}

// Export singleton instance
export const travelAnalyticsEngine = TravelAnalyticsEngine.getInstance();