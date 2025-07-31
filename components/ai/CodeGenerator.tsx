'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Code,
  Sparkles,
  Copy,
  Download,
  Check,
  Loader2,
  FileCode,
  Database,
  Layout,
  Server,
  TestTube,
  GitBranch,
} from 'lucide-react';

interface GeneratedCode {
  id: string;
  type: 'component' | 'api' | 'database' | 'test' | 'config';
  name: string;
  description: string;
  code: string;
  language: string;
  framework?: string;
  dependencies?: string[];
  testCode?: string;
  documentation?: string;
}

export default function CodeGenerator() {
  const [prompt, setPrompt] = useState('');
  const [codeType, setCodeType] = useState<GeneratedCode['type']>('component');
  const [framework, setFramework] = useState('react');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(
    null
  );
  const [copied, setCopied] = useState(false);

  const _handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          type: codeType,
          framework,
          includeTests: true,
          includeDocs: true,
        }),
      });

      const data = await response.json();
      setGeneratedCode(data.code);
    } catch (error) {
      console.error('Code generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const _copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const _downloadCode = (code: string, filename: string) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const _getTypeIcon = (type: GeneratedCode['type']) => {
    switch (type) {
      case 'component':
        return <Layout className='h-4 w-4' />;
      case 'api':
        return <Server className='h-4 w-4' />;
      case 'database':
        return <Database className='h-4 w-4' />;
      case 'test':
        return <TestTube className='h-4 w-4' />;
      case 'config':
        return <FileCode className='h-4 w-4' />;
    }
  };

  return (
    <div className='w-full max-w-6xl mx-auto space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Sparkles className='h-5 w-5 text-yellow-500' />
            지능형 코드 생성
          </CardTitle>
          <p className='text-sm text-muted-foreground'>
            자연어로 요구사항을 설명하면 즉시 프로덕션 준비 코드를 생성
          </p>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* 코드 타입 및 프레임워크 선택 */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='text-sm font-medium mb-2 block'>
                코드 타입
              </label>
              <Select
                value={codeType}
                onValueChange={v => setCodeType(v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='component'>
                    <div className='flex items-center gap-2'>
                      <Layout className='h-4 w-4' />
                      UI 컴포넌트
                    </div>
                  </SelectItem>
                  <SelectItem value='api'>
                    <div className='flex items-center gap-2'>
                      <Server className='h-4 w-4' />
                      API 엔드포인트
                    </div>
                  </SelectItem>
                  <SelectItem value='database'>
                    <div className='flex items-center gap-2'>
                      <Database className='h-4 w-4' />
                      데이터베이스 스키마
                    </div>
                  </SelectItem>
                  <SelectItem value='test'>
                    <div className='flex items-center gap-2'>
                      <TestTube className='h-4 w-4' />
                      테스트 코드
                    </div>
                  </SelectItem>
                  <SelectItem value='config'>
                    <div className='flex items-center gap-2'>
                      <FileCode className='h-4 w-4' />
                      설정 파일
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className='text-sm font-medium mb-2 block'>
                프레임워크
              </label>
              <Select value={framework} onValueChange={setFramework}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='react'>React</SelectItem>
                  <SelectItem value='vue'>Vue.js</SelectItem>
                  <SelectItem value='angular'>Angular</SelectItem>
                  <SelectItem value='nextjs'>Next.js</SelectItem>
                  <SelectItem value='express'>Express</SelectItem>
                  <SelectItem value='nestjs'>NestJS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 프롬프트 입력 */}
          <div>
            <label className='text-sm font-medium mb-2 block'>
              무엇을 만들고 싶으신가요?
            </label>
            <Textarea
              placeholder={
                codeType === 'component'
                  ? "예: '사용자 프로필 카드 컴포넌트 - 아바타, 이름, 이메일, 팔로워/팔로잉 수 표시'"
                  : codeType === 'api'
                    ? "예: 'RESTful API - 사용자 CRUD 엔드포인트, JWT 인증, 페이지네이션 포함'"
                    : codeType === 'database'
                      ? "예: 'Prisma 스키마 - User, Post, Comment 모델 관계 설정'"
                      : codeType === 'test'
                        ? "예: '로그인 기능 E2E 테스트 - 성공/실패 케이스 포함'"
                        : "예: 'ESLint + Prettier 설정 - Airbnb 스타일 가이드 기반'"
              }
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={4}
            />
          </div>

          {/* 코드 품질 옵션 */}
          <div className='flex items-center gap-4 text-sm'>
            <label className='flex items-center gap-2'>
              <input type='checkbox' defaultChecked className='rounded' />
              테스트 코드 포함
            </label>
            <label className='flex items-center gap-2'>
              <input type='checkbox' defaultChecked className='rounded' />
              문서화 포함
            </label>
            <label className='flex items-center gap-2'>
              <input type='checkbox' defaultChecked className='rounded' />
              TypeScript 사용
            </label>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className='w-full'
            size='lg'
          >
            {isGenerating ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                AI가 코드를 생성 중...
              </>
            ) : (
              <>
                <Code className='mr-2 h-4 w-4' />
                코드 생성
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 생성된 코드 표시 */}
      {generatedCode && (
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                {getTypeIcon(generatedCode.type)}
                <CardTitle>{generatedCode.name}</CardTitle>
              </div>
              <div className='flex items-center gap-2'>
                {generatedCode.dependencies && (
                  <Badge variant='outline'>
                    {generatedCode.dependencies.length} dependencies
                  </Badge>
                )}
                <Badge>{generatedCode.language}</Badge>
              </div>
            </div>
            <p className='text-sm text-muted-foreground mt-2'>
              {generatedCode.description}
            </p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue='code'>
              <TabsList className='grid w-full grid-cols-3'>
                <TabsTrigger value='code'>코드</TabsTrigger>
                <TabsTrigger value='test'>테스트</TabsTrigger>
                <TabsTrigger value='docs'>문서</TabsTrigger>
              </TabsList>

              <TabsContent value='code' className='space-y-4'>
                <div className='relative'>
                  <pre className='bg-muted p-4 rounded-md overflow-x-auto'>
                    <code className='text-sm font-mono'>
                      {generatedCode.code}
                    </code>
                  </pre>
                  <div className='absolute top-2 right-2 flex gap-2'>
                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={() => copyToClipboard(generatedCode.code)}
                    >
                      {copied ? (
                        <Check className='h-4 w-4' />
                      ) : (
                        <Copy className='h-4 w-4' />
                      )}
                    </Button>
                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={() =>
                        downloadCode(
                          generatedCode.code,
                          `${generatedCode.name}.${generatedCode.language === 'typescript' ? 'ts' : 'js'}`
                        )
                      }
                    >
                      <Download className='h-4 w-4' />
                    </Button>
                  </div>
                </div>

                {generatedCode.dependencies && (
                  <div className='bg-muted p-3 rounded-md'>
                    <p className='text-sm font-medium mb-2'>필요한 종속성:</p>
                    <code className='text-sm'>
                      npm install {generatedCode.dependencies.join(' ')}
                    </code>
                  </div>
                )}
              </TabsContent>

              <TabsContent value='test'>
                {generatedCode.testCode ? (
                  <pre className='bg-muted p-4 rounded-md overflow-x-auto'>
                    <code className='text-sm font-mono'>
                      {generatedCode.testCode}
                    </code>
                  </pre>
                ) : (
                  <p className='text-muted-foreground text-center py-8'>
                    테스트 코드가 없습니다.
                  </p>
                )}
              </TabsContent>

              <TabsContent value='docs'>
                {generatedCode.documentation ? (
                  <div className='prose prose-sm max-w-none'>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: generatedCode.documentation,
                      }}
                    />
                  </div>
                ) : (
                  <p className='text-muted-foreground text-center py-8'>
                    문서가 없습니다.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* 코드 생성 팁 */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg flex items-center gap-2'>
            <GitBranch className='h-4 w-4' />
            효과적인 코드 생성 팁
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <h4 className='font-medium'>프롬프트 작성 팁</h4>
              <ul className='text-sm text-muted-foreground space-y-1'>
                <li>• 구체적인 요구사항을 명시</li>
                <li>• 원하는 디자인 패턴 언급</li>
                <li>• 필요한 기능을 상세히 설명</li>
                <li>• 예상 입출력 형식 제공</li>
              </ul>
            </div>
            <div className='space-y-2'>
              <h4 className='font-medium'>코드 품질 향상</h4>
              <ul className='text-sm text-muted-foreground space-y-1'>
                <li>• 테스트 코드 항상 포함</li>
                <li>• TypeScript 사용 권장</li>
                <li>• 에러 처리 코드 추가</li>
                <li>• 주석과 문서화 요청</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
