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
      let response;
      if (trip) {
        response = await ApiClient.updateTrip(trip.id, formData)
      } else {
        response = await ApiClient.createTrip(formData)
      }
      
      if (response.success) {
        onSuccess()
      } else {
        setError(response.error || 'An error occurred while saving')
      }
    } catch (err) {
      console.error('Form submission error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof TripFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        border: '3px solid #333',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '10px',
          borderBottom: '2px solid #333'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            margin: 0
          }}>
            {trip ? '여행 기록 수정' : '새 여행 기록 추가'}
          </h2>
          <button
            onClick={onCancel}
            style={{
              backgroundColor: 'white',
              border: '2px solid #666',
              padding: '5px 10px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div style={{
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#ffe6e6',
            border: '2px solid #cc0000',
            color: '#cc0000'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            {/* Country Selection */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '5px'
              }}>
                국가 *
              </label>
              <select
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #666',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
              >
                <option value="">국가를 선택하세요</option>
                {COUNTRIES.map(country => (
                  <option key={country.code} value={country.name}>
                    {country.flag} {country.name} {country.isSchengen ? '(셰겐)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Date fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginBottom: '5px'
                }}>
                  입국 날짜 *
                </label>
                <input
                  type="date"
                  value={formData.entryDate}
                  onChange={(e) => handleChange('entryDate', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #666',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginBottom: '5px'
                }}>
                  출국 날짜
                  <span style={{ fontSize: '10px', color: '#666', fontWeight: 'normal' }}>
                    {' '}(체류 중이면 비워두세요)
                  </span>
                </label>
                <input
                  type="date"
                  value={formData.exitDate || ''}
                  onChange={(e) => handleChange('exitDate', e.target.value || null)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #666',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            {/* Visa and Duration fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginBottom: '5px'
                }}>
                  비자 유형 *
                </label>
                <select
                  value={formData.visaType}
                  onChange={(e) => handleChange('visaType', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #666',
                    fontSize: '14px',
                    backgroundColor: 'white'
                  }}
                >
                  {VISA_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginBottom: '5px'
                }}>
                  최대 체류 일수 *
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={formData.maxDays}
                  onChange={(e) => handleChange('maxDays', parseInt(e.target.value))}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #666',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            {/* Passport Country */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '5px'
              }}>
                여권 국가 *
              </label>
              <select
                value={formData.passportCountry}
                onChange={(e) => handleChange('passportCountry', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #666',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
              >
                {PASSPORT_COUNTRIES.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '5px'
              }}>
                메모 (선택사항)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #666',
                  fontSize: '14px',
                  resize: 'none',
                  fontFamily: 'inherit'
                }}
                placeholder="추가 정보나 메모를 입력하세요..."
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{
            borderTop: '2px solid #333',
            paddingTop: '20px',
            display: 'flex',
            gap: '10px'
          }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                backgroundColor: loading ? '#ccc' : '#333',
                color: 'white',
                padding: '12px 20px',
                border: '2px solid #333',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {loading ? '저장 중...' : (trip ? '수정하기' : '추가하기')}
            </button>
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: 1,
                backgroundColor: 'white',
                color: '#666',
                padding: '12px 20px',
                border: '2px solid #666',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}