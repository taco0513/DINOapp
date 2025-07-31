import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface PairProgrammingContext {
  mode: 'driver' | 'navigator';
  code: string;
  language: string;
  task: string;
  currentFile?: string;
}

interface NavigatorSuggestion {
  type: 'architecture' | 'implementation' | 'optimization' | 'testing' | 'refactoring';
  suggestion: string;
  codeExample?: string;
  confidence: number;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { context } = await request.json();
    const suggestions = await generateNavigatorSuggestions(context);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Pair programming error:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}

async function generateNavigatorSuggestions(
  context: PairProgrammingContext
): Promise<NavigatorSuggestion[]> {
  const suggestions: NavigatorSuggestion[] = [];

  // 코드 분석 및 컨텍스트 기반 제안 생성
  if (context.mode === 'navigator') {
    // 아키텍처 레벨 제안
    if (context.code.includes('useState') && context.code.includes('useEffect')) {
      suggestions.push({
        type: 'architecture',
        suggestion: '복잡한 상태 로직을 Custom Hook으로 추출하면 재사용성과 테스트 용이성이 향상됩니다.',
        codeExample: `// Custom Hook 예시
function useUserData(userId: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserData(userId)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);

  return { data, loading, error };
}`,
        confidence: 0.92,
        reasoning: '상태 관리 로직이 복잡해질 가능성이 보입니다.',
        priority: 'high'
      });
    }

    // 구현 레벨 제안
    if (context.code.includes('map') && !context.code.includes('key=')) {
      suggestions.push({
        type: 'implementation',
        suggestion: 'React 리스트 렌더링 시 key prop을 추가하여 렌더링 성능을 최적화하세요.',
        codeExample: `// key prop 추가
{items.map((item) => (
  <ItemComponent key={item.id} {...item} />
))}`,
        confidence: 0.98,
        reasoning: 'key prop이 없으면 React가 비효율적으로 리렌더링합니다.',
        priority: 'high'
      });
    }

    // 최적화 제안
    if (context.code.includes('filter') && context.code.includes('map')) {
      suggestions.push({
        type: 'optimization',
        suggestion: 'filter와 map을 연속으로 사용하는 대신 reduce로 한 번에 처리하면 성능이 향상됩니다.',
        codeExample: `// 최적화 전
const result = data
  .filter(item => item.active)
  .map(item => item.value);

// 최적화 후
const result = data.reduce((acc, item) => {
  if (item.active) acc.push(item.value);
  return acc;
}, []);`,
        confidence: 0.85,
        reasoning: '배열을 한 번만 순회하여 성능이 향상됩니다.',
        priority: 'medium'
      });
    }

    // 테스팅 제안
    if (context.task.includes('기능') && !context.code.includes('test')) {
      suggestions.push({
        type: 'testing',
        suggestion: '새로운 기능에 대한 단위 테스트를 작성하여 안정성을 확보하세요.',
        codeExample: `// 테스트 예시
describe('UserComponent', () => {
  it('should display user name when logged in', () => {
    const { getByText } = render(
      <UserComponent user={{ name: 'John', isLoggedIn: true }} />
    );
    expect(getByText('John')).toBeInTheDocument();
  });
});`,
        confidence: 0.88,
        reasoning: '테스트는 코드 품질과 유지보수성을 크게 향상시킵니다.',
        priority: 'medium'
      });
    }
  } else {
    // Driver 모드일 때는 실시간 피드백 제공
    if (context.code.includes('async') && !context.code.includes('try')) {
      suggestions.push({
        type: 'implementation',
        suggestion: '비동기 함수에 에러 처리를 추가하세요.',
        confidence: 0.95,
        reasoning: '비동기 작업은 항상 실패할 가능성이 있습니다.',
        priority: 'high'
      });
    }
  }

  return suggestions;
}

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 페어 프로그래밍 세션 통계 반환
    const stats = {
      totalSessions: 42,
      totalTime: 12600, // 초 단위
      averageProductivity: 285,
      mostProductiveTime: '14:00-16:00',
      preferredMode: 'navigator',
      topSuggestionTypes: [
        { type: 'implementation', count: 156 },
        { type: 'optimization', count: 89 },
        { type: 'architecture', count: 67 }
      ]
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Failed to fetch pair programming stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}