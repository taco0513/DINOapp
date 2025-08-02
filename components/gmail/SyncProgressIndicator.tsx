/**
 * DINO v2.0 - Gmail Sync Progress Indicator
 * Real-time progress display component
 */

import React from 'react';

interface SyncProgressIndicatorProps {
  readonly emailsProcessed: number;
  readonly totalEmails: number;
  readonly flightsFound: number;
  readonly currentStep: string;
  readonly estimatedTimeRemaining?: number;
}

export function SyncProgressIndicator({
  emailsProcessed,
  totalEmails,
  flightsFound,
  currentStep,
  estimatedTimeRemaining,
}: SyncProgressIndicatorProps) {
  const progress = totalEmails > 0 ? (emailsProcessed / totalEmails) * 100 : 0;
  
  // Format time remaining
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}초`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}분`;
    const hours = Math.floor(minutes / 60);
    return `${hours}시간 ${minutes % 60}분`;
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-blue-900">🔄 동기화 진행 중...</h4>
        {estimatedTimeRemaining && (
          <span className="text-xs text-blue-700">
            예상 시간: {formatTime(estimatedTimeRemaining)}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-200">
          <div
            style={{ width: `${progress}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500"
          />
        </div>
        <div className="flex justify-between text-xs text-blue-700 mt-1">
          <span>{emailsProcessed} / {totalEmails} 이메일</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Current Step */}
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
        <span className="text-sm text-blue-800">{currentStep}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="bg-white rounded px-2 py-1 text-center">
          <div className="font-medium text-blue-900">📧 {emailsProcessed}</div>
          <div className="text-blue-600">이메일 처리</div>
        </div>
        <div className="bg-white rounded px-2 py-1 text-center">
          <div className="font-medium text-green-900">✈️ {flightsFound}</div>
          <div className="text-green-600">항공편 발견</div>
        </div>
        <div className="bg-white rounded px-2 py-1 text-center">
          <div className="font-medium text-purple-900">⚡ {progress.toFixed(1)}%</div>
          <div className="text-purple-600">완료</div>
        </div>
      </div>

      {/* Animated Processing Dots */}
      <div className="flex items-center justify-center space-x-1">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}