import { onCLS, onFID, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

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
function sendToAnalytics(
  metric: Metric,
  options: {
    analyticsId?: string;
    page?: string;
    href?: string;
    debug?: boolean;
  }
) {
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
    // eslint-disable-next-line no-console
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
export function reportWebVitals(
  options: {
    analyticsId?: string;
    page?: string;
    href?: string;
    debug?: boolean;
  } = {}
) {
  try {
    onINP(metric => sendToAnalytics(metric, options));
    onTTFB(metric => sendToAnalytics(metric, options));
    onLCP(metric => sendToAnalytics(metric, options));
    onCLS(metric => sendToAnalytics(metric, options));
    onFCP(metric => sendToAnalytics(metric, options));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[Analytics]', err);
  }
}
