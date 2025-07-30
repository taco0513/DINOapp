// Enhanced i18n system for DINO with expanded language support
type Locale = 'ko' | 'en' | 'ja' | 'zh' | 'es' | 'fr';

interface Translations {
  [key: string]: {
    [locale in Locale]: string;
  };
}

const translations: Translations = {
  // App Title & Navigation
  'app.title': {
    ko: 'DINO',
    en: 'DINO',
    ja: 'DINO',
    zh: 'DINO',
    es: 'DINO',
    fr: 'DINO',
  },
  'nav.dashboard': {
    ko: '대시보드',
    en: 'Dashboard',
    ja: 'ダッシュボード',
    zh: '仪表板',
    es: 'Panel de Control',
    fr: 'Tableau de Bord',
  },
  'nav.trips': {
    ko: '여행기록',
    en: 'Travel Records',
    ja: '旅行記録',
    zh: '旅行记录',
    es: 'Registros de Viaje',
    fr: 'Enregistrements de Voyage',
  },
  'nav.schengen': {
    ko: '셰겐계산기',
    en: 'Schengen Calculator',
    ja: 'シェンゲン計算機',
    zh: '申根计算器',
    es: 'Calculadora Schengen',
    fr: 'Calculateur Schengen',
  },
  'nav.calendar': {
    ko: '캘린더',
    en: 'Calendar',
    ja: 'カレンダー',
    zh: '日历',
    es: 'Calendario',
    fr: 'Calendrier',
  },

  // Dashboard
  'dashboard.welcome': {
    ko: '환영합니다, {name}님',
    en: 'Welcome, {name}',
    ja: 'ようこそ、{name}さん',
    zh: '欢迎，{name}',
    es: 'Bienvenido, {name}',
    fr: 'Bienvenue, {name}',
  },
  'dashboard.logout': {
    ko: '로그아웃',
    en: 'Logout',
    ja: 'ログアウト',
    zh: '注销',
    es: 'Cerrar Sesión',
    fr: 'Déconnexion',
  },

  // Travel Records
  'trips.title': {
    ko: '여행 기록',
    en: 'Travel Records',
    ja: '旅行記録',
    zh: '旅行记录',
  },
  'trips.description': {
    ko: '여행 기록을 추가하고 관리하세요',
    en: 'Add and manage your travel records',
    ja: '旅行記録を追加・管理しましょう',
    zh: '添加和管理您的旅行记录',
  },
  'trips.add': {
    ko: '새 여행 추가',
    en: 'Add New Trip',
    ja: '新しい旅行を追加',
    zh: '添加新旅行',
  },
  'trips.empty': {
    ko: '여행 기록이 없습니다',
    en: 'No travel records found',
    ja: '旅行記録がありません',
    zh: '未找到旅行记录',
  },
  'trips.empty.description': {
    ko: '첫 번째 여행을 추가하여 비자 추적을 시작하세요',
    en: 'Add your first trip to start tracking visas',
    ja: '最初の旅行を追加してビザ追跡を開始しましょう',
    zh: '添加您的第一次旅行以开始跟踪签证',
  },
  'trips.loading': {
    ko: '여행 기록을 불러오는 중...',
    en: 'Loading trips...',
    ja: '旅行記録を読み込み中...',
    zh: '正在加载旅行记录...',
  },

  // Schengen Calculator
  'schengen.title': {
    ko: '셰겐 계산기',
    en: 'Schengen Calculator',
    ja: 'シェンゲン計算機',
    zh: '申根计算器',
  },
  'schengen.description': {
    ko: '90/180일 규칙을 확인하고 규정 준수를 추적하세요',
    en: 'Check 90/180 day rule and track compliance',
    ja: '90/180日ルールを確認し、コンプライアンスを追跡しましょう',
    zh: '检查90/180天规则并跟踪合规性',
  },
  'schengen.current_status': {
    ko: '현재 셰겐 상태',
    en: 'Current Schengen Status',
    ja: '現在のシェンゲン状況',
    zh: '当前申根状态',
  },
  'schengen.used_days': {
    ko: '사용된 일수',
    en: 'Used Days',
    ja: '使用日数',
    zh: '已使用天数',
  },
  'schengen.remaining_days': {
    ko: '남은 일수',
    en: 'Remaining Days',
    ja: '残り日数',
    zh: '剩余天数',
  },
  'schengen.next_reset': {
    ko: '다음 재설정',
    en: 'Next Reset',
    ja: '次のリセット',
    zh: '下次重置',
  },
  'schengen.compliant': {
    ko: '✅ 셰겐 규정 준수',
    en: '✅ Schengen Compliant',
    ja: '✅ シェンゲン規定準拠',
    zh: '✅ 符合申根规定',
  },
  'schengen.violation': {
    ko: '⚠️ 셰겐 규정 위반',
    en: '⚠️ Schengen Violation',
    ja: '⚠️ シェンゲン規定違反',
    zh: '⚠️ 违反申根规定',
  },

  // Forms
  'form.country': {
    ko: '국가',
    en: 'Country',
    ja: '国',
    zh: '国家',
  },
  'form.entry_date': {
    ko: '입국일',
    en: 'Entry Date',
    ja: '入国日',
    zh: '入境日期',
  },
  'form.exit_date': {
    ko: '출국일',
    en: 'Exit Date',
    ja: '出国日',
    zh: '出境日期',
  },
  'form.visa_type': {
    ko: '비자 유형',
    en: 'Visa Type',
    ja: 'ビザタイプ',
    zh: '签证类型',
  },
  'form.save': {
    ko: '저장',
    en: 'Save',
    ja: '保存',
    zh: '保存',
  },
  'form.cancel': {
    ko: '취소',
    en: 'Cancel',
    ja: 'キャンセル',
    zh: '取消',
  },
  'form.delete': {
    ko: '삭제',
    en: 'Delete',
    ja: '削除',
    zh: '删除',
  },
  'form.edit': {
    ko: '수정',
    en: 'Edit',
    ja: '編集',
    zh: '编辑',
  },

  // Notifications
  'notifications.title': {
    ko: '알림',
    en: 'Notifications',
    ja: '通知',
    zh: '通知',
  },
  'notifications.empty': {
    ko: '새로운 알림이 없습니다',
    en: 'No new notifications',
    ja: '新しい通知はありません',
    zh: '没有新通知',
  },
  'notifications.view_all': {
    ko: '모두 보기',
    en: 'View All',
    ja: 'すべて表示',
    zh: '查看全部',
  },

  // Common
  'common.loading': {
    ko: '로딩 중...',
    en: 'Loading...',
    ja: '読み込み中...',
    zh: '加载中...',
    es: 'Cargando...',
    fr: 'Chargement...',
  },
  'common.error': {
    ko: '오류가 발생했습니다',
    en: 'An error occurred',
    ja: 'エラーが発生しました',
    zh: '发生错误',
    es: 'Ocurrió un error',
    fr: "Une erreur s'est produite",
  },
  'common.retry': {
    ko: '다시 시도',
    en: 'Retry',
    ja: '再試行',
    zh: '重试',
    es: 'Reintentar',
    fr: 'Réessayer',
  },
  'common.days': {
    ko: '일',
    en: 'days',
    ja: '日',
    zh: '天',
  },
  'common.total': {
    ko: '총',
    en: 'Total',
    ja: '合計',
    zh: '总计',
  },

  // Language selector
  'language.select': {
    ko: '언어 선택',
    en: 'Language',
    ja: '言語',
    zh: '语言',
  },

  // Additional dashboard text
  'dashboard.stats.countries': {
    ko: '방문 국가',
    en: 'Visited Countries',
    ja: '訪問国',
    zh: '访问国家',
  },
  'dashboard.stats.view': {
    ko: '통계 보기',
    en: 'View Statistics',
    ja: '統計を見る',
    zh: '查看统计',
  },
  'dashboard.recent_activity': {
    ko: '최근 활동',
    en: 'Recent Activity',
    ja: '最近の活動',
    zh: '最近活动',
  },
  'dashboard.no_trips': {
    ko: '아직 여행 기록이 없습니다',
    en: 'No travel records yet',
    ja: 'まだ旅行記録がありません',
    zh: '还没有旅行记录',
  },
  'dashboard.add_first_trip': {
    ko: '첫 번째 여행 추가하기',
    en: 'Add your first trip',
    ja: '最初の旅行を追加',
    zh: '添加第一次旅行',
  },
  'dashboard.loading_activity': {
    ko: '최근 활동을 불러오는 중...',
    en: 'Loading recent activity...',
    ja: '最近の活動を読み込み中...',
    zh: '正在加载最近活动...',
    es: 'Cargando actividad reciente...',
    fr: "Chargement de l'activité récente...",
  },

  // New internationalization-specific translations
  'language.change_note': {
    ko: '언어가 즉시 변경됩니다.',
    en: 'Language changes immediately.',
    ja: '言語がすぐに変更されます。',
    zh: '语言立即更改。',
    es: 'El idioma cambia inmediatamente.',
    fr: 'La langue change immédiatement.',
  },
  'language.auto_detect': {
    ko: '자동 감지됨',
    en: 'Auto-detected',
    ja: '自動検出',
    zh: '自动检测',
    es: 'Detectado automáticamente',
    fr: 'Détecté automatiquement',
  },
};

// Get current locale from localStorage or browser
export function getCurrentLocale(): Locale {
  // Return 'ko' during SSR to prevent hydration mismatches
  if (typeof window === 'undefined') {
    return 'ko';
  }

  // Get locale from localStorage or detect from browser
  const stored = localStorage.getItem('dino-locale') as Locale;
  if (stored && getSupportedLocales().some(l => l.code === stored)) {
    return stored;
  }

  // Detect from browser language
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('en')) return 'en';
  if (browserLang.startsWith('ja')) return 'ja';
  if (browserLang.startsWith('zh')) return 'zh';
  if (browserLang.startsWith('es')) return 'es';
  if (browserLang.startsWith('fr')) return 'fr';

  // Default to Korean
  return 'ko';
}

// Set locale and save to localStorage
export function setLocale(locale: Locale): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('dino-locale', locale);
    // Reload page to apply changes
    window.location.reload();
  }
}

// Get supported locales
export function getSupportedLocales(): Array<{
  code: Locale;
  name: string;
  flag: string;
}> {
  return [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];
}

// Translate function
export function t(key: string, params?: Record<string, string>): string {
  const locale = getCurrentLocale();
  const translation = translations[key];

  if (!translation) {
    console.warn(`Translation not found for key: ${key}`);
    return key;
  }

  let text = translation[locale] || translation.ko || key;

  // Replace parameters
  if (params) {
    Object.entries(params).forEach(([paramKey, value]) => {
      text = text.replace(`{${paramKey}}`, value);
    });
  }

  return text;
}

export type { Locale };
