'use client'

import { useState } from 'react'
import { ApiClient } from '@/lib/api-client'
import type { CountryVisit } from '@/types/global'

interface WireframeTripFormProps {
  trip?: CountryVisit
  onSuccess: () => void
  onCancel: () => void
}

export default function WireframeTripForm({ trip, onSuccess, onCancel }: WireframeTripFormProps) {
  const [formData, setFormData] = useState({
    country: trip?.country || '',
    entryDate: trip?.entryDate || '',
    exitDate: trip?.exitDate || '',
    visaType: trip?.visaType || '',
    purpose: trip?.purpose || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (trip) {
        await ApiClient.updateTrip(trip.id!, formData)
      } else {
        await ApiClient.createTrip(formData)
      }
      onSuccess()
    } catch (error) {
      // Error saving trip
    }
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
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'var(--color-background)',
        border: '1px solid var(--color-border)',
        padding: '30px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-5)', color: 'var(--color-text-primary)' }}>
          {trip ? '여행 기록 수정' : '새 여행 추가'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#333', marginBottom: '5px' }}>
              국가
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value})}
              required
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid var(--color-border)',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#333', marginBottom: '5px' }}>
              입국일
            </label>
            <input
              type="date"
              value={formData.entryDate}
              onChange={(e) => setFormData({...formData, entryDate: e.target.value})}
              required
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid var(--color-border)',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#333', marginBottom: '5px' }}>
              출국일 (현재 체류중이면 비워두세요)
            </label>
            <input
              type="date"
              value={formData.exitDate}
              onChange={(e) => setFormData({...formData, exitDate: e.target.value})}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid var(--color-border)',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#333', marginBottom: '5px' }}>
              비자 유형
            </label>
            <select
              value={formData.visaType}
              onChange={(e) => setFormData({...formData, visaType: e.target.value})}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid var(--color-border)',
                fontSize: '14px'
              }}
            >
              <option value="">선택하세요</option>
              <option value="schengen">셰겐 관광</option>
              <option value="tourist">관광</option>
              <option value="business">비즈니스</option>
              <option value="transit">경유</option>
              <option value="visa-free">비자면제</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#333', marginBottom: '5px' }}>
              목적
            </label>
            <input
              type="text"
              value={formData.purpose}
              onChange={(e) => setFormData({...formData, purpose: e.target.value})}
              placeholder="예: 관광, 업무, 가족방문"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid var(--color-border)',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '8px 20px',
                backgroundColor: 'var(--color-background)',
                border: '1px solid #666',
                color: '#666',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              취소
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 20px',
                backgroundColor: '#000',
                border: 'none',
                color: '#fff',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              {trip ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}