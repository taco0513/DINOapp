/**
 * DINO v2.0 - Passport Manager Component
 * Manage multiple passports for dual/multi-citizenship
 */

'use client';

import { useState } from 'react';
import { Passport, PASSPORT_RANKINGS, COMMON_DUAL_CITIZENSHIPS } from '@/types/passport';

interface PassportManagerProps {
  passports: Passport[];
  onAddPassport?: (passport: Omit<Passport, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdatePassport?: (passport: Passport) => void;
  onDeletePassport?: (id: string) => void;
}

export function PassportManager({ 
  passports, 
  onAddPassport: _onAddPassport,
  onUpdatePassport: _onUpdatePassport,
  onDeletePassport: _onDeletePassport 
}: PassportManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPassport, setSelectedPassport] = useState<string | null>(null);

  // Get passport power information
  const getPassportPower = (countryCode: string) => {
    return PASSPORT_RANKINGS[countryCode as keyof typeof PASSPORT_RANKINGS] || {
      rank: 999,
      visaFreeCount: 0,
      power: 'Unknown'
    };
  };

  // Calculate days until expiry
  const getDaysUntilExpiry = (expiryDate: Date) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get expiry status
  const getExpiryStatus = (passport: Passport) => {
    const daysUntilExpiry = getDaysUntilExpiry(passport.expiryDate);
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', color: 'bg-red-100 text-red-700', label: '만료됨' };
    } else if (daysUntilExpiry <= 180) {
      return { status: 'expiring_soon', color: 'bg-orange-100 text-orange-700', label: '만료 임박' };
    } else if (daysUntilExpiry <= 365) {
      return { status: 'renewal_due', color: 'bg-yellow-100 text-yellow-700', label: '갱신 권장' };
    } else {
      return { status: 'valid', color: 'bg-green-100 text-green-700', label: '유효' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">여권 관리</h2>
          <p className="text-gray-600 mt-1">
            다중 국적의 경우 최적의 여권을 선택하여 여행하세요
          </p>
        </div>
        
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + 여권 추가
        </button>
      </div>

      {/* Dual Citizenship Quick Setup */}
      {passports.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start space-x-4">
            <span className="text-3xl">🛂</span>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">이중국적자이신가요?</h3>
              <p className="text-sm text-blue-800 mb-4">
                일반적인 이중국적 조합에서 빠르게 설정할 수 있습니다
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {COMMON_DUAL_CITIZENSHIPS.slice(0, 6).map((combo) => (
                  <button
                    key={`${combo.primary}-${combo.secondary}`}
                    className="text-left p-3 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg text-sm transition-colors"
                    onClick={() => {
                      // TODO: Auto-setup dual citizenship
                      console.log('Setup dual citizenship:', combo);
                    }}
                  >
                    <div className="font-medium text-blue-900">{combo.name}</div>
                    <div className="text-xs text-blue-600 mt-1">
                      {getPassportPower(combo.primary).visaFreeCount} + {getPassportPower(combo.secondary).visaFreeCount} 개국
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Passports List */}
      <div className="space-y-4">
        {passports.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <div className="text-4xl mb-4">🛂</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">여권을 추가해주세요</h3>
            <p className="text-gray-600">
              여권 정보를 추가하면 여행지별 최적의 여권을 추천받을 수 있습니다
            </p>
          </div>
        ) : (
          passports.map((passport) => {
            const power = getPassportPower(passport.countryCode);
            const expiryStatus = getExpiryStatus(passport);
            const daysUntilExpiry = getDaysUntilExpiry(passport.expiryDate);
            
            return (
              <div
                key={passport.id}
                className={`bg-white rounded-2xl p-6 shadow-sm border transition-all duration-200 hover:shadow-md ${
                  passport.isPrimary ? 'border-l-4 border-l-blue-500' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Country Flag/Code */}
                    <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-lg font-bold text-gray-600">
                      {passport.countryCode}
                    </div>
                    
                    {/* Passport Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {passport.countryName} 여권
                        </h3>
                        {passport.isPrimary && (
                          <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                            주여권
                          </span>
                        )}
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${expiryStatus.color}`}>
                          {expiryStatus.label}
                        </span>
                      </div>
                      
                      {/* Passport Power */}
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">세계 {power.rank}위</span>
                          <span className="mx-2">•</span>
                          <span>{power.visaFreeCount}개국 무비자</span>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                          power.power === 'Very High' ? 'bg-green-100 text-green-700' :
                          power.power === 'High' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {power.power === 'Very High' ? '최상급' :
                           power.power === 'High' ? '상급' : power.power}
                        </div>
                      </div>
                      
                      {/* Expiry Info */}
                      <div className="text-sm text-gray-600">
                        <span>만료일: {new Date(passport.expiryDate).toLocaleDateString('ko-KR')}</span>
                        <span className="mx-2">•</span>
                        <span>
                          {daysUntilExpiry > 0 ? `${daysUntilExpiry}일 남음` : '만료됨'}
                        </span>
                      </div>
                      
                      {/* Renewal Warning */}
                      {(expiryStatus.status === 'expired' || expiryStatus.status === 'expiring_soon') && (
                        <div className={`mt-3 p-3 rounded-lg ${
                          expiryStatus.status === 'expired' ? 'bg-red-50 border border-red-200' :
                          'bg-orange-50 border border-orange-200'
                        }`}>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">
                              {expiryStatus.status === 'expired' ? '🚫' : '⚠️'}
                            </span>
                            <div className="text-sm">
                              <div className={`font-medium ${
                                expiryStatus.status === 'expired' ? 'text-red-800' : 'text-orange-800'
                              }`}>
                                {expiryStatus.status === 'expired' ? '여권이 만료되었습니다' : '여권 만료가 임박했습니다'}
                              </div>
                              <div className={expiryStatus.status === 'expired' ? 'text-red-600' : 'text-orange-600'}>
                                {expiryStatus.status === 'expired' 
                                  ? '여행 전에 반드시 갱신하세요'
                                  : '대부분의 국가는 입국 시 여권 유효기간이 6개월 이상 남아있어야 합니다'
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setSelectedPassport(selectedPassport === passport.id ? null : passport.id)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {selectedPassport === passport.id ? '▼' : '▶'}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedPassport === passport.id && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Details */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">여권 상세정보</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">여권번호</span>
                            <span className="font-mono">
                              {passport.passportNumber.replace(/(.{2})/g, '$1 ').trim()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">발급일</span>
                            <span>{new Date(passport.issueDate).toLocaleDateString('ko-KR')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">만료일</span>
                            <span>{new Date(passport.expiryDate).toLocaleDateString('ko-KR')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">상태</span>
                            <span className={passport.isActive ? 'text-green-600' : 'text-gray-500'}>
                              {passport.isActive ? '활성' : '비활성'}
                            </span>
                          </div>
                          {passport.notes && (
                            <div className="pt-2 border-t">
                              <span className="text-gray-600 block mb-1">메모</span>
                              <span className="text-gray-900">{passport.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">빠른 작업</h4>
                        <div className="space-y-2">
                          <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors">
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">🌍</span>
                              <div>
                                <div className="font-medium text-sm">무비자 국가 확인</div>
                                <div className="text-xs text-gray-600">{power.visaFreeCount}개국 목록 보기</div>
                              </div>
                            </div>
                          </button>
                          
                          <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors">
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">🎯</span>
                              <div>
                                <div className="font-medium text-sm">여행 최적화</div>
                                <div className="text-xs text-gray-600">이 여권으로 최적 여행 계획</div>
                              </div>
                            </div>
                          </button>
                          
                          {!passport.isPrimary && (
                            <button 
                              onClick={() => {
                                // TODO: Set as primary passport
                                console.log('Set as primary:', passport.id);
                              }}
                              className="w-full text-left p-3 rounded-lg hover:bg-blue-50 border border-blue-200 transition-colors"
                            >
                              <div className="flex items-center space-x-3">
                                <span className="text-lg">⭐</span>
                                <div>
                                  <div className="font-medium text-sm text-blue-900">주여권으로 설정</div>
                                  <div className="text-xs text-blue-600">기본 여권으로 사용</div>
                                </div>
                              </div>
                            </button>
                          )}
                        </div>

                        {/* Edit/Delete Actions */}
                        <div className="mt-4 flex space-x-2">
                          <button 
                            onClick={() => {
                              // TODO: Edit passport
                              console.log('Edit passport:', passport.id);
                            }}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            수정
                          </button>
                          <button 
                            onClick={() => {
                              if (onDeletePassport && confirm('정말로 이 여권을 삭제하시겠습니까?')) {
                                onDeletePassport(passport.id);
                              }
                            }}
                            className="px-3 py-2 border border-red-300 hover:border-red-400 text-red-700 rounded-lg text-sm font-medium transition-colors"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Passport Form (Placeholder) */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">여권 추가</h3>
            <p className="text-gray-600 mb-4">
              여권 추가 기능은 개발 중입니다. 곧 사용할 수 있습니다.
            </p>
            <button
              onClick={() => setShowAddForm(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}