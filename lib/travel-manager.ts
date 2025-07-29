/**
 * Travel Management Core Business Logic Module
 * 
 * PURPOSE: 여행 관리 핵심 비즈니스 로직 - 여행 CRUD, 솅겐 계산, 분석 기능
 * ARCHITECTURE: Service Layer - 데이터베이스와 UI 사이의 비즈니스 로직 처리
 * RELATED: lib/schengen-calculator.ts, lib/database/dev-prisma.ts, data/countries.ts
 * GOTCHAS: 솅겐 계산시 시간대 처리 주의, 과거 여행 데이터 불일치 가능성
 * 
 * @module travel-manager
 */

import { getPrismaClient } from '@/lib/database/dev-prisma';
import { CountryVisit } from '@prisma/client';
import {
  calculateSchengenStatus,
  validateFutureTrip,
  FutureTripValidation,
} from '@/lib/schengen-calculator';
import { COUNTRIES, VISA_TYPES, getCountryByName } from '@/data/countries';

/**
 * Options for filtering and sorting trip queries
 */
export interface TravelManagerOptions {
  userId: string;
  includeCompleted?: boolean;
  includePlanned?: boolean;
  includeOngoing?: boolean;
  limit?: number;
  sortBy?: 'entryDate' | 'createdAt' | 'country';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Summary statistics for user's travel history
 */
export interface TripSummary {
  /** Total number of trips (all statuses) */
  totalTrips: number;
  /** Number of completed trips */
  completedTrips: number;
  /** Number of currently ongoing trips */
  ongoingTrips: number;
  /** Number of planned future trips */
  plannedTrips: number;
  /** Number of unique countries visited */
  countriesVisited: number;
  /** Total days spent abroad */
  totalDaysAbroad: number;
  /** Days used in Schengen area (180-day window) */
  schengenDaysUsed: number;
  /** Days remaining for Schengen area */
  schengenDaysRemaining: number;
  /** Date of the last trip entry */
  lastTripDate?: string;
  /** Date of the next planned trip */
  nextTripDate?: string;
}

/**
 * Comprehensive travel insights and analytics
 */
export interface TravelInsights {
  /** Summary statistics */
  summary: TripSummary;
  /** Most visited destinations with frequency and duration */
  popularDestinations: Array<{
    country: string;
    visits: number;
    totalDays: number;
  }>;
  /** Travel behavior patterns */
  travelPatterns: {
    /** Average trip duration in days */
    averageTripDuration: number;
    /** Longest trip duration in days */
    longestTrip: number;
    /** Shortest trip duration in days */
    shortestTrip: number;
    /** Most frequently used visa type */
    mostCommonVisaType: string;
    /** Total amount spent on trips (if tracked) */
    totalSpent?: number;
  };
  /** Upcoming visa/stay expirations */
  upcomingExpirations: Array<{
    country: string;
    exitDate: string;
    daysUntilExit: number;
  }>;
  /** AI-generated travel recommendations */
  recommendations: string[];
}

/**
 * Main travel management service class
 * Handles all travel-related business logic and database operations
 * 
 * @example
 * ```typescript
 * const manager = new TravelManager('user123');
 * const trips = await manager.getTrips();
 * const insights = await manager.getTravelInsights();
 * ```
 */
export class TravelManager {
  private userId: string;
  private prisma: any;

  /**
   * Creates a new TravelManager instance for a specific user
   * @param userId - The user ID to manage trips for
   */
  constructor(userId: string) {
    this.userId = userId;
    this.prisma = getPrismaClient();
  }

  /**
   * Retrieves all trips for the user with filtering and sorting options
   * @param options - Filtering and sorting options
   * @returns Array of country visits matching the criteria
   * 
   * @example
   * ```typescript
   * // Get only completed trips, sorted by entry date
   * const completedTrips = await manager.getTrips({
   *   includeCompleted: true,
   *   includePlanned: false,
   *   includeOngoing: false,
   *   sortBy: 'entryDate',
   *   sortOrder: 'desc'
   * });
   * ```
   */
  async getTrips(
    options: Partial<TravelManagerOptions> = {}
  ): Promise<CountryVisit[]> {
    const {
      includeCompleted = true,
      includePlanned = true,
      includeOngoing = true,
      limit = 100,
      sortBy = 'entryDate',
      sortOrder = 'desc',
    } = options;

    const statusFilter: string[] = [];
    if (includeCompleted) statusFilter.push('completed');
    if (includePlanned) statusFilter.push('planned');
    if (includeOngoing) statusFilter.push('ongoing');

    const trips = await this.prisma.countryVisit.findMany({
      where: {
        userId: this.userId,
        status: {
          in: statusFilter,
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      take: limit,
    });

    return trips;
  }

  /**
   * Creates a new trip record with validation
   * @param tripData - Trip information to create
   * @returns Created trip record
   * @throws Error if country or visa type is invalid, or dates are illogical
   * 
   * @example
   * ```typescript
   * const newTrip = await manager.createTrip({
   *   country: 'France',
   *   entryDate: '2024-06-01',
   *   exitDate: '2024-06-15',
   *   visaType: 'Tourist',
   *   maxDays: 90,
   *   passportCountry: 'KR',
   *   notes: 'Summer vacation in Paris'
   * });
   * ```
   */
  async createTrip(tripData: {
    country: string;
    entryDate: string | Date;
    exitDate?: string | Date | null;
    visaType: string;
    maxDays: number;
    passportCountry: string;
    notes?: string;
    status?: string;
    purpose?: string;
    accommodation?: string;
    cost?: number;
    isEmergency?: boolean;
  }): Promise<CountryVisit> {
    // Validate country exists
    const countryInfo = getCountryByName(tripData.country);
    if (!countryInfo) {
      throw new Error(`Country "${tripData.country}" not found`);
    }

    // Validate visa type
    if (!VISA_TYPES.includes(tripData.visaType as any)) {
      throw new Error(`Invalid visa type: ${tripData.visaType}`);
    }

    // Convert dates to ISO format
    const entryDate = new Date(tripData.entryDate).toISOString();
    const exitDate = tripData.exitDate
      ? new Date(tripData.exitDate).toISOString()
      : null;

    // Validate date logic
    if (exitDate && new Date(exitDate) <= new Date(entryDate)) {
      throw new Error('Exit date must be after entry date');
    }

    const trip = await this.prisma.countryVisit.create({
      data: {
        userId: this.userId,
        country: tripData.country,
        entryDate,
        exitDate,
        visaType: tripData.visaType,
        maxDays: tripData.maxDays,
        passportCountry: tripData.passportCountry,
        notes: tripData.notes || null,
        status: tripData.status || 'completed',
        purpose: tripData.purpose || null,
        accommodation: tripData.accommodation || null,
        cost: tripData.cost || null,
        isEmergency: tripData.isEmergency || false,
      },
    });

    return trip;
  }

  /**
   * Updates an existing trip record
   * @param tripId - ID of the trip to update
   * @param updateData - Partial data to update
   * @returns Updated trip record
   * @throws Error if trip not found or unauthorized
   * 
   * @example
   * ```typescript
   * const updated = await manager.updateTrip('trip123', {
   *   exitDate: '2024-06-20',
   *   notes: 'Extended stay',
   *   cost: 2500
   * });
   * ```
   */
  async updateTrip(
    tripId: string,
    updateData: Partial<{
      country: string;
      entryDate: string | Date;
      exitDate: string | Date | null;
      visaType: string;
      maxDays: number;
      notes: string;
      status: string;
      purpose: string;
      accommodation: string;
      cost: number;
      rating: number;
      isEmergency: boolean;
    }>
  ): Promise<CountryVisit> {
    // Verify trip belongs to user
    const existingTrip = await this.prisma.countryVisit.findFirst({
      where: {
        id: tripId,
        userId: this.userId,
      },
    });

    if (!existingTrip) {
      throw new Error('Trip not found or unauthorized');
    }

    // Prepare update data
    const updatePayload: any = {};

    if (updateData.entryDate) {
      updatePayload.entryDate = new Date(updateData.entryDate).toISOString();
    }

    if (updateData.exitDate !== undefined) {
      updatePayload.exitDate = updateData.exitDate
        ? new Date(updateData.exitDate).toISOString()
        : null;
    }

    // Copy other fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'entryDate' && key !== 'exitDate') {
        updatePayload[key] = updateData[key as keyof typeof updateData];
      }
    });

    const updatedTrip = await this.prisma.countryVisit.update({
      where: { id: tripId },
      data: updatePayload,
    });

    return updatedTrip;
  }

  /**
   * Deletes a trip record
   * @param tripId - ID of the trip to delete
   * @returns true if deleted, false if not found
   * 
   * @example
   * ```typescript
   * const deleted = await manager.deleteTrip('trip123');
   * if (deleted) {
   *   console.log('Trip deleted successfully');
   * }
   * ```
   */
  async deleteTrip(tripId: string): Promise<boolean> {
    const result = await this.prisma.countryVisit.deleteMany({
      where: {
        id: tripId,
        userId: this.userId,
      },
    });

    return result.count > 0;
  }

  /**
   * Generates comprehensive travel insights and analytics
   * Analyzes travel patterns, Schengen compliance, and provides recommendations
   * 
   * @returns Complete travel insights including statistics, patterns, and recommendations
   * 
   * @example
   * ```typescript
   * const insights = await manager.getTravelInsights();
   * console.log(`Countries visited: ${insights.summary.countriesVisited}`);
   * console.log(`Schengen days used: ${insights.summary.schengenDaysUsed}/90`);
   * insights.recommendations.forEach(rec => console.log(rec));
   * ```
   */
  async getTravelInsights(): Promise<TravelInsights> {
    const trips = await this.getTrips({
      includeCompleted: true,
      includeOngoing: true,
    });

    // Calculate basic summary
    const totalTrips = trips.length;
    const completedTrips = trips.filter(t => t.status === 'completed').length;
    const ongoingTrips = trips.filter(t => t.status === 'ongoing').length;
    const plannedTrips = trips.filter(t => t.status === 'planned').length;

    const countriesVisited = new Set(trips.map(t => t.country)).size;

    // Calculate total days abroad
    let totalDaysAbroad = 0;
    trips.forEach(trip => {
      if (trip.exitDate) {
        const entry = new Date(trip.entryDate);
        const exit = new Date(trip.exitDate);
        const days =
          Math.ceil(
            (exit.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24)
          ) + 1;
        totalDaysAbroad += days;
      }
    });

    // Get Schengen status
    const schengenStatus = calculateSchengenStatus(trips);

    // Popular destinations
    const countryFrequency: {
      [key: string]: { visits: number; totalDays: number };
    } = {};
    trips.forEach(trip => {
      if (!countryFrequency[trip.country]) {
        countryFrequency[trip.country] = { visits: 0, totalDays: 0 };
      }
      countryFrequency[trip.country].visits += 1;

      if (trip.exitDate) {
        const entry = new Date(trip.entryDate);
        const exit = new Date(trip.exitDate);
        const days =
          Math.ceil(
            (exit.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24)
          ) + 1;
        countryFrequency[trip.country].totalDays += days;
      }
    });

    const popularDestinations = Object.entries(countryFrequency)
      .map(([country, data]) => ({ country, ...data }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);

    // Travel patterns
    const durations = trips
      .filter(t => t.exitDate)
      .map(
        t =>
          Math.ceil(
            (new Date(t.exitDate!).getTime() -
              new Date(t.entryDate).getTime()) /
              (1000 * 60 * 60 * 24)
          ) + 1
      );

    const averageTripDuration =
      durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0;
    const longestTrip = durations.length > 0 ? Math.max(...durations) : 0;
    const shortestTrip = durations.length > 0 ? Math.min(...durations) : 0;

    const visaTypeCounts: { [key: string]: number } = {};
    trips.forEach(trip => {
      visaTypeCounts[trip.visaType] = (visaTypeCounts[trip.visaType] || 0) + 1;
    });
    const mostCommonVisaType =
      Object.entries(visaTypeCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      'Tourist';

    const totalSpent = trips
      .filter(t => t.cost)
      .reduce((sum, t) => sum + (t.cost || 0), 0);

    // Upcoming expirations (for ongoing trips)
    const today = new Date();
    const upcomingExpirations = trips
      .filter(t => t.status === 'ongoing' && t.exitDate)
      .map(t => ({
        country: t.country,
        exitDate: t.exitDate!,
        daysUntilExit: Math.ceil(
          (new Date(t.exitDate!).getTime() - today.getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      }))
      .filter(item => item.daysUntilExit >= 0)
      .sort((a, b) => a.daysUntilExit - b.daysUntilExit);

    // Generate recommendations
    const recommendations: string[] = [];

    if (
      schengenStatus.remainingDays <= 30 &&
      schengenStatus.remainingDays > 0
    ) {
      recommendations.push(
        `셰겐 지역 체류 가능일이 ${schengenStatus.remainingDays}일 남았습니다. 비셰겐 지역 여행을 고려하세요.`
      );
    }

    if (!schengenStatus.isCompliant) {
      recommendations.push(
        '셰겐 규정을 위반했습니다. 법적 조언을 구하시기 바랍니다.'
      );
    }

    if (upcomingExpirations.length > 0) {
      const nextExpiry = upcomingExpirations[0];
      if (nextExpiry.daysUntilExit <= 7) {
        recommendations.push(
          `${nextExpiry.country}에서 ${nextExpiry.daysUntilExit}일 후 출국 예정입니다.`
        );
      }
    }

    if (totalTrips > 10 && averageTripDuration < 7) {
      recommendations.push(
        '짧은 여행을 많이 하는 패턴입니다. 긴 여행도 고려해보세요.'
      );
    }

    const lastTripDate =
      trips.length > 0
        ? trips.sort(
            (a, b) =>
              new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
          )[0].entryDate
        : undefined;

    const plannedTripsUpcoming = trips
      .filter(t => t.status === 'planned')
      .sort(
        (a, b) =>
          new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
      );
    const nextTripDate =
      plannedTripsUpcoming.length > 0
        ? plannedTripsUpcoming[0].entryDate
        : undefined;

    return {
      summary: {
        totalTrips,
        completedTrips,
        ongoingTrips,
        plannedTrips,
        countriesVisited,
        totalDaysAbroad,
        schengenDaysUsed: schengenStatus.usedDays,
        schengenDaysRemaining: schengenStatus.remainingDays,
        lastTripDate: lastTripDate,
        nextTripDate: nextTripDate,
      },
      popularDestinations,
      travelPatterns: {
        averageTripDuration,
        longestTrip,
        shortestTrip,
        mostCommonVisaType,
        totalSpent: totalSpent > 0 ? totalSpent : undefined,
      },
      upcomingExpirations,
      recommendations,
    };
  }

  /**
   * Validates a planned trip against Schengen rules and other constraints
   * @param country - Destination country
   * @param entryDate - Planned entry date
   * @param exitDate - Planned exit date
   * @param passportCountry - User's passport country (optional)
   * @returns Validation result with warnings and suggestions
   * 
   * @example
   * ```typescript
   * const validation = await manager.validatePlannedTrip(
   *   'Germany',
   *   '2024-07-01',
   *   '2024-07-15'
   * );
   * if (!validation.canTravel) {
   *   console.log('Cannot travel:', validation.warnings);
   * }
   * ```
   */
  async validatePlannedTrip(
    country: string,
    entryDate: string | Date,
    exitDate: string | Date,
    passportCountry?: string
  ): Promise<FutureTripValidation> {
    const trips = await this.getTrips();

    return validateFutureTrip(
      trips,
      new Date(entryDate),
      new Date(exitDate),
      country
    );
  }

  /**
   * Retrieves visa requirements between two countries
   * @param fromCountry - Origin/passport country
   * @param toCountry - Destination country
   * @returns Visa requirements including types, duration, and specific requirements
   * 
   * @example
   * ```typescript
   * const requirements = await manager.getVisaRequirements('KR', 'US');
   * console.log(`Visa required: ${requirements.visaRequired}`);
   * console.log(`Visa-free stay: ${requirements.visaFreeStay} days`);
   * ```
   */
  async getVisaRequirements(fromCountry: string, toCountry: string) {
    try {
      const requirement = await this.prisma.visaRequirement.findUnique({
        where: {
          fromCountry_toCountry: {
            fromCountry,
            toCountry,
          },
        },
      });

      if (requirement) {
        return {
          ...requirement,
          visaTypes: JSON.parse(requirement.visaTypes || '[]'),
          requirements: JSON.parse(requirement.requirements || '[]'),
        };
      }

      // Return default if not found
      return {
        fromCountry,
        toCountry,
        visaRequired: null, // Unknown
        visaFreeStay: null,
        visaTypes: [],
        requirements: [],
        note: 'Visa information not available. Please check with relevant embassy.',
      };
    } catch (error) {
      throw new Error('Failed to fetch visa requirements');
    }
  }

  /**
   * Retrieves active travel alerts and warnings for a country
   * @param country - Country to check for alerts
   * @returns Array of active travel alerts sorted by severity
   * 
   * @example
   * ```typescript
   * const alerts = await manager.getTravelAlerts('France');
   * alerts.forEach(alert => {
   *   console.log(`${alert.severity}: ${alert.title}`);
   * });
   * ```
   */
  async getTravelAlerts(country: string) {
    const alerts = await this.prisma.travelAlert.findMany({
      where: {
        country,
        isActive: true,
        OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
      },
      orderBy: [
        { severity: 'desc' }, // critical first
        { createdAt: 'desc' },
      ],
    });

    return alerts;
  }

  /**
   * Retrieves user's travel preferences and settings
   * @returns User preferences or null if not set
   */
  async getTravelPreferences() {
    const preferences = await this.prisma.travelPreferences.findUnique({
      where: { userId: this.userId },
    });

    if (preferences) {
      return {
        ...preferences,
        preferredRegions: JSON.parse(preferences.preferredRegions || '[]'),
        languageSpoken: JSON.parse(preferences.languageSpoken || '[]'),
      };
    }

    return null;
  }

  /**
   * Updates user's travel preferences
   * @param preferences - Preferences to update (partial update supported)
   * @returns Updated preferences record
   * 
   * @example
   * ```typescript
   * await manager.updateTravelPreferences({
   *   preferredRegions: ['Europe', 'Asia'],
   *   budgetRange: 'medium',
   *   travelStyle: 'cultural',
   *   languageSpoken: ['en', 'ko', 'ja'],
   *   emergencyContact: '+82-10-1234-5678'
   * });
   * ```
   */
  async updateTravelPreferences(preferences: {
    preferredRegions?: string[];
    budgetRange?: string;
    travelStyle?: string;
    maxTripDuration?: number;
    languageSpoken?: string[];
    dietaryNeeds?: string;
    mobilityNeeds?: string;
    emergencyContact?: string;
    travelInsurance?: boolean;
  }) {
    const existingPrefs = await this.getTravelPreferences();

    const data = {
      userId: this.userId,
      preferredRegions: preferences.preferredRegions
        ? JSON.stringify(preferences.preferredRegions)
        : undefined,
      budgetRange: preferences.budgetRange,
      travelStyle: preferences.travelStyle,
      maxTripDuration: preferences.maxTripDuration,
      languageSpoken: preferences.languageSpoken
        ? JSON.stringify(preferences.languageSpoken)
        : undefined,
      dietaryNeeds: preferences.dietaryNeeds,
      mobilityNeeds: preferences.mobilityNeeds,
      emergencyContact: preferences.emergencyContact,
      travelInsurance: preferences.travelInsurance,
    };

    // Remove undefined values
    Object.keys(data).forEach(
      key =>
        data[key as keyof typeof data] === undefined &&
        delete data[key as keyof typeof data]
    );

    if (existingPrefs) {
      return await this.prisma.travelPreferences.update({
        where: { userId: this.userId },
        data,
      });
    } else {
      return await this.prisma.travelPreferences.create({
        data: data as any,
      });
    }
  }
}

/**
 * Factory function for creating TravelManager instances
 * @param userId - User ID for the travel manager
 * @returns New TravelManager instance
 * 
 * @example
 * ```typescript
 * const manager = createTravelManager('user123');
 * ```
 */
export function createTravelManager(userId: string): TravelManager {
  return new TravelManager(userId);
}

/**
 * Utility function to get user's travel summary quickly
 * @param userId - User ID to get summary for
 * @returns Trip summary statistics
 * 
 * @example
 * ```typescript
 * const summary = await getUserTravelSummary('user123');
 * console.log(`Total trips: ${summary.totalTrips}`);
 * ```
 */
export async function getUserTravelSummary(
  userId: string
): Promise<TripSummary> {
  const manager = createTravelManager(userId);
  const insights = await manager.getTravelInsights();
  return insights.summary;
}

/**
 * Utility function to validate a user's planned trip
 * @param userId - User ID
 * @param country - Destination country
 * @param entryDate - Planned entry date
 * @param exitDate - Planned exit date
 * @returns Trip validation result
 * 
 * @example
 * ```typescript
 * const validation = await validateUserTrip(
 *   'user123',
 *   'Spain',
 *   '2024-08-01',
 *   '2024-08-15'
 * );
 * ```
 */
export async function validateUserTrip(
  userId: string,
  country: string,
  entryDate: string,
  exitDate: string
): Promise<FutureTripValidation> {
  const manager = createTravelManager(userId);
  return await manager.validatePlannedTrip(country, entryDate, exitDate);
}
