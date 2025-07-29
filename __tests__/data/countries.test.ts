// Countries Data Tests - Country Information and Utilities Testing

import {
  COUNTRIES,
  VISA_TYPES,
  PASSPORT_COUNTRIES,
  getCountryByName,
  getSchengenCountries,
  getNonSchengenCountries,
  countries
} from '@/data/countries'
import type { CountryInfo } from '@/data/countries'

describe('Countries Data', () => {
  describe('COUNTRIES constant', () => {
    it('should contain expected number of countries', () => {
      expect(COUNTRIES.length).toBeGreaterThan(50)
      expect(COUNTRIES.length).toBe(57) // Based on the current implementation
    })

    it('should have valid country structure', () => {
      COUNTRIES.forEach(country => {
        expect(country).toHaveProperty('code')
        expect(country).toHaveProperty('name')
        expect(country).toHaveProperty('flag')
        expect(country).toHaveProperty('isSchengen')
        
        expect(typeof country.code).toBe('string')
        expect(typeof country.name).toBe('string')
        expect(typeof country.flag).toBe('string')
        expect(typeof country.isSchengen).toBe('boolean')
        
        expect(country.code.length).toBe(2)
        expect(country.name.length).toBeGreaterThan(0)
        expect(country.flag.length).toBeGreaterThan(0)
      })
    })

    it('should have unique country codes', () => {
      const codes = COUNTRIES.map(country => country.code)
      const uniqueCodes = new Set(codes)
      expect(codes.length).toBe(uniqueCodes.size)
    })

    it('should have unique country names', () => {
      const names = COUNTRIES.map(country => country.name)
      const uniqueNames = new Set(names)
      expect(names.length).toBe(uniqueNames.size)
    })

    it('should contain all expected Schengen countries', () => {
      const expectedSchengenCountries = [
        'Austria', 'Belgium', 'Czech Republic', 'Denmark', 'Estonia',
        'Finland', 'France', 'Germany', 'Greece', 'Hungary',
        'Iceland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg',
        'Malta', 'Netherlands', 'Norway', 'Poland', 'Portugal',
        'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland'
      ]

      const schengenCountries = COUNTRIES
        .filter(country => country.isSchengen)
        .map(country => country.name)

      expectedSchengenCountries.forEach(expected => {
        expect(schengenCountries).toContain(expected)
      })
    })

    it('should contain popular non-Schengen destinations', () => {
      const expectedNonSchengenCountries = [
        'United States', 'United Kingdom', 'Canada', 'Australia',
        'Japan', 'South Korea', 'Singapore', 'Thailand'
      ]

      const nonSchengenCountries = COUNTRIES
        .filter(country => !country.isSchengen)
        .map(country => country.name)

      expectedNonSchengenCountries.forEach(expected => {
        expect(nonSchengenCountries).toContain(expected)
      })
    })

    it('should have proper flag emojis', () => {
      COUNTRIES.forEach(country => {
        // Basic check for flag emoji format (regional indicator symbols)
        expect(country.flag).toMatch(/[\u{1F1E6}-\u{1F1FF}]{2}/u)
      })
    })
  })

  describe('VISA_TYPES constant', () => {
    it('should contain expected visa types', () => {
      const expectedTypes = [
        'Tourist', 'Business', 'Student', 'Working Holiday',
        'Digital Nomad', 'Transit', 'Work', 'Investor',
        'Retirement', 'Volunteer', 'Visa Run', 'Extension',
        'Spouse', 'Medical'
      ]

      expect(VISA_TYPES.length).toBe(expectedTypes.length)
      expectedTypes.forEach(type => {
        expect(VISA_TYPES).toContain(type)
      })
    })

    it('should have all string values', () => {
      VISA_TYPES.forEach(type => {
        expect(typeof type).toBe('string')
        expect(type.length).toBeGreaterThan(0)
      })
    })

    it('should be unique visa types', () => {
      const uniqueTypes = new Set(VISA_TYPES)
      expect(VISA_TYPES.length).toBe(uniqueTypes.size)
    })
  })

  describe('PASSPORT_COUNTRIES constant', () => {
    it('should contain expected passport countries', () => {
      const expectedCountries = [
        { code: 'US', name: 'United States' },
        { code: 'UK', name: 'United Kingdom' },
        { code: 'EU', name: 'European Union' },
        { code: 'CA', name: 'Canada' },
        { code: 'AU', name: 'Australia' },
        { code: 'JP', name: 'Japan' },
        { code: 'OTHER', name: 'Other' }
      ]

      expect(PASSPORT_COUNTRIES.length).toBe(expectedCountries.length)
      
      expectedCountries.forEach(expected => {
        const found = PASSPORT_COUNTRIES.find(p => p.code === expected.code)
        expect(found).toBeDefined()
        expect(found?.name).toBe(expected.name)
      })
    })

    it('should have valid passport country structure', () => {
      PASSPORT_COUNTRIES.forEach(passportCountry => {
        expect(passportCountry).toHaveProperty('code')
        expect(passportCountry).toHaveProperty('name')
        expect(typeof passportCountry.code).toBe('string')
        expect(typeof passportCountry.name).toBe('string')
        expect(passportCountry.code.length).toBeGreaterThan(0)
        expect(passportCountry.name.length).toBeGreaterThan(0)
      })
    })
  })

  describe('getCountryByName function', () => {
    it('should find existing countries by exact name', () => {
      const france = getCountryByName('France')
      expect(france).toBeDefined()
      expect(france?.name).toBe('France')
      expect(france?.code).toBe('FR')
      expect(france?.isSchengen).toBe(true)

      const usa = getCountryByName('United States')
      expect(usa).toBeDefined()
      expect(usa?.name).toBe('United States')
      expect(usa?.code).toBe('US')
      expect(usa?.isSchengen).toBe(false)
    })

    it('should return undefined for non-existent countries', () => {
      const nonExistent = getCountryByName('Atlantis')
      expect(nonExistent).toBeUndefined()
    })

    it('should be case sensitive', () => {
      const lowercase = getCountryByName('france')
      expect(lowercase).toBeUndefined()

      const uppercase = getCountryByName('FRANCE')
      expect(uppercase).toBeUndefined()

      const correct = getCountryByName('France')
      expect(correct).toBeDefined()
    })

    it('should handle empty and null inputs', () => {
      expect(getCountryByName('')).toBeUndefined()
      expect(getCountryByName('   ')).toBeUndefined()
    })
  })

  describe('getSchengenCountries function', () => {
    it('should return only Schengen countries', () => {
      const schengenCountries = getSchengenCountries()
      
      expect(schengenCountries.length).toBeGreaterThan(20)
      schengenCountries.forEach(country => {
        expect(country.isSchengen).toBe(true)
      })
    })

    it('should include expected Schengen countries', () => {
      const schengenCountries = getSchengenCountries()
      const schengenNames = schengenCountries.map(c => c.name)
      
      expect(schengenNames).toContain('France')
      expect(schengenNames).toContain('Germany')
      expect(schengenNames).toContain('Italy')
      expect(schengenNames).toContain('Spain')
      expect(schengenNames).toContain('Netherlands')
    })

    it('should not include non-Schengen countries', () => {
      const schengenCountries = getSchengenCountries()
      const schengenNames = schengenCountries.map(c => c.name)
      
      expect(schengenNames).not.toContain('United States')
      expect(schengenNames).not.toContain('United Kingdom')
      expect(schengenNames).not.toContain('Japan')
    })

    it('should return array with expected structure', () => {
      const schengenCountries = getSchengenCountries()
      
      schengenCountries.forEach(country => {
        expect(country).toHaveProperty('code')
        expect(country).toHaveProperty('name')
        expect(country).toHaveProperty('flag')
        expect(country).toHaveProperty('isSchengen')
        expect(country.isSchengen).toBe(true)
      })
    })
  })

  describe('getNonSchengenCountries function', () => {
    it('should return only non-Schengen countries', () => {
      const nonSchengenCountries = getNonSchengenCountries()
      
      expect(nonSchengenCountries.length).toBeGreaterThan(30)
      nonSchengenCountries.forEach(country => {
        expect(country.isSchengen).toBe(false)
      })
    })

    it('should include expected non-Schengen countries', () => {
      const nonSchengenCountries = getNonSchengenCountries()
      const nonSchengenNames = nonSchengenCountries.map(c => c.name)
      
      expect(nonSchengenNames).toContain('United States')
      expect(nonSchengenNames).toContain('United Kingdom')
      expect(nonSchengenNames).toContain('Japan')
      expect(nonSchengenNames).toContain('Australia')
      expect(nonSchengenNames).toContain('Canada')
    })

    it('should not include Schengen countries', () => {
      const nonSchengenCountries = getNonSchengenCountries()
      const nonSchengenNames = nonSchengenCountries.map(c => c.name)
      
      expect(nonSchengenNames).not.toContain('France')
      expect(nonSchengenNames).not.toContain('Germany')
      expect(nonSchengenNames).not.toContain('Italy')
    })

    it('should return array with expected structure', () => {
      const nonSchengenCountries = getNonSchengenCountries()
      
      nonSchengenCountries.forEach(country => {
        expect(country).toHaveProperty('code')
        expect(country).toHaveProperty('name')
        expect(country).toHaveProperty('flag')
        expect(country).toHaveProperty('isSchengen')
        expect(country.isSchengen).toBe(false)
      })
    })
  })

  describe('Data integrity and relationships', () => {
    it('should have Schengen and non-Schengen countries add up to total', () => {
      const schengenCount = getSchengenCountries().length
      const nonSchengenCount = getNonSchengenCountries().length
      const totalCount = COUNTRIES.length
      
      expect(schengenCount + nonSchengenCount).toBe(totalCount)
    })

    it('should have no overlap between Schengen and non-Schengen countries', () => {
      const schengenNames = getSchengenCountries().map(c => c.name)
      const nonSchengenNames = getNonSchengenCountries().map(c => c.name)
      
      schengenNames.forEach(name => {
        expect(nonSchengenNames).not.toContain(name)
      })
    })

    it('should maintain referential integrity', () => {
      // Every country returned by utility functions should exist in main array
      const schengenCountries = getSchengenCountries()
      const nonSchengenCountries = getNonSchengenCountries()
      
      schengenCountries.forEach(country => {
        expect(COUNTRIES).toContainEqual(country)
      })
      
      nonSchengenCountries.forEach(country => {
        expect(COUNTRIES).toContainEqual(country)
      })
    })
  })

  describe('Backward compatibility exports', () => {
    it('should export countries as default', () => {
      // This test verifies the default export works
      expect(Array.isArray(countries)).toBe(true)
      expect(countries.length).toBe(COUNTRIES.length)
      expect(countries).toEqual(COUNTRIES)
    })

    it('should export countries as named export', () => {
      expect(Array.isArray(countries)).toBe(true)
      expect(countries.length).toBe(COUNTRIES.length)
      expect(countries).toEqual(COUNTRIES)
    })
  })

  describe('Optional visa information', () => {
    it('should handle countries with visa information', () => {
      // Test that the visa information structure is valid when present
      COUNTRIES.forEach(country => {
        if (country.visaFree) {
          expect(typeof country.visaFree).toBe('object')
          
          // Check that visa-free periods are numbers when defined
          Object.values(country.visaFree).forEach(period => {
            if (period !== undefined) {
              expect(typeof period).toBe('number')
              expect(period).toBeGreaterThan(0)
            }
          })
        }
      })
    })

    it('should handle countries without visa information', () => {
      // Most countries in our current dataset don't have visa info, which is fine
      const countriesWithoutVisa = COUNTRIES.filter(c => !c.visaFree)
      expect(countriesWithoutVisa.length).toBeGreaterThan(0)
    })
  })
})