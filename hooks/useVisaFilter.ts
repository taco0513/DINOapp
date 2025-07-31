'use client';

import { useMemo } from 'react';
import {
  VISA_DATABASE,
  type PassportCountry,
  type VisaType,
} from '@/lib/visa-database';

interface FilteredCountry {
  code: string;
  name: string;
  region: string;
  visaTypes: VisaType[];
  requiredDocuments: string[];
  embassy?: {
    address: string;
    phone?: string;
    website?: string;
  };
  travelAdvisory: 'low' | 'medium' | 'high';
  capital?: string;
  requirements: any;
  visaRequirement: any;
}

interface UseVisaFilterProps {
  searchQuery: string;
  selectedPassport: PassportCountry;
  selectedVisaType: VisaType | 'all';
  selectedRequirement:
    | 'all'
    | 'visa-free'
    | 'visa-on-arrival'
    | 'evisa'
    | 'embassy';
  bookmarkedCountries: string[];
  showOnlyBookmarked: boolean;
}

export function useVisaFilter({
  searchQuery,
  selectedPassport,
  selectedVisaType,
  selectedRequirement,
  bookmarkedCountries,
  showOnlyBookmarked,
}: UseVisaFilterProps) {
  const filteredCountries = useMemo(() => {
    let countries: FilteredCountry[] = Object.entries(VISA_DATABASE).map(
      ([countryCode, countryData]) => ({
        code: countryCode,
        ...countryData,
        visaRequirement: countryData.requirements[selectedPassport] || {
          visaRequired: true,
          visaType: 'embassy' as const,
          processingTime: '7-14 days',
          fee: 'Contact embassy',
          maxStay: '30 days',
          notes: 'Contact embassy for accurate information',
        },
      })
    );

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      countries = countries.filter(
        country =>
          country.name.toLowerCase().includes(query) ||
          country.code.toLowerCase().includes(query) ||
          country.region.toLowerCase().includes(query)
      );
    }

    // Visa requirement filter
    if (selectedRequirement !== 'all') {
      countries = countries.filter(country => {
        const req = country.visaRequirement;
        switch (selectedRequirement) {
          case 'visa-free':
            return !req.visaRequired;
          case 'visa-on-arrival':
            return req.visaType === 'visa-on-arrival';
          case 'evisa':
            return req.visaType === 'evisa';
          case 'embassy':
            return req.visaType === 'embassy';
          default:
            return true;
        }
      });
    }

    // Visa type filter
    if (selectedVisaType !== 'all') {
      countries = countries.filter(country =>
        country.visaTypes.includes(selectedVisaType)
      );
    }

    // Bookmarked filter
    if (showOnlyBookmarked) {
      countries = countries.filter(country =>
        bookmarkedCountries.includes(country.code)
      );
    }

    return countries;
  }, [
    searchQuery,
    selectedPassport,
    selectedVisaType,
    selectedRequirement,
    bookmarkedCountries,
    showOnlyBookmarked,
  ]);

  return {
    countries: filteredCountries,
    totalCount: filteredCountries.length,
  };
}
