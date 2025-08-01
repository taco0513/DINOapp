import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logger } from '@/lib/logger';

// TODO: Remove unused logger import

interface ProblemSolvingRequest {
  problem: string;
  errorDetails?: string;
  timeLimit: number;
}

interface Solution {
  id: string;
  type: 'quick_fix' | 'root_cause' | 'workaround' | 'prevention';
  title: string;
  description: string;
  steps: string[];
  confidence: number;
  timeEstimate: string;
  code?: string;
  references?: {
    title: string;
    url: string;
    relevance: number;
  }[];
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ProblemSolvingRequest = await request.json();
    const solutions = await findSolutions(body);

    return NextResponse.json({ solutions });
  } catch (error) {
    logger.error('Problem solving error:', error);
    return NextResponse.json(
      { error: 'Failed to find solutions' },
      { status: 500 }
    );
  }
}

async function findSolutions(request: ProblemSolvingRequest): Promise<Solution[]> {
  const { problem, errorDetails: _errorDetails } = request;
  const solutions: Solution[] = [];

  // 문제 타입 분석
  const problemLower = problem.toLowerCase();
  
  // TypeError 관련 문제
  if (problemLower.includes('cannot read property') || problemLower.includes('undefined')) {
    solutions.push({
      id: 'sol_1',
      type: 'quick_fix',
      title: 'Optional Chaining 사용하기',
      description: '안전하게 객체 속성에 접근하여 undefined 에러 방지',
      steps: [
        '에러가 발생하는 코드 위치 확인',
        '점(.) 연산자를 물음표(?.) 연산자로 변경',
        'null/undefined 체크 추가',
        '테스트하여 에러 해결 확인'
      ],
      confidence: 0.95,
      timeEstimate: '30초',
      code: `// Before
const value = user.profile.name;

// After - Optional Chaining
const value = user?.profile?.name;

// 또는 기본값 설정
const value = user?.profile?.name ?? '기본 이름';`,
      references: [
        {
          title: 'MDN: Optional Chaining',
          url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining',
          relevance: 0.98
        }
      ]
    });

    solutions.push({
      id: 'sol_2',
      type: 'root_cause',
      title: '비동기 데이터 로딩 문제 해결',
      description: '데이터가 로드되기 전에 접근하는 근본 원인 해결',
      steps: [
        '데이터 로딩 상태 확인',
        '로딩 상태에 따른 조건부 렌더링 구현',
        '초기 상태값 설정',
        'useEffect로 비동기 데이터 처리'
      ],
      confidence: 0.88,
      timeEstimate: '2분',
      code: `const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchData()
    .then(setData)
    .finally(() => setLoading(false));
}, []);

if (loading) return <LoadingSpinner />;
if (!data) return <EmptyState />;

return <DataDisplay data={data} />;`
    });
  }

  // 성능 문제
  if (problemLower.includes('느린') || problemLower.includes('성능') || problemLower.includes('performance')) {
    solutions.push({
      id: 'sol_3',
      type: 'quick_fix',
      title: 'React.memo로 뺈필요한 리렌더링 방지',
      description: '컴포넌트를 메모이제이션하여 성능 개선',
      steps: [
        '리렌더링이 자주 발생하는 컴포넌트 식별',
        'React.memo로 컴포넌트 감싸기',
        'props 비교 함수 추가 (필요한 경우)',
        'React DevTools로 개선 확인'
      ],
      confidence: 0.85,
      timeEstimate: '1분',
      code: `// Before
export default function ExpensiveComponent({ data }) {
  return <ComplexVisualization data={data} />;
}

// After
export default React.memo(function ExpensiveComponent({ data }) {
  return <ComplexVisualization data={data} />;
}, (prevProps, nextProps) => {
  // true를 반환하면 리렌더링 건너뛰기
  return prevProps.data.id === nextProps.data.id;
});`
    });
  }

  // 설정 문제
  if (problemLower.includes('module not found') || problemLower.includes('설치')) {
    solutions.push({
      id: 'sol_4',
      type: 'quick_fix',
      title: '패키지 재설치',
      description: 'node_modules 초기화 및 패키지 재설치',
      steps: [
        'node_modules 폴더 삭제',
        'package-lock.json 삭제',
        'npm cache clean --force 실행',
        'npm install 다시 실행'
      ],
      confidence: 0.92,
      timeEstimate: '1분 30초',
      code: `# Terminal
rm -rf node_modules
rm package-lock.json
npm cache clean --force
npm install`,
      references: [
        {
          title: 'npm docs: npm-install',
          url: 'https://docs.npmjs.com/cli/v8/commands/npm-install',
          relevance: 0.9
        }
      ]
    });
  }

  // AI 기반 일반적인 해결책 추가
  if (solutions.length === 0) {
    solutions.push({
      id: 'sol_generic',
      type: 'workaround',
      title: '일반적인 디버깅 접근법',
      description: '단계별로 문제를 파악하고 해결',
      steps: [
        'console.log로 변수 값 확인',
        '브라우저 개발자 도구에서 에러 확인',
        '관련 코드를 주석 처리하여 문제 범위 축소',
        '스택 트레이스를 따라 에러 발생 지점 추적'
      ],
      confidence: 0.7,
      timeEstimate: '2분',
      references: [
        {
          title: 'Chrome DevTools 디버깅 가이드',
          url: 'https://developer.chrome.com/docs/devtools/',
          relevance: 0.8
        }
      ]
    });
  }

  return solutions;
}