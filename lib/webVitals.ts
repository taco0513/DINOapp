import { getCLS, getFID, getFCP, getLCP, getTTFB, Metric } from 'web-vitals';

const vitalsUrl = 'https://vitals.vercel-analytics.com/v1/vitals';

function getConnectionSpeed() {
  return 'connection' in navigator &&
    navigator['connection' as keyof Navigator] &&
    'effectiveType' in (navigator as any).connection
    ? (navigator as any).connection.effectiveType
    : '';
}

/**
 * Send analytics data to Vercel Analytics
 */
function sendToAnalytics(metric: Metric, options: any) {
  const body = {
    dsn: options.analyticsId,
    id: metric.id,
    page: options.page,
    href: options.href,
    event_name: metric.name,
    value: metric.value.toString(),
    speed: getConnectionSpeed(),
  };

  if (options.debug) {
    console.log('[Analytics]', metric.name, JSON.stringify(body, null, 2));
  }

  const blob = new Blob([new URLSearchParams(body).toString()], {
    type: 'application/x-www-form-urlencoded',
  });
  if (navigator.sendBeacon) {
    navigator.sendBeacon(vitalsUrl, blob);
  } else
    fetch(vitalsUrl, {
      body: blob,
      method: 'POST',
      credentials: 'omit',
      keepalive: true,
    });
}

/**
 * Web Vitals reporting
 */
export function reportWebVitals(options: {
  analyticsId?: string;
  page?: string;
  href?: string;
  debug?: boolean;
} = {}) {
  try {
    getFID((metric) => sendToAnalytics(metric, options));
    getTTFB((metric) => sendToAnalytics(metric, options));
    getLCP((metric) => sendToAnalytics(metric, options));
    getCLS((metric) => sendToAnalytics(metric, options));
    getFCP((metric) => sendToAnalytics(metric, options));
  } catch (err) {
    console.error('[Analytics]', err);
  }
}