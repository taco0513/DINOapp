'use client';

import { useState } from 'react';
import { SwipeableCard } from '@/components/mobile/SwipeableCard';
import { ApiClient } from '@/lib/api-client';
import { getCountryByName } from '@/data/countries';
import type { CountryVisit } from '@/types/global';
import { Edit, Trash2, Calendar, CreditCard } from 'lucide-react';

interface MobileTripCardProps {
  trip: CountryVisit;
  onEdit: (trip: CountryVisit) => void;
  onDelete: () => void;
}

export default function MobileTripCard({
  trip,
  onEdit,
  onDelete,
}: MobileTripCardProps) {
  const [loading, setLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const country = getCountryByName(trip.country);
  const entryDate = new Date(trip.entryDate);
  const exitDate = trip.exitDate ? new Date(trip.exitDate) : null;

  const calculateDays = () => {
    if (exitDate) {
      return (
        Math.ceil(
          (exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1
      );
    } else {
      // Currently staying
      return (
        Math.ceil(
          (new Date().getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1
      );
    }
  };

  const days = calculateDays();
  const isCurrentlyStaying = !exitDate;

  const handleDelete = async () => {
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }

    const confirmed = window.confirm('이 여행 기록을 삭제하시겠습니까?');
    if (!confirmed) return;

    setLoading(true);
    try {
      await ApiClient.deleteTrip(trip.id);
      onDelete();
    } catch (error) {
      console.error('Error deleting trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleSwipeLeft = () => {
    setShowActions(true);
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }
  };

  const handleSwipeRight = () => {
    setShowActions(false);
  };

  return (
    <SwipeableCard
      onSwipeLeft={handleSwipeLeft}
      onSwipeRight={handleSwipeRight}
      threshold={80}
      className='mb-4'
    >
      <div className='card relative overflow-hidden'>
        {/* Main Content */}
        <div className='p-4'>
          {/* Header */}
          <div className='flex items-start justify-between mb-3'>
            <div className='flex-1'>
              <h3 className='text-lg font-semibold flex items-center gap-2'>
                <span className='text-2xl'>{country?.flag || '🌍'}</span>
                <span>{trip.country}</span>
                {country?.isSchengen && (
                  <span className='badge badge-sm'>셰겐</span>
                )}
              </h3>
              <p className='text-sm text-secondary mt-1 flex items-center gap-2'>
                <CreditCard className='h-3 w-3' />
                {trip.visaType}
              </p>
            </div>

            {isCurrentlyStaying && (
              <div className='px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium'>
                체류 중
              </div>
            )}
          </div>

          {/* Date Info */}
          <div className='flex items-center justify-between text-sm'>
            <div className='flex items-center gap-2 text-secondary'>
              <Calendar className='h-4 w-4' />
              <span>{formatDate(entryDate)}</span>
              <span>→</span>
              <span>{exitDate ? formatDate(exitDate) : '현재'}</span>
            </div>

            <div className='text-right'>
              <div className='text-2xl font-bold text-primary'>{days}</div>
              <div className='text-xs text-secondary'>일</div>
            </div>
          </div>

          {/* Notes */}
          {trip.notes && (
            <div className='mt-3 pt-3 border-t text-sm text-secondary'>
              {trip.notes}
            </div>
          )}
        </div>

        {/* Action Buttons - Revealed on swipe */}
        <div
          className={`absolute inset-y-0 right-0 flex items-center gap-2 px-4 bg-gray-100 transition-transform ${
            showActions ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ width: '140px' }}
        >
          <button
            onClick={() => {
              setShowActions(false);
              onEdit(trip);
            }}
            className='flex-1 py-3 bg-blue-500 text-white rounded-lg flex flex-col items-center justify-center'
            disabled={loading}
          >
            <Edit className='h-5 w-5 mb-1' />
            <span className='text-xs'>수정</span>
          </button>
          <button
            onClick={handleDelete}
            className='flex-1 py-3 bg-red-500 text-white rounded-lg flex flex-col items-center justify-center'
            disabled={loading}
          >
            <Trash2 className='h-5 w-5 mb-1' />
            <span className='text-xs'>{loading ? '...' : '삭제'}</span>
          </button>
        </div>

        {/* Swipe Hint */}
        {!showActions && (
          <div className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-400'>
            <span className='text-xs'>←</span>
          </div>
        )}
      </div>
    </SwipeableCard>
  );
}
