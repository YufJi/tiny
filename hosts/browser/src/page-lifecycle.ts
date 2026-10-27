import type { BridgeConnection } from '@tiny/bridge'

/**
 * Translate the render document's real scroll position into mini-program page
 * lifecycle events. The devtool gives every page its own iframe, so this is
 * the page's WebView: `onPageScroll` and `onReachBottom` come from the same
 * scroll container the user manipulates.
 */
export function installPageLifecycleBridge(connection: BridgeConnection): () => void {
  let frame = 0
  let lastScrollTop = -1
  let bottomLatched = false
  let pullStartY: number | undefined
  let pulledDown = false
  const bottomThreshold = 24
  const pullThreshold = 50

  const readScroll = () => {
    const scrolling = document.scrollingElement as HTMLElement | null
    return {
      scrollTop: Math.max(0, scrolling?.scrollTop ?? window.scrollY ?? 0),
      scrollLeft: Math.max(0, scrolling?.scrollLeft ?? window.scrollX ?? 0),
      scrollHeight: scrolling?.scrollHeight ?? document.documentElement.scrollHeight,
      clientHeight: window.innerHeight,
    }
  }

  const flush = () => {
    frame = 0
    const state = readScroll()
    if (state.scrollTop === lastScrollTop) return
    lastScrollTop = state.scrollTop
    connection.sendEvent('page', 'scroll', {
      scrollTop: state.scrollTop,
      scrollLeft: state.scrollLeft,
    })

    const maxScroll = Math.max(0, state.scrollHeight - state.clientHeight)
    const atBottom = maxScroll > 0 && state.scrollTop >= maxScroll - bottomThreshold
    if (atBottom && !bottomLatched) {
      bottomLatched = true
      connection.sendEvent('page', 'reachBottom', {
        scrollTop: state.scrollTop,
        scrollHeight: state.scrollHeight,
      })
    } else if (!atBottom && state.scrollTop < maxScroll - bottomThreshold * 2) {
      bottomLatched = false
    }
  }

  const onScroll = () => {
    if (frame) return
    frame = typeof requestAnimationFrame === 'function'
      ? requestAnimationFrame(flush)
      : window.setTimeout(flush, 16)
  }

  // A pull-down gesture is the host's visual affordance for
  // onPullDownRefresh. It starts only when the page is already at the top, so
  // it never steals a normal page scroll.
  const onTouchStart = (event: TouchEvent) => {
    pulledDown = false
    pullStartY = undefined
    if (readScroll().scrollTop > 0 || event.touches.length !== 1) return
    pullStartY = event.touches[0]!.clientY
  }
  const onTouchMove = (event: TouchEvent) => {
    if (pulledDown || pullStartY === undefined || event.touches.length !== 1) return
    const delta = event.touches[0]!.clientY - pullStartY
    if (delta < pullThreshold || readScroll().scrollTop > 0) return
    pulledDown = true
    connection.sendEvent('page', 'pullDownRefresh', { distance: delta })
  }
  const onTouchEnd = () => {
    pullStartY = undefined
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('touchstart', onTouchStart, { passive: true })
  window.addEventListener('touchmove', onTouchMove, { passive: true })
  window.addEventListener('touchend', onTouchEnd, { passive: true })
  window.addEventListener('touchcancel', onTouchEnd, { passive: true })
  return () => {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('touchstart', onTouchStart)
    window.removeEventListener('touchmove', onTouchMove)
    window.removeEventListener('touchend', onTouchEnd)
    window.removeEventListener('touchcancel', onTouchEnd)
    if (frame) {
      if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(frame)
      else clearTimeout(frame)
    }
  }
}
