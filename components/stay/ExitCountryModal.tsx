'use client';

import React, { useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader,
  DialogTitle,
  DialogFooter } from '@/components/ui/dialog'
import { logger } from '@/lib/logger'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plane, 
  Calendar, 
  Clock, 
  CheckCircle2,
  Loader2,
  MapPin,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

interface ExitCountryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stayId: string;
  countryName: string;
  entryDate: string;
  visaType: string;
  maxStayDays: number | null;
  onExitRecorded: () => void;
}

export function ExitCountryModal({ 
  open, 
  onOpenChange, 
  stayId,
  countryName,
  entryDate,
  visaType,
  maxStayDays,
  onExitRecorded 
}: ExitCountryModalProps) {
  const [exitDate, setExitDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // 체류 정보 계산
  const calculateStayInfo = () => {
    if (!exitDate) return null;

    const entryDateObj = new Date(entryDate);
    const exitDateObj = new Date(exitDate);
    const totalStayDays = differenceInDays(exitDateObj, entryDateObj) + 1;
    
    const exceededDays = maxStayDays ? Math.max(0, totalStayDays - maxStayDays) : 0;
    const remainingAllowedDays = maxStayDays ? Math.max(0, maxStayDays - totalStayDays) : null;

    return {
      totalStayDays,
      exceededDays,
      remainingAllowedDays,
      isExceeded: exceededDays > 0
    };
  };

  const stayInfo = calculateStayInfo();

  // 출국 기록 생성
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!exitDate) {
      toast.error('출국일을 입력해주세요.');
      return;
    }

    // 출국일이 입국일보다 늦은지 확인
    if (new Date(exitDate) < new Date(entryDate)) {
      toast.error('출국일은 입국일보다 늦어야 합니다.');
      return;
    }

    // 출국일이 미래가 아닌지 확인
    if (new Date(exitDate) > new Date()) {
      toast.error('출국일은 오늘 이전이어야 합니다.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/stay-tracking', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visaEntryId: stayId,
          exitDate,
          notes: notes || undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.data.message);
        onExitRecorded();
        onOpenChange(false);
        
        // 폼 초기화
        setExitDate(format(new Date(), 'yyyy-MM-dd'));
        setNotes('');
      } else {
        throw new Error(result.error || 'Failed to record exit');
      }
    } catch (error) {
      logger.error('Error recording exit:', error);
      toast.error(error instanceof Error ? error.message : '출국 기록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            {countryName} 출국 기록
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 현재 체류 정보 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              현재 체류 정보
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-blue-600 font-medium">국가:</span>
                <div className="text-blue-800">{countryName}</div>
              </div>
              <div>
                <span className="text-blue-600 font-medium">비자:</span>
                <div className="text-blue-800">{visaType}</div>
              </div>
              <div>
                <span className="text-blue-600 font-medium">입국일:</span>
                <div className="text-blue-800">
                  {format(new Date(entryDate), 'yyyy.MM.dd (E)', { locale: ko })}
                </div>
              </div>
              <div>
                <span className="text-blue-600 font-medium">현재 체류:</span>
                <div className="text-blue-800">
                  {differenceInDays(new Date(), new Date(entryDate)) + 1}일
                </div>
              </div>
              {maxStayDays && (
                <>
                  <div>
                    <span className="text-blue-600 font-medium">최대 체류:</span>
                    <div className="text-blue-800">{maxStayDays}일</div>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">잔여일수:</span>
                    <div className={
                      maxStayDays - (differenceInDays(new Date(), new Date(entryDate)) + 1) <= 0 
                        ? 'text-red-600 font-medium' 
                        : 'text-blue-800'
                    }>
                      {Math.max(0, maxStayDays - (differenceInDays(new Date(), new Date(entryDate)) + 1))}일
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 출국일 */}
          <div className="space-y-2">
            <Label htmlFor="exitDate">출국일</Label>
            <Input
              id="exitDate"
              type="date"
              value={exitDate}
              onChange={(e) => setExitDate(e.target.value)}
              min={entryDate}
              max={format(new Date(), 'yyyy-MM-dd')}
              required
            />
          </div>

          {/* 메모 */}
          <div className="space-y-2">
            <Label htmlFor="notes">메모 (선택사항)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="출국 관련 메모나 특이사항을 입력하세요..."
              rows={3}
            />
          </div>

          {/* 체류 요약 정보 */}
          {stayInfo && (
            <Alert className={stayInfo.isExceeded ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}>
              <CheckCircle2 className={`h-4 w-4 ${stayInfo.isExceeded ? 'text-red-600' : 'text-green-600'}`} />
              <AlertDescription>
                <div className="space-y-2 text-sm">
                  <div className={`font-medium ${stayInfo.isExceeded ? 'text-red-800' : 'text-green-800'}`}>
                    체류 요약
                  </div>
                  <div className={`grid grid-cols-2 gap-2 ${stayInfo.isExceeded ? 'text-red-700' : 'text-green-700'}`}>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span className="font-medium">총 체류일:</span> {stayInfo.totalStayDays}일
                    </div>
                    {maxStayDays && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span className="font-medium">허용 기간:</span> {maxStayDays}일
                      </div>
                    )}
                    {stayInfo.isExceeded && (
                      <div className="flex items-center gap-1 col-span-2">
                        <TrendingUp className="h-3 w-3" />
                        <span className="font-medium text-red-700">초과 일수:</span> 
                        <Badge variant="destructive" className="text-xs">
                          {stayInfo.exceededDays}일 초과
                        </Badge>
                      </div>
                    )}
                    {!stayInfo.isExceeded && stayInfo.remainingAllowedDays !== null && (
                      <div className="flex items-center gap-1 col-span-2">
                        <CheckCircle2 className="h-3 w-3" />
                        <span className="font-medium">잔여 허용:</span> {stayInfo.remainingAllowedDays}일
                      </div>
                    )}
                  </div>
                  
                  {stayInfo.isExceeded && (
                    <div className="text-red-700 font-medium text-xs mt-2 p-2 bg-red-100 rounded">
                      ⚠️ 허용된 체류 기간을 초과했습니다. 향후 입국에 영향을 줄 수 있습니다.
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
              disabled={loading}
              variant={stayInfo?.isExceeded ? "destructive" : "default"}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  기록 중...
                </>
              ) : (
                <>
                  <Plane className="h-4 w-4 mr-2" />
                  출국 기록 완료
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}