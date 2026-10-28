/**
 * Mini-program keyframes accept CSS properties plus the transform sugar that
 * `wx.createAnimation` popularized (`rotate`, `scale`, `translate`, `ease`, …).
 * `this.animate` reuses that shape, so normalization happens once here and the
 * render protocol only ever carries Web Animations-compatible frames.
 */

export type AnimationFrame = {
  offset?: number
  easing?: string
  [property: string]: unknown
}

const SKEW_UNITS: Record<string, string> = {
  skew: 'deg',
  skewX: 'deg',
  skewY: 'deg',
  rotate: 'deg',
  rotateX: 'deg',
  rotateY: 'deg',
  rotateZ: 'deg',
}

const SCALE_PARTS: Record<string, string> = {
  scale: 'scale',
  scaleX: 'scaleX',
  scaleY: 'scaleY',
  scaleZ: 'scaleZ',
}

const TRANSLATE_PARTS: Record<string, string> = {
  translate: 'translate',
  translateX: 'translateX',
  translateY: 'translateY',
  translateZ: 'translateZ',
}

/** Longhand transform sugar in the order mini-program authors expect. */
const TRANSFORM_ORDER = [
  'translate',
  'translateX',
  'translateY',
  'translateZ',
  'scale',
  'scaleX',
  'scaleY',
  'scaleZ',
  'rotate',
  'rotateX',
  'rotateY',
  'rotateZ',
  'skew',
  'skewX',
  'skewY',
  'matrix',
] as const

const numberOr = (value: unknown, fallback = 0): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const pair = (value: unknown): [number, number] => {
  if (Array.isArray(value)) {
    return [numberOr(value[0]), numberOr(value[1], numberOr(value[0]))]
  }
  const single = numberOr(value)
  return [single, single]
}

function transformPart(name: string, value: unknown): string | undefined {
  if (name === 'matrix') {
    const values = Array.isArray(value) ? value : []
    if (values.length !== 6) return undefined
    return `matrix(${values.map((item) => numberOr(item)).join(', ')})`
  }
  if (name in SCALE_PARTS) {
    const [x, y] = pair(value)
    if (name === 'scale') return `scale(${x}, ${y})`
    return `${name}(${name === 'scaleX' ? x : y})`
  }
  if (name in TRANSLATE_PARTS) {
    const [x, y] = pair(value)
    if (name === 'translate') return `translate(${x}px, ${y}px)`
    if (name === 'translateX') return `translateX(${x}px)`
    if (name === 'translateY') return `translateY(${y}px)`
    return `translateZ(${x}px)`
  }
  if (name in SKEW_UNITS) {
    if (name === 'skew') {
      const [x, y] = pair(value)
      return `skew(${x}deg, ${y}deg)`
    }
    return `${name}(${numberOr(value)}deg)`
  }
  return undefined
}

/** Drop empty frames and coerce `offset`/`ease` into their WAAPI names. */
export function normalizeAnimationFrames(frames: unknown): AnimationFrame[] {
  if (!Array.isArray(frames)) return []
  const normalized: AnimationFrame[] = []
  for (const raw of frames) {
    if (!raw || typeof raw !== 'object') continue
    const source = raw as Record<string, unknown>
    const frame: AnimationFrame = {}
    const transforms = new Map<string, string>()
    for (const [key, value] of Object.entries(source)) {
      if (value === undefined || value === null || value === '') continue
      if (key === 'offset') {
        const offset = Number(value)
        if (Number.isFinite(offset)) frame.offset = Math.min(Math.max(offset, 0), 1)
        continue
      }
      if (key === 'ease') {
        frame.easing = String(value)
        continue
      }
      if (key === 'duration' || key === 'delay' || key === 'iterations' || key === 'timingFunction') {
        // Per-keyframe timing belongs to the call that owns the animation.
        continue
      }
      const part = transformPart(key, value)
      if (part !== undefined) {
        transforms.set(key, part)
        continue
      }
      frame[key] = value
    }
    const ordered = TRANSFORM_ORDER
      .map((name) => transforms.get(name))
      .filter((part): part is string => Boolean(part))
    if (ordered.length > 0) {
      const existing = typeof frame.transform === 'string' ? frame.transform : ''
      frame.transform = [...(existing ? [existing] : []), ...ordered].join(' ')
    }
    normalized.push(frame)
  }
  return normalized
}

/** `fill` defaults to `both`: the last keyframe sticks until it is cleared. */
export function animationTimingOptions(
  duration: number,
  options: { delay?: unknown; easing?: unknown; iterations?: unknown; fill?: unknown } = {},
): { duration: number; delay?: number; easing?: string; iterations?: number; fill: 'none' | 'forwards' | 'backwards' | 'both' } {
  const delay = Number(options.delay)
  const iterations = Number(options.iterations)
  const fill = options.fill === 'none' || options.fill === 'forwards'
    || options.fill === 'backwards' || options.fill === 'both'
    ? options.fill
    : 'both'
  return {
    duration: Number.isFinite(duration) && duration > 0 ? duration : 0,
    ...(Number.isFinite(delay) && delay > 0 ? { delay } : {}),
    ...(typeof options.easing === 'string' && options.easing ? { easing: options.easing } : {}),
    ...(Number.isFinite(iterations) && iterations > 0 ? { iterations } : {}),
    fill,
  }
}
