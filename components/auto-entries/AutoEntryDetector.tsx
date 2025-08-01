'use client';

import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Mail,
  Plane,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Loader2,
  RefreshCw,
  Save,
  X,
  Eye,
  EyeOff,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/Input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

interface AutoEntry {
  visaId?: string;
  countryCode: string;
  countryName: string;
  entryDate: string;
  exitDate?: string;
  entryType: 'auto_flight' | 'auto_hotel' | 'manual';
  source: {
    type: 'gmail_flight' | 'gmail_hotel' | 'manual';
    emailId?: string;
    flightNumber?: string;
    bookingReference?: string;
  };
  confidence: number;
  status: 'pending' | 'confirmed' | 'rejected';
  notes?: string;
}

interface DetectionResult {
  entries: AutoEntry[];
  total: number;
  dateRange: {
    start: string;
    end: string;
  };
  summary: {
    highConfidence: number;
    mediumConfidence: number;
    lowConfidence: number;
    countries: string[];
  };
}

export function AutoEntryDetector() {
  const { data: session } = useSession();
  const [detecting, setDetecting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [selectedEntries, setSelectedEntries] = useState<Set<number>>(new Set());
  const [showPreview, setShowPreview] = useState(true);
  const [autoConfirm, setAutoConfirm] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: format(new Date(new Date().setMonth(new Date().getMonth() - 6)), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });

  // 사용자의 비자 목록 로드
  const [userVisas, setUserVisas] = useState<Array<{
    id: string;
    countryCode: string;
    countryName: string;
    visaType: string;
  }>>([]);

  useEffect(() => {
    loadUserVisas();
  }, []);

  const loadUserVisas = async () => {
    try {
      const response = await fetch('/api/visas?status=active');
      const result = await response.json();
      if (result.success) {
        setUserVisas(result.data);
      }
    } catch (error) {
      console.error('Error loading visas:', error);
    }
  };

  const detectEntries = async () => {
    if (!session?.accessToken) {
      toast.error('Gmail 연결이 필요합니다.');
      return;
    }

    setDetecting(true);
    setDetectionResult(null);
    setSelectedEntries(new Set());

    try {
      const response = await fetch('/api/auto-entries/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: session.accessToken,
          dateRange,
          autoConfirm: false,
          saveDirectly: false
        }),
      });

      const result = await response.json();

      if (result.success) {
        setDetectionResult(result.data);
        
        // 높은 신뢰도 항목 자동 선택
        if (autoConfirm) {
          const highConfidenceIndices = new Set<number>();
          result.data.entries.forEach((entry: AutoEntry, index: number) => {
            if (entry.confidence >= 0.8 && entry.visaId) {
              highConfidenceIndices.add(index);
            }
          });
          setSelectedEntries(highConfidenceIndices);
        }
        
        toast.success(`${result.data.total}개의 입출국 기록을 감지했습니다.`);
      } else {
        throw new Error(result.error || 'Detection failed');
      }
    } catch (error) {
      console.error('Error detecting entries:', error);
      toast.error('입출국 기록 감지에 실패했습니다.');
    } finally {
      setDetecting(false);
    }
  };

  const saveSelectedEntries = async () => {
    if (!detectionResult || selectedEntries.size === 0) {
      toast.error('저장할 항목을 선택해주세요.');
      return;
    }

    setSaving(true);

    try {
      // 선택된 항목만 필터링
      const entriesToSave = detectionResult.entries.filter((_, index) => 
        selectedEntries.has(index)
      );

      const response = await fetch('/api/auto-entries/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entries: entriesToSave,
          autoConfirm: true
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`${result.data.saved}개의 입출국 기록이 저장되었습니다.`);
        setDetectionResult(null);
        setSelectedEntries(new Set());
      } else {
        throw new Error(result.error || 'Save failed');
      }
    } catch (error) {
      console.error('Error saving entries:', error);
      toast.error('입출국 기록 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const toggleEntrySelection = (index: number) => {
    const newSelected = new Set(selectedEntries);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedEntries(newSelected);
  };

  const selectAll = () => {
    if (detectionResult) {
      const allIndices = new Set<number>();
      detectionResult.entries.forEach((entry, index) => {
        if (entry.visaId) { // 비자가 있는 항목만
          allIndices.add(index);
        }
      });
      setSelectedEntries(allIndices);
    }
  };

  const deselectAll = () => {
    setSelectedEntries(new Set());
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) {
      return <Badge className="bg-green-50 text-green-800 border-green-200">높음</Badge>;
    } else if (confidence >= 0.6) {
      return <Badge className="bg-orange-50 text-orange-800 border-orange-200">보통</Badge>;
    } else {
      return <Badge className="bg-red-50 text-red-800 border-red-200">낮음</Badge>;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'border-green-200 bg-green-50';
    if (confidence >= 0.6) return 'border-orange-200 bg-orange-50';
    return 'border-red-200 bg-red-50';
  };

  return (
    <div className="space-y-6">
      {/* 감지 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Gmail 입출국 기록 자동 감지
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 날짜 범위 */}
            <div className="space-y-2">
              <Label>감지 시작일</Label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                max={dateRange.end}
              />
            </div>
            <div className="space-y-2">
              <Label>감지 종료일</Label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                min={dateRange.start}
                max={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
          </div>

          {/* 옵션 */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="auto-confirm" className="text-sm font-medium">
                  높은 신뢰도 항목 자동 선택
                </Label>
                <p className="text-xs text-gray-500">
                  신뢰도 80% 이상인 항목을 자동으로 선택합니다
                </p>
              </div>
              <Switch
                id="auto-confirm"
                checked={autoConfirm}
                onCheckedChange={setAutoConfirm}
              />
            </div>
          </div>

          {/* 감지 버튼 */}
          <Button
            onClick={detectEntries}
            disabled={detecting}
            className="w-full"
            size="lg"
          >
            {detecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                감지 중...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Gmail에서 입출국 기록 감지하기
              </>
            )}
          </Button>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Gmail에서 항공권 이메일을 분석하여 입출국 기록을 자동으로 감지합니다.
              감지된 기록은 검토 후 선택적으로 저장할 수 있습니다.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* 감지 결과 */}
      {detectionResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5" />
                감지된 입출국 기록
                <Badge variant="outline">
                  {detectionResult.total}개
                </Badge>
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-1" />
                      숨기기
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-1" />
                      보기
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDetectionResult(null)}
                >
                  <X className="h-4 w-4 mr-1" />
                  닫기
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* 요약 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">
                  {detectionResult.summary.highConfidence}
                </div>
                <div className="text-sm text-green-700">높은 신뢰도</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-2xl font-bold text-orange-600">
                  {detectionResult.summary.mediumConfidence}
                </div>
                <div className="text-sm text-orange-700">보통 신뢰도</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-600">
                  {detectionResult.summary.lowConfidence}
                </div>
                <div className="text-sm text-red-700">낮은 신뢰도</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">
                  {detectionResult.summary.countries.length}
                </div>
                <div className="text-sm text-blue-700">방문 국가</div>
              </div>
            </div>

            {/* 선택 컨트롤 */}
            <div className="flex items-center justify-between border-t border-b py-3">
              <div className="text-sm text-gray-600">
                {selectedEntries.size}개 선택됨
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  전체 선택
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAll}>
                  전체 해제
                </Button>
              </div>
            </div>

            {/* 감지된 항목 목록 */}
            {showPreview && (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {detectionResult.entries.map((entry, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedEntries.has(index)
                        ? 'border-blue-500 bg-blue-50'
                        : getConfidenceColor(entry.confidence)
                    }`}
                    onClick={() => toggleEntrySelection(index)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedEntries.has(index)}
                            onChange={() => toggleEntrySelection(index)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-4 w-4"
                            disabled={!entry.visaId}
                          />
                          <h4 className="font-semibold flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {entry.countryName}
                            {getConfidenceBadge(entry.confidence)}
                          </h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-gray-500" />
                            <span className="font-medium">입국:</span>
                            <span>{format(parseISO(entry.entryDate), 'yyyy.MM.dd', { locale: ko })}</span>
                          </div>
                          {entry.exitDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-gray-500" />
                              <span className="font-medium">출국:</span>
                              <span>{format(parseISO(entry.exitDate), 'yyyy.MM.dd', { locale: ko })}</span>
                            </div>
                          )}
                          {entry.source.flightNumber && (
                            <div className="flex items-center gap-2">
                              <Plane className="h-3 w-3 text-gray-500" />
                              <span>{entry.source.flightNumber}</span>
                            </div>
                          )}
                        </div>

                        {/* 비자 정보 */}
                        {entry.visaId ? (
                          <div className="text-sm text-green-600">
                            ✓ 비자 확인됨
                          </div>
                        ) : (
                          <Alert className="py-2">
                            <AlertTriangle className="h-3 w-3" />
                            <AlertDescription className="text-xs">
                              해당 국가의 비자가 없습니다. 먼저 비자를 추가해주세요.
                            </AlertDescription>
                          </Alert>
                        )}

                        {entry.notes && (
                          <p className="text-sm text-gray-600">{entry.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 저장 버튼 */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setDetectionResult(null)}
              >
                취소
              </Button>
              <Button
                onClick={saveSelectedEntries}
                disabled={saving || selectedEntries.size === 0}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    선택한 {selectedEntries.size}개 저장
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}