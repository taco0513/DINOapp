'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ApiClient, TripFormData } from '@/lib/api-client';
import { COUNTRIES, VISA_TYPES, PASSPORT_COUNTRIES } from '@/data/countries';
import {
  Calendar,
  MapPin,
  Shield,
  FileText,
  AlertCircle,
  HelpCircle,
  Home,
  DollarSign,
  Target,
  Clock,
  CheckCircle,
  Loader2,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';

interface NewTripFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function NewTripForm({ onSuccess, onCancel }: NewTripFormProps) {
  const { data: session } = useSession();

  const [formData, setFormData] = useState<
    TripFormData & {
      purpose?: string;
      accommodation?: string;
      cost?: number;
    }
  >({
    country: '',
    entryDate: '',
    exitDate: '',
    visaType: 'Tourist',
    maxDays: 90,
    passportCountry: 'OTHER',
    notes: '',
    purpose: '',
    accommodation: '',
    cost: undefined,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showHelp, setShowHelp] = useState(false);
  const [stayDuration, setStayDuration] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isValid, setIsValid] = useState(false);

  // Pre-fill user's passport country from profile
  useEffect(() => {
    if (session?.user && (session.user as any).passportCountry) {
      setFormData(prev => ({
        ...prev,
        passportCountry: (session.user as any).passportCountry,
      }));
    }
  }, [session]);

  // Calculate trip duration automatically
  useEffect(() => {
    if (formData.entryDate && formData.exitDate) {
      const entry = new Date(formData.entryDate);
      const exit = new Date(formData.exitDate);

      // Validate exit date is after entry date
      if (exit <= entry) {
        setErrors(prev => ({
          ...prev,
          exitDate: t('tripForm.error.exitAfterEntry'),
        }));
        setStayDuration(null);
      } else {
        const days =
          Math.ceil(
            (exit.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24)
          ) + 1;
        setStayDuration(days > 0 ? days : null);
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.exitDate;
          return newErrors;
        });
      }
    } else {
      setStayDuration(null);
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.exitDate;
        return newErrors;
      });
    }
  }, [formData.entryDate, formData.exitDate]);

  // Form validation
  useEffect(() => {
    const requiredFields = [
      'country',
      'entryDate',
      'visaType',
      'passportCountry',
    ];
    const hasRequiredFields = requiredFields.every(
      field => formData[field as keyof typeof formData]
    );
    const hasNoErrors = Object.keys(errors).length === 0;
    setIsValid(hasRequiredFields && hasNoErrors);
  }, [formData, errors]);

  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});

    try {
      // Client-side validation
      const newErrors: Record<string, string> = {};

      if (!formData.country) newErrors.country = t('tripForm.error.selectCountry');
      if (!formData.entryDate) newErrors.entryDate = t('tripForm.error.selectEntryDate');
      if (!formData.visaType) newErrors.visaType = t('tripForm.error.selectVisaType');
      if (!formData.passportCountry)
        newErrors.passportCountry = '여권 국가를 선택해주세요';

      // Date validation
      if (formData.entryDate && formData.exitDate) {
        const entry = new Date(formData.entryDate);
        const exit = new Date(formData.exitDate);
        if (exit <= entry) {
          newErrors.exitDate = '출국 날짜는 입국 날짜 이후여야 합니다';
        }
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        toast.error('입력 정보를 확인해주세요');
        setLoading(false);
        return;
      }

      const response = await ApiClient.createTrip(formData);

      if (response.success) {
        toast.success('새 여행이 성공적으로 추가되었습니다! 🎉');
        onSuccess();
      } else {
        toast.error(response.error || '여행 추가 중 오류가 발생했습니다');
        setErrors({ general: response.error || '오류가 발생했습니다' });
      }
    } catch (err) {
      console.error('Form submission error:', err);
      const errorMessage =
        err instanceof Error ? err.message : '예기치 않은 오류가 발생했습니다';
      toast.error(errorMessage);
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const getStepStatus = (step: number) => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'current';
    return 'upcoming';
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.country;
      case 2:
        return !!formData.entryDate;
      case 3:
        return !!formData.visaType && !!formData.passportCountry;
      case 4:
        return true; // Optional step
      default:
        return false;
    }
  };

  return (
    <div className='max-w-4xl mx-auto'>
      {/* Progress Steps */}
      <div className='mb-8'>
        <div className='flex items-center justify-between mb-4'>
          {[1, 2, 3, 4].map(step => {
            const status = getStepStatus(step);
            // const stepValid = isStepValid(step);

            return (
              <div key={step} className='flex items-center'>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep(step)}
                  className={`w-10 h-10 rounded-full p-0 font-semibold transition-all ${
                    status === 'completed'
                      ? 'bg-success text-success-foreground hover:bg-success/90'
                      : status === 'current'
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {status === 'completed' ? (
                    <CheckCircle className='w-5 h-5' />
                  ) : (
                    step
                  )}
                </Button>
                {step < 4 && (
                  <div
                    className={`w-16 h-0.5 mx-2 ${
                      step < currentStep ? 'bg-success' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className='text-center'>
          <h3 className='text-lg font-semibold mb-1'>
            {currentStep === 1 && '여행지 선택'}
            {currentStep === 2 && '날짜 정보'}
            {currentStep === 3 && '비자 정보'}
            {currentStep === 4 && '추가 정보'}
          </h3>
          <p className='text-sm text-gray-600'>
            {currentStep === 1 && '어느 나라로 여행하셨나요?'}
            {currentStep === 2 && '입국과 출국 날짜를 입력해주세요'}
            {currentStep === 3 && '비자 유형과 여권 정보를 입력해주세요'}
            {currentStep === 4 &&
              '여행에 대한 추가 정보를 입력해주세요 (선택사항)'}
          </p>
        </div>
      </div>

      {/* Help Toggle */}
      <div className='mb-6 flex justify-end'>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowHelp(!showHelp)}
          className='text-primary hover:text-primary/90'
        >
          <HelpCircle className='w-4 h-4 mr-2' />
          {showHelp ? '도움말 숨기기' : '도움말 보기'}
        </Button>
      </div>

      {/* Help Section */}
      {showHelp && (
        <div className='mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200'>
          <h4 className='font-semibold mb-3 text-blue-900'>
            💡 여행 추가 가이드
          </h4>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
            <div>
              <h5 className='font-medium mb-2 text-blue-800'>📍 국가 선택</h5>
              <p className='text-blue-700'>
                셰겐 지역 국가는 자동으로 90/180일 규칙이 적용됩니다. 국가 옆에
                🇪🇺 표시를 확인하세요.
              </p>
            </div>
            <div>
              <h5 className='font-medium mb-2 text-blue-800'>📅 날짜 입력</h5>
              <p className='text-blue-700'>
                현재 체류 중이면 출국 날짜를 비워두세요. 체류 일수가 자동으로
                계산됩니다.
              </p>
            </div>
            <div>
              <h5 className='font-medium mb-2 text-blue-800'>🛂 비자 정보</h5>
              <p className='text-blue-700'>
                무비자 입국은 'Tourist'를 선택하세요. 비자 유형에 따라 체류 가능
                일수가 다릅니다.
              </p>
            </div>
            <div>
              <h5 className='font-medium mb-2 text-blue-800'>📝 추가 정보</h5>
              <p className='text-blue-700'>
                숙소와 여행 목적은 선택사항이지만, 나중에 여행 기록을 관리할 때
                유용합니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* General Error */}
      {errors.general && (
        <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3'>
          <AlertCircle className='w-5 h-5 text-red-500 flex-shrink-0 mt-0.5' />
          <div className='text-red-700'>{errors.general}</div>
        </div>
      )}

      {/* Form Steps */}
      <div className='space-y-8'>
        {/* Step 1: Country Selection */}
        {currentStep === 1 && (
          <div className='card' style={{ padding: 'var(--space-8)' }}>
            <div className='flex items-center gap-3 mb-6'>
              <div className='w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold'>
                1
              </div>
              <div>
                <h3 className='text-xl font-semibold'>
                  어느 나라로 여행하셨나요?
                </h3>
                <p className='text-gray-600'>방문한 국가를 선택해주세요</p>
              </div>
            </div>

            <div>
              <label className='flex items-center gap-2 text-sm font-medium mb-3 text-gray-700'>
                <MapPin className='w-4 h-4' />
                방문 국가
              </label>
              <select
                value={formData.country}
                onChange={e => handleChange('country', e.target.value)}
                className={`w-full p-4 border rounded-lg text-base transition-colors ${
                  errors.country
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 hover:border-blue-400 focus:border-blue-500'
                }`}
                style={{ fontSize: '16px' }} // Prevent zoom on iOS
              >
                <option value=''>국가를 선택하세요</option>
                {COUNTRIES.map(country => (
                  <option key={country.code} value={country.name}>
                    {country.flag} {country.name}{' '}
                    {country.isSchengen ? '🇪🇺' : ''}
                  </option>
                ))}
              </select>
              {errors.country && (
                <p className='mt-2 text-sm text-red-600 flex items-center gap-1'>
                  <AlertCircle className='w-4 h-4' />
                  {errors.country}
                </p>
              )}
              {formData.country &&
                COUNTRIES.find(c => c.name === formData.country)
                  ?.isSchengen && (
                  <div className='mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                    <p className='text-sm text-blue-800 flex items-center gap-2'>
                      <Info className='w-4 h-4' />
                      <strong>셰겐 지역</strong> - 180일 중 90일 규칙이 자동으로
                      적용됩니다
                    </p>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Step 2: Dates */}
        {currentStep === 2 && (
          <div className='card' style={{ padding: 'var(--space-8)' }}>
            <div className='flex items-center gap-3 mb-6'>
              <div className='w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold'>
                2
              </div>
              <div>
                <h3 className='text-xl font-semibold'>언제 여행하셨나요?</h3>
                <p className='text-gray-600'>입국과 출국 날짜를 입력해주세요</p>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='flex items-center gap-2 text-sm font-medium mb-3 text-gray-700'>
                  <Calendar className='w-4 h-4' />
                  입국 날짜
                </label>
                <input
                  type='date'
                  value={formData.entryDate}
                  onChange={e => handleChange('entryDate', e.target.value)}
                  className={`w-full p-4 border rounded-lg text-base transition-colors ${
                    errors.entryDate
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 hover:border-blue-400 focus:border-blue-500'
                  }`}
                />
                {errors.entryDate && (
                  <p className='mt-2 text-sm text-red-600 flex items-center gap-1'>
                    <AlertCircle className='w-4 h-4' />
                    {errors.entryDate}
                  </p>
                )}
              </div>

              <div>
                <label className='flex items-center gap-2 text-sm font-medium mb-3 text-gray-700'>
                  <Calendar className='w-4 h-4' />
                  출국 날짜 (선택사항)
                </label>
                <input
                  type='date'
                  value={formData.exitDate || ''}
                  onChange={e =>
                    handleChange('exitDate', e.target.value || null)
                  }
                  className={`w-full p-4 border rounded-lg text-base transition-colors ${
                    errors.exitDate
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 hover:border-blue-400 focus:border-blue-500'
                  }`}
                />
                <p className='mt-2 text-sm text-gray-500'>
                  현재 체류 중이면 비워두세요
                </p>
                {errors.exitDate && (
                  <p className='mt-2 text-sm text-red-600 flex items-center gap-1'>
                    <AlertCircle className='w-4 h-4' />
                    {errors.exitDate}
                  </p>
                )}
              </div>
            </div>

            {/* Duration Display */}
            {stayDuration && (
              <div className='mt-6 p-4 bg-green-50 border border-green-200 rounded-lg'>
                <div className='flex items-center gap-3'>
                  <Clock className='w-5 h-5 text-green-600' />
                  <div>
                    <p className='font-semibold text-green-800'>
                      체류 일수: {stayDuration}일
                    </p>
                    {stayDuration > 90 && (
                      <p className='text-sm text-amber-600 mt-1 flex items-center gap-1'>
                        <AlertCircle className='w-4 h-4' />
                        90일을 초과하는 장기 체류입니다
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Visa Information */}
        {currentStep === 3 && (
          <div className='card' style={{ padding: 'var(--space-8)' }}>
            <div className='flex items-center gap-3 mb-6'>
              <div className='w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold'>
                3
              </div>
              <div>
                <h3 className='text-xl font-semibold'>
                  비자 정보를 입력해주세요
                </h3>
                <p className='text-gray-600'>비자 유형과 여권 정보</p>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
              <div>
                <label className='flex items-center gap-2 text-sm font-medium mb-3 text-gray-700'>
                  <Shield className='w-4 h-4' />
                  비자 유형
                </label>
                <select
                  value={formData.visaType}
                  onChange={e => handleChange('visaType', e.target.value)}
                  className={`w-full p-4 border rounded-lg text-base transition-colors ${
                    errors.visaType
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 hover:border-blue-400 focus:border-blue-500'
                  }`}
                >
                  {VISA_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.visaType && (
                  <p className='mt-2 text-sm text-red-600 flex items-center gap-1'>
                    <AlertCircle className='w-4 h-4' />
                    {errors.visaType}
                  </p>
                )}
              </div>

              <div>
                <label className='flex items-center gap-2 text-sm font-medium mb-3 text-gray-700'>
                  <FileText className='w-4 h-4' />
                  최대 체류 일수
                </label>
                <input
                  type='number'
                  min='1'
                  max='365'
                  value={formData.maxDays}
                  onChange={e =>
                    handleChange('maxDays', parseInt(e.target.value))
                  }
                  className='w-full p-4 border border-gray-300 rounded-lg text-base hover:border-blue-400 focus:border-blue-500 transition-colors'
                />
              </div>
            </div>

            <div className='mb-6'>
              <label className='flex items-center gap-2 text-sm font-medium mb-3 text-gray-700'>
                <Shield className='w-4 h-4' />
                여권 국가
              </label>
              <select
                value={formData.passportCountry}
                onChange={e => handleChange('passportCountry', e.target.value)}
                className={`w-full p-4 border rounded-lg text-base transition-colors ${
                  errors.passportCountry
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 hover:border-blue-400 focus:border-blue-500'
                }`}
              >
                {PASSPORT_COUNTRIES.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
              {errors.passportCountry && (
                <p className='mt-2 text-sm text-red-600 flex items-center gap-1'>
                  <AlertCircle className='w-4 h-4' />
                  {errors.passportCountry}
                </p>
              )}
            </div>

            <div className='p-4 bg-amber-50 border border-amber-200 rounded-lg'>
              <p className='text-sm text-amber-800 flex items-center gap-2'>
                <Info className='w-4 h-4' />
                <strong>팁:</strong> 무비자 입국은 'Tourist'를 선택하세요. 셰겐
                지역은 90일이 기본값입니다.
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Additional Information */}
        {currentStep === 4 && (
          <div className='card' style={{ padding: 'var(--space-8)' }}>
            <div className='flex items-center gap-3 mb-6'>
              <div className='w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold'>
                4
              </div>
              <div>
                <h3 className='text-xl font-semibold'>추가 정보 (선택사항)</h3>
                <p className='text-gray-600'>
                  여행에 대한 세부 정보를 입력해주세요
                </p>
              </div>
            </div>

            <div className='space-y-6'>
              <div>
                <label className='flex items-center gap-2 text-sm font-medium mb-3 text-gray-700'>
                  <Target className='w-4 h-4' />
                  여행 목적
                </label>
                <input
                  type='text'
                  value={formData.purpose || ''}
                  onChange={e => handleChange('purpose', e.target.value)}
                  placeholder='예: 관광, 출장, 친구 방문...'
                  className='w-full p-4 border border-gray-300 rounded-lg text-base hover:border-blue-400 focus:border-blue-500 transition-colors'
                />
              </div>

              <div>
                <label className='flex items-center gap-2 text-sm font-medium mb-3 text-gray-700'>
                  <Home className='w-4 h-4' />
                  숙소 정보
                </label>
                <input
                  type='text'
                  value={formData.accommodation || ''}
                  onChange={e => handleChange('accommodation', e.target.value)}
                  placeholder='예: 호텔, 에어비앤비, 친구 집...'
                  className='w-full p-4 border border-gray-300 rounded-lg text-base hover:border-blue-400 focus:border-blue-500 transition-colors'
                />
              </div>

              <div>
                <label className='flex items-center gap-2 text-sm font-medium mb-3 text-gray-700'>
                  <DollarSign className='w-4 h-4' />
                  여행 비용 (USD)
                </label>
                <input
                  type='number'
                  min='0'
                  value={formData.cost || ''}
                  onChange={e =>
                    handleChange(
                      'cost',
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                  placeholder='예: 1500'
                  className='w-full p-4 border border-gray-300 rounded-lg text-base hover:border-blue-400 focus:border-blue-500 transition-colors'
                />
              </div>

              <div>
                <label className='flex items-center gap-2 text-sm font-medium mb-3 text-gray-700'>
                  <FileText className='w-4 h-4' />
                  메모
                </label>
                <textarea
                  value={formData.notes}
                  onChange={e => handleChange('notes', e.target.value)}
                  rows={4}
                  placeholder='추가 정보나 메모를 입력하세요...'
                  className='w-full p-4 border border-gray-300 rounded-lg text-base hover:border-blue-400 focus:border-blue-500 transition-colors resize-none'
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className='mt-8 flex items-center justify-between'>
        <div className='flex gap-3'>
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              className='px-6'
            >
              이전
            </Button>
          )}
        </div>

        <div className='flex gap-3'>
          <Button
            variant="outline"
            onClick={onCancel}
            className='px-6'
          >
            취소
          </Button>

          {currentStep < 4 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!isStepValid(currentStep)}
              className='px-6'
            >
              다음
            </Button>
          ) : (
            <Button
              variant="success"
              onClick={handleSubmit}
              disabled={loading || !isValid}
              className='px-8'
            >
              {loading ? (
                <>
                  <Loader2 className='w-4 h-4 animate-spin mr-2' />
                  저장 중...
                </>
              ) : (
                <>
                  <CheckCircle className='w-4 h-4 mr-2' />
                  여행 추가
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Save Notice */}
      <div className='mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center'>
        <p className='text-sm text-blue-800'>
          💾 저장하면 자동으로 셰겐 규정과 비자 상태가 계산됩니다
        </p>
      </div>
    </div>
  );
}
