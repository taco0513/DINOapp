'use client'

import { useState } from 'react'
import { ApiClient } from '@/lib/api-client'
import { getCountryByName } from '@/data/countries'
import type { CountryVisit } from '@/types/global'

interface TripCardProps {
  trip: CountryVisit
  onEdit: (trip: CountryVisit) => void
  onDelete: () => void
}

export default function TripCard({ trip, onEdit, onDelete }: TripCardProps) {
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const country = getCountryByName(trip.country)
  const entryDate = new Date(trip.entryDate)
  const exitDate = trip.exitDate ? new Date(trip.exitDate) : null
  
  const calculateDays = () => {
    if (exitDate) {
      return Math.ceil((exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))
    } else {
      // Currently staying
      return Math.ceil((new Date().getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))
    }
  }

  const days = calculateDays()
  const isCurrentlyStaying = !exitDate

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    setLoading(true)
    try {
      await ApiClient.deleteTrip(trip.id)
      onDelete()
    } catch (error) {
      // Error deleting trip
    } finally {
      setLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR')
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="card-title flex items-center">
            {country?.flag || '🌍'} {trip.country}
            {country?.isSchengen && (
              <span className="badge ml-2">
                셰겐
              </span>
            )}
          </h3>
          <p className="card-description">
            {trip.visaType}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(trip)}
            className="btn btn-sm btn-ghost"
          >
            수정
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="btn btn-sm btn-ghost"
            style={{
              borderColor: 'var(--color-error)',
              color: 'var(--color-error)',
              backgroundColor: showDeleteConfirm ? 'rgba(239, 68, 68, 0.05)' : 'transparent'
            }}
          >
            {loading ? '...' : '삭제'}
          </button>
        </div>
      </div>

      {/* Dates */}
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-small text-secondary">입국:</span>
          <span className="text-small font-semibold">{formatDate(entryDate)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-small text-secondary">출국:</span>
          <span className="text-small font-semibold">
            {exitDate ? formatDate(exitDate) : (
              <span className="badge badge-success">
                현재 체류 중
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Duration */}
      <div className="stat mb-4">
        <div className="flex justify-between items-center">
          <span className="text-small text-secondary">체류 일수:</span>
          <div className="text-right">
            <span className="font-bold text-lg">
              {days}일
            </span>
            <span className="text-small text-tertiary ml-2">
              / {trip.maxDays}일
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div style={{ 
          width: '100%', 
          height: '20px', 
          border: '1px solid var(--color-border-strong)',
          backgroundColor: 'var(--color-surface)',
          position: 'relative'
        }}>
          <div
            style={{
              height: '100%',
              width: `${Math.min((days / trip.maxDays) * 100, 100)}%`,
              backgroundColor: days > trip.maxDays ? 'var(--color-error)' : days > trip.maxDays * 0.8 ? 'var(--color-warning)' : 'var(--color-success)'
            }}
          />
          <span style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-semibold)'
          }}>
            {Math.round((days / trip.maxDays) * 100)}%
          </span>
        </div>
        {days > trip.maxDays && (
          <p className="text-small mt-2" style={{ color: 'var(--color-error)' }}>⚠️ 최대 체류 일수 초과</p>
        )}
      </div>

      {/* Notes */}
      {trip.notes && (
        <div style={{ paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
          <p className="text-small text-secondary">{trip.notes}</p>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="alert alert-error mt-4">
          <p className="text-small mb-3">
            정말 이 여행 기록을 삭제하시겠습니까?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={loading}
              className="btn btn-sm"
              style={{
                backgroundColor: 'var(--color-error)',
                borderColor: 'var(--color-error)',
                color: 'white'
              }}
            >
              {loading ? '삭제 중...' : '삭제'}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="btn btn-sm"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  )
}