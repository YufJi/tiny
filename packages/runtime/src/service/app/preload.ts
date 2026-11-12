import type { PreloadRuleArtifact } from '@tiny/manifest'

/**
 * `preloadRule.network` gate.
 *
 * `all` always preloads. `wifi` only preloads when the host reports a Wi-Fi
 * connection; without a host fact the safe default is "not Wi-Fi", so a mobile
 * network never pays for an unexpected package download.
 */
export function shouldPreloadRule(
  rule: Pick<PreloadRuleArtifact, 'network'>,
  network: 'wifi' | 'other' | undefined,
): boolean {
  return rule.network === 'all' || network === 'wifi'
}
