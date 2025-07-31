'use client'

import { format, startOfYear, endOfYear, eachMonthOfInterval, getDaysInMonth, startOfMonth } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Trip {
  id: string
  country: string
  city: string
  startDate: string
  endDate: string
  purpose: string
  isSchengen?: boolean
}

interface YearViewProps {
  year: number
  trips: Trip[]
  onMonthClick: (date: Date) => void
}

export function YearView({ year, trips, onMonthClick }: YearViewProps) {
  const yearStart = startOfYear(new Date(year, 0))
  const yearEnd = endOfYear(new Date(year, 0))
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd })

  const getTripsForMonth = (monthDate: Date) => {
    const monthStart = startOfMonth(monthDate)
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
    
    return trips.filter(trip => {
      const tripStart = new Date(trip.startDate)
      const tripEnd = new Date(trip.endDate)
      
      return (
        (tripStart >= monthStart && tripStart <= monthEnd) ||
        (tripEnd >= monthStart && tripEnd <= monthEnd) ||
        (tripStart < monthStart && tripEnd > monthEnd)
      )
    })
  }

  const getSchengenDaysForMonth = (monthDate: Date) => {
    const monthTrips = getTripsForMonth(monthDate)
    const monthStart = startOfMonth(monthDate)
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
    
    let schengenDays = 0
    
    monthTrips.forEach(trip => {
      if (trip.isSchengen) {
        const tripStart = new Date(trip.startDate)
        const tripEnd = new Date(trip.endDate)
        
        const overlapStart = tripStart > monthStart ? tripStart : monthStart
        const overlapEnd = tripEnd < monthEnd ? tripEnd : monthEnd
        
        if (overlapStart <= overlapEnd) {
          schengenDays += Math.floor((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
        }
      }
    })
    
    return schengenDays
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">{year}년 전체 보기</h2>
      
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
        {months.map(month => {
          const monthTrips = getTripsForMonth(month)
          const schengenDays = getSchengenDaysForMonth(month)
          // const daysInMonth = getDaysInMonth(month)
          
          return (
            <div
              key={month.toISOString()}
              onClick={() => onMonthClick(month)}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <h3 className="font-medium text-gray-900 mb-2">
                {format(month, 'M월', { locale: ko })}
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">여행</span>
                  <span className="font-medium">{monthTrips.length}개</span>
                </div>
                
                {schengenDays > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">셰겐</span>
                    <span className="font-medium text-purple-600">{schengenDays}일</span>
                  </div>
                )}
                
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex flex-wrap gap-1">
                    {monthTrips.slice(0, 3).map(trip => (
                      <span
                        key={trip.id}
                        className={`text-xs px-2 py-0.5 rounded ${
                          trip.isSchengen
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {trip.city}
                      </span>
                    ))}
                    {monthTrips.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{monthTrips.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* 연간 통계 */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {year}년 여행 통계
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">총 여행 횟수</p>
            <p className="text-2xl font-semibold text-gray-900">{trips.length}회</p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-600 mb-1">셰겐 체류일수</p>
            <p className="text-2xl font-semibold text-purple-700">
              {trips.reduce((sum, trip) => {
                if (trip.isSchengen) {
                  const start = new Date(trip.startDate)
                  const end = new Date(trip.endDate)
                  return sum + Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
                }
                return sum
              }, 0)}일
            </p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600 mb-1">방문 국가</p>
            <p className="text-2xl font-semibold text-blue-700">
              {new Set(trips.map(t => t.country)).size}개국
            </p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600 mb-1">총 여행일수</p>
            <p className="text-2xl font-semibold text-green-700">
              {trips.reduce((sum, trip) => {
                const start = new Date(trip.startDate)
                const end = new Date(trip.endDate)
                return sum + Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
              }, 0)}일
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}