import { useRef, useEffect, useCallback } from 'react';

interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPullToRefresh?: () => void;
  onLongPress?: () => void;
  swipeThreshold?: number;
  pullThreshold?: number;
  longPressDelay?: number;
  enableHapticFeedback?: boolean;
}

interface TouchGestureState {
  isDragging: boolean;
  isPulling: boolean;
  pullDistance: number;
}

export function useTouchGestures(options: TouchGestureOptions = {}) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPullToRefresh,
    onLongPress,
    swipeThreshold = 50,
    pullThreshold = 100,
    longPressDelay = 500,
    enableHapticFeedback = true,
  } = options;

  const elementRef = useRef<HTMLElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(
    null
  );
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gestureStateRef = useRef<TouchGestureState>({
    isDragging: false,
    isPulling: false,
    pullDistance: 0,
  });

  // 햅틱 피드백 함수
  const triggerHapticFeedback = useCallback(
    (type: 'light' | 'medium' | 'heavy' = 'light') => {
      if (!enableHapticFeedback || !('vibrate' in navigator)) return;

      try {
        // iOS Safari에서는 navigator.vibrate가 지원되지 않으므로 조건부 실행
        if (navigator.vibrate) {
          switch (type) {
            case 'light':
              navigator.vibrate(10);
              break;
            case 'medium':
              navigator.vibrate(20);
              break;
            case 'heavy':
              navigator.vibrate(50);
              break;
          }
        }
      } catch (error) {
        // 햅틱 피드백 실패는 무시
      }
    },
    [enableHapticFeedback]
  );

  // 터치 시작 핸들러
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };

      gestureStateRef.current.isDragging = false;
      gestureStateRef.current.isPulling = false;
      gestureStateRef.current.pullDistance = 0;

      // 롱 프레스 타이머 시작
      if (onLongPress) {
        longPressTimerRef.current = setTimeout(() => {
          triggerHapticFeedback('medium');
          onLongPress();
        }, longPressDelay);
      }
    },
    [onLongPress, longPressDelay, triggerHapticFeedback]
  );

  // 터치 이동 핸들러
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // 움직임이 감지되면 롱 프레스 취소
      if (distance > 10 && longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      gestureStateRef.current.isDragging = distance > 10;

      // Pull to refresh 감지
      if (
        onPullToRefresh &&
        deltaY > 0 &&
        !gestureStateRef.current.isDragging
      ) {
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop === 0) {
          gestureStateRef.current.isPulling = true;
          gestureStateRef.current.pullDistance = Math.min(
            deltaY,
            pullThreshold * 1.5
          );

          // 임계점 도달 시 햅틱 피드백
          if (
            deltaY >= pullThreshold &&
            gestureStateRef.current.pullDistance < pullThreshold
          ) {
            triggerHapticFeedback('medium');
          }

          // 스크롤 방지
          e.preventDefault();
        }
      }
    },
    [onPullToRefresh, pullThreshold, triggerHapticFeedback]
  );

  // 터치 종료 핸들러
  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;
      const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / deltaTime;

      // 롱 프레스 타이머 정리
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      // Pull to refresh 처리
      if (
        gestureStateRef.current.isPulling &&
        gestureStateRef.current.pullDistance >= pullThreshold
      ) {
        triggerHapticFeedback('heavy');
        onPullToRefresh?.();
      }

      // 스와이프 제스처 감지
      if (
        Math.abs(deltaX) > swipeThreshold ||
        Math.abs(deltaY) > swipeThreshold
      ) {
        const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);

        if (isHorizontal) {
          if (deltaX > 0 && onSwipeRight) {
            triggerHapticFeedback('light');
            onSwipeRight();
          } else if (deltaX < 0 && onSwipeLeft) {
            triggerHapticFeedback('light');
            onSwipeLeft();
          }
        } else {
          if (deltaY > 0 && onSwipeDown) {
            triggerHapticFeedback('light');
            onSwipeDown();
          } else if (deltaY < 0 && onSwipeUp) {
            triggerHapticFeedback('light');
            onSwipeUp();
          }
        }
      }

      // 상태 초기화
      touchStartRef.current = null;
      gestureStateRef.current.isDragging = false;
      gestureStateRef.current.isPulling = false;
      gestureStateRef.current.pullDistance = 0;
    },
    [
      onSwipeLeft,
      onSwipeRight,
      onSwipeUp,
      onSwipeDown,
      onPullToRefresh,
      swipeThreshold,
      pullThreshold,
      triggerHapticFeedback,
    ]
  );

  // 이벤트 리스너 등록/해제
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const options: AddEventListenerOptions = { passive: false };

    element.addEventListener('touchstart', handleTouchStart, options);
    element.addEventListener('touchmove', handleTouchMove, options);
    element.addEventListener('touchend', handleTouchEnd, options);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);

      // 타이머 정리
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    ref: elementRef,
    gestureState: gestureStateRef.current,
    triggerHapticFeedback,
  };
}

// 스와이프 제스처만 사용하는 간단한 훅
export function useSwipeGestures(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  threshold: number = 50
) {
  return useTouchGestures({
    onSwipeLeft,
    onSwipeRight,
    swipeThreshold: threshold,
  });
}

// Pull to refresh만 사용하는 훅
export function usePullToRefresh(
  onRefresh: () => void,
  threshold: number = 100
) {
  return useTouchGestures({
    onPullToRefresh: onRefresh,
    pullThreshold: threshold,
  });
}

// 롱 프레스만 사용하는 훅
export function useLongPress(onLongPress: () => void, delay: number = 500) {
  return useTouchGestures({
    onLongPress,
    longPressDelay: delay,
  });
}
