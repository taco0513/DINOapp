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
      console.error('Error deleting trip:', error)
    } finally {
      setLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{country?.flag || '🌍'}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {trip.country}
              {country?.isSchengen && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  셰겐
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-600">{trip.visaType}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(trip)}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className={`p-2 transition-colors ${
              showDeleteConfirm 
                ? 'text-red-600 bg-red-50' 
                : 'text-gray-400 hover:text-red-600'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Dates */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">입국:</span>
          <span className="font-medium">{formatDate(entryDate)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">출국:</span>
          <span className="font-medium">
            {exitDate ? formatDate(exitDate) : (
              <span className="text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs">
                현재 체류 중
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Duration */}
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
        <span className="text-sm text-gray-600">체류 일수:</span>
        <div className="text-right">
          <span className="font-bold text-lg text-gray-900">
            {days}일
          </span>
          <span className="text-sm text-gray-600 ml-2">
            / {trip.maxDays}일
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              days > trip.maxDays 
                ? 'bg-red-500' 
                : days > trip.maxDays * 0.8 
                  ? 'bg-yellow-500' 
                  : 'bg-green-500'
            }`}
            style={{ width: `${Math.min((days / trip.maxDays) * 100, 100)}%` }}
          />
        </div>
        {days > trip.maxDays && (
          <p className="text-xs text-red-600 mt-1">⚠️ 최대 체류 일수 초과</p>
        )}
      </div>

      {/* Notes */}
      {trip.notes && (
        <div className="pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">{trip.notes}</p>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 mb-2">정말 이 여행 기록을 삭제하시겠습니까?</p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={loading}
              className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors"
            >
              {loading ? '삭제 중...' : '삭제'}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  )
}