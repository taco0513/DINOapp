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
    <div style={{ border: '2px solid #333', padding: '20px', marginBottom: '15px', backgroundColor: 'white' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '5px', margin: 0 }}>
            {country?.flag || '🌍'} {trip.country}
            {country?.isSchengen && (
              <span style={{ 
                marginLeft: '8px', 
                padding: '2px 6px', 
                backgroundColor: '#e0e0e0', 
                fontSize: '10px',
                border: '1px solid #666'
              }}>
                셰겐
              </span>
            )}
          </h3>
          <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
            {trip.visaType}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '5px' }}>
          <button
            onClick={() => onEdit(trip)}
            style={{
              padding: '6px',
              backgroundColor: 'white',
              border: '1px solid #666',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            수정
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            style={{
              padding: '6px',
              backgroundColor: showDeleteConfirm ? '#ffe6e6' : 'white',
              border: '1px solid #cc0000',
              color: '#cc0000',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {loading ? '...' : '삭제'}
          </button>
        </div>
      </div>

      {/* Dates */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px' }}>
          <span style={{ color: '#666' }}>입국:</span>
          <span style={{ fontWeight: 'bold' }}>{formatDate(entryDate)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px' }}>
          <span style={{ color: '#666' }}>출국:</span>
          <span style={{ fontWeight: 'bold' }}>
            {exitDate ? formatDate(exitDate) : (
              <span style={{ 
                padding: '2px 6px', 
                backgroundColor: '#e6ffe6', 
                color: '#006600',
                fontSize: '10px',
                border: '1px solid #666'
              }}>
                현재 체류 중
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Duration */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '10px', 
        backgroundColor: '#f9f9f9',
        border: '1px solid #ccc',
        marginBottom: '15px'
      }}>
        <span style={{ fontSize: '14px', color: '#666' }}>체류 일수:</span>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#000' }}>
            {days}일
          </span>
          <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>
            / {trip.maxDays}일
          </span>
        </div>
      </div>

      {/* Progress Bar - Wireframe Style */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ 
          width: '100%', 
          height: '20px', 
          border: '1px solid #666',
          backgroundColor: '#f0f0f0',
          position: 'relative'
        }}>
          <div
            style={{
              height: '100%',
              width: `${Math.min((days / trip.maxDays) * 100, 100)}%`,
              backgroundColor: days > trip.maxDays ? '#cc0000' : days > trip.maxDays * 0.8 ? '#ffcc00' : '#006600'
            }}
          />
          <span style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '10px',
            fontWeight: 'bold'
          }}>
            {Math.round((days / trip.maxDays) * 100)}%
          </span>
        </div>
        {days > trip.maxDays && (
          <p style={{ fontSize: '12px', color: '#cc0000', margin: '5px 0 0 0' }}>⚠️ 최대 체류 일수 초과</p>
        )}
      </div>

      {/* Notes */}
      {trip.notes && (
        <div style={{ paddingTop: '15px', borderTop: '1px solid #ccc' }}>
          <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>{trip.notes}</p>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          backgroundColor: '#ffe6e6', 
          border: '1px solid #cc0000'
        }}>
          <p style={{ fontSize: '14px', color: '#cc0000', marginBottom: '10px', margin: '0 0 10px 0' }}>
            정말 이 여행 기록을 삭제하시겠습니까?
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleDelete}
              disabled={loading}
              style={{
                padding: '6px 12px',
                backgroundColor: '#cc0000',
                color: 'white',
                border: '1px solid #cc0000',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {loading ? '삭제 중...' : '삭제'}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              style={{
                padding: '6px 12px',
                backgroundColor: 'white',
                color: '#666',
                border: '1px solid #666',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  )
}