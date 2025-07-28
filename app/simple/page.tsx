'use client'

import { useState } from 'react'

export default function SimplePage() {
  const [trips, setTrips] = useState([
    {
      id: 1,
      country: '프랑스',
      entryDate: '2024-01-15',
      exitDate: '2024-01-20',
      visaType: 'Tourist',
      maxDays: 90,
      notes: '파리 여행'
    },
    {
      id: 2,
      country: '독일',
      entryDate: '2024-02-10',
      exitDate: '2024-02-15',
      visaType: 'Tourist',  
      maxDays: 90,
      notes: '베를린 방문'
    }
  ])

  const [showExportImport, setShowExportImport] = useState(false)

  const handleExport = (format: string) => {
    const data = format === 'json' 
      ? JSON.stringify(trips, null, 2)
      : trips.map(trip => `${trip.country},${trip.entryDate},${trip.exitDate},${trip.visaType},${trip.maxDays},"${trip.notes}"`).join('\n')
    
    const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dinoapp-${format}-${new Date().toISOString().split('T')[0]}.${format}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="card border-b shadow-none rounded-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">🦕 DinoApp</h1>
              <span className="ml-2 text-sm text-secondary">디지털 노마드 캘린더</span>
            </div>
            <div className="text-sm text-primary">프로토타입 데모</div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center mb-4">
              <div className="text-2xl mr-3">🗓️</div>
              <h3 className="text-lg font-semibold">여행 기록</h3>
            </div>
            <div className="text-2xl font-bold text-primary mb-1">{trips.length}</div>
            <p className="text-secondary text-sm">총 여행 수</p>
          </div>

          <div className="card">
            <div className="flex items-center mb-4">
              <div className="text-2xl mr-3">🇪🇺</div>
              <h3 className="text-lg font-semibold">셰겐 현황</h3>
            </div>
            <div className="text-2xl font-bold text-success mb-1">15/90</div>
            <p className="text-secondary text-sm">사용 일수 (규정 준수)</p>
          </div>

          <div className="card">
            <div className="flex items-center mb-4">
              <div className="text-2xl mr-3">🌍</div>
              <h3 className="text-lg font-semibold">방문 국가</h3>
            </div>
            <div className="text-2xl font-bold text-primary mb-1">2</div>
            <p className="text-secondary text-sm">총 방문 국가</p>
          </div>
        </div>

        {/* 데이터 관리 섹션 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">데이터 관리</h2>
            <button 
              onClick={() => setShowExportImport(!showExportImport)}
              className="text-primary hover:opacity-70"
            >
              {showExportImport ? '숨기기' : '보기'}
            </button>
          </div>
          
          {showExportImport && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-medium mb-4">📤 데이터 내보내기</h4>
                  <div className="space-y-3">
                    <button
                      onClick={() => handleExport('json')}
                      className="w-full btn btn-primary"
                    >
                      📄 JSON 형식으로 내보내기
                    </button>
                    <button
                      onClick={() => handleExport('csv')}
                      className="w-full btn btn-success"
                    >
                      📊 CSV 형식으로 내보내기
                    </button>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-4">📥 데이터 가져오기</h4>
                  <div className="border-2 border-dashed border rounded-lg p-6 text-center">
                    <p className="text-secondary mb-2">JSON 또는 CSV 파일을 선택하세요</p>
                    <input type="file" accept=".json,.csv" className="text-sm" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 여행 기록 목록 */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">여행 기록</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {trips.map(trip => (
                <div key={trip.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{trip.country}</h3>
                      <p className="text-secondary">
                        {trip.entryDate} ~ {trip.exitDate}
                      </p>
                      <p className="text-sm text-tertiary">{trip.visaType} | 최대 {trip.maxDays}일</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs badge badge-success">
                        완료
                      </span>
                    </div>
                  </div>
                  {trip.notes && (
                    <p className="mt-2 text-sm text-secondary">{trip.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 셰겐 계산기 미리보기 */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">셰겐 계산기</h2>
          </div>
          <div className="p-6">
            <div className="alert">
              <h4 className="font-semibold mb-3">📚 셰겐 90/180일 규칙</h4>
              <div className="space-y-2 text-sm">
                <p>• 셰겐 지역 내에서 180일 중 최대 90일까지만 체류할 수 있습니다</p>
                <p>• 현재 사용량: 15일 / 90일 (규정 준수 ✅)</p>
                <p>• 다음 초기화: 2024년 8월 15일</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}