'use client';

import { useState } from 'react';
import { X, Plus, ArrowRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  VISA_DATABASE,
  type PassportCountry,
  VisaRequirement,
} from '@/lib/visa-database';
import { getCountryFlag } from '@/lib/visa-utils';

interface VisaComparisonProps {
  passportCountry: PassportCountry;
  onClose: () => void;
}

export function VisaComparison({
  passportCountry,
  onClose,
}: VisaComparisonProps) {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [availableCountries] = useState(
    () => Object.keys(VISA_DATABASE).slice(0, 20) // Limit for demo
  );

  const _addCountry = (countryCode: string) => {
    if (
      selectedCountries.length < 4 &&
      !selectedCountries.includes(countryCode)
    ) {
      setSelectedCountries([...selectedCountries, countryCode]);
    }
  };

  const _removeCountry = (countryCode: string) => {
    setSelectedCountries(
      selectedCountries.filter(code => code !== countryCode)
    );
  };

  const _getRequirementBadge = (requirement: VisaRequirement) => {
    if (!requirement.visaRequired) {
      return (
        <Badge className='bg-green-100 text-green-800 border-green-200'>
          Visa Free
        </Badge>
      );
    }

    switch (requirement.visaType) {
      case 'visa-on-arrival':
        return (
          <Badge className='bg-yellow-100 text-yellow-800 border-yellow-200'>
            Visa on Arrival
          </Badge>
        );
      case 'evisa':
        return (
          <Badge className='bg-blue-100 text-blue-800 border-blue-200'>
            eVisa
          </Badge>
        );
      case 'embassy':
        return (
          <Badge className='bg-red-100 text-red-800 border-red-200'>
            Embassy Required
          </Badge>
        );
      default:
        return (
          <Badge className='bg-gray-100 text-gray-800 border-gray-200'>
            Unknown
          </Badge>
        );
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <Card className='w-full max-w-6xl max-h-[90vh] overflow-y-auto'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-2xl'>
                Visa Requirements Comparison
              </CardTitle>
              <CardDescription>
                Compare visa requirements for multiple destinations with your{' '}
                {getCountryFlag(passportCountry)} passport
              </CardDescription>
            </div>
            <Button variant='ghost' onClick={onClose}>
              <X className='h-4 w-4' />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Country Selection */}
          <div className='mb-6'>
            <h3 className='text-lg font-semibold mb-3'>
              Select countries to compare (max 4)
            </h3>
            <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2'>
              {availableCountries.map(countryCode => {
                const country = VISA_DATABASE[countryCode];
                const isSelected = selectedCountries.includes(countryCode);

                return (
                  <Button
                    key={countryCode}
                    variant={isSelected ? 'default' : 'outline'}
                    size='sm'
                    onClick={() =>
                      isSelected
                        ? removeCountry(countryCode)
                        : addCountry(countryCode)
                    }
                    disabled={!isSelected && selectedCountries.length >= 4}
                    className='justify-start'
                  >
                    <span className='mr-2'>{getCountryFlag(countryCode)}</span>
                    <span className='truncate'>{country.name}</span>
                    {isSelected ? (
                      <X className='h-3 w-3 ml-auto' />
                    ) : (
                      <Plus className='h-3 w-3 ml-auto' />
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Comparison Table */}
          {selectedCountries.length > 0 && (
            <div className='overflow-x-auto'>
              <table className='w-full border-collapse'>
                <thead>
                  <tr className='border-b'>
                    <th className='text-left p-3 font-semibold'>Aspect</th>
                    {selectedCountries.map(countryCode => (
                      <th
                        key={countryCode}
                        className='text-center p-3 min-w-[200px]'
                      >
                        <div className='flex flex-col items-center gap-1'>
                          <span className='text-2xl'>
                            {getCountryFlag(countryCode)}
                          </span>
                          <span className='font-semibold'>
                            {VISA_DATABASE[countryCode].name}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className='border-b'>
                    <td className='p-3 font-medium'>Visa Requirement</td>
                    {selectedCountries.map(countryCode => {
                      const requirement = VISA_DATABASE[countryCode]
                        .requirements[passportCountry] || {
                        visaRequired: true,
                        visaType: 'embassy' as const,
                        processingTime: 'Unknown',
                        fee: 'Contact embassy',
                        maxStay: 'Varies',
                      };
                      return (
                        <td key={countryCode} className='p-3 text-center'>
                          {getRequirementBadge(requirement)}
                        </td>
                      );
                    })}
                  </tr>

                  <tr className='border-b'>
                    <td className='p-3 font-medium'>Max Stay</td>
                    {selectedCountries.map(countryCode => {
                      const requirement =
                        VISA_DATABASE[countryCode].requirements[
                          passportCountry
                        ];
                      return (
                        <td key={countryCode} className='p-3 text-center'>
                          {requirement?.maxStay || 'Unknown'}
                        </td>
                      );
                    })}
                  </tr>

                  <tr className='border-b'>
                    <td className='p-3 font-medium'>Processing Time</td>
                    {selectedCountries.map(countryCode => {
                      const requirement =
                        VISA_DATABASE[countryCode].requirements[
                          passportCountry
                        ];
                      return (
                        <td key={countryCode} className='p-3 text-center'>
                          {requirement?.processingTime || 'Unknown'}
                        </td>
                      );
                    })}
                  </tr>

                  <tr className='border-b'>
                    <td className='p-3 font-medium'>Fee</td>
                    {selectedCountries.map(countryCode => {
                      const requirement =
                        VISA_DATABASE[countryCode].requirements[
                          passportCountry
                        ];
                      return (
                        <td key={countryCode} className='p-3 text-center'>
                          {requirement?.fee || 'Unknown'}
                        </td>
                      );
                    })}
                  </tr>

                  <tr className='border-b'>
                    <td className='p-3 font-medium'>Region</td>
                    {selectedCountries.map(countryCode => (
                      <td key={countryCode} className='p-3 text-center'>
                        {VISA_DATABASE[countryCode].region}
                      </td>
                    ))}
                  </tr>

                  <tr className='border-b'>
                    <td className='p-3 font-medium'>Currency</td>
                    {selectedCountries.map(countryCode => (
                      <td key={countryCode} className='p-3 text-center'>
                        {VISA_DATABASE[countryCode].currency || 'N/A'}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className='p-3 font-medium'>Travel Advisory</td>
                    {selectedCountries.map(countryCode => {
                      const advisory =
                        VISA_DATABASE[countryCode].travelAdvisory;
                      return (
                        <td key={countryCode} className='p-3 text-center'>
                          <div className='flex items-center justify-center gap-2'>
                            <div
                              className={`w-3 h-3 rounded-full ${
                                advisory === 'low'
                                  ? 'bg-green-500'
                                  : advisory === 'medium'
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                              }`}
                            ></div>
                            <span className='capitalize'>{advisory}</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {selectedCountries.length === 0 && (
            <div className='text-center py-12'>
              <p className='text-gray-500 mb-4'>
                Select countries above to compare their visa requirements
              </p>
              <ArrowRight className='h-8 w-8 text-gray-400 mx-auto' />
            </div>
          )}

          {/* Action Buttons */}
          <div className='flex justify-end gap-2 mt-6 pt-4 border-t'>
            <Button variant='outline' onClick={onClose}>
              Close Comparison
            </Button>
            {selectedCountries.length > 0 && (
              <Button
                onClick={() => {
                  // In a real app, you might export this data or save it
                  console.log('Saving comparison:', selectedCountries);
                }}
              >
                Save Comparison
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
