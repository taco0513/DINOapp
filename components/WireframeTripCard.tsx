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
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
        <div>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}>
            {trip.country}
          </h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
            {formatDate(trip.entryDate)} - {trip.exitDate ? formatDate(trip.exitDate) : '현재'}
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <span 
              className={`badge ${trip.visaType === 'schengen' ? 'badge-success' : ''}`}
              style={{ 
                padding: 'var(--space-1) var(--space-2)', 
                fontSize: 'var(--text-xs)' 
              }}
            >
              {trip.visaType || '비자면제'}
            </span>
            {!trip.exitDate && (
              <span 
                className="badge badge-error"
                style={{ 
                  padding: 'var(--space-1) var(--space-2)', 
                  fontSize: 'var(--text-xs)' 
                }}
              >
                체류중
              </span>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-text-primary)' }}>{calculateDays()}일</p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>체류</p>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <button
          onClick={() => onEdit(trip)}
          className="btn btn-ghost btn-sm"
        >
          수정
        </button>
        <button
          onClick={onDelete}
          className="btn btn-sm"
          style={{
            borderColor: 'var(--color-error)',
            color: 'var(--color-error)'
          }}
        >
          삭제
        </button>
      </div>
    </div>
  )
}