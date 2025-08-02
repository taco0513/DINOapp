/**
 * DINO v2.0 - Visa Policy Update Service
 * Real-time visa policy monitoring and updates
 */

import type { VisaPolicy, VisaPolicyUpdate } from '@/types/visa-policy';

// Mock data for demonstration - in production, this would connect to real APIs
const MOCK_POLICY_UPDATES: VisaPolicyUpdate[] = [
  {
    id: '1',
    policyId: 'kr-de-001',
    changeType: 'UPDATE',
    previousPolicy: {
      maxStayDays: 90,
    },
    newPolicy: {
      id: 'kr-de-001',
      fromCountry: 'KR',
      toCountry: 'DE',
      policyType: 'VISA_FREE',
      maxStayDays: 180,
      validityDays: null,
      fee: null,
      currency: null,
      requirements: ['Valid passport', 'Return ticket'],
      lastUpdated: new Date('2024-01-15'),
      effectiveDate: new Date('2024-02-01'),
      source: 'German Federal Foreign Office',
      notes: 'Extended visa-free stay for Korean citizens',
    },
    timestamp: new Date('2024-01-15'),
    verified: true,
  },
  {
    id: '2',
    policyId: 'kr-jp-001',
    changeType: 'UPDATE',
    previousPolicy: {
      policyType: 'VISA_REQUIRED',
    },
    newPolicy: {
      id: 'kr-jp-001',
      fromCountry: 'KR',
      toCountry: 'JP',
      policyType: 'VISA_FREE',
      maxStayDays: 90,
      validityDays: null,
      fee: null,
      currency: null,
      requirements: ['Valid passport'],
      lastUpdated: new Date('2024-01-10'),
      effectiveDate: new Date('2024-01-10'),
      source: 'Japan Ministry of Foreign Affairs',
      notes: 'Visa exemption resumed',
    },
    timestamp: new Date('2024-01-10'),
    verified: true,
  },
];

export class VisaPolicyUpdateService {
  private static instance: VisaPolicyUpdateService;
  private subscribers: Map<string, (update: VisaPolicyUpdate) => void> = new Map();
  private updateCheckInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): VisaPolicyUpdateService {
    if (!VisaPolicyUpdateService.instance) {
      VisaPolicyUpdateService.instance = new VisaPolicyUpdateService();
    }
    return VisaPolicyUpdateService.instance;
  }

  // Subscribe to policy updates
  subscribe(userId: string, callback: (update: VisaPolicyUpdate) => void) {
    this.subscribers.set(userId, callback);
    
    // Start checking for updates if not already running
    if (!this.updateCheckInterval) {
      this.startUpdateCheck();
    }
  }

  // Unsubscribe from updates
  unsubscribe(userId: string) {
    this.subscribers.delete(userId);
    
    // Stop checking if no subscribers
    if (this.subscribers.size === 0 && this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
      this.updateCheckInterval = null;
    }
  }

  // Get recent updates
  async getRecentUpdates(countries?: string[]): Promise<VisaPolicyUpdate[]> {
    // In production, this would fetch from a real API
    let updates = [...MOCK_POLICY_UPDATES];
    
    if (countries && countries.length > 0) {
      updates = updates.filter(update => 
        countries.includes(update.newPolicy.fromCountry) ||
        countries.includes(update.newPolicy.toCountry)
      );
    }
    
    return updates.sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  // Check if a policy affects user's countries
  isPolicyRelevant(policy: VisaPolicy, userCountries: string[]): boolean {
    return userCountries.includes(policy.fromCountry) || 
           userCountries.includes(policy.toCountry);
  }

  // Start periodic update checks
  private startUpdateCheck() {
    // Check for updates every 30 minutes
    this.updateCheckInterval = setInterval(async () => {
      await this.checkForUpdates();
    }, 30 * 60 * 1000);
    
    // Also check immediately
    this.checkForUpdates();
  }

  // Check for new policy updates
  private async checkForUpdates() {
    try {
      // In production, this would fetch from multiple visa policy APIs
      // For now, we'll simulate with random updates
      const shouldSimulateUpdate = Math.random() > 0.8;
      
      if (shouldSimulateUpdate && this.subscribers.size > 0) {
        // Create a mock update
        const mockUpdate: VisaPolicyUpdate = {
          id: `mock-${Date.now()}`,
          policyId: 'kr-th-001',
          changeType: 'UPDATE',
          previousPolicy: {
            policyType: 'VISA_ON_ARRIVAL',
            maxStayDays: 15,
          },
          newPolicy: {
            id: 'kr-th-001',
            fromCountry: 'KR',
            toCountry: 'TH',
            policyType: 'VISA_FREE',
            maxStayDays: 30,
            validityDays: null,
            fee: null,
            currency: null,
            requirements: ['Valid passport', 'Proof of accommodation'],
            lastUpdated: new Date(),
            effectiveDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            source: 'Thailand Ministry of Foreign Affairs',
            notes: 'Extended visa-free stay starting next week',
          },
          timestamp: new Date(),
          verified: true,
        };
        
        // Notify all subscribers
        this.notifySubscribers(mockUpdate);
      }
    } catch (error) {
      console.error('Error checking for visa policy updates:', error);
    }
  }

  // Notify subscribers of updates
  private notifySubscribers(update: VisaPolicyUpdate) {
    this.subscribers.forEach((callback) => {
      try {
        callback(update);
      } catch (error) {
        console.error('Error notifying subscriber:', error);
      }
    });
  }
}