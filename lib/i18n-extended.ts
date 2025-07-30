// Enhanced i18n system for DINO with expanded language support
type Locale = 'ko' | 'en' | 'ja' | 'zh' | 'es' | 'fr';

interface Translations {
  [key: string]: {
    [locale in Locale]: string;
  };
}

// Extended translations with new languages
const extendedTranslations = {
  // Dashboard translations that were missing Spanish and French
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
  'dashboard.loading_activity': {
    ko: '최근 활동을 불러오는 중...',
    en: 'Loading recent activity...',
    ja: '最近の活動を読み込み中...',
    zh: '正在加载最近活动...',
    es: 'Cargando actividad reciente...',
    fr: "Chargement de l'activité récente...",
  },

  // Common phrases
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

  // New calendar specific translations
  'calendar.schedule': {
    ko: '일정',
    en: 'Schedule',
    ja: 'スケジュール',
    zh: '日程',
    es: 'Horario',
    fr: 'Programme',
  },
  'calendar.month_view': {
    ko: '월별 보기',
    en: 'Month View',
    ja: '月表示',
    zh: '月视图',
    es: 'Vista Mensual',
    fr: 'Vue Mensuelle',
  },
  'calendar.year_view': {
    ko: '년별 보기',
    en: 'Year View',
    ja: '年表示',
    zh: '年视图',
    es: 'Vista Anual',
    fr: 'Vue Annuelle',
  },
  'calendar.filter_all': {
    ko: '모든 여행',
    en: 'All Trips',
    ja: 'すべての旅行',
    zh: '所有旅行',
    es: 'Todos los Viajes',
    fr: 'Tous les Voyages',
  },
  'calendar.filter_schengen': {
    ko: '셰겐만',
    en: 'Schengen Only',
    ja: 'シェンゲンのみ',
    zh: '仅申根',
    es: 'Solo Schengen',
    fr: 'Schengen Uniquement',
  },
  'calendar.filter_current': {
    ko: '현재 여행',
    en: 'Current Trips',
    ja: '現在の旅行',
    zh: '当前旅行',
    es: 'Viajes Actuales',
    fr: 'Voyages Actuels',
  },
  'calendar.search_placeholder': {
    ko: '여행 검색...',
    en: 'Search trips...',
    ja: '旅行を検索...',
    zh: '搜索旅行...',
    es: 'Buscar viajes...',
    fr: 'Rechercher des voyages...',
  },
  'calendar.no_events': {
    ko: '이 날짜에 여행이 없습니다',
    en: 'No trips on this date',
    ja: 'この日に旅行はありません',
    zh: '此日期没有旅行',
    es: 'No hay viajes en esta fecha',
    fr: 'Aucun voyage à cette date',
  },

  // Analytics/Statistics
  'analytics.title': {
    ko: '여행 분석',
    en: 'Travel Analytics',
    ja: '旅行分析',
    zh: '旅行分析',
    es: 'Análisis de Viajes',
    fr: 'Analyse des Voyages',
  },
  'analytics.total_countries': {
    ko: '총 방문 국가',
    en: 'Total Countries Visited',
    ja: '総訪問国数',
    zh: '总访问国家',
    es: 'Total de Países Visitados',
    fr: 'Total des Pays Visités',
  },
  'analytics.total_days': {
    ko: '총 여행 일수',
    en: 'Total Travel Days',
    ja: '総旅行日数',
    zh: '总旅行天数',
    es: 'Total de Días de Viaje',
    fr: 'Total des Jours de Voyage',
  },

  // Forms
  'form.select_country': {
    ko: '국가를 선택하세요',
    en: 'Select a country',
    ja: '国を選択してください',
    zh: '选择国家',
    es: 'Selecciona un país',
    fr: 'Sélectionnez un pays',
  },
  'form.required': {
    ko: '필수 항목입니다',
    en: 'This field is required',
    ja: 'この項目は必須です',
    zh: '此字段为必填项',
    es: 'Este campo es obligatorio',
    fr: 'Ce champ est obligatoire',
  },
  'form.invalid_date': {
    ko: '유효하지 않은 날짜입니다',
    en: 'Invalid date',
    ja: '無効な日付です',
    zh: '无效日期',
    es: 'Fecha inválida',
    fr: 'Date invalide',
  },

  // Notifications
  'notification.schengen_warning': {
    ko: '셰겐 90일 한도에 접근하고 있습니다',
    en: 'Approaching Schengen 90-day limit',
    ja: 'シェンゲン90日制限に近づいています',
    zh: '接近申根90天限制',
    es: 'Acercándose al límite de 90 días Schengen',
    fr: 'Approche de la limite de 90 jours Schengen',
  },
  'notification.visa_expiry': {
    ko: '비자가 곧 만료됩니다',
    en: 'Visa expiring soon',
    ja: 'ビザの有効期限が近づいています',
    zh: '签证即将过期',
    es: 'Visa por vencer pronto',
    fr: 'Visa expirant bientôt',
  },
};

// Date formatting utilities for different locales
export function formatDate(date: Date, locale: Locale): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  try {
    switch (locale) {
      case 'ko':
        return date.toLocaleDateString('ko-KR', options);
      case 'en':
        return date.toLocaleDateString('en-US', options);
      case 'ja':
        return date.toLocaleDateString('ja-JP', options);
      case 'zh':
        return date.toLocaleDateString('zh-CN', options);
      case 'es':
        return date.toLocaleDateString('es-ES', options);
      case 'fr':
        return date.toLocaleDateString('fr-FR', options);
      default:
        return date.toLocaleDateString('ko-KR', options);
    }
  } catch {
    return date.toLocaleDateString();
  }
}

// Number formatting for different locales
export function formatNumber(num: number, locale: Locale): string {
  try {
    switch (locale) {
      case 'ko':
        return num.toLocaleString('ko-KR');
      case 'en':
        return num.toLocaleString('en-US');
      case 'ja':
        return num.toLocaleString('ja-JP');
      case 'zh':
        return num.toLocaleString('zh-CN');
      case 'es':
        return num.toLocaleString('es-ES');
      case 'fr':
        return num.toLocaleString('fr-FR');
      default:
        return num.toLocaleString();
    }
  } catch {
    return num.toString();
  }
}

// Currency formatting for different locales
export function formatCurrency(
  amount: number,
  currency: string,
  locale: Locale
): string {
  try {
    const localeMap = {
      ko: 'ko-KR',
      en: 'en-US',
      ja: 'ja-JP',
      zh: 'zh-CN',
      es: 'es-ES',
      fr: 'fr-FR',
    };

    return new Intl.NumberFormat(localeMap[locale], {
      style: 'currency',
      currency: currency,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export { extendedTranslations };
export type { Locale };
