'use client'

import { useState } from 'react'
import { ApiClient } from '@/lib/api-client'

interface DataExportImportProps {
  onSuccess?: () => void
}

export default function DataExportImport({ onSuccess }: DataExportImportProps) {
  const [exportLoading, setExportLoading] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importResult, setImportResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [showImportOptions, setShowImportOptions] = useState(false)
  const [importOptions, setImportOptions] = useState({
    replaceExisting: false,
    skipDuplicates: true
  })

  const handleExport = async (format: 'json' | 'csv') => {
    setExportLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/export?format=${format}`)
      
      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      
      const filename = format === 'csv' 
        ? `dinocal-trips-${new Date().toISOString().split('T')[0]}.csv`
        : `dinocal-data-${new Date().toISOString().split('T')[0]}.json`
      
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setExportLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImportFile(file)
      setImportResult(null)
      setError(null)
    }
  }

  const handleImport = async () => {
    if (!importFile) return

    setImportLoading(true)
    setError(null)
    setImportResult(null)

    try {
      const fileContent = await importFile.text()
      let importData

      if (importFile.name.endsWith('.json')) {
        importData = JSON.parse(fileContent)
      } else if (importFile.name.endsWith('.csv')) {
        // Simple CSV parsing (for basic trip data)
        const lines = fileContent.split('\n')
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())
        
        const trips = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.split(',').map(v => v.replace(/"/g, '').trim())
            const trip: any = {}
            
            headers.forEach((header, index) => {
              const value = values[index]
              switch (header) {
                case 'Country':
                  trip.country = value
                  break
                case 'Entry Date':
                  trip.entryDate = value
                  break
                case 'Exit Date':
                  trip.exitDate = value || null
                  break
                case 'Visa Type':
                  trip.visaType = value
                  break
                case 'Max Days':
                  trip.maxDays = parseInt(value)
                  break
                case 'Passport Country':
                  trip.passportCountry = value
                  break
                case 'Notes':
                  trip.notes = value
                  break
              }
            })
            
            return trip
          })

        importData = { trips }
      } else {
        throw new Error('Unsupported file format. Please use JSON or CSV.')
      }

      const queryParams = new URLSearchParams()
      if (importOptions.replaceExisting) {
        queryParams.append('replace', 'true')
      }
      if (!importOptions.skipDuplicates) {
        queryParams.append('skipDuplicates', 'false')
      }

      const response = await fetch(`/api/import?${queryParams}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(importData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Import failed')
      }

      setImportResult(result)
      setImportFile(null)
      
      if (onSuccess) {
        onSuccess()
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setImportLoading(false)
    }
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-6">데이터 내보내기 / 가져오기</h3>

      {error && (
        <div className="mb-6 alert alert-error">
          <p>{error}</p>
        </div>
      )}

      {importResult && (
        <div className="mb-6 alert alert-success">
          <h4 className="font-medium mb-2">가져오기 완료</h4>
          <div className="text-sm space-y-1">
            <p>• 가져온 여행 기록: {importResult.summary.imported}개</p>
            <p>• 건너뛴 기록: {importResult.summary.skipped}개</p>
            <p>• 오류 발생: {importResult.summary.errors}개</p>
            {importResult.errors && importResult.errors.length > 0 && (
              <div className="mt-2">
                <p className="font-medium">오류 내역:</p>
                <ul className="list-disc list-inside">
                  {importResult.errors.map((error: string, index: number) => (
                    <li key={index} className="text-xs">{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Export Section */}
        <div>
          <h4 className="font-medium mb-4">📤 데이터 내보내기</h4>
          <p className="text-sm text-secondary mb-4">
            여행 기록을 JSON 또는 CSV 형식으로 내보낼 수 있습니다.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => handleExport('json')}
              disabled={exportLoading}
              className="w-full btn btn-primary"
            >
              {exportLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : (
                <span>📄</span>
              )}
              JSON 형식으로 내보내기
            </button>
            
            <button
              onClick={() => handleExport('csv')}
              disabled={exportLoading}
              className="w-full btn btn-success"
            >
              {exportLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : (
                <span>📊</span>
              )}
              CSV 형식으로 내보내기
            </button>
          </div>
        </div>

        {/* Import Section */}
        <div>
          <h4 className="font-medium mb-4">📥 데이터 가져오기</h4>
          <p className="text-sm text-secondary mb-4">
            JSON 또는 CSV 파일에서 여행 기록을 가져올 수 있습니다.
          </p>

          <div className="space-y-4">
            <div>
              <input
                type="file"
                accept=".json,.csv"
                onChange={handleFileSelect}
                className="w-full text-sm text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-surface file:text-primary hover:file:bg-surface hover:file:opacity-80"
              />
            </div>

            {importFile && (
              <div className="space-y-4">
                <div className="p-3 bg-surface rounded-lg">
                  <p className="text-sm">
                    선택된 파일: <span className="font-medium">{importFile.name}</span>
                  </p>
                </div>

                <div>
                  <button
                    onClick={() => setShowImportOptions(!showImportOptions)}
                    className="text-sm text-primary hover:opacity-70"
                  >
                    {showImportOptions ? '옵션 숨기기' : '가져오기 옵션 보기'}
                  </button>

                  {showImportOptions && (
                    <div className="mt-3 p-4 bg-surface rounded-lg space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={importOptions.replaceExisting}
                          onChange={(e) => setImportOptions(prev => ({
                            ...prev,
                            replaceExisting: e.target.checked
                          }))}
                          className="mr-2"
                        />
                        <span className="text-sm">기존 데이터를 모두 삭제하고 가져오기</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={importOptions.skipDuplicates}
                          onChange={(e) => setImportOptions(prev => ({
                            ...prev,
                            skipDuplicates: e.target.checked
                          }))}
                          className="mr-2"
                        />
                        <span className="text-sm">중복 기록 건너뛰기</span>
                      </label>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleImport}
                  disabled={importLoading}
                  className="w-full btn btn-primary"
                >
                  {importLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  ) : (
                    <span>📥</span>
                  )}
                  {importLoading ? '가져오는 중...' : '가져오기'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 alert">
        <h5 className="font-medium mb-2">💡 사용 팁</h5>
        <div className="text-sm space-y-1">
          <p>• JSON 형식은 모든 데이터(설정 포함)를 완전히 백업합니다</p>
          <p>• CSV 형식은 여행 기록만 내보내며 다른 앱과 호환됩니다</p>
          <p>• 가져오기 전에 기존 데이터를 백업하는 것을 권장합니다</p>
          <p>• 중복 기록 건너뛰기는 같은 국가/날짜 조합을 기준으로 합니다</p>
        </div>
      </div>
    </div>
  )
}