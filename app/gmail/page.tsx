'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

// Gmail Integration 인라인 컴포넌트
function WireframeGmailIntegration() {
  const { data: session } = useSession()
  const [connectionStatus, setConnectionStatus] = useState<any>(null)
  const [travelEmails, setTravelEmails] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'analysis' | 'stats'>('analysis')

  // Gmail 연결 상태 확인
  const checkConnection = async () => {
    if (!session) return

    try {
      setIsLoading(true)
      setError('')
      
      const response = await fetch('/api/gmail/check')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to check Gmail connection')
      }
      
      setConnectionStatus(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setConnectionStatus({ connected: false, message: '연결 확인 실패' })
    } finally {
      setIsLoading(false)
    }
  }

  // 여행 이메일 분석
  const analyzeTravelEmails = async (maxResults: number = 20) => {
    if (!session) return

    try {
      setIsLoading(true)
      setError('')
      
      const response = await fetch(`/api/gmail/analyze?maxResults=${maxResults}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to analyze travel emails')
      }
      
      const emails = data.travelInfos || []
      setTravelEmails(emails)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  // 컴포넌트 마운트 시 연결 상태 확인
  useEffect(() => {
    if (session) {
      checkConnection()
    }
  }, [session])

  if (!session) {
    return (
      <div style={{ backgroundColor: '#fffbf0', border: '1px solid #e0e0e0', padding: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#000' }}>Gmail 통합</h3>
        <p style={{ color: '#666' }}>Gmail 통합을 사용하려면 먼저 로그인해주세요.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', padding: '30px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#000', marginBottom: '20px' }}>
          📧 Gmail 여행 이메일 분석
        </h2>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          Gmail에서 여행 관련 이메일을 자동으로 찾아 분석합니다.
        </p>
        
        {/* 연결 상태 */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#333', marginBottom: '15px' }}>연결 상태</h3>
          
          {connectionStatus && (
            <div style={{
              padding: '15px',
              border: '1px solid #e0e0e0',
              backgroundColor: connectionStatus.connected ? '#f0fff0' : '#fff0f0',
              marginBottom: '15px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: connectionStatus.connected ? '#00aa00' : '#aa0000',
                  marginRight: '12px'
                }} />
                <span style={{
                  fontWeight: '500',
                  color: connectionStatus.connected ? '#006600' : '#660000'
                }}>
                  {connectionStatus.message}
                </span>
              </div>
            </div>
          )}
          
          <button
            onClick={checkConnection}
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#0066cc',
              color: '#fff',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            {isLoading ? '확인 중...' : '연결 상태 확인'}
          </button>
        </div>

        {/* 이메일 분석 컨트롤 */}
        {connectionStatus?.connected && (
          <div style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>여행 이메일 분석</h3>
              {travelEmails.length > 0 && (
                <span style={{ 
                  padding: '4px 12px', 
                  backgroundColor: '#e6f3ff', 
                  color: '#0066cc', 
                  fontSize: '12px',
                  border: '1px solid #cce6ff'
                }}>
                  {travelEmails.length}개 발견
                </span>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <button
                onClick={() => analyzeTravelEmails(10)}
                disabled={isLoading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#009900',
                  color: '#fff',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: isLoading ? 0.6 : 1
                }}
              >
                {isLoading ? '분석 중...' : '🔍 최근 10개 분석'}
              </button>
              
              <button
                onClick={() => analyzeTravelEmails(20)}
                disabled={isLoading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#0066cc',
                  color: '#fff',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: isLoading ? 0.6 : 1
                }}
              >
                {isLoading ? '분석 중...' : '🔍 최근 20개 분석'}
              </button>
              
              <button
                onClick={() => analyzeTravelEmails(50)}
                disabled={isLoading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6600cc',
                  color: '#fff',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: isLoading ? 0.6 : 1
                }}
              >
                {isLoading ? '분석 중...' : '📊 전체 분석 (50개)'}
              </button>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div style={{ 
                marginBottom: '20px', 
                padding: '15px', 
                backgroundColor: '#fff0f0', 
                border: '1px solid #ffcccc' 
              }}>
                <p style={{ color: '#cc0000' }}>❌ {error}</p>
              </div>
            )}
          </div>
        )}

        {/* 분석 결과 탭 */}
        {travelEmails.length > 0 && (
          <div style={{ width: '100%' }}>
            <div style={{ borderBottom: '1px solid #e0e0e0', marginBottom: '30px' }}>
              <div style={{ display: 'flex', gap: '30px' }}>
                <button
                  onClick={() => setActiveTab('analysis')}
                  style={{
                    padding: '10px 0',
                    borderBottom: activeTab === 'analysis' ? '2px solid #0066cc' : '2px solid transparent',
                    backgroundColor: 'transparent',
                    border: 'none',
                    fontWeight: '500',
                    fontSize: '14px',
                    color: activeTab === 'analysis' ? '#0066cc' : '#666',
                    cursor: 'pointer'
                  }}
                >
                  🔍 분석결과
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  style={{
                    padding: '10px 0',
                    borderBottom: activeTab === 'stats' ? '2px solid #0066cc' : '2px solid transparent',
                    backgroundColor: 'transparent',
                    border: 'none',
                    fontWeight: '500',
                    fontSize: '14px',
                    color: activeTab === 'stats' ? '#0066cc' : '#666',
                    cursor: 'pointer'
                  }}
                >
                  📊 통계
                </button>
              </div>
            </div>
            
            {activeTab === 'analysis' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '400px', overflowY: 'auto' }}>
                {travelEmails.map((email, index) => (
                  <div key={email.emailId} style={{ backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <h5 style={{ fontWeight: '500', color: '#000', flex: 1, marginRight: '10px' }}>
                        {email.subject}
                      </h5>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {email.category && (
                          <span style={{ 
                            padding: '4px 8px', 
                            fontSize: '11px', 
                            backgroundColor: '#f0e6ff', 
                            color: '#6600cc',
                            border: '1px solid #e0ccff'
                          }}>
                            {email.category === 'airline' ? '항공사' :
                             email.category === 'hotel' ? '호텔' :
                             email.category === 'travel_agency' ? '여행사' :
                             email.category === 'rental' ? '렌터카' :
                             email.category === 'booking_platform' ? '예약사이트' : email.category}
                          </span>
                        )}
                        <span style={{
                          padding: '4px 8px',
                          fontSize: '11px',
                          backgroundColor: email.confidence >= 0.7 ? '#e6ffe6' : 
                                          email.confidence >= 0.5 ? '#fffde6' : '#ffe6e6',
                          color: email.confidence >= 0.7 ? '#006600' : 
                                email.confidence >= 0.5 ? '#cc9900' : '#cc0000',
                          border: '1px solid #e0e0e0'
                        }}>
                          신뢰도 {Math.round(email.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                    
                    <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>{email.from}</p>
                    
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                      gap: '10px', 
                      fontSize: '13px', 
                      marginBottom: '15px' 
                    }}>
                      {email.departureDate && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span>✈️</span>
                          <span style={{ fontWeight: '500', color: '#333' }}>출발:</span>
                          <span style={{ color: '#666' }}>{email.departureDate}</span>
                        </div>
                      )}
                      {email.returnDate && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span>🏠</span>
                          <span style={{ fontWeight: '500', color: '#333' }}>귀국:</span>
                          <span style={{ color: '#666' }}>{email.returnDate}</span>
                        </div>
                      )}
                      {email.departure && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span>📍</span>
                          <span style={{ fontWeight: '500', color: '#333' }}>출발지:</span>
                          <span style={{ color: '#666' }}>{email.departure}</span>
                        </div>
                      )}
                      {email.destination && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span>🎯</span>
                          <span style={{ fontWeight: '500', color: '#333' }}>목적지:</span>
                          <span style={{ color: '#666' }}>{email.destination}</span>
                        </div>
                      )}
                      {email.flightNumber && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span>✈️</span>
                          <span style={{ fontWeight: '500', color: '#333' }}>항공편:</span>
                          <span style={{ color: '#666' }}>{email.flightNumber}</span>
                        </div>
                      )}
                      {email.bookingReference && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span>📋</span>
                          <span style={{ fontWeight: '500', color: '#333' }}>예약번호:</span>
                          <span style={{ color: '#666' }}>{email.bookingReference}</span>
                        </div>
                      )}
                    </div>
                    
                    {email.confidence >= 0.5 && (
                      <button
                        style={{
                          padding: '8px 15px',
                          backgroundColor: '#0066cc',
                          color: '#fff',
                          fontSize: '13px',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          console.log('Add travel record:', email)
                        }}
                      >
                        📅 여행 기록 추가
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'stats' && (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
                <p style={{ color: '#666' }}>분석된 이메일 통계가 표시됩니다</p>
              </div>
            )}
          </div>
        )}

        {travelEmails.length === 0 && !isLoading && !error && connectionStatus?.connected && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔍</div>
            <p>분석할 여행 이메일을 찾지 못했습니다.</p>
            <p style={{ fontSize: '13px', marginTop: '5px' }}>다른 검색 범위로 시도해보세요.</p>
          </div>
        )}
      </div>
      
      {/* 개인정보 보호 안내 */}
      <div style={{ backgroundColor: '#f0f8ff', border: '1px solid #cce6ff', padding: '20px' }}>
        <h4 style={{ fontWeight: '500', color: '#004499', marginBottom: '10px' }}>🔒 개인정보 보호</h4>
        <ul style={{ fontSize: '13px', color: '#0066cc', lineHeight: '1.6', paddingLeft: '20px' }}>
          <li>이메일 내용은 로컬에서만 처리되며 외부로 전송되지 않습니다</li>
          <li>읽기 전용 권한만 사용하여 이메일을 수정할 수 없습니다</li>
          <li>분석된 정보는 사용자 승인 후에만 저장됩니다</li>
          <li>언제든지 Gmail 연동을 해제할 수 있습니다</li>
        </ul>
      </div>
    </div>
  )
}

export default function GmailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>로딩 중...</div>
        </div>
      </main>
    )
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  return (
    <main style={{ 
      minHeight: '100vh', 
      padding: '20px',
      backgroundColor: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          marginBottom: '40px',
          paddingBottom: '20px',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#000', marginBottom: '10px' }}>Gmail 통합</h1>
          <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.5' }}>
            Gmail에서 여행 관련 이메일을 자동으로 분석하여 여행 기록을 간편하게 추가할 수 있습니다.
          </p>
        </div>
        
        <WireframeGmailIntegration />
        
        {/* 사용 가이드 */}
        <div style={{ marginTop: '40px', backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0', padding: '30px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#000', marginBottom: '20px' }}>사용 가이드</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#333', marginBottom: '8px' }}>1. Gmail 연결 확인</h3>
              <p style={{ color: '#666', lineHeight: '1.5' }}>
                먼저 Gmail 연결 상태를 확인합니다. 연결이 되지 않았다면 Google 계정 재로그인이 필요할 수 있습니다.
              </p>
            </div>
            
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#333', marginBottom: '8px' }}>2. 여행 이메일 분석</h3>
              <p style={{ color: '#666', lineHeight: '1.5' }}>
                "최근 10개 분석" 또는 "최근 20개 분석" 버튼을 클릭하여 여행 관련 이메일을 분석합니다.
                항공권, 호텔 예약, 여행 일정 등의 이메일을 자동으로 찾아 분석합니다.
              </p>
            </div>
            
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#333', marginBottom: '8px' }}>3. 분석 결과 확인</h3>
              <p style={{ color: '#666', lineHeight: '1.5' }}>
                분석된 결과에서 출발일, 도착일, 목적지 등의 정보를 확인하고, 
                신뢰도가 높은 결과는 "여행 기록 추가" 버튼으로 바로 여행 기록에 추가할 수 있습니다.
              </p>
            </div>
            
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#333', marginBottom: '8px' }}>4. 지원하는 이메일 유형</h3>
              <ul style={{ color: '#666', lineHeight: '1.6', paddingLeft: '20px' }}>
                <li>항공권 예약 이메일 (항공사, 여행사)</li>
                <li>호텔 예약 이메일 (Booking.com, Expedia, Agoda 등)</li>
                <li>렌터카 예약 이메일</li>
                <li>여행 일정 이메일</li>
                <li>전자티켓 및 보딩패스</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}