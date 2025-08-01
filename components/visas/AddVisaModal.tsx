'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/Input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { VISA_DATABASE } from '@/lib/visa-database';
import { getCountryFlag } from '@/lib/visa-utils';

interface AddVisaModalProps {
  onVisaAdded?: (visa: any) => void;
  trigger?: React.ReactNode;
}

interface VisaFormData {
  countryCode: string;
  countryName: string;
  visaType: string;
  visaNumber: string;
  issueDate: string;
  expiryDate: string;
  entryType: string;
  maxStayDays: string;
  totalStayDays: string;
  issuingCountry: string;
  fee: string;
  processingTime: string;
  applicationDate: string;
  notes: string;
  isAutoRenewal: boolean;
  renewalEligible: boolean;
  renewalDeadline: string;
  alertDays: string;
}

const VISA_TYPES = [
  { value: 'tourist', label: '관광' },
  { value: 'business', label: '비즈니스' },
  { value: 'student', label: '학생' },
  { value: 'work', label: '취업' },
  { value: 'transit', label: '경유' },
  { value: 'digital-nomad', label: '디지털 노마드' },
];

const ENTRY_TYPES = [
  { value: 'single', label: '단수입국' },
  { value: 'multiple', label: '복수입국' },
];

const ALERT_DAY_OPTIONS = [
  { value: '1,3,7,14,30,60', label: '기본 (1, 3, 7, 14, 30, 60일 전)' },
  { value: '7,14,30', label: '간소 (7, 14, 30일 전)' },
  { value: '1,7,30', label: '최소 (1, 7, 30일 전)' },
  { value: '1,3,7,14,30,60,90', label: '상세 (1, 3, 7, 14, 30, 60, 90일 전)' },
];

export function AddVisaModal({ onVisaAdded, trigger }: AddVisaModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<VisaFormData>({
    countryCode: '',
    countryName: '',
    visaType: 'tourist',
    visaNumber: '',
    issueDate: '',
    expiryDate: '',
    entryType: 'multiple',
    maxStayDays: '',
    totalStayDays: '',
    issuingCountry: '',
    fee: '',
    processingTime: '',
    applicationDate: '',
    notes: '',
    isAutoRenewal: false,
    renewalEligible: false,
    renewalDeadline: '',
    alertDays: '1,3,7,14,30,60',
  });

  const countries = Object.entries(VISA_DATABASE).map(([code, data]) => ({
    code,
    name: data.name,
    flag: getCountryFlag(code),
  })).sort((a, b) => a.name.localeCompare(b.name));

  const handleCountryChange = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode);
    if (country) {
      setFormData(prev => ({
        ...prev,
        countryCode,
        countryName: country.name,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 필수 필드 검증
      if (!formData.countryCode || !formData.issueDate || !formData.expiryDate) {
        toast.error('필수 필드를 모두 입력해주세요.');
        return;
      }

      // 날짜 검증
      const issueDate = new Date(formData.issueDate);
      const expiryDate = new Date(formData.expiryDate);
      
      if (expiryDate <= issueDate) {
        toast.error('만료일은 발급일보다 늦어야 합니다.');
        return;
      }

      if (expiryDate <= new Date()) {
        toast.error('만료일은 현재 날짜보다 늦어야 합니다.');
        return;
      }

      // API 호출
      const response = await fetch('/api/visas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          maxStayDays: formData.maxStayDays ? parseInt(formData.maxStayDays) : undefined,
          totalStayDays: formData.totalStayDays ? parseInt(formData.totalStayDays) : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create visa');
      }

      toast.success('비자가 성공적으로 추가되었습니다.');
      setOpen(false);
      
      // 폼 초기화
      setFormData({
        countryCode: '',
        countryName: '',
        visaType: 'tourist',
        visaNumber: '',
        issueDate: '',
        expiryDate: '',
        entryType: 'multiple',
        maxStayDays: '',
        totalStayDays: '',
        issuingCountry: '',
        fee: '',
        processingTime: '',
        applicationDate: '',
        notes: '',
        isAutoRenewal: false,
        renewalEligible: false,
        renewalDeadline: '',
        alertDays: '1,3,7,14,30,60',
      });

      if (onVisaAdded) {
        onVisaAdded(result.data);
      }
    } catch (error) {
      console.error('Error creating visa:', error);
      toast.error(error instanceof Error ? error.message : '비자 추가에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            비자 추가
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>새 비자 추가</DialogTitle>
          <DialogDescription>
            보유하고 있는 비자 정보를 추가하여 만료일과 사용량을 추적하세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">기본 정보</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">국가 *</Label>
                <Select
                  value={formData.countryCode}
                  onValueChange={handleCountryChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="국가를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(country => (
                      <SelectItem key={country.code} value={country.code}>
                        <span className="flex items-center gap-2">
                          <span>{country.flag}</span>
                          <span>{country.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visaType">비자 유형 *</Label>
                <Select
                  value={formData.visaType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, visaType: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VISA_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="visaNumber">비자 번호</Label>
                <Input
                  id="visaNumber"
                  value={formData.visaNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, visaNumber: e.target.value }))}
                  placeholder="비자 번호 (선택사항)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="entryType">입국 유형</Label>
                <Select
                  value={formData.entryType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, entryType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ENTRY_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* 날짜 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">날짜 정보</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issueDate">발급일 *</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">만료일 *</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="applicationDate">신청일</Label>
                <Input
                  id="applicationDate"
                  type="date"
                  value={formData.applicationDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, applicationDate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="renewalDeadline">갱신 마감일</Label>
                <Input
                  id="renewalDeadline"
                  type="date"
                  value={formData.renewalDeadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, renewalDeadline: e.target.value }))}
                  disabled={!formData.renewalEligible}
                />
              </div>
            </div>
          </div>

          {/* 체류 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">체류 정보</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxStayDays">최대 체류일수 (각 입국당)</Label>
                <Input
                  id="maxStayDays"
                  type="number"
                  min="1"
                  value={formData.maxStayDays}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxStayDays: e.target.value }))}
                  placeholder="예: 90"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalStayDays">총 체류일수 (비자 전체 기간)</Label>
                <Input
                  id="totalStayDays"
                  type="number"
                  min="1"
                  value={formData.totalStayDays}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalStayDays: e.target.value }))}
                  placeholder="예: 180"
                />
              </div>
            </div>
          </div>

          {/* 추가 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">추가 정보</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fee">비자 수수료</Label>
                <Input
                  id="fee"
                  value={formData.fee}
                  onChange={(e) => setFormData(prev => ({ ...prev, fee: e.target.value }))}
                  placeholder="예: $100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="processingTime">처리 기간</Label>
                <Input
                  id="processingTime"
                  value={formData.processingTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, processingTime: e.target.value }))}
                  placeholder="예: 7-14일"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issuingCountry">발급 국가</Label>
              <Input
                id="issuingCountry"
                value={formData.issuingCountry}
                onChange={(e) => setFormData(prev => ({ ...prev, issuingCountry: e.target.value }))}
                placeholder="비자를 발급받은 국가 (거주국과 다른 경우)"
              />
            </div>
          </div>

          {/* 알림 설정 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">알림 설정</h3>
            
            <div className="space-y-2">
              <Label htmlFor="alertDays">만료 알림</Label>
              <Select
                value={formData.alertDays}
                onValueChange={(value) => setFormData(prev => ({ ...prev, alertDays: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALERT_DAY_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="renewalEligible"
                  checked={formData.renewalEligible}
                  onCheckedChange={(checked) => setFormData(prev => ({ 
                    ...prev, 
                    renewalEligible: checked,
                    renewalDeadline: checked ? prev.renewalDeadline : '',
                  }))}
                />
                <Label htmlFor="renewalEligible">갱신 가능</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isAutoRenewal"
                  checked={formData.isAutoRenewal}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAutoRenewal: checked }))}
                />
                <Label htmlFor="isAutoRenewal">자동 갱신</Label>
              </div>
            </div>
          </div>

          {/* 메모 */}
          <div className="space-y-2">
            <Label htmlFor="notes">메모</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="비자에 대한 추가 메모나 특이사항"
              rows={3}
            />
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              취소
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  추가 중...
                </>
              ) : (
                '비자 추가'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}