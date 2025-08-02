'use client';

/**
 * DINO v2.0 - Trip Form Component
 * Add new travel entries with full validation
 */

import { useState, useCallback } from 'react';
import { COUNTRIES } from '@/data/countries';
import type { Trip } from '@prisma/client';

interface TripFormProps {
  readonly onSuccess: (trip: Trip) => void;
  readonly onCancel: () => void;
}

export function TripForm({ onSuccess, onCancel }: TripFormProps) {
  const [formData, setFormData] = useState({
    country: '',
    entryDate: '',
    exitDate: '',
    purpose: 'tourism',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '여행 추가 중 오류가 발생했습니다.');
      }

      const { trip } = await response.json();
      onSuccess(trip);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSuccess]);

  const selectedCountry = COUNTRIES.find(c => c.code === formData.country);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Country Selection */}
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
            방문 국가 *
          </label>
          <select
            id="country"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            required
            className="form-select"
          >
            <option value="">국가를 선택하세요</option>
            <optgroup label="셰겐 지역">
              {COUNTRIES.filter(c => c.isSchengen).map(country => (
                <option key={country.code} value={country.code}>
                  🇪🇺 {country.name} ({country.code})
                </option>
              ))}
            </optgroup>
            <optgroup label="아시아">
              {COUNTRIES.filter(c => c.region === 'Asia Pacific' && !c.isSchengen).map(country => (
                <option key={country.code} value={country.code}>
                  {country.name} ({country.code})
                </option>
              ))}
            </optgroup>
            <optgroup label="아메리카">
              {COUNTRIES.filter(c => c.region === 'Americas').map(country => (
                <option key={country.code} value={country.code}>
                  {country.name} ({country.code})
                </option>
              ))}
            </optgroup>
            <optgroup label="유럽 (비셰겐)">
              {COUNTRIES.filter(c => c.region === 'Europe' && !c.isSchengen).map(country => (
                <option key={country.code} value={country.code}>
                  {country.name} ({country.code})
                </option>
              ))}
            </optgroup>
            <optgroup label="기타">
              {COUNTRIES.filter(c => !['Asia Pacific', 'Americas', 'Europe'].includes(c.region)).map(country => (
                <option key={country.code} value={country.code}>
                  {country.name} ({country.code})
                </option>
              ))}
            </optgroup>
          </select>
          {selectedCountry && selectedCountry.isSchengen && (
            <p className="mt-1 text-sm text-blue-600">
              🇪🇺 셰겐 지역 - 90/180일 규칙이 적용됩니다
            </p>
          )}
        </div>

        {/* Purpose */}
        <div>
          <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
            여행 목적
          </label>
          <select
            id="purpose"
            value={formData.purpose}
            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            className="form-select"
          >
            <option value="tourism">관광</option>
            <option value="business">사업</option>
            <option value="transit">경유</option>
            <option value="study">학업</option>
            <option value="work">업무</option>
            <option value="family_visit">가족 방문</option>
          </select>
        </div>

        {/* Entry Date */}
        <div>
          <label htmlFor="entryDate" className="block text-sm font-medium text-gray-700 mb-2">
            입국일 *
          </label>
          <input
            type="date"
            id="entryDate"
            value={formData.entryDate}
            onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
            required
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Exit Date */}
        <div>
          <label htmlFor="exitDate" className="block text-sm font-medium text-gray-700 mb-2">
            출국일
            <span className="text-sm text-gray-500 ml-2">(현재 체류 중이면 비워두세요)</span>
          </label>
          <input
            type="date"
            id="exitDate"
            value={formData.exitDate}
            onChange={(e) => setFormData({ ...formData, exitDate: e.target.value })}
            min={formData.entryDate}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
          메모
        </label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="여행 관련 메모를 남겨주세요..."
        />
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>추가 중...</span>
            </>
          ) : (
            <span>여행 추가</span>
          )}
        </button>
      </div>
    </form>
  );
}