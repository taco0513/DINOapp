/**
 * DINO v2.0 - Quick Actions Component
 * Fast access to common features
 */

import Link from "next/link";

export function QuickActions() {
  const actions = [
    {
      href: "/trips",
      icon: "✈️",
      title: "여행 추가",
      description: "새로운 여행 기록",
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      href: "/analytics",
      icon: "📊",
      title: "여행 분석",
      description: "통계 및 시각화",
      color: "bg-indigo-600 hover:bg-indigo-700",
    },
    {
      href: "/visa-assistant",
      icon: "🎯",
      title: "비자 도우미",
      description: "신청 관리 & 알림",
      color: "bg-orange-600 hover:bg-orange-700",
    },
    {
      href: "/visa-tracker",
      icon: "📅",
      title: "비자 추적기",
      description: "만료일 관리",
      color: "bg-red-600 hover:bg-red-700",
    },
    {
      href: "/multi-passport",
      icon: "🛂",
      title: "다중 여권",
      description: "이중국적자 지원",
      color: "bg-teal-600 hover:bg-teal-700",
    },
    {
      href: "/schengen",
      icon: "🇪🇺",
      title: "셰겐 계산기",
      description: "90/180일 규칙 확인",
      color: "bg-green-600 hover:bg-green-700",
    },
    // Gmail 싱크 기능 (백로그 - v3.0에서 사용하지 않음)
    // {
    //   href: '/gmail-sync',
    //   icon: '📧',
    //   title: 'Gmail 동기화',
    //   description: '항공편 자동 가져오기',
    //   color: 'bg-purple-600 hover:bg-purple-700',
    // },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className={`${action.color} text-white rounded-lg p-4 transition-colors group`}
        >
          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
            {action.icon}
          </div>
          <div className="font-medium">{action.title}</div>
          <div className="text-sm opacity-90">{action.description}</div>
        </Link>
      ))}
    </div>
  );
}
