'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import {
  Search,
  Filter,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
} from 'lucide-react';
import { StandardPageLayout, StandardCard, StatsCard, EmptyState } from '@/components/layout/StandardPageLayout';
import { Input } from '@/components/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserVisaCard, type UserVisa } from '@/components/visas/UserVisaCard';
import { AddVisaModal } from '@/components/visas/AddVisaModal';
import { VisaExpiryAlerts } from '@/components/visas/VisaExpiryAlerts';
import { t } from '@/lib/i18n';

interface VisaStats {
  overview: {
    totalVisas: number;
    activeVisas: number;
    expiredVisas: number;
    expiringVisas: number;
    countriesVisited: number;
    currentStays: number;
  };
  expiringVisas: Array<{
    id: string;
    countryCode: string;
    countryName: string;
    visaType: string;
    expiryDate: Date;
  }>;
  currentStays: Array<{
    id: string;
    entryDate: Date;
    daysInCountry: number;
    remainingDays: number | null;
    userVisa: {
      countryCode: string;
      countryName: string;
      visaType: string;
      maxStayDays: number | null;
      expiryDate: Date;
    };
  }>;
}

export default function MyVisasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [visas, setVisas] = useState<UserVisa[]>([]);
  const [stats, setStats] = useState<VisaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [visaTypeFilter, setVisaTypeFilter] = useState<string>('all');

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    loadVisas();
    loadStats();
  }, [session, status, router]);

  const loadVisas = async () => {
    try {
      const response = await fetch('/api/visas');
      const result = await response.json();

      if (result.success) {
        // Date 객체로 변환
        const visasWithDates = result.data.map((visa: any) => ({
          ...visa,
          issueDate: new Date(visa.issueDate),
          expiryDate: new Date(visa.expiryDate),
          applicationDate: visa.applicationDate ? new Date(visa.applicationDate) : undefined,
          renewalDeadline: visa.renewalDeadline ? new Date(visa.renewalDeadline) : undefined,
          lastEntryDate: visa.lastEntryDate ? new Date(visa.lastEntryDate) : undefined,
          lastAlertSent: visa.lastAlertSent ? new Date(visa.lastAlertSent) : undefined,
        }));
        setVisas(visasWithDates);
      } else {
        toast.error('비자 정보를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      logger.error('Error loading visas:', error);
      toast.error('비자 정보를 불러오는데 실패했습니다.');
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/visas/stats');
      const result = await response.json();

      if (result.success) {
        // Date 객체로 변환
        const statsWithDates = {
          ...result.data,
          expiringVisas: result.data.expiringVisas.map((visa: any) => ({
            ...visa,
            expiryDate: new Date(visa.expiryDate),
          })),
          currentStays: result.data.currentStays.map((stay: any) => ({
            ...stay,
            entryDate: new Date(stay.entryDate),
            userVisa: {
              ...stay.userVisa,
              expiryDate: new Date(stay.userVisa.expiryDate),
            },
          })),
        };
        setStats(statsWithDates);
      }
    } catch (error) {
      logger.error('Error loading visa stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVisaAdded = (newVisa: UserVisa) => {
    setVisas(prev => [newVisa, ...prev]);
    loadStats(); // 통계 새로고침
  };

  const handleDeleteVisa = async (visaId: string) => {
    if (!confirm('정말로 이 비자를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/visas?id=${visaId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setVisas(prev => prev.filter(visa => visa.id !== visaId));
        loadStats(); // 통계 새로고침
        toast.success('비자가 삭제되었습니다.');
      } else {
        toast.error('비자 삭제에 실패했습니다.');
      }
    } catch (error) {
      logger.error('Error deleting visa:', error);
      toast.error('비자 삭제에 실패했습니다.');
    }
  };

  // 필터링된 비자 목록
  const filteredVisas = visas.filter(visa => {
    const matchesSearch = 
      visa.countryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visa.visaType.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || visa.status === statusFilter;
    const matchesType = visaTypeFilter === 'all' || visa.visaType === visaTypeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getVisaTypeDisplay = (type: string) => {
    const typeMap: Record<string, string> = {
      'tourist': '관광',
      'business': '비즈니스',
      'student': '학생',
      'work': '취업',
      'transit': '경유',
      'digital-nomad': '디지털 노마드',
    };
    return typeMap[type] || type;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <StandardPageLayout
      title="내 비자 관리"
      description="보유하고 있는 비자들을 관리하고 만료일을 추적하세요"
      icon="Shield"
      breadcrumbs={[
        { label: t('nav.dashboard'), href: '/dashboard' },
        { label: '내 비자 관리' },
      ]}
      headerActions={
        <AddVisaModal onVisaAdded={handleVisaAdded} />
      }
    >
      {/* 통계 카드 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            value={stats.overview.totalVisas}
            label="총 비자 수"
            color="blue"
            icon={<BarChart3 className="h-5 w-5" />}
          />
          <StatsCard
            value={stats.overview.activeVisas}
            label="활성 비자"
            color="green"
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
          <StatsCard
            value={stats.overview.expiringVisas}
            label="만료 임박"
            color="orange"
            icon={<AlertTriangle className="h-5 w-5" />}
          />
          <StatsCard
            value={stats.overview.currentStays}
            label="현재 체류중"
            color="purple"
            icon={<Clock className="h-5 w-5" />}
          />
        </div>
      )}

      {/* 긴급 알림 */}
      {stats && stats.expiringVisas.length > 0 && (
        <StandardCard className="mb-6 border-orange-200 bg-orange-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-orange-800 mb-2">만료 예정 비자</h3>
              <div className="space-y-1">
                {stats.expiringVisas.map(visa => {
                  const daysUntilExpiry = Math.ceil(
                    (visa.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <div key={visa.id} className="text-sm text-orange-700">
                      <strong>{visa.countryName}</strong> {getVisaTypeDisplay(visa.visaType)} 비자가{' '}
                      <strong>{daysUntilExpiry}일 후</strong> 만료됩니다.
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </StandardCard>
      )}

      {/* 현재 체류 알림 */}
      {stats && stats.currentStays.length > 0 && (
        <StandardCard className="mb-6 border-blue-200 bg-blue-50">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">현재 체류중</h3>
              <div className="space-y-1">
                {stats.currentStays.map(stay => (
                  <div key={stay.id} className="text-sm text-blue-700">
                    <strong>{stay.userVisa.countryName}</strong>에서 {stay.daysInCountry}일째 체류중
                    {stay.remainingDays !== null && stay.remainingDays > 0 && (
                      <span> (잔여 {stay.remainingDays}일)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </StandardCard>
      )}

      {/* 비자 만료 알림 */}
      {visas.length > 0 && (
        <VisaExpiryAlerts 
          className="mb-6" 
          onVisaClick={(visaId) => {
            // 특정 비자로 스크롤하거나 모달을 열 수 있음
            const visaElement = document.getElementById(`visa-${visaId}`);
            if (visaElement) {
              visaElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              visaElement.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50');
              setTimeout(() => {
                visaElement.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50');
              }, 3000);
            }
          }}
        />
      )}

      {visas.length === 0 ? (
        /* 빈 상태 */
        <EmptyState
          icon="🛂"
          title="비자가 없습니다"
          description="첫 번째 비자를 추가하여 만료일과 사용량을 추적해보세요"
          action={
            <AddVisaModal onVisaAdded={handleVisaAdded}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                첫 비자 추가하기
              </Button>
            </AddVisaModal>
          }
        >
          <StandardCard title="비자 관리란?" className="mt-8">
            <div className="text-left max-w-2xl mx-auto">
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  보유한 비자들의 만료일을 자동으로 추적합니다
                </p>
                <p className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  체류일수와 입출국 기록을 관리할 수 있습니다
                </p>
                <p className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  만료 전 알림을 받아 갱신 시기를 놓치지 않습니다
                </p>
                <p className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  여행 계획 시 비자 상태를 자동으로 확인합니다
                </p>
              </div>
            </div>
          </StandardCard>
        </EmptyState>
      ) : (
        /* 비자 목록 */
        <div className="space-y-6">
          {/* 검색 및 필터 */}
          <StandardCard>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="국가명 또는 비자 유형으로 검색..."
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체 상태</SelectItem>
                      <SelectItem value="active">활성</SelectItem>
                      <SelectItem value="expired">만료</SelectItem>
                      <SelectItem value="cancelled">취소</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={visaTypeFilter} onValueChange={setVisaTypeFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체 유형</SelectItem>
                      <SelectItem value="tourist">관광</SelectItem>
                      <SelectItem value="business">비즈니스</SelectItem>
                      <SelectItem value="student">학생</SelectItem>
                      <SelectItem value="work">취업</SelectItem>
                      <SelectItem value="digital-nomad">디지털 노마드</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>총 {filteredVisas.length}개의 비자</span>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    활성: {filteredVisas.filter(v => v.status === 'active').length}
                  </Badge>
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    만료 임박: {filteredVisas.filter(v => {
                      const days = Math.ceil((v.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      return days <= 30 && days > 0;
                    }).length}
                  </Badge>
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    만료: {filteredVisas.filter(v => v.expiryDate < new Date()).length}
                  </Badge>
                </div>
              </div>
            </div>
          </StandardCard>

          {/* 비자 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVisas.map(visa => (
              <div key={visa.id} id={`visa-${visa.id}`}>
                <UserVisaCard
                  visa={visa}
                  onDelete={handleDeleteVisa}
                  onViewDetails={(visa) => {
                    // TODO: 상세보기 모달 구현
                    logger.debug('View details:', visa);
                  }}
                  onEdit={(visa) => {
                    // TODO: 수정 모달 구현
                    logger.debug('Edit visa:', visa);
                  }}
                />
              </div>
            ))}
          </div>

          {filteredVisas.length === 0 && (
            <StandardCard className="text-center py-12">
              <div className="text-gray-600">
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">검색 결과가 없습니다</h3>
                <p>다른 검색어를 시도해보거나 필터를 조정해보세요.</p>
              </div>
            </StandardCard>
          )}
        </div>
      )}
    </StandardPageLayout>
  );
}