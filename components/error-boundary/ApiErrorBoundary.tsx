'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ApiErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, errorInfo: any) {
    console.error('API Error Boundary caught an error:', error, errorInfo)
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{
          padding: '20px',
          margin: '10px 0',
          border: '1px solid #ff6b6b',
          borderRadius: '8px',
          backgroundColor: '#fff5f5',
        }}>
          <h3 style={{
            color: '#e03131',
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '8px',
          }}>
            데이터 로드 오류
          </h3>
          
          <p style={{
            color: '#666',
            fontSize: '14px',
            marginBottom: '16px',
          }}>
            데이터를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
          </p>

          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              backgroundColor: '#e03131',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              fontSize: '14px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '8px',
            }}
          >
            다시 시도
          </button>
          
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: 'transparent',
              color: '#e03131',
              border: '1px solid #e03131',
              padding: '8px 16px',
              fontSize: '14px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            페이지 새로고침
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ApiErrorBoundary