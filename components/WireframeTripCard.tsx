'use client'

import type { CountryVisit } from '@/types/global'

interface WireframeTripCardProps {
  trip: CountryVisit
  onEdit: (trip: CountryVisit) => void
  onDelete: () => void
}

export default function WireframeTripCard({ trip, onEdit, onDelete }: WireframeTripCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  const calculateDays = () => {
    const entry = new Date(trip.entryDate)
    const exit = trip.exitDate ? new Date(trip.exitDate) : new Date()
    return Math.ceil((exit.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24))
  }

  return (
    <div style={{ border: '1px solid #e0e0e0', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '5px' }}>
            {trip.country}
          </h3>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            {formatDate(trip.entryDate)} - {trip.exitDate ? formatDate(trip.exitDate) : '현재'}
          </p>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <span style={{ 
              padding: '4px 8px', 
              backgroundColor: trip.visaType === 'schengen' ? '#e6f3ff' : '#f0f0f0', 
              color: trip.visaType === 'schengen' ? '#0066cc' : '#666', 
              fontSize: '12px' 
            }}>
              {trip.visaType || '비자면제'}
            </span>
            {!trip.exitDate && (
              <span style={{ padding: '4px 8px', backgroundColor: '#ffe6e6', color: '#cc0000', fontSize: '12px' }}>
                체류중
              </span>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#000' }}>{calculateDays()}일</p>
          <p style={{ fontSize: '12px', color: '#666' }}>체류</p>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => onEdit(trip)}
          style={{
            padding: '6px 12px',
            backgroundColor: '#fff',
            border: '1px solid #666',
            color: '#666',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          수정
        </button>
        <button
          onClick={onDelete}
          style={{
            padding: '6px 12px',
            backgroundColor: '#fff',
            border: '1px solid #cc0000',
            color: '#cc0000',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          삭제
        </button>
      </div>
    </div>
  )
}