'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ApiClient } from '@/lib/api-client'
import NotificationIcon from '@/components/notifications/NotificationIcon'
import LanguageSelector from '@/components/ui/LanguageSelector'
import LanguageTest from '@/components/ui/LanguageTest'
import { t } from '@/lib/i18n'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [statsData, setStatsData] = useState<any>(null)
  const [schengenData, setSchengenData] = useState<any>(null)
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    loadDashboardData()
  }, [session, status, router])

  const loadDashboardData = async () => {
    setDataLoading(true)
    try {
      const [statsResponse, schengenResponse] = await Promise.all([
        ApiClient.getStats(),
        ApiClient.getSchengenStatus()
      ])

      if (statsResponse.success && statsResponse.data) {
        setStatsData(statsResponse.data)
      }

      if (schengenResponse.success && schengenResponse.data) {
        setSchengenData(schengenResponse.data)
      }
    } catch (error) {
      // Error loading dashboard data
    } finally {
      setDataLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut({ 
        callbackUrl: `${window.location.origin}/`,
        redirect: true 
      })
    } catch (error) {
      // Logout error occurred
      window.location.href = '/'
    }
  }

  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0'
      }}>
        <div style={{
          padding: '20px',
          border: '2px solid #ccc',
          backgroundColor: 'white'
        }}>
          {t('common.loading')}
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f0f0f0',
      padding: '20px'
    }}>
      {/* 진짜 와이어프레임 컨테이너 */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: 'white',
        border: '3px solid #333',
        padding: '20px'
      }}>
        
        {/* 헤더 박스 */}
        <div style={{
          border: '2px solid #666',
          padding: '15px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f9f9f9'
        }}>
          <div>
            <h1 style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: 'bold' }}>
              {t('nav.dashboard')} - {t('app.title')}
            </h1>
            <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
              {t('dashboard.welcome', { name: session.user?.name || '' })}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <LanguageSelector />
            <NotificationIcon userId={session.user?.email || ''} />
            <button 
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                border: '2px solid #333',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              {t('dashboard.logout')}
            </button>
          </div>
        </div>

        {/* 메인 그리드 - 와이어프레임 박스들 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '20px'
        }}>
          
          {/* 여행 기록 박스 */}
          <div style={{
            border: '2px solid #666',
            padding: '20px',
            backgroundColor: 'white'
          }}>
            <div style={{
              borderBottom: '1px solid #ccc',
              paddingBottom: '10px',
              marginBottom: '15px'
            }}>
              <h3 style={{ margin: '0', fontSize: '18px' }}>{t('nav.trips')}</h3>
            </div>
            
            <div style={{
              border: '1px dashed #999',
              padding: '20px',
              textAlign: 'center',
              marginBottom: '15px',
              backgroundColor: '#fafafa'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
                {dataLoading ? '...' : statsData ? statsData.overview.totalVisits : '0'}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>{t('common.total')} {t('nav.trips')}</div>
            </div>
            
            <p style={{ fontSize: '14px', marginBottom: '15px', color: '#666' }}>
              {t('trips.description')}
            </p>
            
            <button 
              onClick={() => router.push('/trips')}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #333',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {t('trips.add')}
            </button>
          </div>

          {/* 셰겐 계산기 박스 */}
          <div style={{
            border: '2px solid #666',
            padding: '20px',
            backgroundColor: 'white'
          }}>
            <div style={{
              borderBottom: '1px solid #ccc',
              paddingBottom: '10px',
              marginBottom: '15px'
            }}>
              <h3 style={{ margin: '0', fontSize: '18px' }}>{t('nav.schengen')}</h3>
            </div>
            
            <div style={{
              border: '1px dashed #999',
              padding: '20px',
              textAlign: 'center',
              marginBottom: '15px',
              backgroundColor: '#fafafa'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
                {dataLoading ? '...' : schengenData ? `${schengenData.status.usedDays}/90` : '0/90'}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>{t('schengen.used_days')}/90</div>
              {schengenData && (
                <div style={{
                  marginTop: '10px',
                  padding: '5px 10px',
                  border: '1px solid #ccc',
                  backgroundColor: schengenData.status.isCompliant ? '#e6ffe6' : '#ffe6e6',
                  fontSize: '12px'
                }}>
                  {schengenData.status.isCompliant ? t('schengen.compliant') : t('schengen.violation')}
                </div>
              )}
            </div>
            
            <p style={{ fontSize: '14px', marginBottom: '15px', color: '#666' }}>
              {t('schengen.description')}
            </p>
            
            <button 
              onClick={() => router.push('/schengen')}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #333',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {t('nav.schengen')}
            </button>
          </div>

          {/* 통계 박스 */}
          <div style={{
            border: '2px solid #666',
            padding: '20px',
            backgroundColor: 'white'
          }}>
            <div style={{
              borderBottom: '1px solid #ccc',
              paddingBottom: '10px',
              marginBottom: '15px'
            }}>
              <h3 style={{ margin: '0', fontSize: '18px' }}>{t('dashboard.stats.view')}</h3>
            </div>
            
            <div style={{
              border: '1px dashed #999',
              padding: '20px',
              textAlign: 'center',
              marginBottom: '15px',
              backgroundColor: '#fafafa'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
                {dataLoading ? '...' : statsData ? statsData.overview.totalCountries : '0'}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>{t('dashboard.stats.countries')}</div>
            </div>
            
            <p style={{ fontSize: '14px', marginBottom: '15px', color: '#666' }}>
              여행 패턴과 체류 일수를 분석해보세요
            </p>
            
            <button 
              onClick={() => router.push('/analytics')}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #333',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
{t('dashboard.stats.view')}
            </button>
          </div>
        </div>

        {/* 최근 활동 박스 */}
        <div style={{
          border: '2px solid #666',
          padding: '20px',
          backgroundColor: 'white'
        }}>
          <div style={{
            borderBottom: '1px solid #ccc',
            paddingBottom: '10px',
            marginBottom: '15px'
          }}>
            <h3 style={{ margin: '0', fontSize: '18px' }}>{t('dashboard.recent_activity')}</h3>
          </div>
          
          {dataLoading ? (
            <div style={{
              border: '1px dashed #999',
              padding: '40px',
              textAlign: 'center',
              color: '#666'
            }}>
{t('dashboard.loading_activity')}
            </div>
          ) : statsData && statsData.overview.totalVisits > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '15px'
            }}>
              <div style={{
                border: '1px solid #ccc',
                padding: '15px',
                textAlign: 'center',
                backgroundColor: '#f9f9f9'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
                  {statsData.overview.totalVisits}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>{t('common.total')} {t('nav.trips')}</div>
              </div>
              <div style={{
                border: '1px solid #ccc',
                padding: '15px',
                textAlign: 'center',
                backgroundColor: '#f9f9f9'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
                  {statsData.overview.totalCountries}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>{t('dashboard.stats.countries')}</div>
              </div>
              <div style={{
                border: '1px solid #ccc',
                padding: '15px',
                textAlign: 'center',
                backgroundColor: '#f9f9f9'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
                  {statsData.overview.totalDays}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>{t('common.total')} {t('common.days')}</div>
              </div>
            </div>
          ) : (
            <div style={{
              border: '1px dashed #999',
              padding: '40px',
              textAlign: 'center'
            }}>
              <p style={{ marginBottom: '20px', color: '#666' }}>{t('dashboard.no_trips')}</p>
              <button 
                onClick={() => router.push('/trips')}
                style={{
                  padding: '10px 20px',
                  border: '2px solid #333',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                {t('dashboard.add_first_trip')}
              </button>
            </div>
          )}
        </div>
      </div>
      <LanguageTest />
    </div>
  )
}