'use client';

import { useState, useEffect } from 'react';
import { ApiClient, TripFormData } from '@/lib/api-client';
import { COUNTRIES, VISA_TYPES, PASSPORT_COUNTRIES } from '@/data/countries';
import type { CountryVisit } from '@/types/global';
import {
  Calendar,
  MapPin,
  Shield,
  FileText,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface TripFormProps {
  trip?: CountryVisit;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function TripForm({ trip, onSuccess, onCancel }: TripFormProps) {
  const [formData, setFormData] = useState<TripFormData>({
    country: trip?.country || '',
    entryDate: trip?.entryDate ? trip.entryDate.split('T')[0] : '',
    exitDate: trip?.exitDate ? trip.exitDate.split('T')[0] : '',
    visaType: trip?.visaType || 'Tourist',
    maxDays: trip?.maxDays || 90,
    passportCountry: trip?.passportCountry || 'OTHER',
    notes: trip?.notes || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [stayDuration, setStayDuration] = useState<number | null>(null);

  // 체류 일수 자동 계산
  useEffect(() => {
    if (formData.entryDate && formData.exitDate) {
      const entry = new Date(formData.entryDate);
      const exit = new Date(formData.exitDate);
      const days =
        Math.ceil((exit.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24)) +
        1;
      setStayDuration(days > 0 ? days : null);
    } else {
      setStayDuration(null);
    }
  }, [formData.entryDate, formData.exitDate]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      let response;
      if (trip) {
        response = await ApiClient.updateTrip(trip.id, formData);
      } else {
        response = await ApiClient.createTrip(formData);
      }

      if (response.success) {
        onSuccess();
      } else {
        setError(response.error || 'An error occurred while saving');
      }
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof TripFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          maxWidth: '720px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '0',
        }}
      >
        {/* 헤더 섹션 */}
        <div
          style={{
            background:
              'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
            color: 'white',
            padding: '24px',
            borderRadius: '12px 12px 0 0',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  margin: 0,
                  marginBottom: '8px',
                }}
              >
                {trip ? '여행 기록 수정' : '새로운 여행을 기록해보세요'}
              </h2>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
                {trip
                  ? '날짜나 비자 정보를 업데이트할 수 있습니다'
                  : '간단한 정보만 입력하면 자동으로 분석됩니다'}
              </p>
            </div>
            <button
              onClick={onCancel}
              aria-label='모달 닫기'
              style={{
                minHeight: '44px',
                minWidth: '44px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '16px',
                color: 'white',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={e =>
                (e.currentTarget.style.backgroundColor =
                  'rgba(255,255,255,0.3)')
              }
              onMouseOut={e =>
                (e.currentTarget.style.backgroundColor =
                  'rgba(255,255,255,0.2)')
              }
            >
              ✕
            </button>
          </div>

          {/* 도움말 토글 */}
          <button
            onClick={() => setShowHelp(!showHelp)}
            aria-label={showHelp ? '도움말 숨기기' : '도움말 보기'}
            aria-expanded={showHelp}
            style={{
              position: 'absolute',
              bottom: '-20px',
              right: '24px',
              minHeight: '44px',
              backgroundColor: 'white',
              border: '1px solid var(--color-border)',
              borderRadius: '20px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <HelpCircle style={{ height: '16px', width: '16px' }} />
            도움말
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {/* 도움말 섹션 */}
          {showHelp && (
            <div
              style={{
                marginBottom: '24px',
                padding: '16px',
                backgroundColor: 'var(--color-primary-light)',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            >
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
                💡 빠른 팁
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
                <li>셰겐 국가는 180일 중 90일 규칙이 자동으로 계산됩니다</li>
                <li>현재 체류 중이면 출국 날짜를 비워두세요</li>
                <li>비자 유형에 따라 체류 가능 일수가 다르게 적용됩니다</li>
              </ul>
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div
              style={{
                marginBottom: '20px',
                padding: '16px',
                backgroundColor: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid var(--color-error)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <AlertCircle
                style={{
                  height: '20px',
                  width: '20px',
                  color: 'var(--color-error)',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              />
              <div style={{ color: 'var(--color-error)' }}>{error}</div>
            </div>
          )}

          {/* 폼 내용 */}
          <div style={{ marginBottom: '32px' }}>
            {/* 1단계: 어디로 */}
            <div
              style={{
                marginBottom: '24px',
                padding: '20px',
                backgroundColor: 'var(--color-surface)',
                borderRadius: '12px',
                border: '2px solid var(--color-border)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: 'var(--color-primary)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}
                >
                  1
                </div>
                <h3 style={{ margin: 0, fontSize: '18px' }}>
                  어디로 가셨나요?
                </h3>
              </div>

              <div style={{ paddingLeft: '44px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '8px',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  <MapPin style={{ height: '16px', width: '16px' }} />
                  방문 국가
                </label>
                <select
                  value={formData.country}
                  onChange={e => handleChange('country', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    padding: '12px',
                    border: '2px solid var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '16px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s',
                    touchAction: 'manipulation',
                  }}
                  onFocus={e =>
                    (e.currentTarget.style.borderColor = 'var(--color-primary)')
                  }
                  onBlur={e =>
                    (e.currentTarget.style.borderColor = 'var(--color-border)')
                  }
                >
                  <option value=''>국가를 선택하세요</option>
                  {COUNTRIES.map(country => (
                    <option key={country.code} value={country.name}>
                      {country.flag} {country.name}{' '}
                      {country.isSchengen ? '🇪🇺' : ''}
                    </option>
                  ))}
                </select>
                {formData.country &&
                  COUNTRIES.find(c => c.name === formData.country)
                    ?.isSchengen && (
                    <div
                      style={{
                        marginTop: '8px',
                        padding: '8px 12px',
                        backgroundColor: 'var(--color-primary-light)',
                        borderRadius: '6px',
                        fontSize: '13px',
                        color: 'var(--color-primary-dark)',
                      }}
                    >
                      ✨ 셰겐 지역입니다. 90/180일 규칙이 자동 적용됩니다.
                    </div>
                  )}
              </div>
            </div>

            {/* 2단계: 언제 */}
            <div
              style={{
                marginBottom: '24px',
                padding: '20px',
                backgroundColor: 'var(--color-surface)',
                borderRadius: '12px',
                border: '2px solid var(--color-border)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: 'var(--color-primary)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}
                >
                  2
                </div>
                <h3 style={{ margin: 0, fontSize: '18px' }}>언제 가셨나요?</h3>
              </div>

              <div style={{ paddingLeft: '44px' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        marginBottom: '8px',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      <Calendar style={{ height: '16px', width: '16px' }} />
                      입국 날짜
                    </label>
                    <input
                      type='date'
                      value={formData.entryDate}
                      onChange={e => handleChange('entryDate', e.target.value)}
                      required
                      style={{
                        width: '100%',
                        minHeight: '44px',
                        padding: '12px',
                        border: '2px solid var(--color-border)',
                        borderRadius: '8px',
                        fontSize: '16px',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s',
                        touchAction: 'manipulation',
                      }}
                      onFocus={e =>
                        (e.currentTarget.style.borderColor =
                          'var(--color-primary)')
                      }
                      onBlur={e =>
                        (e.currentTarget.style.borderColor =
                          'var(--color-border)')
                      }
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        marginBottom: '8px',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      <Calendar style={{ height: '16px', width: '16px' }} />
                      출국 날짜
                    </label>
                    <input
                      type='date'
                      value={formData.exitDate || ''}
                      onChange={e =>
                        handleChange('exitDate', e.target.value || null)
                      }
                      placeholder='체류 중이면 비워두세요'
                      style={{
                        width: '100%',
                        minHeight: '44px',
                        padding: '12px',
                        border: '2px solid var(--color-border)',
                        borderRadius: '8px',
                        fontSize: '16px',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s',
                        touchAction: 'manipulation',
                      }}
                      onFocus={e =>
                        (e.currentTarget.style.borderColor =
                          'var(--color-primary)')
                      }
                      onBlur={e =>
                        (e.currentTarget.style.borderColor =
                          'var(--color-border)')
                      }
                    />
                    <p
                      style={{
                        marginTop: '4px',
                        fontSize: '12px',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      현재 체류 중이면 비워두세요
                    </p>
                  </div>
                </div>

                {/* 체류 일수 표시 */}
                {stayDuration && (
                  <div
                    style={{
                      marginTop: '16px',
                      padding: '12px',
                      backgroundColor: 'var(--color-primary-light)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>📅</span>
                    <div>
                      <strong
                        style={{
                          fontSize: '16px',
                          color: 'var(--color-primary-dark)',
                        }}
                      >
                        체류 일수: {stayDuration}일
                      </strong>
                      {stayDuration > 90 && (
                        <p
                          style={{
                            margin: '4px 0 0 0',
                            fontSize: '12px',
                            color: 'var(--color-warning)',
                          }}
                        >
                          ⚠️ 90일을 초과하는 장기 체류입니다
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3단계: 비자 정보 */}
            <div
              style={{
                marginBottom: '24px',
                padding: '20px',
                backgroundColor: 'var(--color-surface)',
                borderRadius: '12px',
                border: '2px solid var(--color-border)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: 'var(--color-primary)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}
                >
                  3
                </div>
                <h3 style={{ margin: 0, fontSize: '18px' }}>
                  비자 정보를 입력해주세요
                </h3>
              </div>

              <div style={{ paddingLeft: '44px' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    marginBottom: '16px',
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        marginBottom: '8px',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      <Shield style={{ height: '16px', width: '16px' }} />
                      비자 유형
                    </label>
                    <select
                      value={formData.visaType}
                      onChange={e => handleChange('visaType', e.target.value)}
                      required
                      style={{
                        width: '100%',
                        minHeight: '44px',
                        padding: '12px',
                        border: '2px solid var(--color-border)',
                        borderRadius: '8px',
                        fontSize: '16px',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s',
                        touchAction: 'manipulation',
                      }}
                      onFocus={e =>
                        (e.currentTarget.style.borderColor =
                          'var(--color-primary)')
                      }
                      onBlur={e =>
                        (e.currentTarget.style.borderColor =
                          'var(--color-border)')
                      }
                    >
                      {VISA_TYPES.map(type => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        marginBottom: '8px',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      <FileText style={{ height: '16px', width: '16px' }} />
                      최대 체류 일수
                    </label>
                    <input
                      type='number'
                      min='1'
                      max='365'
                      value={formData.maxDays}
                      onChange={e =>
                        handleChange('maxDays', parseInt(e.target.value))
                      }
                      required
                      style={{
                        width: '100%',
                        minHeight: '44px',
                        padding: '12px',
                        border: '2px solid var(--color-border)',
                        borderRadius: '8px',
                        fontSize: '16px',
                        backgroundColor: 'white',
                        transition: 'border-color 0.2s',
                        touchAction: 'manipulation',
                      }}
                      onFocus={e =>
                        (e.currentTarget.style.borderColor =
                          'var(--color-primary)')
                      }
                      onBlur={e =>
                        (e.currentTarget.style.borderColor =
                          'var(--color-border)')
                      }
                    />
                  </div>
                </div>

                {/* 여권 국가 */}
                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      marginBottom: '8px',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    <Shield style={{ height: '16px', width: '16px' }} />
                    여권 국가
                  </label>
                  <select
                    value={formData.passportCountry}
                    onChange={e =>
                      handleChange('passportCountry', e.target.value)
                    }
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid var(--color-border)',
                      borderRadius: '8px',
                      fontSize: '16px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e =>
                      (e.currentTarget.style.borderColor =
                        'var(--color-primary)')
                    }
                    onBlur={e =>
                      (e.currentTarget.style.borderColor =
                        'var(--color-border)')
                    }
                  >
                    {PASSPORT_COUNTRIES.map(country => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 비자 정보 도움말 */}
                <div
                  style={{
                    padding: '12px',
                    backgroundColor: 'var(--color-info-light)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: 'var(--color-info-dark)',
                  }}
                >
                  💡 <strong>팁:</strong> 무비자 입국은 Tourist를 선택하세요.
                  셰겐 지역은 90일이 기본값입니다.
                </div>
              </div>
            </div>

            {/* 메모 섹션 */}
            <div
              style={{
                marginBottom: '32px',
                padding: '20px',
                backgroundColor: 'var(--color-surface)',
                borderRadius: '12px',
                border: '1px solid var(--color-border)',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '8px',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <FileText style={{ height: '16px', width: '16px' }} />
                메모 (선택사항)
              </label>
              <textarea
                value={formData.notes}
                onChange={e => handleChange('notes', e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  minHeight: '44px',
                  padding: '12px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'none',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.2s',
                  touchAction: 'manipulation',
                }}
                placeholder='추가 정보나 메모를 입력하세요...'
                onFocus={e =>
                  (e.currentTarget.style.borderColor = 'var(--color-primary)')
                }
                onBlur={e =>
                  (e.currentTarget.style.borderColor = 'var(--color-border)')
                }
              />
            </div>
          </div>

          {/* Actions */}
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              margin: '-24px',
              marginTop: '8px',
              padding: '24px',
              borderTop: '2px solid var(--color-border)',
              borderRadius: '0 0 12px 12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
              }}
            >
              <button
                type='button'
                onClick={handleSubmit}
                disabled={loading}
                aria-label={trip ? '여행 기록 수정 완료' : '새 여행 기록 추가'}
                style={{
                  flex: 1,
                  minHeight: '44px',
                  backgroundColor: loading
                    ? 'var(--color-border-strong)'
                    : 'var(--color-primary)',
                  color: 'white',
                  padding: '14px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  boxShadow: loading
                    ? 'none'
                    : '0 2px 8px rgba(var(--color-primary-rgb), 0.3)',
                }}
                onMouseOver={e => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow =
                      '0 4px 12px rgba(var(--color-primary-rgb), 0.4)';
                  }
                }}
                onMouseOut={e => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow =
                      '0 2px 8px rgba(var(--color-primary-rgb), 0.3)';
                  }
                }}
              >
                {loading ? (
                  <>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '16px',
                        height: '16px',
                        border: '2px solid #fff',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                      }}
                    />
                    저장 중...
                  </>
                ) : (
                  <>
                    {trip ? '수정 완료' : '추가하기'}
                    <span style={{ fontSize: '18px' }}>✓</span>
                  </>
                )}
              </button>
              <button
                type='button'
                onClick={onCancel}
                aria-label='여행 기록 작성 취소'
                style={{
                  minHeight: '44px',
                  padding: '14px 24px',
                  backgroundColor: 'white',
                  color: 'var(--color-text-secondary)',
                  border: '2px solid var(--color-border)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.borderColor =
                    'var(--color-border-strong)';
                  e.currentTarget.style.backgroundColor =
                    'var(--color-surface)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                취소
              </button>
            </div>

            {/* 저장 안내 메시지 */}
            <p
              style={{
                marginTop: '12px',
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                textAlign: 'center',
              }}
            >
              💾 저장하면 자동으로 셰겐 규정과 비자 상태가 계산됩니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
