'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { COUNTRIES, VISA_TYPES, PASSPORT_COUNTRIES } from '@/data/countries'
import { FutureTripValidation } from '@/lib/travel-manager'

interface TripFormData {
  country: string
  entryDate: string
  exitDate: string
  visaType: string
  maxDays: number
  passportCountry: string
  notes: string
  status: 'completed' | 'ongoing' | 'planned'
  purpose: string
  accommodation: string
  cost: number | ''
  isEmergency: boolean
}

interface EnhancedTripFormProps {
  initialData?: Partial<TripFormData>
  onSubmit: (data: TripFormData) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
  className?: string
}

const initialFormData: TripFormData = {
  country: '',
  entryDate: '',
  exitDate: '',
  visaType: 'Tourist',
  maxDays: 90,
  passportCountry: 'OTHER',
  notes: '',
  status: 'completed',
  purpose: '',
  accommodation: '',
  cost: '',
  isEmergency: false
}

export function EnhancedTripForm({
  initialData = {},
  onSubmit,
  onCancel,
  submitLabel = '저장',
  className
}: EnhancedTripFormProps) {
  const [formData, setFormData] = useState<TripFormData>({
    ...initialFormData,
    ...initialData
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [validation, setValidation] = useState<FutureTripValidation | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (field: keyof TripFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateTrip = async () => {
    if (!formData.country || !formData.entryDate || !formData.exitDate) {
      return
    }

    setIsValidating(true)
    try {
      const response = await fetch('/api/trips/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          country: formData.country,
          entryDate: formData.entryDate,
          exitDate: formData.exitDate,
          passportCountry: formData.passportCountry
        })
      })

      const data = await response.json()
      if (data.success) {
        setValidation(data.data)
      }
    } catch (error) {
    } finally {
      setIsValidating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    const newErrors: Record<string, string> = {}
    
    if (!formData.country) newErrors.country = '국가를 선택해주세요'
    if (!formData.entryDate) newErrors.entryDate = '입국일을 선택해주세요'
    if (!formData.visaType) newErrors.visaType = '비자 유형을 선택해주세요'
    if (!formData.maxDays || formData.maxDays < 1) newErrors.maxDays = '최대 체류일을 입력해주세요'
    
    if (formData.exitDate && new Date(formData.exitDate) <= new Date(formData.entryDate)) {
      newErrors.exitDate = '출국일은 입국일보다 늦어야 합니다'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (error) {
    } finally {
      setIsSubmitting(false)
    }
  }

  // Auto-validate when key fields change
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.country && formData.entryDate && formData.exitDate) {
        validateTrip()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [formData.country, formData.entryDate, formData.exitDate])

  return (
    <Card className={`p-6 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              국가 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.country}
              onChange={(e) => updateField('country', e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">국가를 선택하세요</option>
              {COUNTRIES.map(country => (
                <option key={country.code} value={country.name}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
            {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              여행 상태
            </label>
            <select
              value={formData.status}
              onChange={(e) => updateField('status', e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="completed">완료됨</option>
              <option value="ongoing">진행 중</option>
              <option value="planned">계획됨</option>
            </select>
          </div>
        </div>

        {/* 날짜 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              입국일 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.entryDate}
              onChange={(e) => updateField('entryDate', e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            {errors.entryDate && <p className="text-red-500 text-sm mt-1">{errors.entryDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              출국일 {formData.status === 'ongoing' && <span className="text-gray-500">(선택사항)</span>}
            </label>
            <input
              type="date"
              value={formData.exitDate}
              onChange={(e) => updateField('exitDate', e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.exitDate && <p className="text-red-500 text-sm mt-1">{errors.exitDate}</p>}
          </div>
        </div>

        {/* 비자 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              비자 유형 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.visaType}
              onChange={(e) => updateField('visaType', e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {VISA_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              최대 체류일 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={formData.maxDays}
              onChange={(e) => updateField('maxDays', parseInt(e.target.value) || 0)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            {errors.maxDays && <p className="text-red-500 text-sm mt-1">{errors.maxDays}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              여권 국가
            </label>
            <select
              value={formData.passportCountry}
              onChange={(e) => updateField('passportCountry', e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {PASSPORT_COUNTRIES.map(country => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              여행 목적
            </label>
            <select
              value={formData.purpose}
              onChange={(e) => updateField('purpose', e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">선택하세요</option>
              <option value="tourism">관광</option>
              <option value="business">비즈니스</option>
              <option value="transit">환승</option>
              <option value="study">학업</option>
              <option value="work">업무</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              숙박 유형
            </label>
            <select
              value={formData.accommodation}
              onChange={(e) => updateField('accommodation', e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">선택하세요</option>
              <option value="hotel">호텔</option>
              <option value="airbnb">에어비앤비</option>
              <option value="hostel">호스텔</option>
              <option value="friend">지인집</option>
              <option value="other">기타</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            여행 비용 (USD)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.cost}
            onChange={(e) => updateField('cost', e.target.value ? parseFloat(e.target.value) : '')}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="예: 1500.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            메모
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            rows={3}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="여행에 대한 추가 정보를 입력하세요..."
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isEmergency"
            checked={formData.isEmergency}
            onChange={(e) => updateField('isEmergency', e.target.checked)}
            className="rounded"
          />
          <label htmlFor="isEmergency" className="text-sm">
            긴급 여행
          </label>
        </div>

        {/* 여행 검증 결과 */}
        {validation && (
          <Card className="p-4 bg-gray-50">
            <h4 className="font-medium mb-3">여행 검증 결과</h4>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Badge variant={validation.canTravel ? "default" : "destructive"}>
                  {validation.canTravel ? '여행 가능' : '여행 불가'}
                </Badge>
                {validation.violatesRule && (
                  <Badge variant="destructive">규정 위반</Badge>
                )}
              </div>

              {validation.warnings.length > 0 && (
                <div className="mt-3">
                  <h5 className="font-medium text-red-600 mb-1">경고사항:</h5>
                  <ul className="text-sm space-y-1">
                    {validation.warnings.map((warning, index) => (
                      <li key={index} className="text-red-600">• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {validation.suggestions.length > 0 && (
                <div className="mt-3">
                  <h5 className="font-medium text-blue-600 mb-1">권장사항:</h5>
                  <ul className="text-sm space-y-1">
                    {validation.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-blue-600">• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                <div>
                  <span className="text-gray-600">최대 체류 가능일:</span>
                  <span className="font-medium ml-2">{validation.maxStayDays}일</span>
                </div>
                <div>
                  <span className="text-gray-600">여행 후 잔여일:</span>
                  <span className="font-medium ml-2">{validation.remainingDaysAfterTrip}일</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {isValidating && (
          <div className="text-center py-2">
            <span className="text-sm text-gray-600">여행 검증 중...</span>
          </div>
        )}

        {/* 버튼 */}
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              취소
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting || (validation && !validation.canTravel)}
          >
            {isSubmitting ? '저장 중...' : submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  )
}