'use client';

import React from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Edit,
  Trash2,
  Eye,
  CreditCard,
  FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getCountryFlag } from '@/lib/visa-utils';

export interface UserVisa {
  id: string;
  countryCode: string;
  countryName: string;
  visaType: string;
  visaNumber?: string;
  issueDate: Date;
  expiryDate: Date;
  entryType: string;
  maxStayDays?: number;
  totalStayDays?: number;
  status: string;
  isAutoRenewal: boolean;
  renewalEligible: boolean;
  renewalDeadline?: Date;
  fee?: string;
  processingTime?: string;
  notes?: string;
  totalUsedDays: number;
  currentStayDays: number;
  lastEntryDate?: Date;
  _count: {
    visaEntries: number;
  };
  visaEntries?: Array<{
    id: string;
    entryDate: Date;
    exitDate?: Date;
    stayDays?: number;
    purpose?: string;
  }>;
}

interface UserVisaCardProps {
  visa: UserVisa;
  onEdit?: (visa: UserVisa) => void;
  onDelete?: (visaId: string) => void;
  onViewDetails?: (visa: UserVisa) => void;
}

export function UserVisaCard({ visa, onEdit, onDelete, onViewDetails }: UserVisaCardProps) {
  const daysUntilExpiry = Math.ceil(
    (visa.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  const isExpired = daysUntilExpiry <= 0;
  const isActive = visa.status === 'active' && !isExpired;

  const getStatusBadge = () => {
    if (isExpired) {
      return <Badge variant="destructive">만료됨</Badge>;
    }
    if (isExpiringSoon) {
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">만료 임박</Badge>;
    }
    if (isActive) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">활성</Badge>;
    }
    return <Badge variant="secondary">{visa.status}</Badge>;
  };

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

  const getRemainingStayDays = () => {
    if (visa.maxStayDays && visa.currentStayDays > 0) {
      return visa.maxStayDays - visa.currentStayDays;
    }
    return null;
  };

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 ${
      isExpired ? 'border-red-200 bg-red-50' : 
      isExpiringSoon ? 'border-orange-200 bg-orange-50' : ''
    }`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getCountryFlag(visa.countryCode)}</span>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {visa.countryName}
                {visa.currentStayDays > 0 && (
                  <Badge variant="outline" className="text-xs">
                    체류중
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-600">
                  {getVisaTypeDisplay(visa.visaType)}
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-600">
                  {visa.entryType === 'multiple' ? '복수입국' : '단수입국'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 비자 기본 정보 */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <div>
              <div className="text-gray-600">발급일</div>
              <div className="font-medium">
                {format(visa.issueDate, 'yyyy.MM.dd', { locale: ko })}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <div>
              <div className="text-gray-600">만료일</div>
              <div className={`font-medium ${
                isExpired ? 'text-red-600' : 
                isExpiringSoon ? 'text-orange-600' : ''
              }`}>
                {format(visa.expiryDate, 'yyyy.MM.dd', { locale: ko })}
                {daysUntilExpiry > 0 && (
                  <span className="text-xs text-gray-500 ml-1">
                    ({daysUntilExpiry}일 후)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 체류 정보 */}
        {(visa.maxStayDays || visa.totalUsedDays > 0) && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            {visa.maxStayDays && (
              <div>
                <div className="text-gray-600">최대 체류</div>
                <div className="font-medium">{visa.maxStayDays}일</div>
              </div>
            )}
            <div>
              <div className="text-gray-600">사용일수</div>
              <div className="font-medium">
                {visa.totalUsedDays}일
                {visa.currentStayDays > 0 && (
                  <span className="text-blue-600 ml-1">
                    (+{visa.currentStayDays}일 체류중)
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 현재 체류중인 경우 남은 일수 표시 */}
        {visa.currentStayDays > 0 && getRemainingStayDays() !== null && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <div className="text-sm">
                <div className="font-medium text-blue-800">
                  현재 {visa.countryName}에 체류중
                </div>
                <div className="text-blue-600">
                  남은 체류 가능 일수: {getRemainingStayDays()}일
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 갱신 정보 */}
        {visa.renewalEligible && visa.renewalDeadline && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <div className="text-sm">
                <div className="font-medium text-yellow-800">갱신 가능</div>
                <div className="text-yellow-600">
                  갱신 마감: {format(visa.renewalDeadline, 'yyyy.MM.dd', { locale: ko })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 추가 정보 */}
        <div className="text-xs text-gray-500 space-y-1">
          {visa.visaNumber && (
            <div className="flex items-center gap-2">
              <CreditCard className="h-3 w-3" />
              <span>비자번호: {visa.visaNumber}</span>
            </div>
          )}
          {visa._count.visaEntries > 0 && (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3 w-3" />
              <span>입국 기록: {visa._count.visaEntries}회</span>
            </div>
          )}
          {visa.fee && (
            <div className="flex items-center gap-2">
              <CreditCard className="h-3 w-3" />
              <span>수수료: {visa.fee}</span>
            </div>
          )}
        </div>

        {/* 메모 */}
        {visa.notes && (
          <div className="text-sm bg-gray-50 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <div className="text-gray-600 font-medium mb-1">메모</div>
                <div className="text-gray-700">{visa.notes}</div>
              </div>
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex gap-2 pt-3 border-t">
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(visa)}
              className="flex items-center gap-1"
            >
              <Eye className="h-3 w-3" />
              상세보기
            </Button>
          )}
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(visa)}
              className="flex items-center gap-1"
            >
              <Edit className="h-3 w-3" />
              수정
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(visa.id)}
              className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3" />
              삭제
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}