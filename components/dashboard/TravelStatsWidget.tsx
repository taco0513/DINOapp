'use client'

import React, { memo, useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { Calendar, Globe, Clock, MapPin, TrendingUp, Award } from 'lucide-react'
import { ApiClient } from '@/lib/api-client'
import type { CountryVisit } from '@/types/global'

interface TravelStats {
  totalTrips: number
  totalCountries: number
  totalDays: number
  averageTripLength: number
  longestTrip: {
    country: string
    days: number
  }
  mostVisited: {
    country: string
    visits: number
  }
  yearlyStats: Array<{
    year: number
    trips: number
    countries: number
    days: number
  }>
  monthlyDistribution: Array<{
    month: string
    trips: number
  }>
  continentDistribution: Array<{
    continent: string
    countries: number
    visits: number
  }>
  schengenUsage: {
    totalDays: number
    remainingDays: number
    compliance: boolean
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

const CONTINENT_MAPPING: Record<string, string> = {
  'France': '유럽',
  'Germany': '유럽',
  'Italy': '유럽',
  'Spain': '유럽',
  'Netherlands': '유럽',
  'Switzerland': '유럽',
  'Austria': '유럽',
  'Belgium': '유럽',
  'Czech Republic': '유럽',
  'Japan': '아시아',
  'South Korea': '아시아',
  'China': '아시아',
  'Thailand': '아시아',
  'Singapore': '아시아',
  'United States': '북미',
  'Canada': '북미',
  'Mexico': '북미',
  'Brazil': '남미',
  'Argentina': '남미',
  'Australia': '오세아니아',
  'New Zealand': '오세아니아'
}

interface TravelStatsWidgetProps {
  className?: string
}

export const TravelStatsWidget = memo<TravelStatsWidgetProps>(({ className = '' }) => {
  const [stats, setStats] = useState<TravelStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'distribution'>('overview')

  useEffect(() => {
    loadTravelStats()
  }, [])

  const loadTravelStats = async () => {
    setLoading(true)
    try {
      const response = await ApiClient.getTrips()
      if (response.success && response.data) {
        const processedStats = processTravelData(response.data)
        setStats(processedStats)
      }
    } catch (error) {
      console.error('Error loading travel stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const processTravelData = (trips: CountryVisit[]): TravelStats => {
    if (trips.length === 0) {
      return {
        totalTrips: 0,
        totalCountries: 0,
        totalDays: 0,
        averageTripLength: 0,
        longestTrip: { country: '', days: 0 },
        mostVisited: { country: '', visits: 0 },
        yearlyStats: [],
        monthlyDistribution: [],
        continentDistribution: [],
        schengenUsage: { totalDays: 0, remainingDays: 90, compliance: true }
      }
    }

    // Basic calculations
    const totalTrips = trips.length
    const uniqueCountries = new Set(trips.map(trip => trip.country))
    const totalCountries = uniqueCountries.size

    // Calculate trip durations
    const tripDurations = trips.map(trip => {
      const entryDate = new Date(trip.entryDate)
      const exitDate = trip.exitDate ? new Date(trip.exitDate) : new Date()
      return {
        country: trip.country,
        days: Math.ceil((exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      }
    })

    const totalDays = tripDurations.reduce((sum, trip) => sum + trip.days, 0)
    const averageTripLength = Math.round(totalDays / totalTrips)

    // Find longest trip
    const longestTrip = tripDurations.reduce((longest, current) => 
      current.days > longest.days ? current : longest, { country: '', days: 0 })

    // Find most visited country
    const countryVisits = trips.reduce((acc, trip) => {
      acc[trip.country] = (acc[trip.country] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const mostVisited = Object.entries(countryVisits).reduce((most, [country, visits]) => 
      visits > most.visits ? { country, visits } : most, { country: '', visits: 0 })

    // Yearly statistics
    const yearlyData = trips.reduce((acc, trip) => {
      const year = new Date(trip.entryDate).getFullYear()
      if (!acc[year]) {
        acc[year] = { trips: 0, countries: new Set<string>(), totalDays: 0 }
      }
      acc[year].trips++
      acc[year].countries.add(trip.country)
      
      const days = tripDurations.find(t => t.country === trip.country)?.days || 0
      acc[year].totalDays += days
      
      return acc
    }, {} as Record<number, { trips: number; countries: Set<string>; totalDays: number }>)

    const yearlyStats = Object.entries(yearlyData).map(([year, data]) => ({
      year: parseInt(year),
      trips: data.trips,
      countries: data.countries.size,
      days: data.totalDays
    })).sort((a, b) => a.year - b.year)

    // Monthly distribution
    const monthlyData = trips.reduce((acc, trip) => {
      const month = new Date(trip.entryDate).toLocaleDateString('ko-KR', { month: 'short' })
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const monthlyDistribution = Object.entries(monthlyData).map(([month, trips]) => ({
      month,
      trips
    }))

    // Continent distribution
    const continentData = trips.reduce((acc, trip) => {
      const continent = CONTINENT_MAPPING[trip.country] || '기타'
      if (!acc[continent]) {
        acc[continent] = { countries: new Set<string>(), visits: 0 }
      }
      acc[continent].countries.add(trip.country)
      acc[continent].visits++
      return acc
    }, {} as Record<string, { countries: Set<string>; visits: number }>)

    const continentDistribution = Object.entries(continentData).map(([continent, data]) => ({
      continent,
      countries: data.countries.size,
      visits: data.visits
    }))

    // Schengen usage (simplified)
    const schengenCountries = ['France', 'Germany', 'Italy', 'Spain', 'Netherlands', 'Switzerland', 'Austria', 'Belgium', 'Czech Republic']
    const schengenTrips = trips.filter(trip => schengenCountries.includes(trip.country))
    const schengenDays = schengenTrips.reduce((sum, trip) => {
      const days = tripDurations.find(t => t.country === trip.country)?.days || 0
      return sum + days
    }, 0)

    const schengenUsage = {
      totalDays: schengenDays,
      remainingDays: Math.max(0, 90 - schengenDays),
      compliance: schengenDays <= 90
    }

    return {
      totalTrips,
      totalCountries,
      totalDays,
      averageTripLength,
      longestTrip,
      mostVisited,
      yearlyStats,
      monthlyDistribution,
      continentDistribution,
      schengenUsage
    }
  }

  if (loading) {
    return (
      <div className={`card ${className}`}>
        <div className="card-header">
          <h3 className="card-title flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            여행 통계
          </h3>
        </div>
        <div className="p-8 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!stats || stats.totalTrips === 0) {
    return (
      <div className={`card ${className}`}>
        <div className="card-header">
          <h3 className="card-title flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            여행 통계
          </h3>
        </div>
        <div className="p-8 text-center text-secondary">
          <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>여행 기록을 추가하면 통계를 확인할 수 있습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <h3 className="card-title flex items-center gap-2">
          <BarChart className="h-5 w-5" />
          여행 통계
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-ghost'}`}
          >
            개요
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`btn btn-sm ${activeTab === 'trends' ? 'btn-primary' : 'btn-ghost'}`}
          >
            추세
          </button>
          <button
            onClick={() => setActiveTab('distribution')}
            className={`btn btn-sm ${activeTab === 'distribution' ? 'btn-primary' : 'btn-ghost'}`}
          >
            분포
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.totalTrips}</div>
                <div className="text-sm text-secondary flex items-center justify-center gap-1">
                  <MapPin className="h-3 w-3" />
                  총 여행
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.totalCountries}</div>
                <div className="text-sm text-secondary flex items-center justify-center gap-1">
                  <Globe className="h-3 w-3" />
                  방문 국가
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.totalDays}</div>
                <div className="text-sm text-secondary flex items-center justify-center gap-1">
                  <Calendar className="h-3 w-3" />
                  총 일수
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.averageTripLength}</div>
                <div className="text-sm text-secondary flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3" />
                  평균 일수
                </div>
              </div>
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <div className="card-header">
                  <h4 className="card-title text-sm flex items-center gap-2">
                    <Award className="h-4 w-4 text-blue-600" />
                    최장 여행
                  </h4>
                </div>
                <div className="px-4 pb-4">
                  <p className="font-semibold">{stats.longestTrip.country}</p>
                  <p className="text-sm text-secondary">{stats.longestTrip.days}일</p>
                </div>
              </div>

              <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <div className="card-header">
                  <h4 className="card-title text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    최다 방문
                  </h4>
                </div>
                <div className="px-4 pb-4">
                  <p className="font-semibold">{stats.mostVisited.country}</p>
                  <p className="text-sm text-secondary">{stats.mostVisited.visits}회</p>
                </div>
              </div>
            </div>

            {/* Schengen Status */}
            <div className="card">
              <div className="card-header">
                <h4 className="card-title text-sm">셰겐 사용량</h4>
              </div>
              <div className="px-4 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">사용: {stats.schengenUsage.totalDays}일</span>
                  <span className="text-sm">남은: {stats.schengenUsage.remainingDays}일</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      stats.schengenUsage.compliance 
                        ? stats.schengenUsage.totalDays > 72 ? 'bg-yellow-500' : 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min((stats.schengenUsage.totalDays / 90) * 100, 100)}%` }}
                  />
                </div>
                <p className={`text-xs mt-1 ${
                  stats.schengenUsage.compliance ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stats.schengenUsage.compliance ? '규정 준수' : '규정 초과'}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div className="h-64">
              <h4 className="text-sm font-medium mb-4">연도별 여행 추세</h4>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.yearlyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="trips" stroke="#8884d8" strokeWidth={2} name="여행 수" />
                  <Line type="monotone" dataKey="countries" stroke="#82ca9d" strokeWidth={2} name="국가 수" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="h-64">
              <h4 className="text-sm font-medium mb-4">월별 여행 분포</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="trips" fill="#8884d8" name="여행 수" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'distribution' && (
          <div className="space-y-6">
            <div className="h-64">
              <h4 className="text-sm font-medium mb-4">대륙별 분포</h4>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.continentDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ continent, visits }) => `${continent} (${visits})`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="visits"
                  >
                    {stats.continentDistribution.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.continentDistribution.map((continent, index) => (
                <div key={continent.continent} className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{continent.continent}</p>
                    <p className="text-sm text-secondary">
                      {continent.countries}개국, {continent.visits}회 방문
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

TravelStatsWidget.displayName = 'TravelStatsWidget'