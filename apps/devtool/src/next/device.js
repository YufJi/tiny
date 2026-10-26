const MOBILE_USER_AGENT = /Android|iPhone|iPod|iPad|Mobile|Windows Phone|IEMobile|BlackBerry|Opera Mini/i;

/**
 * True for phone/tablet browsers. Desktop browsers with touch screens are not
 * treated as mobile, and "Request desktop site" iPadOS is caught by the
 * Macintosh + multi-touch combination.
 */
export function isMobileBrowser({
  userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent,
  maxTouchPoints = typeof navigator === 'undefined' ? 0 : navigator.maxTouchPoints,
  userAgentDataMobile = typeof navigator === 'undefined' ? false : navigator.userAgentData?.mobile === true,
} = {}) {
  if (userAgentDataMobile) return true;
  if (MOBILE_USER_AGENT.test(userAgent)) return true;
  if (/Macintosh/i.test(userAgent) && maxTouchPoints > 1) return true;
  return false;
}

/** `?desktop=1` is an explicit escape hatch for desktop-mode testing. */
export function shouldShowMobileGate(search = typeof window === 'undefined' ? '' : window.location.search) {
  return new URLSearchParams(search).get('desktop') !== '1' && isMobileBrowser();
}
