'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  auth: boolean;
  parameters?: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  requestBody?: {
    example: any;
    schema: any;
  };
  responses: {
    status: number;
    description: string;
    example?: any;
  }[];
}

const API_ENDPOINTS: { category: string; endpoints: ApiEndpoint[] }[] = [
  {
    category: '인증 (Authentication)',
    endpoints: [
      {
        method: 'GET',
        path: '/api/auth/session',
        description: '현재 사용자 세션 정보 조회',
        auth: false,
        responses: [
          {
            status: 200,
            description: '세션 정보 반환',
            example: {
              user: {
                id: 'user_123',
                email: 'user@example.com',
                name: 'John Doe',
                image: 'https://...',
              },
              expires: '2024-08-01T00:00:00.000Z',
            },
          },
          {
            status: 401,
            description: '인증되지 않은 사용자',
          },
        ],
      },
    ],
  },
  {
    category: '여행 관리 (Trips)',
    endpoints: [
      {
        method: 'GET',
        path: '/api/trips',
        description: '사용자의 모든 여행 기록 조회',
        auth: true,
        parameters: [
          {
            name: 'limit',
            type: 'number',
            required: false,
            description: '반환할 최대 개수 (기본값: 50)',
          },
          {
            name: 'offset',
            type: 'number',
            required: false,
            description: '건너뛸 개수 (페이지네이션)',
          },
        ],
        responses: [
          {
            status: 200,
            description: '여행 기록 목록',
            example: {
              trips: [
                {
                  id: 'trip_123',
                  country: 'France',
                  entryDate: '2024-01-15T00:00:00.000Z',
                  exitDate: '2024-01-25T00:00:00.000Z',
                  visaType: 'TOURIST',
                  maxDays: 90,
                  notes: 'Paris vacation',
                },
              ],
              total: 1,
              hasMore: false,
            },
          },
        ],
      },
      {
        method: 'POST',
        path: '/api/trips',
        description: '새로운 여행 기록 생성',
        auth: true,
        requestBody: {
          schema: {
            country: 'string (required)',
            entryDate: 'string (ISO date, required)',
            exitDate: 'string (ISO date, optional)',
            visaType: 'string (required)',
            maxDays: 'number (required)',
            notes: 'string (optional)',
          },
          example: {
            country: 'Germany',
            entryDate: '2024-02-01T00:00:00.000Z',
            exitDate: '2024-02-15T00:00:00.000Z',
            visaType: 'TOURIST',
            maxDays: 90,
            notes: 'Business trip to Berlin',
          },
        },
        responses: [
          {
            status: 201,
            description: '여행 기록 생성 성공',
            example: {
              id: 'trip_456',
              country: 'Germany',
              entryDate: '2024-02-01T00:00:00.000Z',
              exitDate: '2024-02-15T00:00:00.000Z',
              visaType: 'TOURIST',
              maxDays: 90,
              notes: 'Business trip to Berlin',
              createdAt: '2024-01-30T12:00:00.000Z',
            },
          },
          {
            status: 400,
            description: '잘못된 요청 데이터',
          },
        ],
      },
    ],
  },
  {
    category: '셰겐 계산 (Schengen)',
    endpoints: [
      {
        method: 'GET',
        path: '/api/schengen/calculate',
        description: '사용자의 셰겐 체류 현황 계산',
        auth: true,
        parameters: [
          {
            name: 'date',
            type: 'string',
            required: false,
            description: '계산 기준 날짜 (ISO 형식, 기본값: 오늘)',
          },
        ],
        responses: [
          {
            status: 200,
            description: '셰겐 계산 결과',
            example: {
              currentStays: 45,
              maxDays: 90,
              remainingDays: 45,
              nextEligibleDate: '2024-05-01T00:00:00.000Z',
              violations: [],
              trips: [
                {
                  country: 'France',
                  entryDate: '2024-01-15T00:00:00.000Z',
                  exitDate: '2024-01-25T00:00:00.000Z',
                  days: 10,
                },
              ],
            },
          },
        ],
      },
    ],
  },
  {
    category: 'Gmail 통합 (Gmail Integration)',
    endpoints: [
      {
        method: 'GET',
        path: '/api/gmail/sync',
        description: 'Gmail에서 여행 관련 이메일 동기화',
        auth: true,
        responses: [
          {
            status: 200,
            description: '동기화 성공',
            example: {
              success: true,
              processed: 15,
              found: 3,
              message: '3개의 여행 관련 이메일을 찾았습니다.',
            },
          },
        ],
      },
    ],
  },
];

export default function ApiDocumentation() {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedEndpoint, setSelectedEndpoint] = useState(0);

  const _currentEndpoint =
    API_ENDPOINTS[selectedCategory]?.endpoints[selectedEndpoint];

  const _getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-green-100 text-green-800';
      case 'POST':
        return 'bg-blue-100 text-blue-800';
      case 'PATCH':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const _copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // TODO: Toast 알림 추가
  };

  return (
    <div className='max-w-7xl mx-auto p-6'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>DINO API 문서</h1>
        <p className='text-gray-600'>
          DINO 여행 관리 플랫폼의 REST API 사용법을 확인하세요.
        </p>
      </div>

      {/* Base URL 및 인증 정보 */}
      <Card className='p-6 mb-8'>
        <h2 className='text-xl font-semibold mb-4'>기본 정보</h2>
        <div className='space-y-4'>
          <div>
            <h3 className='font-medium mb-2'>Base URL</h3>
            <div className='bg-gray-100 p-3 rounded-md font-mono'>
              https://dinoapp.vercel.app
            </div>
          </div>
          <div>
            <h3 className='font-medium mb-2'>인증</h3>
            <p className='text-sm text-gray-600 mb-2'>
              인증이 필요한 엔드포인트는 유효한 JWT 세션이 필요합니다.
              NextAuth.js를 통해 Google OAuth로 로그인하세요.
            </p>
            <div className='bg-gray-100 p-3 rounded-md font-mono text-sm'>
              Cookie: next-auth.session-token=YOUR_SESSION_TOKEN
            </div>
          </div>
          <div>
            <h3 className='font-medium mb-2'>Rate Limiting</h3>
            <p className='text-sm text-gray-600'>
              API 요청은 분당 100회로 제한됩니다. 제한을 초과하면 429 상태
              코드를 반환합니다.
            </p>
          </div>
        </div>
      </Card>

      <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
        {/* 사이드바 - 카테고리 및 엔드포인트 목록 */}
        <div className='lg:col-span-1'>
          <Card className='p-4'>
            <h3 className='font-semibold mb-3'>API 엔드포인트</h3>
            <div className='space-y-2'>
              {API_ENDPOINTS.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <button
                    onClick={() => {
                      setSelectedCategory(categoryIndex);
                      setSelectedEndpoint(0);
                    }}
                    className={`w-full text-left p-2 rounded text-sm font-medium ${
                      selectedCategory === categoryIndex
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {category.category}
                  </button>
                  {selectedCategory === categoryIndex && (
                    <div className='ml-2 mt-2 space-y-1'>
                      {category.endpoints.map((endpoint, endpointIndex) => (
                        <button
                          key={endpointIndex}
                          onClick={() => setSelectedEndpoint(endpointIndex)}
                          className={`w-full text-left p-2 rounded text-xs flex items-center space-x-2 ${
                            selectedEndpoint === endpointIndex
                              ? 'bg-blue-50 border-l-2 border-blue-500'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <Badge
                            className={`text-xs ${getMethodColor(endpoint.method)}`}
                          >
                            {endpoint.method}
                          </Badge>
                          <span className='font-mono'>{endpoint.path}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* 메인 콘텐츠 - 선택된 엔드포인트 상세 정보 */}
        <div className='lg:col-span-3'>
          {currentEndpoint && (
            <Card className='p-6'>
              {/* 엔드포인트 헤더 */}
              <div className='mb-6'>
                <div className='flex items-center space-x-3 mb-2'>
                  <Badge className={getMethodColor(currentEndpoint.method)}>
                    {currentEndpoint.method}
                  </Badge>
                  <code className='font-mono text-lg'>
                    {currentEndpoint.path}
                  </code>
                  {currentEndpoint.auth && (
                    <Badge variant='outline'>🔒 인증 필요</Badge>
                  )}
                </div>
                <p className='text-gray-600'>{currentEndpoint.description}</p>
              </div>

              {/* 파라미터 */}
              {currentEndpoint.parameters && (
                <div className='mb-6'>
                  <h3 className='font-semibold mb-3'>Parameters</h3>
                  <div className='overflow-x-auto'>
                    <table className='w-full text-sm'>
                      <thead>
                        <tr className='border-b'>
                          <th className='text-left p-2'>이름</th>
                          <th className='text-left p-2'>타입</th>
                          <th className='text-left p-2'>필수</th>
                          <th className='text-left p-2'>설명</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentEndpoint.parameters.map((param, index) => (
                          <tr key={index} className='border-b'>
                            <td className='p-2 font-mono'>{param.name}</td>
                            <td className='p-2'>
                              <Badge variant='outline'>{param.type}</Badge>
                            </td>
                            <td className='p-2'>
                              {param.required ? (
                                <Badge className='bg-red-100 text-red-800'>
                                  필수
                                </Badge>
                              ) : (
                                <Badge variant='outline'>선택</Badge>
                              )}
                            </td>
                            <td className='p-2 text-gray-600'>
                              {param.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 요청 본문 */}
              {currentEndpoint.requestBody && (
                <div className='mb-6'>
                  <h3 className='font-semibold mb-3'>Request Body</h3>
                  <div className='space-y-3'>
                    <div>
                      <h4 className='text-sm font-medium mb-2'>Schema</h4>
                      <div className='bg-gray-100 p-3 rounded-md'>
                        <pre className='text-xs'>
                          {JSON.stringify(
                            currentEndpoint.requestBody.schema,
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    </div>
                    <div>
                      <h4 className='text-sm font-medium mb-2'>Example</h4>
                      <div className='bg-gray-100 p-3 rounded-md relative'>
                        <Button
                          size='sm'
                          variant='outline'
                          className='absolute top-2 right-2 text-xs'
                          onClick={() =>
                            copyToClipboard(
                              JSON.stringify(
                                currentEndpoint.requestBody?.example,
                                null,
                                2
                              )
                            )
                          }
                        >
                          복사
                        </Button>
                        <pre className='text-xs'>
                          {JSON.stringify(
                            currentEndpoint.requestBody.example,
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 응답 */}
              <div>
                <h3 className='font-semibold mb-3'>Responses</h3>
                <div className='space-y-4'>
                  {currentEndpoint.responses.map((response, index) => (
                    <div key={index} className='border rounded-md p-4'>
                      <div className='flex items-center space-x-2 mb-2'>
                        <Badge
                          className={
                            response.status < 300
                              ? 'bg-green-100 text-green-800'
                              : response.status < 400
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }
                        >
                          {response.status}
                        </Badge>
                        <span className='text-sm'>{response.description}</span>
                      </div>
                      {response.example && (
                        <div>
                          <h5 className='text-sm font-medium mb-2'>
                            Example Response
                          </h5>
                          <div className='bg-gray-100 p-3 rounded-md relative'>
                            <Button
                              size='sm'
                              variant='outline'
                              className='absolute top-2 right-2 text-xs'
                              onClick={() =>
                                copyToClipboard(
                                  JSON.stringify(response.example, null, 2)
                                )
                              }
                            >
                              복사
                            </Button>
                            <pre className='text-xs'>
                              {JSON.stringify(response.example, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
