import { onCLS, onINP, onFCP, onLCP, onTTFB, Metric } from 'web-vitals';

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
    onINP((metric: Metric) => sendToAnalytics(metric, options)); // FID is deprecated, using INP (Interaction to Next Paint)
    onTTFB((metric: Metric) => sendToAnalytics(metric, options));
    onLCP((metric: Metric) => sendToAnalytics(metric, options));
    onCLS((metric: Metric) => sendToAnalytics(metric, options));
    onFCP((metric: Metric) => sendToAnalytics(metric, options));
  } catch (err) {
    console.error('[Analytics]', err);
  }
}