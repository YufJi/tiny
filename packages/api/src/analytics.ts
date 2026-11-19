import type { ApiHost } from './context'

/**
 * Analytics calls.
 *
 * Tiny has no analytics backend; the official demo calls `reportAnalytics`
 * unconditionally, so the call shape is kept as a no-op and `canIUse` reports
 * it as a stub.
 */
export function createAnalyticsApi(): ApiHost {
  return {
    reportAnalytics: (..._args: unknown[]) => undefined,
  }
}
