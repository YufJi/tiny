export type MiniProgramApiHost = Record<string, (...args: unknown[]) => unknown>

/**
 * Service-side sink for global events. The host-composed API table owns the
 * listener fan-out (`GlobalEventHub`); the runtime only emits events it
 * produces (theme, resize, errors) and forwards host `event.global` frames.
 */
export type GlobalEventSink = {
  emit(event: string, payload?: unknown): void
}

export type TabBarApi = {
  setStyle(params: Record<string, unknown>): void
  setItem(params: Record<string, unknown>): void
  setBadge(params: Record<string, unknown>): void
  removeBadge(params: Record<string, unknown>): void
  showRedDot(params: Record<string, unknown>): void
  hideRedDot(params: Record<string, unknown>): void
  setVisible(visible: boolean): void
}
