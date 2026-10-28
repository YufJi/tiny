const MOBILE_USER_AGENT = /Android|iPhone|iPod|Mobile|Windows Phone|IEMobile|BlackBerry|Opera Mini/i;

/**
 * True for phone/tablet browsers. Desktop browsers with touch screens are not
 * treated as mobile, and "Request desktop site" iPadOS is caught by the
 * Macintosh + multi-touch combination.
 */
export function isMobileBrowser({
  userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent,
} = {}) {
  if (MOBILE_USER_AGENT.test(userAgent)) return true;
  return false;
}

/** `?desktop=1` is an explicit escape hatch for desktop-mode testing. */
export function shouldShowMobileGate(search = typeof window === 'undefined' ? '' : window.location.search) {
  return new URLSearchParams(search).get('desktop') !== '1' && isMobileBrowser();
}
