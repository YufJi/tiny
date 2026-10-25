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
  const bottomThreshold = 24

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

  window.addEventListener('scroll', onScroll, { passive: true })
  return () => {
    window.removeEventListener('scroll', onScroll)
    if (frame) {
      if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(frame)
      else clearTimeout(frame)
    }
  }
}
