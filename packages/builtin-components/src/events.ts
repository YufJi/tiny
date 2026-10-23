import type * as glassEasel from 'glass-easel'

type BackendElementLike = {
  value?: unknown
  checked?: unknown
}

function backendElementFromEvent(event: glassEasel.ShadowedEvent<unknown>): BackendElementLike | null {
  for (const candidate of [event.currentTarget, event.target]) {
    const getElement = (candidate as unknown as {
      getBackendElement?: () => BackendElementLike | null
    } | null | undefined)?.getBackendElement
    if (typeof getElement !== 'function') continue
    const element = getElement.call(candidate)
    if (element) return element
  }
  return null
}

export function numberFromEvent(event: glassEasel.ShadowedEvent<unknown>, fallback = 0): number {
  const detail = event.detail as { value?: unknown } | undefined
  if (detail?.value !== undefined) return Number(detail.value)
  const element = backendElementFromEvent(event)
  if (element?.value !== undefined) return Number(element.value)
  return fallback
}

export function valueFromEvent(event: glassEasel.ShadowedEvent<unknown>): unknown {
  const detail = event.detail as { value?: unknown } | undefined
  if (detail?.value !== undefined) return detail.value
  const target = event.target as { value?: unknown } | undefined
  if (target?.value !== undefined) return target.value
  return backendElementFromEvent(event)?.value
}

export function booleanFromEvent(event: glassEasel.ShadowedEvent<unknown>, fallback = false): boolean {
  const detail = event.detail as { value?: unknown } | undefined
  if (detail?.value !== undefined) return Boolean(detail.value)
  const element = backendElementFromEvent(event)
  if (element?.checked !== undefined) return Boolean(element.checked)
  return fallback
}
