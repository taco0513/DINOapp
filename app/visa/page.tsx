'use client';

import { useState } from 'react';
import {
  Search,
  Bookmark,
  BookmarkCheck,
  Info,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Zap,
  GitCompare,
  CheckSquare,
  Globe,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  StandardPageLayout,
  PageIcons,
} from '@/components/layout/StandardPageLayout';
import {
  VISA_DATABASE,
  PASSPORT_COUNTRIES,
  VisaRequirement,
  type PassportCountry,
  type VisaType,
} from '@/lib/visa-database';
import { getCountryFlag, getVisaTypeIcon } from '@/lib/visa-utils';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useVisaFilter } from '@/hooks/useVisaFilter';
import { VisaComparison } from '@/components/visa/VisaComparison';
import { VisaChecklist } from '@/components/visa/VisaChecklist';
import { t } from '@/lib/i18n';

export default function VisaPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPassport, setSelectedPassport] =
    useState<PassportCountry>('KR');
  const [selectedVisaType, setSelectedVisaType] = useState<VisaType | 'all'>(
    'all'
  );
  const [selectedRequirement, setSelectedRequirement] = useState<
    'all' | 'visa-free' | 'visa-on-arrival' | 'evisa' | 'embassy'
  >('all');
  const [bookmarkedCountries, setBookmarkedCountries] = useLocalStorage<
    string[]
  >('visa-bookmarks', []);
  const [showOnlyBookmarked, setShowOnlyBookmarked] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [showChecklist, setShowChecklist] = useState<string | null>(null);

  // Use custom hook for filtering logic
  const { countries: filteredCountries } = useVisaFilter({
    searchQuery,
    selectedPassport,
    selectedVisaType,
    selectedRequirement,
    bookmarkedCountries,
    showOnlyBookmarked,
  });

  const toggleBookmark = (countryCode: string) => {
    setBookmarkedCountries(prev =>
      prev.includes(countryCode)
        ? prev.filter(code => code !== countryCode)
        : [...prev, countryCode]
    );
  };

  const getRequirementBadge = (requirement: VisaRequirement) => {
    if (!requirement.visaRequired) {
      return (
        <Badge className='bg-green-100 text-green-800 border-green-200'>
          {t('visa.visa_free')}
        </Badge>
      );
    }

    switch (requirement.visaType) {
      case 'visa-on-arrival':
        return (
          <Badge className='bg-yellow-100 text-yellow-800 border-yellow-200'>
            {t('visa.visa_on_arrival')}
          </Badge>
        );
      case 'evisa':
        return (
          <Badge className='bg-blue-100 text-blue-800 border-blue-200'>
            {t('visa.evisa')}
          </Badge>
        );
      case 'embassy':
        return (
          <Badge className='bg-red-100 text-red-800 border-red-200'>
            {t('visa.embassy_required')}
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

  const getRequirementIcon = (requirement: VisaRequirement) => {
    if (!requirement.visaRequired) {
      return <CheckCircle2 className='h-4 w-4 text-green-600' />;
    }

    switch (requirement.visaType) {
      case 'visa-on-arrival':
        return <Clock className='h-4 w-4 text-yellow-600' />;
      case 'evisa':
        return <Zap className='h-4 w-4 text-blue-600' />;
      case 'embassy':
        return <XCircle className='h-4 w-4 text-red-600' />;
      default:
        return <AlertTriangle className='h-4 w-4 text-gray-600' />;
    }
  };

  const selectedCountryData = selectedCountry
    ? Object.entries(VISA_DATABASE).find(
        ([code]) => code === selectedCountry
      )?.[1]
    : null;

  return (
    <StandardPageLayout
      title={t('visa.title')}
      description={t('visa.description')}
      icon={PageIcons.Visa}
      breadcrumbs={[
        { label: t('nav.dashboard'), href: '/dashboard' },
        { label: t('nav.visa') },
      ]}
    >
      {/* Search and Filters */}
      <Card className='mb-8'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Search className='h-5 w-5' />
            {t('visa.search.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4'>
            <div>
              <label className='block text-sm font-medium mb-2'>
                {t('visa.search.countries')}
              </label>
              <div className='relative'>
                <Search
                  className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400'
                  aria-hidden='true'
                />
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t('visa.search.placeholder')}
                  className='pl-10'
                  aria-label={t('visa.search.countries')}
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium mb-2'>
                {t('visa.passport')}
              </label>
              <Select
                value={selectedPassport}
                onValueChange={value =>
                  setSelectedPassport(value as PassportCountry)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PASSPORT_COUNTRIES.map(country => (
                    <SelectItem key={country.code} value={country.code}>
                      {getCountryFlag(country.code)} {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className='block text-sm font-medium mb-2'>
                {t('visa.requirement')}
              </label>
              <Select
                value={selectedRequirement}
                onValueChange={value => setSelectedRequirement(value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>
                    {t('visa.all_requirements')}
                  </SelectItem>
                  <SelectItem value='visa-free'>
                    {t('visa.visa_free')}
                  </SelectItem>
                  <SelectItem value='visa-on-arrival'>
                    {t('visa.visa_on_arrival')}
                  </SelectItem>
                  <SelectItem value='evisa'>{t('visa.evisa')}</SelectItem>
                  <SelectItem value='embassy'>
                    {t('visa.embassy_required')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className='block text-sm font-medium mb-2'>
                {t('visa.purpose')}
              </label>
              <Select
                value={selectedVisaType}
                onValueChange={value => setSelectedVisaType(value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>{t('visa.all_purposes')}</SelectItem>
                  <SelectItem value='tourist'>{t('visa.tourist')}</SelectItem>
                  <SelectItem value='business'>{t('visa.business')}</SelectItem>
                  <SelectItem value='student'>{t('visa.student')}</SelectItem>
                  <SelectItem value='work'>{t('visa.work')}</SelectItem>
                  <SelectItem value='transit'>{t('visa.transit')}</SelectItem>
                  <SelectItem value='digital-nomad'>
                    {t('visa.digital_nomad')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='flex flex-wrap gap-2 items-center justify-between'>
            <div className='flex flex-wrap gap-2'>
              <Button
                variant={showOnlyBookmarked ? 'default' : 'outline'}
                size='sm'
                onClick={() => setShowOnlyBookmarked(!showOnlyBookmarked)}
                className='flex items-center gap-2'
              >
                <Bookmark className='h-4 w-4' />
                {t('visa.bookmarked')} ({bookmarkedCountries.length})
              </Button>

              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowComparison(true)}
                className='flex items-center gap-2'
              >
                <GitCompare className='h-4 w-4' />
                {t('visa.compare_countries')}
              </Button>
            </div>

            <div className='text-sm text-gray-600 flex items-center'>
              {t('visa.showing_countries', {
                count: filteredCountries.length.toString(),
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Country Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredCountries.map(country => {
          const requirement = country.visaRequirement;
          const isBookmarked = bookmarkedCountries.includes(country.code);

          return (
            <Card
              key={country.code}
              className='hover:shadow-lg transition-all duration-200 cursor-pointer group'
              onClick={() => setSelectedCountry(country.code)}
            >
              <CardHeader className='pb-4'>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center gap-3'>
                    <span className='text-3xl'>
                      {getCountryFlag(country.code)}
                    </span>
                    <div>
                      <CardTitle className='text-lg group-hover:text-blue-600 transition-colors'>
                        {country.name}
                      </CardTitle>
                      <CardDescription className='flex items-center gap-1'>
                        <MapPin className='h-3 w-3' />
                        {country.region}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={e => {
                      e.stopPropagation();
                      toggleBookmark(country.code);
                    }}
                    className='shrink-0'
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className='h-4 w-4 text-blue-600' />
                    ) : (
                      <Bookmark className='h-4 w-4' />
                    )}
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    {getRequirementIcon(requirement)}
                    {getRequirementBadge(requirement)}
                  </div>

                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <span className='text-gray-500'>
                        {t('visa.max_stay')}:
                      </span>
                      <div className='font-medium'>{requirement.maxStay}</div>
                    </div>
                    <div>
                      <span className='text-gray-500'>
                        {t('visa.processing')}:
                      </span>
                      <div className='font-medium'>
                        {requirement.processingTime}
                      </div>
                    </div>
                  </div>

                  {requirement.fee && (
                    <div className='text-sm'>
                      <span className='text-gray-500'>{t('visa.fee')}: </span>
                      <span className='font-medium'>{requirement.fee}</span>
                    </div>
                  )}

                  <div className='flex flex-wrap gap-1'>
                    {country.visaTypes.slice(0, 3).map(type => (
                      <Badge key={type} variant='outline' className='text-xs'>
                        {type}
                      </Badge>
                    ))}
                    {country.visaTypes.length > 3 && (
                      <Badge variant='outline' className='text-xs'>
                        +{country.visaTypes.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className='flex gap-2 mt-3 pt-3 border-t'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={e => {
                        e.stopPropagation();
                        setShowChecklist(country.code);
                      }}
                      className='flex items-center gap-1 text-xs'
                    >
                      <CheckSquare className='h-3 w-3' />
                      {t('visa.checklist')}
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedCountry(country.code);
                      }}
                      className='flex items-center gap-1 text-xs'
                    >
                      <Info className='h-3 w-3' />
                      {t('visa.details')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCountries.length === 0 && (
        <Card className='text-center py-12'>
          <CardContent>
            <Globe className='h-12 w-12 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-semibold mb-2'>
              {t('visa.no_countries_found')}
            </h3>
            <p className='text-gray-600'>{t('visa.adjust_filters')}</p>
          </CardContent>
        </Card>
      )}

      {/* Country Detail Modal/Panel */}
      {selectedCountry && selectedCountryData && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'
          role='dialog'
          aria-modal='true'
          aria-labelledby='country-modal-title'
          onClick={e => {
            if (e.target === e.currentTarget) {
              setSelectedCountry(null);
            }
          }}
          onKeyDown={e => {
            if (e.key === 'Escape') {
              setSelectedCountry(null);
            }
          }}
        >
          <Card className='w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
            <CardHeader>
              <div className='flex items-start justify-between'>
                <div className='flex items-center gap-3'>
                  <span className='text-4xl' aria-hidden='true'>
                    {getCountryFlag(selectedCountry)}
                  </span>
                  <div>
                    <CardTitle id='country-modal-title' className='text-2xl'>
                      {selectedCountryData.name}
                    </CardTitle>
                    <CardDescription className='flex items-center gap-2 text-base'>
                      <MapPin className='h-4 w-4' aria-hidden='true' />
                      {selectedCountryData.region}
                      {selectedCountryData.capital && (
                        <>
                          <span aria-hidden='true'>•</span>
                          <span>Capital: {selectedCountryData.capital}</span>
                        </>
                      )}
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant='ghost'
                  onClick={() => setSelectedCountry(null)}
                  aria-label='Close country details'
                >
                  ✕
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue='visa-info' className='w-full'>
                <TabsList className='grid w-full grid-cols-4'>
                  <TabsTrigger value='visa-info'>Visa Info</TabsTrigger>
                  <TabsTrigger value='documents'>Documents</TabsTrigger>
                  <TabsTrigger value='embassy'>Embassy</TabsTrigger>
                  <TabsTrigger value='travel-info'>Travel Info</TabsTrigger>
                </TabsList>

                <TabsContent value='visa-info' className='space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <Card>
                      <CardHeader>
                        <CardTitle className='text-lg'>
                          Visa Requirements
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className='space-y-4'>
                          {Object.entries(selectedCountryData.requirements).map(
                            ([passport, req]) => {
                              const passportCountry = PASSPORT_COUNTRIES.find(
                                p => p.code === passport
                              );
                              return (
                                <div
                                  key={passport}
                                  className='flex items-center justify-between p-3 border rounded-lg'
                                >
                                  <div className='flex items-center gap-2'>
                                    <span>{getCountryFlag(passport)}</span>
                                    <span className='font-medium'>
                                      {passportCountry?.name || passport}
                                    </span>
                                  </div>
                                  {getRequirementBadge(req)}
                                </div>
                              );
                            }
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className='text-lg'>
                          Available Visa Types
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className='grid grid-cols-2 gap-3'>
                          {selectedCountryData.visaTypes.map(type => (
                            <div
                              key={type}
                              className='flex items-center gap-2 p-2 border rounded-lg'
                            >
                              {getVisaTypeIcon(type)}
                              <span className='capitalize'>
                                {type.replace('-', ' ')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value='documents' className='space-y-4'>
                  <Card>
                    <CardHeader>
                      <CardTitle className='text-lg'>
                        Required Documents
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-2'>
                        {selectedCountryData.requiredDocuments.map(
                          (doc, index) => (
                            <div
                              key={index}
                              className='flex items-center gap-2'
                            >
                              <CheckCircle2 className='h-4 w-4 text-green-600' />
                              <span>{doc}</span>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value='embassy' className='space-y-4'>
                  <Card>
                    <CardHeader>
                      <CardTitle className='text-lg'>
                        Embassy Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedCountryData.embassy ? (
                        <div className='space-y-4'>
                          <div>
                            <h4 className='font-semibold'>Address</h4>
                            <p className='text-muted-foreground'>
                              {selectedCountryData.embassy.address}
                            </p>
                          </div>
                          {selectedCountryData.embassy.phone && (
                            <div>
                              <h4 className='font-semibold'>Phone</h4>
                              <p className='text-muted-foreground'>
                                {selectedCountryData.embassy.phone}
                              </p>
                            </div>
                          )}
                          {selectedCountryData.embassy.website && (
                            <div>
                              <h4 className='font-semibold'>Website</h4>
                              <a
                                href={selectedCountryData.embassy.website}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-blue-600 hover:underline'
                              >
                                {selectedCountryData.embassy.website}
                              </a>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className='text-muted-foreground'>
                          Embassy information not available
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value='travel-info' className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <Card>
                      <CardHeader>
                        <CardTitle className='text-lg'>
                          Travel Advisory
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className='flex items-center gap-2 mb-2'>
                          <div
                            className={`w-3 h-3 rounded-full ${
                              selectedCountryData.travelAdvisory === 'low'
                                ? 'bg-green-500'
                                : selectedCountryData.travelAdvisory ===
                                    'medium'
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            }`}
                          ></div>
                          <span className='capitalize'>
                            {selectedCountryData.travelAdvisory} Risk
                          </span>
                        </div>
                        <p className='text-sm text-gray-600'>
                          Check latest travel advisories from your government
                          before traveling.
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className='text-lg'>
                          Best Time to Visit
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className='text-muted-foreground'>
                          Varies by region and purpose of travel. Research
                          seasonal weather patterns and local events.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Visa Comparison Modal */}
      {showComparison && (
        <VisaComparison
          passportCountry={selectedPassport}
          onClose={() => setShowComparison(false)}
        />
      )}

      {/* Visa Checklist Modal */}
      {showChecklist && (
        <VisaChecklist
          countryCode={showChecklist}
          passportCountry={selectedPassport}
          onClose={() => setShowChecklist(null)}
        />
      )}
    </StandardPageLayout>
  );
}
