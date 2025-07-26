'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'trips' | 'schengen'>('overview')

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#000' }}>
                DINO 대시보드 미리보기
              </h1>
              <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
                디지털 노마드를 위한 스마트 여행 관리 플랫폼을 체험해보세요
              </p>
            </div>
            <Link 
              href="/auth/signin"
              style={{
                padding: '8px 20px',
                backgroundColor: '#000',
                color: '#fff',
                textDecoration: 'none',
                fontSize: '14px'
              }}
            >
              시작하기
            </Link>
          </div>
        </div>

        {/* Demo Notice */}
        <div style={{ 
          marginBottom: '30px', 
          padding: '15px', 
          border: '1px solid #e0e0e0',
          backgroundColor: '#f8f9fa'
        }}>
          <p style={{ fontSize: '14px', color: '#333', margin: 0 }}>
            이것은 데모 페이지입니다. 실제 데이터를 보려면 로그인하세요.
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', gap: '0', border: '1px solid #e0e0e0', width: 'fit-content' }}>
            <button
              onClick={() => setActiveTab('overview')}
              style={{
                padding: '10px 20px',
                backgroundColor: activeTab === 'overview' ? '#f0f0f0' : '#fff',
                border: 'none',
                borderRight: '1px solid #e0e0e0',
                color: '#000',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              개요
            </button>
            <button
              onClick={() => setActiveTab('trips')}
              style={{
                padding: '10px 20px',
                backgroundColor: activeTab === 'trips' ? '#f0f0f0' : '#fff',
                border: 'none',
                borderRight: '1px solid #e0e0e0',
                color: '#000',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              여행 기록
            </button>
            <button
              onClick={() => setActiveTab('schengen')}
              style={{
                padding: '10px 20px',
                backgroundColor: activeTab === 'schengen' ? '#f0f0f0' : '#fff',
                border: 'none',
                color: '#000',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              셰겐 계산기
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            <div style={{ border: '1px solid #e0e0e0', padding: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#000' }}>
                총 여행
              </h3>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0066cc', marginBottom: '5px' }}>23</div>
              <p style={{ fontSize: '14px', color: '#666' }}>12개국 방문</p>
            </div>

            <div style={{ border: '1px solid #e0e0e0', padding: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#000' }}>
                셰겐 체류
              </h3>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#6600cc', marginBottom: '5px' }}>45/90</div>
              <p style={{ fontSize: '14px', color: '#666' }}>안전한 상태</p>
            </div>

            <div style={{ border: '1px solid #e0e0e0', padding: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#000' }}>
                현재 체류
              </h3>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#009900', marginBottom: '5px' }}>태국</div>
              <p style={{ fontSize: '14px', color: '#666' }}>15일째 체류 중</p>
            </div>
          </div>
        )}

        {activeTab === 'trips' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ border: '1px solid #e0e0e0', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '5px' }}>프랑스</h3>
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>2024년 3월 1일 - 2024년 3월 15일</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ padding: '4px 8px', backgroundColor: '#e6f3ff', color: '#0066cc', fontSize: '12px' }}>셰겐</span>
                    <span style={{ padding: '4px 8px', backgroundColor: '#e6ffe6', color: '#009900', fontSize: '12px' }}>관광</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#000' }}>14일</p>
                  <p style={{ fontSize: '12px', color: '#666' }}>체류</p>
                </div>
              </div>
            </div>

            <div style={{ border: '1px solid #e0e0e0', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '5px' }}>한국</h3>
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>2024년 2월 1일 - 2024년 2월 28일</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ padding: '4px 8px', backgroundColor: '#f0e6ff', color: '#6600cc', fontSize: '12px' }}>비자면제</span>
                    <span style={{ padding: '4px 8px', backgroundColor: '#f0f0f0', color: '#666', fontSize: '12px' }}>가족방문</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#000' }}>27일</p>
                  <p style={{ fontSize: '12px', color: '#666' }}>체류</p>
                </div>
              </div>
            </div>

            <div style={{ border: '1px solid #e0e0e0', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '5px' }}>태국</h3>
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>2024년 4월 1일 - 현재</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ padding: '4px 8px', backgroundColor: '#ffe6e6', color: '#cc0000', fontSize: '12px' }}>현재 체류 중</span>
                    <span style={{ padding: '4px 8px', backgroundColor: '#e6ffe6', color: '#009900', fontSize: '12px' }}>디지털노마드</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#000' }}>15일</p>
                  <p style={{ fontSize: '12px', color: '#666' }}>진행 중</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schengen' && (
          <div style={{ border: '1px solid #e0e0e0', padding: '30px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#000', marginBottom: '25px' }}>셰겐 90/180일 규칙 계산기</h3>
            
            <div style={{ marginBottom: '25px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ color: '#000', fontSize: '14px' }}>현재 상태</span>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#6600cc' }}>45/90일</span>
              </div>
              
              <div style={{ 
                width: '100%', 
                height: '15px', 
                backgroundColor: '#f0f0f0', 
                border: '1px solid #e0e0e0',
                marginBottom: '15px'
              }}>
                <div style={{ 
                  width: '50%', 
                  height: '100%', 
                  backgroundColor: '#6600cc'
                }} />
              </div>
              
              <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.5', marginBottom: '15px' }}>
                지난 180일 중 45일을 셰겐 지역에서 체류했습니다. 
                앞으로 45일 더 체류할 수 있습니다.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ padding: '15px', backgroundColor: '#e6ffe6', border: '1px solid #ccffcc' }}>
                <h4 style={{ fontWeight: 'bold', color: '#006600', marginBottom: '8px' }}>안전</h4>
                <p style={{ fontSize: '14px', color: '#004400', lineHeight: '1.5' }}>
                  현재 셰겐 규정을 준수하고 있습니다. 
                  다음 셰겐 입국 가능일: 즉시 가능
                </p>
              </div>

              <div style={{ padding: '15px', backgroundColor: '#e6f3ff', border: '1px solid #cce6ff' }}>
                <h4 style={{ fontWeight: 'bold', color: '#0066cc', marginBottom: '8px' }}>팁</h4>
                <p style={{ fontSize: '14px', color: '#004499', lineHeight: '1.5' }}>
                  셰겐 지역 밖에서 90일을 보내면 다시 90일 전체를 사용할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div style={{ 
          marginTop: '50px', 
          textAlign: 'center', 
          padding: '40px', 
          border: '1px solid #e0e0e0',
          backgroundColor: '#fafafa'
        }}>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#000', marginBottom: '15px' }}>
            실제 여행 데이터로 시작하세요
          </h3>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '25px', lineHeight: '1.5' }}>
            무료로 가입하고 여행 기록을 관리하세요
          </p>
          <Link
            href="/auth/signin"
            style={{
              display: 'inline-block',
              padding: '12px 30px',
              backgroundColor: '#000',
              color: '#fff',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            지금 시작하기
          </Link>
        </div>
      </div>
    </main>
  )
}