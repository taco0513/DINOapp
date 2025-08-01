'use client'

import { useState } from 'react'
import { Error } from '@/components/ui/error'
import { Button } from '@/components/ui/button'
import { StandardPageLayout } from '@/components/layout/StandardPageLayout'

export default function TestErrorsPage() {
  const [_showAlert, _setShowAlert] = useState(true)
  const [formErrors, _setFormErrors] = useState({
    email: '유효한 이메일 주소를 입력해주세요.',
    password: '비밀번호는 8자 이상이어야 합니다.',
    country: '국가를 선택해주세요.'
  })

  return (
    <StandardPageLayout
      title="Error Components Test"
      description="Unified error handling UI components"
    >
      <div className="space-y-8">
        {/* Error Alerts */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Error Alerts</h2>
          <div className="space-y-4">
            <Error.Alert
              severity="info"
              title="정보"
              message="이것은 정보 메시지입니다."
              onDismiss={() => {}}
            />
            
            <Error.Alert
              severity="warning"
              title="경고"
              message="주의가 필요한 상황입니다."
              action={
                <Button size="sm" variant="outline">
                  자세히 보기
                </Button>
              }
            />
            
            <Error.Alert
              severity="error"
              title="오류"
              message="작업을 완료할 수 없습니다."
            />
            
            <Error.Alert
              severity="critical"
              title="심각한 오류"
              message="시스템에 치명적인 오류가 발생했습니다. 즉시 조치가 필요합니다."
              onDismiss={() => _setShowAlert(false)}
            />
          </div>
        </section>

        {/* Form Errors */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Form Validation</h2>
          <Error.Summary errors={formErrors} />
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">이메일</label>
              <input type="email" className="w-full px-3 py-2 border rounded-lg" />
              <Error.Field error={formErrors.email} />
            </div>
          </div>
        </section>

        {/* Empty States */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Empty States</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <Error.Empty
                title="데이터가 없습니다"
                message="표시할 데이터가 없습니다."
              />
            </div>
            
            <div className="border rounded-lg p-4">
              <Error.Network
                onRetry={() => alert('Retrying...')}
              />
            </div>
          </div>
        </section>

        {/* Error Pages */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Error Pages</h2>
          <div className="space-y-4">
            <div className="border rounded-lg p-8">
              <Error.NotFound
                onGoHome={() => alert('Going home...')}
              />
            </div>
            
            <div className="border rounded-lg p-8">
              <Error.Permission
                onGoBack={() => alert('Going back...')}
              />
            </div>
          </div>
        </section>

        {/* Error Boundary Fallback */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Error Boundary</h2>
          <div className="border rounded-lg">
            <div className="p-4 border border-red-200 bg-red-50 rounded">
              <p className="text-red-800">Error Boundary component demonstration</p>
              <p className="text-sm text-red-600">Component would catch errors in child components</p>
            </div>
          </div>
        </section>
      </div>
    </StandardPageLayout>
  )
}