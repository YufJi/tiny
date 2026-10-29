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

const touchToPlain = (touch: Touch): Record<string, unknown> => ({
  identifier: touch.identifier,
  pageX: touch.pageX,
  pageY: touch.pageY,
  clientX: touch.clientX,
  clientY: touch.clientY,
  screenX: touch.screenX,
  screenY: touch.screenY,
  force: touch.force,
  radiusX: touch.radiusX,
  radiusY: touch.radiusY,
})

/**
 * Read a touch list from a glass event.
 *
 * Touch events reach built-in templates in three shapes: normalized `detail`
 * (built-in re-dispatch), `touches` extra fields (compositor projection), and
 * the raw DOM `TouchEvent` (glass native projection). Components should not
 * need to know which one they got.
 */
export function touchListFromEvent(
  event: glassEasel.Event<unknown>,
  key: 'touches' | 'changedTouches',
): Array<Record<string, unknown>> {
  const detail = (event.detail ?? {}) as Record<string, unknown>
  const fromDetail = detail[key]
  if (Array.isArray(fromDetail) && fromDetail.length > 0) {
    return fromDetail as Array<Record<string, unknown>>
  }
  const projected = (event as unknown as Record<string, unknown>)[key]
  if (Array.isArray(projected) && projected.length > 0) {
    return projected as Array<Record<string, unknown>>
  }
  const original = (event as { getOriginalEvent?: () => TouchEvent | undefined })
    .getOriginalEvent?.()
  const fromOriginal = original?.[key]
  return fromOriginal ? Array.from(fromOriginal, (touch) => touchToPlain(touch)) : []
}
