export type AnalyticsEventName =
  | 'preview_started'
  | 'preview_30s'
  | 'preview_ended'
  | 'paywall_shown'
  | 'checkout_start'
  | 'checkout_success'
  | 'unlock_activated_24h'
  | 'unlock_expired_24h'

export function trackEvent(name: AnalyticsEventName, payload?: Record<string, unknown>) {
  // Lightweight, console-only analytics as per existing project conventions
  try {
    // eslint-disable-next-line no-console
    console.info('[analytics]', name, payload || {})
  } catch {
    // no-op in non-browser environments
  }
}


