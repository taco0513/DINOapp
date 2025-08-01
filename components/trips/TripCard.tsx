'use client'

import { useState } from 'react'
import { ApiClient } from '@/lib/api-client'
import { getCountryByName } from '@/data/countries'
import type { CountryVisit } from '@/types/global'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Icon } from '@/components/icons'

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
  // const isCurrentlyStaying = !exitDate

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
    <Card className="ios-card-interactive">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-title-3 flex items-center gap-2">
              {country?.flag || <Icon name="world" size="sm" />} {trip.country}
              {country?.isSchengen && (
                <Badge variant="secondary">셰겐</Badge>
              )}
            </h3>
            <p className="text-body-sm text-muted-foreground">
              {trip.visaType}
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onEdit(trip)}
            >
              수정
            </Button>
            <Button 
              variant="destructive-outline" 
              size="sm"
              onClick={handleDelete}
              disabled={loading}
              className={showDeleteConfirm ? 'bg-destructive/10' : ''}
            >
              {loading ? '...' : '삭제'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Dates */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-body-sm text-muted-foreground">입국:</span>
            <span className="text-body-sm font-medium">{formatDate(entryDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-body-sm text-muted-foreground">출국:</span>
            <span className="text-body-sm font-medium">
              {exitDate ? formatDate(exitDate) : (
                <Badge variant="success">현재 체류 중</Badge>
              )}
            </span>
          </div>
        </div>

        {/* Duration */}
        <div className="flex justify-between items-center">
          <span className="text-body-sm text-muted-foreground">체류 일수:</span>
          <div className="text-right">
            <span className="text-lg font-bold">
              {days}일
            </span>
            <span className="text-body-sm text-muted-foreground ml-2">
              / {trip.maxDays}일
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress 
            value={Math.min((days / trip.maxDays) * 100, 100)}
            className={`h-5 ${
              days > trip.maxDays ? 'progress-error' : 
              days > trip.maxDays * 0.8 ? 'progress-warning' : 
              'progress-success'
            }`}
          />
          <div className="flex justify-between text-footnote text-muted-foreground">
            <span>{Math.round((days / trip.maxDays) * 100)}% 사용</span>
            {days > trip.maxDays && (
              <span className="text-destructive flex items-center gap-1">
                <Icon name="alert-triangle" size="xs" />
                최대 체류 일수 초과
              </span>
            )}
          </div>
        </div>

        {/* Notes */}
        {trip.notes && (
          <div className="pt-4 border-t border-border">
            <p className="text-body-sm text-muted-foreground">{trip.notes}</p>
          </div>
        )}

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="bg-error p-4 rounded-lg border border-destructive/20">
            <p className="text-body-sm mb-3 text-destructive">
              정말 이 여행 기록을 삭제하시겠습니까?
            </p>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? '삭제 중...' : '삭제'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                취소
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}