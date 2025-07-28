import { Metadata } from 'next';
import ApiDocumentation from '@/components/docs/ApiDocumentation';

export const metadata: Metadata = {
  title: 'API 문서 - DINO',
  description: 'DINO 여행 관리 플랫폼의 REST API 사용법과 예제를 확인하세요.',
};

export default function ApiDocsPage() {
  return <ApiDocumentation />;
}