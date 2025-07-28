'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface FeedbackData {
  type: 'bug' | 'feature' | 'general';
  message: string;
  priority: 'low' | 'medium' | 'high';
  screenshot?: string;
  userAgent: string;
  url: string;
  timestamp: string;
}

export default function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'general'>('general');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 스크린샷 자동 캡처 (선택적)
      let screenshot = '';
      if (typeof window !== 'undefined' && 'html2canvas' in window) {
        // html2canvas가 있다면 스크린샷 캡처
        // 실제로는 html2canvas를 설치해야 함
      }

      const feedbackData: FeedbackData = {
        type: feedbackType,
        message,
        priority,
        screenshot,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });

      if (response.ok) {
        alert('피드백이 성공적으로 전송되었습니다!');
        setMessage('');
        setIsOpen(false);
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      alert('피드백 전송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-primary text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all"
        size="sm"
      >
        💬 피드백
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">피드백 보내기</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">피드백 유형</label>
            <select
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value as typeof feedbackType)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="general">일반 의견</option>
              <option value="bug">버그 신고</option>
              <option value="feature">기능 요청</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">우선순위</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as typeof priority)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="low">낮음</option>
              <option value="medium">보통</option>
              <option value="high">높음</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">메시지</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="피드백을 자세히 설명해주세요..."
              required
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 resize-none"
            />
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="flex-1"
            >
              {isSubmitting ? '전송 중...' : '전송'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}