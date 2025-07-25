'use client'

import { useState } from 'react'
import { ApiClient, TripFormData } from '@/lib/api-client'
import { COUNTRIES, VISA_TYPES, PASSPORT_COUNTRIES } from '@/data/countries'
import type { CountryVisit } from '@/types/global'

interface TripFormProps {
  trip?: CountryVisit
  onSuccess: () => void
  onCancel: () => void
}

export default function TripForm({ trip, onSuccess, onCancel }: TripFormProps) {
  const [formData, setFormData] = useState<TripFormData>({
    country: trip?.country || '',
    entryDate: trip?.entryDate ? trip.entryDate.split('T')[0] : '',
    exitDate: trip?.exitDate ? trip.exitDate.split('T')[0] : '',
    visaType: trip?.visaType || 'Tourist',
    maxDays: trip?.maxDays || 90,
    passportCountry: trip?.passportCountry || 'OTHER',
    notes: trip?.notes || ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (trip) {
        await ApiClient.updateTrip(trip.id, formData)
      } else {
        await ApiClient.createTrip(formData)
      }
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof TripFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 pr-2">
              {trip ? '여행 기록 수정' : '새 여행 기록 추가'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Mobile-optimized grid layout */}
            <div className="space-y-4 sm:space-y-6">
              {/* Country Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  국가 *
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  required
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
                >
                  <option value="">국가를 선택하세요</option>
                  {COUNTRIES.map(country => (
                    <option key={country.code} value={country.name}>
                      {country.flag} {country.name} {country.isSchengen ? '(셰겐)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date fields in mobile-optimized layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    입국 날짜 *
                  </label>
                  <input
                    type="date"
                    value={formData.entryDate}
                    onChange={(e) => handleChange('entryDate', e.target.value)}
                    required
                    className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    출국 날짜 <span className="text-xs text-gray-500">(현재 체류 중이면 비워두세요)</span>
                  </label>
                  <input
                    type="date"
                    value={formData.exitDate || ''}
                    onChange={(e) => handleChange('exitDate', e.target.value || null)}
                    className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
                  />
                </div>
              </div>

              {/* Visa and Duration fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    비자 유형 *
                  </label>
                  <select
                    value={formData.visaType}
                    onChange={(e) => handleChange('visaType', e.target.value)}
                    required
                    className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
                  >
                    {VISA_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    최대 체류 가능 일수 *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={formData.maxDays}
                    onChange={(e) => handleChange('maxDays', parseInt(e.target.value))}
                    required
                    className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
                  />
                </div>
              </div>

              {/* Passport Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  여권 국가 *
                </label>
                <select
                  value={formData.passportCountry}
                  onChange={(e) => handleChange('passportCountry', e.target.value)}
                  required
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
                >
                  {PASSPORT_COUNTRIES.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  메모 (선택사항)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm resize-none"
                  placeholder="추가 정보나 메모를 입력하세요..."
                />
              </div>
            </div>

            {/* Actions - Mobile optimized buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-4 sm:py-3 px-4 rounded-lg transition-colors font-medium text-base sm:text-sm"
              >
                {loading ? '저장 중...' : (trip ? '수정하기' : '추가하기')}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 sm:py-3 px-4 rounded-lg transition-colors font-medium text-base sm:text-sm"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}