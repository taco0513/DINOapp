// Visa Requirements Tests - Visa Logic and Requirements Testing

import {
  getVisaRequirements,
  POPULAR_DESTINATIONS
} from '@/lib/visa-requirements'
import type { PassportCountry } from '@/types/global'

describe('Visa Requirements', () => {
  describe('getVisaRequirements function', () => {
    describe('Korean passport (KR)', () => {
      it('should return correct visa-free countries for Korean passport', () => {
        const usVisa = getVisaRequirements('KR', 'US')
        expect(usVisa.visaRequired).toBe(false)
        expect(usVisa.visaType).toBe('ESTA')
        expect(usVisa.maxStayDays).toBe(90)
        expect(usVisa.notes).toContain('ESTA')

        const jpVisa = getVisaRequirements('KR', 'JP')
        expect(jpVisa.visaRequired).toBe(false)
        expect(jpVisa.maxStayDays).toBe(90)

        const gbVisa = getVisaRequirements('KR', 'GB')
        expect(gbVisa.visaRequired).toBe(false)
        expect(gbVisa.maxStayDays).toBe(180)
      })

      it('should return correct Schengen countries for Korean passport', () => {
        const schengenCountries = ['FR', 'DE', 'ES', 'IT', 'NL']
        
        schengenCountries.forEach(country => {
          const visa = getVisaRequirements('KR', country)
          expect(visa.visaRequired).toBe(false)
          expect(visa.visaType).toBe('Visa Waiver')
          expect(visa.maxStayDays).toBe(90)
          expect(visa.notes).toContain('셴겐')
        })
      })

      it('should return correct visa-required countries for Korean passport', () => {
        const cnVisa = getVisaRequirements('KR', 'CN')
        expect(cnVisa.visaRequired).toBe(true)
        expect(cnVisa.visaType).toBe('Tourist Visa')
        expect(cnVisa.maxStayDays).toBe(30)

        const inVisa = getVisaRequirements('KR', 'IN')
        expect(inVisa.visaRequired).toBe(true)
        expect(inVisa.visaType).toBe('e-Visa')
        expect(inVisa.maxStayDays).toBe(30)
      })

      it('should return correct Southeast Asian countries for Korean passport', () => {
        const thVisa = getVisaRequirements('KR', 'TH')
        expect(thVisa.visaRequired).toBe(false)
        expect(thVisa.maxStayDays).toBe(90)

        const vnVisa = getVisaRequirements('KR', 'VN')
        expect(vnVisa.visaRequired).toBe(false)
        expect(vnVisa.maxStayDays).toBe(45)

        const idVisa = getVisaRequirements('KR', 'ID')
        expect(idVisa.visaRequired).toBe(false)
        expect(idVisa.maxStayDays).toBe(30)
      })

      it('should return correct Latin American countries for Korean passport', () => {
        const brVisa = getVisaRequirements('KR', 'BR')
        expect(brVisa.visaRequired).toBe(false)
        expect(brVisa.maxStayDays).toBe(90)

        const mxVisa = getVisaRequirements('KR', 'MX')
        expect(mxVisa.visaRequired).toBe(false)
        expect(mxVisa.maxStayDays).toBe(180)
      })
    })

    describe('US passport', () => {
      it('should return correct requirements for US passport holders', () => {
        const krVisa = getVisaRequirements('US', 'KR')
        expect(krVisa.visaRequired).toBe(false)
        expect(krVisa.visaType).toBe('K-ETA')
        expect(krVisa.maxStayDays).toBe(90)
        expect(krVisa.notes).toContain('K-ETA')

        const jpVisa = getVisaRequirements('US', 'JP')
        expect(jpVisa.visaRequired).toBe(false)
        expect(jpVisa.maxStayDays).toBe(90)

        const cnVisa = getVisaRequirements('US', 'CN')
        expect(cnVisa.visaRequired).toBe(true)
        expect(cnVisa.maxStayDays).toBe(60)
      })
    })

    describe('Japanese passport', () => {
      it('should return correct requirements for Japanese passport holders', () => {
        const krVisa = getVisaRequirements('JP', 'KR')
        expect(krVisa.visaRequired).toBe(false)
        expect(krVisa.visaType).toBe('K-ETA')
        expect(krVisa.notes).toContain('K-ETA')

        const usVisa = getVisaRequirements('JP', 'US')
        expect(usVisa.visaRequired).toBe(false)
        expect(usVisa.visaType).toBe('ESTA')
        expect(usVisa.notes).toContain('ESTA')
      })
    })

    describe('Chinese passport', () => {
      it('should return correct requirements for Chinese passport holders', () => {
        const krVisa = getVisaRequirements('CN', 'KR')
        expect(krVisa.visaRequired).toBe(true)
        expect(krVisa.visaType).toBe('Tourist Visa')
        expect(krVisa.maxStayDays).toBe(30)

        const jpVisa = getVisaRequirements('CN', 'JP')
        expect(jpVisa.visaRequired).toBe(true)
        expect(jpVisa.maxStayDays).toBe(15)
      })
    })

    describe('Fallback behavior', () => {
      it('should return default visa requirements for unknown passport countries', () => {
        const unknownPassport = 'ZZ' as PassportCountry
        const visa = getVisaRequirements(unknownPassport, 'US')
        
        expect(visa.visaRequired).toBe(true)
        expect(visa.visaType).toBe('Tourist Visa')
        expect(visa.maxStayDays).toBe(30)
        expect(visa.notes).toContain('대사관에 문의')
      })

      it('should return default visa requirements for unknown destination countries', () => {
        const visa = getVisaRequirements('KR', 'UNKNOWN_COUNTRY')
        
        expect(visa.visaRequired).toBe(true)
        expect(visa.visaType).toBe('Tourist Visa')
        expect(visa.maxStayDays).toBe(30)
        expect(visa.notes).toContain('대사관에 문의')
      })

      it('should use OTHER passport fallback correctly', () => {
        const krVisa = getVisaRequirements('OTHER', 'KR')
        expect(krVisa.visaRequired).toBe(true)
        expect(krVisa.visaType).toBe('Tourist Visa')
        expect(krVisa.maxStayDays).toBe(30)

        const usVisa = getVisaRequirements('OTHER', 'US')
        expect(usVisa.visaRequired).toBe(true)
        expect(usVisa.maxStayDays).toBe(90)
      })
    })

    describe('Special visa types', () => {
      it('should handle ESTA requirements correctly', () => {
        const usVisa = getVisaRequirements('KR', 'US')
        expect(usVisa.visaType).toBe('ESTA')
        expect(usVisa.notes).toContain('$21')
      })

      it('should handle eTA requirements correctly', () => {
        const caVisa = getVisaRequirements('KR', 'CA')
        expect(caVisa.visaType).toBe('eTA')
        expect(caVisa.notes).toContain('CAD $7')
      })

      it('should handle ETA requirements correctly', () => {
        const auVisa = getVisaRequirements('KR', 'AU')
        expect(auVisa.visaRequired).toBe(true)
        expect(auVisa.visaType).toBe('ETA')
        expect(auVisa.notes).toContain('AUD $20')
      })

      it('should handle K-ETA requirements correctly', () => {
        const krVisaFromUS = getVisaRequirements('US', 'KR')
        const krVisaFromJP = getVisaRequirements('JP', 'KR')
        
        expect(krVisaFromUS.visaType).toBe('K-ETA')
        expect(krVisaFromJP.visaType).toBe('K-ETA')
      })
    })

    describe('Data consistency', () => {
      it('should have consistent data structure for all visa requirements', () => {
        const testCases = [
          ['KR', 'US'], ['KR', 'JP'], ['KR', 'CN'], ['KR', 'FR'],
          ['US', 'KR'], ['JP', 'KR'], ['CN', 'KR']
        ]

        testCases.forEach(([passport, destination]) => {
          const visa = getVisaRequirements(passport as PassportCountry, destination)
          
          expect(visa).toHaveProperty('visaRequired')
          expect(visa).toHaveProperty('visaType')
          expect(visa).toHaveProperty('maxStayDays')
          
          expect(typeof visa.visaRequired).toBe('boolean')
          expect(typeof visa.visaType).toBe('string')
          expect(typeof visa.maxStayDays).toBe('number')
          
          expect(visa.visaType.length).toBeGreaterThan(0)
          expect(visa.maxStayDays).toBeGreaterThan(0)
          
          if (visa.notes) {
            expect(typeof visa.notes).toBe('string')
          }
        })
      })

      it('should have reasonable stay duration limits', () => {
        const testCases = [
          ['KR', 'US'], ['KR', 'JP'], ['KR', 'GB'], ['KR', 'FR'],
          ['US', 'KR'], ['JP', 'US'], ['CN', 'KR']
        ]

        testCases.forEach(([passport, destination]) => {
          const visa = getVisaRequirements(passport as PassportCountry, destination)
          
          // Most visa-free stays are between 15-180 days
          expect(visa.maxStayDays).toBeGreaterThanOrEqual(15)
          expect(visa.maxStayDays).toBeLessThanOrEqual(365)
        })
      })
    })
  })

  describe('POPULAR_DESTINATIONS constant', () => {
    it('should contain popular destinations for each passport type', () => {
      const passportTypes: PassportCountry[] = ['KR', 'US', 'JP', 'CN', 'OTHER']
      
      passportTypes.forEach(passportType => {
        expect(POPULAR_DESTINATIONS).toHaveProperty(passportType)
        expect(Array.isArray(POPULAR_DESTINATIONS[passportType])).toBe(true)
        expect(POPULAR_DESTINATIONS[passportType].length).toBeGreaterThan(0)
      })
    })

    it('should have valid country codes in popular destinations', () => {
      Object.values(POPULAR_DESTINATIONS).forEach(destinations => {
        destinations.forEach(destination => {
          expect(typeof destination).toBe('string')
          expect(destination.length).toBe(2) // ISO country codes are 2 letters
          expect(destination).toMatch(/^[A-Z]{2}$/)
        })
      })
    })

    it('should contain expected popular destinations for Korean passport', () => {
      const krDestinations = POPULAR_DESTINATIONS.KR
      
      expect(krDestinations).toContain('US')
      expect(krDestinations).toContain('JP')
      expect(krDestinations).toContain('TH')
      expect(krDestinations).toContain('FR')
      expect(krDestinations).toContain('GB')
    })

    it('should contain expected popular destinations for US passport', () => {
      const usDestinations = POPULAR_DESTINATIONS.US
      
      expect(usDestinations).toContain('MX')
      expect(usDestinations).toContain('CA')
      expect(usDestinations).toContain('GB')
      expect(usDestinations).toContain('FR')
      expect(usDestinations).toContain('JP')
    })

    it('should not contain duplicate destinations', () => {
      Object.entries(POPULAR_DESTINATIONS).forEach(([passportType, destinations]) => {
        const uniqueDestinations = new Set(destinations)
        expect(destinations.length).toBe(uniqueDestinations.size)
      })
    })

    it('should have reasonable number of popular destinations', () => {
      Object.values(POPULAR_DESTINATIONS).forEach(destinations => {
        expect(destinations.length).toBeGreaterThanOrEqual(5)
        expect(destinations.length).toBeLessThanOrEqual(15)
      })
    })
  })

  describe('Integration scenarios', () => {
    it('should handle visa requirements for a complete trip planning scenario', () => {
      // Korean passport holder planning multi-country trip
      const tripCountries = ['JP', 'TH', 'SG', 'MY', 'VN']
      
      const visaRequirements = tripCountries.map(country => ({
        country,
        visa: getVisaRequirements('KR', country)
      }))

      // All should be visa-free for Korean passport
      visaRequirements.forEach(({ country, visa }) => {
        expect(visa.visaRequired).toBe(false)
        expect(visa.maxStayDays).toBeGreaterThan(0)
      })

      // Check specific requirements
      const jpVisa = visaRequirements.find(v => v.country === 'JP')?.visa
      expect(jpVisa?.maxStayDays).toBe(90)

      const vnVisa = visaRequirements.find(v => v.country === 'VN')?.visa
      expect(vnVisa?.maxStayDays).toBe(45)
    })

    it('should handle visa requirements for business travelers', () => {
      // Test different passport types for business travel to Korea
      const businessTravelers = [
        { passport: 'US' as PassportCountry, expectation: { visaRequired: false, hasKETA: true } },
        { passport: 'JP' as PassportCountry, expectation: { visaRequired: false, hasKETA: true } },
        { passport: 'CN' as PassportCountry, expectation: { visaRequired: true, hasKETA: false } }
      ]

      businessTravelers.forEach(({ passport, expectation }) => {
        const visa = getVisaRequirements(passport, 'KR')
        
        expect(visa.visaRequired).toBe(expectation.visaRequired)
        
        if (expectation.hasKETA) {
          expect(visa.visaType).toBe('K-ETA')
          expect(visa.notes).toContain('K-ETA')
        }
      })
    })

    it('should provide comprehensive visa information for digital nomads', () => {
      // Popular digital nomad destinations for Korean passport
      const nomadDestinations = ['TH', 'VN', 'MX', 'BR', 'TR', 'AE']
      
      nomadDestinations.forEach(destination => {
        const visa = getVisaRequirements('KR', destination)
        
        // All should be visa-free for Korean passport holders
        expect(visa.visaRequired).toBe(false)
        expect(visa.maxStayDays).toBeGreaterThanOrEqual(30)
        
        // Longer stays are preferred for digital nomads
        if (destination === 'MX') {
          expect(visa.maxStayDays).toBe(180)
        }
      })
    })
  })
})