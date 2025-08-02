/**
 * DINO v2.0 - Travel Data Context
 * Global state management for travel data across DINO features
 */

'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { CountryVisit } from '@/types/schengen';
import type { TravelPeriod } from '@/types/gmail';

interface ImportData {
  readonly source: 'gmail' | 'manual' | 'api';
  readonly visits: readonly CountryVisit[];
  readonly originalPeriods?: readonly TravelPeriod[];
  readonly importedAt: Date;
  readonly userId: string;
}

interface TravelDataContextType {
  // Import data management
  readonly pendingImport: ImportData | null;
  readonly importHistory: readonly ImportData[];
  
  // Actions
  readonly setImportData: (data: ImportData) => void;
  readonly clearImportData: () => void;
  readonly addToHistory: (data: ImportData) => void;
  readonly getImportById: (userId: string) => ImportData | null;
  
  // Multi-destination import
  readonly importToSchengen: (data: ImportData) => Promise<boolean>;
  readonly importToTripHistory: (data: ImportData) => Promise<boolean>;
  readonly importToAnalytics: (data: ImportData) => Promise<boolean>;
  readonly importToMultipleDestinations: (data: ImportData, destinations: string[]) => Promise<{ success: boolean; results: Record<string, boolean> }>;
}

const TravelDataContext = createContext<TravelDataContextType | null>(null);

export function TravelDataProvider({ children }: { children: React.ReactNode }) {
  const [pendingImport, setPendingImport] = useState<ImportData | null>(null);
  const [importHistory, setImportHistory] = useState<readonly ImportData[]>([]);

  const setImportData = useCallback((data: ImportData) => {
    setPendingImport(data);
    console.log('🎯 Travel data queued for import:', data);
  }, []);

  const clearImportData = useCallback(() => {
    setPendingImport(null);
  }, []);

  const addToHistory = useCallback((data: ImportData) => {
    setImportHistory(prev => [data, ...prev.slice(0, 9)]); // Keep last 10 imports
  }, []);

  const getImportById = useCallback((userId: string) => {
    return importHistory.find(item => item.userId === userId) || null;
  }, [importHistory]);

  // Import to Schengen Calculator
  const importToSchengen = useCallback(async (data: ImportData): Promise<boolean> => {
    try {
      console.log('🇪🇺 Importing to Schengen calculator:', data.visits.length, 'visits');
      
      // Store in localStorage for Schengen calculator to pick up
      localStorage.setItem('schengenImportData', JSON.stringify({
        visits: data.visits,
        source: data.source,
        importedAt: data.importedAt.toISOString(),
      }));
      
      return true;
    } catch (error) {
      console.error('Schengen import failed:', error);
      return false;
    }
  }, []);

  // Import to Trip History (future implementation)
  const importToTripHistory = useCallback(async (data: ImportData): Promise<boolean> => {
    try {
      console.log('🗺️ Importing to trip history:', data.visits.length, 'visits');
      
      // TODO: Implement actual trip history integration
      // For now, just store in localStorage
      const existingTrips = JSON.parse(localStorage.getItem('tripHistoryData') || '[]');
      const newTrips = data.visits.map(visit => ({
        id: visit.id,
        country: visit.country,
        entryDate: visit.entryDate,
        exitDate: visit.exitDate,
        source: data.source,
        importedAt: data.importedAt.toISOString(),
      }));
      
      localStorage.setItem('tripHistoryData', JSON.stringify([...existingTrips, ...newTrips]));
      
      return true;
    } catch (error) {
      console.error('Trip history import failed:', error);
      return false;
    }
  }, []);

  // Import to Analytics Dashboard (future implementation)
  const importToAnalytics = useCallback(async (data: ImportData): Promise<boolean> => {
    try {
      console.log('📊 Importing to analytics:', data.visits.length, 'visits');
      
      // TODO: Implement actual analytics integration
      // For now, just store in localStorage
      const analyticsData = {
        totalTrips: data.visits.length,
        countries: Array.from(new Set(data.visits.map(v => v.country))),
        lastImport: data.importedAt.toISOString(),
        source: data.source,
      };
      
      localStorage.setItem('analyticsImportData', JSON.stringify(analyticsData));
      
      return true;
    } catch (error) {
      console.error('Analytics import failed:', error);
      return false;
    }
  }, []);

  // Multi-destination import
  const importToMultipleDestinations = useCallback(async (
    data: ImportData, 
    destinations: string[]
  ): Promise<{ success: boolean; results: Record<string, boolean> }> => {
    const results: Record<string, boolean> = {};
    let overallSuccess = true;

    for (const destination of destinations) {
      try {
        let result = false;
        
        switch (destination) {
          case 'schengen':
            result = await importToSchengen(data);
            break;
          case 'trips':
            result = await importToTripHistory(data);
            break;
          case 'analytics':
            result = await importToAnalytics(data);
            break;
          default:
            console.warn('Unknown destination:', destination);
            result = false;
        }
        
        results[destination] = result;
        if (!result) overallSuccess = false;
        
      } catch (error) {
        console.error(`Import to ${destination} failed:`, error);
        results[destination] = false;
        overallSuccess = false;
      }
    }

    // Add to history if any import succeeded
    if (Object.values(results).some(success => success)) {
      addToHistory(data);
    }

    return { success: overallSuccess, results };
  }, [importToSchengen, importToTripHistory, importToAnalytics, addToHistory]);

  const value: TravelDataContextType = {
    pendingImport,
    importHistory,
    setImportData,
    clearImportData,
    addToHistory,
    getImportById,
    importToSchengen,
    importToTripHistory,
    importToAnalytics,
    importToMultipleDestinations,
  };

  return (
    <TravelDataContext.Provider value={value}>
      {children}
    </TravelDataContext.Provider>
  );
}

export function useTravelData() {
  const context = useContext(TravelDataContext);
  if (!context) {
    throw new Error('useTravelData must be used within a TravelDataProvider');
  }
  return context;
}

export type { ImportData, TravelDataContextType };