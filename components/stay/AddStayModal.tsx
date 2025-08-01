'use client';

import React, { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader,
  DialogTitle,
  DialogFooter } from '@/components/ui/dialog'
import { logger } from '@/lib/logger'
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
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plane, 
  Calendar, 
  MapPin, 
  Clock, 
  AlertTriangle,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

interface UserVisa {
  id: string;
  countryName: string;
  countryCode: string;
  visaType: string;
  maxStayDays: number | null;
  expiryDate: string;
  status: string;
}

interface AddStayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStayAdded: () => void;
}

const STAY_PURPOSES = [
  { value: 'tourism', label: '관광' },
  { value: 'business', label: '비즈니스' },
  { value: 'work', label: '업무' },
  { value: 'study', label: '학습/연수' },
  { value: 'medical', label: '의료' },
  { value: 'family', label: '가족 방문' },
  { value: 'transit', label: '경유' },
  { value: 'other', label: '기타' },
];

export function AddStayModal({ open, onOpenChange, onStayAdded }: AddStayModalProps) {
  const [visas, setVisas] = useState<UserVisa[]>([]);
  const [selectedVisaId, setSelectedVisaId] = useState('');
  const [entryDate, setEntryDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingVisas, setLoadingVisas] = useState(true);

  // 선택된 비자 정보
  const selectedVisa = visas.find(v => v.id === selectedVisaId);

  // 사용자의 활성 비자 목록 로드
  const loadVisas = async () => {
    setLoadingVisas(true);
    try {
      const response = await fetch('/api/visas?status=active');
      const result = await response.json();

      if (result.success) {
        // 현재 사용 가능한 비자만 필터링 (만료되지 않은 것)
        const activeVisas = result.data.filter((visa: UserVisa) => 
          new Date(visa.expiryDate) > new Date() && 
          visa.status === 'active'
        );
        setVisas(activeVisas);
      } else {
        throw new Error(result.error || 'Failed to load visas');
      }
    } catch (error) {
      logger.error('Error loading visas:', error);
      toast.error('비자 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoadingVisas(false);
    }
  };

  // 입국 기록 생성
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedVisaId) {
      toast.error('비자를 선택해주세요.');
      return;
    }

    if (!entryDate) {
      toast.error('입국일을 입력해주세요.');
      return;
    }

    // 입국일이 미래가 아닌지 확인
    const today = new Date();
    const entryDateObj = new Date(entryDate);
    if (entryDateObj > today) {
      toast.error('입국일은 오늘 이전이어야 합니다.');
      return;
    }

    // 비자 만료일 이후 입국인지 확인
    if (selectedVisa && entryDateObj > new Date(selectedVisa.expiryDate)) {
      toast.error('비자 만료일 이후에는 입국할 수 없습니다.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/stay-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visaId: selectedVisaId,
          entryDate,
          purpose: purpose || undefined,
          notes: notes || undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.data.message);
        onStayAdded();
        onOpenChange(false);
        
        // 폼 초기화
        setSelectedVisaId('');
        setEntryDate(format(new Date(), 'yyyy-MM-dd'));
        setPurpose('');
        setNotes('');
      } else {
        throw new Error(result.error || 'Failed to add stay entry');
      }
    } catch (error) {
      logger.error('Error adding stay entry:', error);
      toast.error(error instanceof Error ? error.message : '입국 기록 추가에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadVisas();
    }
  }, [open]);

  // 예상 체류 정보 계산
  const getStayInfo = () => {
    if (!selectedVisa || !entryDate) return null;

    const entryDateObj = new Date(entryDate);
    const today = new Date();
    const daysInCountry = Math.ceil((today.getTime() - entryDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const remainingDays = selectedVisa.maxStayDays 
      ? selectedVisa.maxStayDays - daysInCountry 
      : null;

    const visaExpiryDate = new Date(selectedVisa.expiryDate);
    const daysUntilVisaExpiry = Math.ceil((visaExpiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return {
      daysInCountry,
      remainingDays,
      daysUntilVisaExpiry,
      maxStayDays: selectedVisa.maxStayDays
    };
  };

  const stayInfo = getStayInfo();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            입국 기록 추가
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 비자 선택 */}
          <div className="space-y-2">
            <Label htmlFor="visa">사용할 비자 선택</Label>
            {loadingVisas ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm text-gray-600">비자 목록을 불러오는 중...</span>
              </div>
            ) : visas.length === 0 ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  사용 가능한 활성 비자가 없습니다. 먼저 비자를 추가해주세요.
                </AlertDescription>
              </Alert>
            ) : (
              <Select value={selectedVisaId} onValueChange={setSelectedVisaId}>
                <SelectTrigger>
                  <SelectValue placeholder="비자를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {visas.map(visa => (
                    <SelectItem key={visa.id} value={visa.id}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{visa.countryName} - {visa.visaType}</span>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {visa.maxStayDays && (
                            <Badge variant="outline" className="text-xs">
                              최대 {visa.maxStayDays}일
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {format(new Date(visa.expiryDate), 'MM/dd', { locale: ko })} 만료
                          </Badge>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* 입국일 */}
          <div className="space-y-2">
            <Label htmlFor="entryDate">입국일</Label>
            <Input
              id="entryDate"
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
              required
            />
          </div>

          {/* 입국 목적 */}
          <div className="space-y-2">
            <Label htmlFor="purpose">입국 목적 (선택사항)</Label>
            <Select value={purpose} onValueChange={setPurpose}>
              <SelectTrigger>
                <SelectValue placeholder="입국 목적을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {STAY_PURPOSES.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 메모 */}
          <div className="space-y-2">
            <Label htmlFor="notes">메모 (선택사항)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="추가 정보나 메모를 입력하세요..."
              rows={3}
            />
          </div>

          {/* 예상 체류 정보 */}
          {stayInfo && selectedVisa && (
            <Alert className="bg-blue-50 border-blue-200">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <div className="space-y-2 text-sm">
                  <div className="font-medium text-blue-800">예상 체류 정보</div>
                  <div className="grid grid-cols-2 gap-2 text-blue-700">
                    <div>
                      <span className="font-medium">현재 체류일:</span> {stayInfo.daysInCountry}일
                    </div>
                    {stayInfo.remainingDays !== null && (
                      <div>
                        <span className="font-medium">잔여 체류일:</span> 
                        <span className={stayInfo.remainingDays <= 7 ? 'text-red-600 font-medium' : ''}>
                          {' '}{stayInfo.remainingDays}일
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="font-medium">비자 만료:</span> 
                      <span className={stayInfo.daysUntilVisaExpiry <= 7 ? 'text-red-600 font-medium' : ''}>
                        {' '}{stayInfo.daysUntilVisaExpiry}일 후
                      </span>
                    </div>
                    {stayInfo.maxStayDays && (
                      <div>
                        <span className="font-medium">최대 체류:</span> {stayInfo.maxStayDays}일
                      </div>
                    )}
                  </div>
                  
                  {stayInfo.remainingDays !== null && stayInfo.remainingDays <= 7 && (
                    <div className="text-red-700 font-medium text-xs mt-2">
                      ⚠️ 체류 기간이 얼마 남지 않았습니다!
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={loading || !selectedVisaId || visas.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  기록 중...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  입국 기록 추가
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}