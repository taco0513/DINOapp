/**
 * DINO v2.0 - Breadcrumb Component
 * Navigation breadcrumb for better UX
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const routeLabels: Record<string, string> = {
  '': '홈',
  'dashboard': '대시보드',
  'visa': '비자 체커',
  'schengen': '샹겐 추적기',
  'visa-tracker': '비자 추적기',
  'visa-updates': '정책 업데이트',
  'trips': '여행 기록',
  'multi-passport': '다중 여권',
  'analytics': '여행 분석',
  'profile': '프로필',
  'auth': '인증',
  'signin': '로그인',
};

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  // Don't show breadcrumb on home page
  if (segments.length === 0) return null;

  const items: BreadcrumbItem[] = [
    { label: '홈', href: '/' }
  ];

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;
    
    items.push({
      label: routeLabels[segment] || segment,
      href: isLast ? undefined : currentPath,
    });
  });

  return (
    <nav aria-label="Breadcrumb" className="bg-gray-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ol className="flex items-center space-x-2 py-3 text-sm">
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-gray-400">/</span>
              )}
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}