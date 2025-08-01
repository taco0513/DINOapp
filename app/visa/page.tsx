'use client';

import { useState } from 'react';
import { StandardPageLayout } from '@/components/layout/StandardPageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VisaRequirementsList from '@/components/visa/VisaRequirementsList';
import { VisaComparison } from '@/components/visa/VisaComparison';
import { VisaChecklist } from '@/components/visa/VisaChecklist';
import { t } from '@/lib/i18n';

export default function VisaPage() {
  const [showComparison, setShowComparison] = useState(false);
  const [showChecklist, setShowChecklist] = useState<string | null>(null);

  return (
    <StandardPageLayout
      title='비자 정보'
      description='디지털 노마드와 여행자를 위한 포괄적인 비자 요구사항 및 여행 정보'
      icon='Globe'
      breadcrumbs={[
        { label: t('nav.dashboard'), href: '/dashboard' },
        { label: t('nav.visa') },
      ]}
    >
      <Tabs defaultValue="requirements" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="requirements">비자 요구사항</TabsTrigger>
          <TabsTrigger value="comparison">국가 비교</TabsTrigger>
          <TabsTrigger value="checklist">체크리스트</TabsTrigger>
        </TabsList>

        <TabsContent value="requirements" className="space-y-6">
          <VisaRequirementsList />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔄</div>
            <h3 className="text-xl font-semibold mb-2">국가별 비자 요구사항 비교</h3>
            <p className="text-muted-foreground mb-6">
              여러 국가의 비자 요구사항을 한눈에 비교해보세요.
            </p>
            {showComparison ? (
              <VisaComparison
                passportCountry="KR"
                onClose={() => setShowComparison(false)}
              />
            ) : (
              <button
                onClick={() => setShowComparison(true)}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                비교 시작하기
              </button>
            )}
          </div>
        </TabsContent>

        <TabsContent value="checklist" className="space-y-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2">비자 신청 체크리스트</h3>
            <p className="text-muted-foreground mb-6">
              국가별 비자 신청에 필요한 서류와 절차를 확인하세요.
            </p>
            {showChecklist ? (
              <VisaChecklist
                countryCode={showChecklist}
                passportCountry="KR"
                onClose={() => setShowChecklist(null)}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                비자 요구사항 탭에서 국가를 선택하여 체크리스트를 확인하세요.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </StandardPageLayout>
  );
}
