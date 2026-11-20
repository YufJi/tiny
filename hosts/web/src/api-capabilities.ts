/**
 * `api` handler keys the shared Rust HostCore answers for every web host.
 *
 * They are not part of a host's `apiHandlers` map, so a host that advertises
 * its capabilities must add them explicitly or `canIUse` would report routing
 * and pull-down refresh as missing.
 */
export const HOST_CORE_API_KEYS: readonly string[] = [
  'navigate.to',
  'navigate.back',
  'navigate.switchTab',
  'navigate.redirectTo',
  'navigate.reLaunch',
  'page.pullDownRefresh',
  'page.stopPullDownRefresh',
]
