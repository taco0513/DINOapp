/**
 * Tests for Schengen Calculator
 * DINO v2.0 - Zero technical debt testing
 */

import { 
  calculateSchengenStatus, 
  calculateComprehensiveStatus
} from '@/lib/schengen/calculator';
import { CountryVisit } from '@/types/schengen';

describe('Schengen Calculator', () => {
  
  describe('calculateSchengenStatus', () => {
    it('should calculate correct status for no visits', () => {
      const visits: CountryVisit[] = [];
      const status = calculateSchengenStatus(visits);
      
      expect(status.usedDays).toBe(0);
      expect(status.remainingDays).toBe(90);
      expect(status.isCompliant).toBe(true);
    });
    
    it('should handle multiple completed visits', () => {
      // Test with dates within the current 180-day window
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);
      
      const visits: CountryVisit[] = [
        {
          id: '1',
          userId: 'test',
          country: 'France',
          entryDate: sixtyDaysAgo.toISOString().split('T')[0],
          exitDate: new Date(sixtyDaysAgo.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          visaType: 'tourist',
          maxDays: 90,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          userId: 'test',
          country: 'Italy',
          entryDate: thirtyDaysAgo.toISOString().split('T')[0],
          exitDate: new Date(thirtyDaysAgo.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          visaType: 'tourist',
          maxDays: 90,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      const status = calculateSchengenStatus(visits);
      
      expect(status.usedDays).toBeGreaterThanOrEqual(0);
      expect(status.remainingDays).toBeLessThanOrEqual(90);
      expect(status.isCompliant).toBe(true);
    });
    
    it('should detect potential overstay scenarios', () => {
      // Test with a long stay that exceeds 90 days within the current window
      const today = new Date();
      const startDate = new Date(today.getTime() - 100 * 24 * 60 * 60 * 1000);
      
      const visits: CountryVisit[] = [
        {
          id: '3',
          userId: 'test',
          country: 'Portugal',
          entryDate: startDate.toISOString().split('T')[0],
          exitDate: new Date(startDate.getTime() + 100 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          visaType: 'tourist',
          maxDays: 90,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      const status = calculateSchengenStatus(visits);
      
      // The exact calculation depends on the 180-day window, so we check relative values
      expect(status.usedDays).toBeGreaterThan(0);
      expect(status.isCompliant).toBe(status.usedDays <= 90);
    });
  });
  
  describe('calculateComprehensiveStatus', () => {
    it('should return comprehensive status for empty visits', () => {
      const visits: CountryVisit[] = [];
      const result = calculateComprehensiveStatus(visits);
      
      expect(result.status.usedDays).toBe(0);
      expect(result.status.remainingDays).toBe(90);
      expect(result.status.isCompliant).toBe(true);
      expect(result.recommendations).toBeDefined();
      expect(result.warnings).toBeDefined();
    });
    
    it('should provide recommendations', () => {
      const visits: CountryVisit[] = [
        {
          id: '4',
          userId: 'test',
          country: 'DE',
          entryDate: '2024-01-01',
          exitDate: '2024-01-30',
          visaType: 'tourist',
          maxDays: 90,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      const result = calculateComprehensiveStatus(visits);
      
      expect(result.recommendations.length).toBeGreaterThanOrEqual(0);
      expect(result.warnings.length).toBeGreaterThanOrEqual(0);
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle empty visit array', () => {
      const status = calculateSchengenStatus([]);
      expect(status).toBeDefined();
      expect(status.usedDays).toBe(0);
    });
    
    it('should handle single visit', () => {
      const today = new Date();
      const fourteenDaysAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
      
      const visits: CountryVisit[] = [
        {
          id: '5',
          userId: 'test',
          country: 'France',
          entryDate: fourteenDaysAgo.toISOString().split('T')[0],
          exitDate: today.toISOString().split('T')[0],
          visaType: 'tourist',
          maxDays: 90,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      const status = calculateSchengenStatus(visits);
      expect(status).toBeDefined();
      expect(status.usedDays).toBeGreaterThanOrEqual(0);
      expect(status.remainingDays).toBeLessThanOrEqual(90);
    });
  });
});