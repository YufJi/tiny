export type AnimationAnimate = {
  type: string
  args: unknown[]
}

export type AnimationAction = {
  animates: AnimationAnimate[]
  option: {
    transformOrigin?: string
    transition: {
      duration: number
      timingFunction: string
      delay: number
    }
  }
}

export type AnimationExport = { actions: AnimationAction[] }

export type AnimationStyle = {
  style: Record<string, unknown>
  transformOrigin?: string
  transform: string
  transitionProperty: string
  transition: string
}

const angle = (value: unknown): string => (
  typeof value === 'number' ? `${value}deg` : String(value)
)

const length = (value: unknown): string => (
  typeof value === 'number' ? `${value}px` : String(value)
)

const numberOr = (value: unknown, fallback: number): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

/**
 * Port of WeChat 3.17.5's `wx.animationToStyle` (WAWebview.js:21457).
 *
 * The render host applies one action at a time (transitionend drives the
 * sequence), exactly like the WebView pageframe does for `animation="{{...}}"`.
 */
export function animationToStyle(action: AnimationAction): AnimationStyle {
  const animates = action?.animates
  const option = action?.option ?? {}
  const transition = option.transition
  if (transition === undefined || animates === undefined) {
    return { style: {}, transformOrigin: '', transform: '', transitionProperty: '', transition: '' }
  }
  const transform = animates
    .filter(({ type }) => type !== 'style')
    .map(({ type, args }) => {
      switch (type) {
        case 'matrix':
          return `matrix(${args.join(',')})`
        case 'matrix3d':
          return `matrix3d(${args.join(',')})`
        case 'rotate':
          return `rotate(${angle(args[0])})`
        case 'rotate3d':
          return `rotate3d(${args[0]},${args[1]},${args[2]},${angle(args[3])})`
        case 'rotateX':
          return `rotateX(${angle(args[0])})`
        case 'rotateY':
          return `rotateY(${angle(args[0])})`
        case 'rotateZ':
          return `rotateZ(${angle(args[0])})`
        case 'scale':
          return `scale(${args[0]},${args[1] ?? args[0]})`
        case 'scale3d':
          return `scale3d(${args[0]},${args[1]},${args[2]})`
        case 'scaleX':
          return `scaleX(${args[0]})`
        case 'scaleY':
          return `scaleY(${args[0]})`
        case 'scaleZ':
          return `scaleZ(${args[0]})`
        case 'translate':
          return `translate(${length(args[0])},${length(args[1] ?? 0)})`
        case 'translate3d':
          return `translate3d(${length(args[0])},${length(args[1])},${length(args[2])})`
        case 'translateX':
          return `translateX(${length(args[0])})`
        case 'translateY':
          return `translateY(${length(args[0])})`
        case 'translateZ':
          return `translateZ(${length(args[0])})`
        case 'skew':
          return `skew(${angle(args[0])},${angle(args[1] ?? 0)})`
        case 'skewX':
          return `skewX(${angle(args[0])})`
        case 'skewY':
          return `skewY(${angle(args[0])})`
        default:
          return ''
      }
    })
    .join(' ')
  const style = animates
    .filter(({ type }) => type === 'style')
    .reduce<Record<string, unknown>>((result, item) => {
      result[String(item.args[0])] = item.args[1]
      return result
    }, {})
  return {
    style,
    transformOrigin: option.transformOrigin,
    transform,
    transitionProperty: ['transform', ...Object.keys(style)].join(','),
    transition: `${transition.duration}ms ${transition.timingFunction} ${transition.delay}ms`,
  }
}

/**
 * WeChat's `Animation` handle (`wx.createAnimation` / `this.animate` return
 * value): methods record animates, each `step()` commits one action, and
 * `export()` returns the `{ actions }` object consumed by the render host.
 */
export function createAnimationStub(options: unknown = {}): Record<string, unknown> {
  const settings = (options ?? {}) as {
    duration?: number
    delay?: number
    timingFunction?: string
    transformOrigin?: string
  }
  const animation = {
    actions: [] as AnimationAction[],
    currentTransform: {} as Record<string, AnimationAnimate>,
    currentStepAnimates: [] as AnimationAnimate[],
    option: {
      transition: {
        duration: settings.duration !== undefined ? Number(settings.duration) : 400,
        timingFunction: settings.timingFunction !== undefined ? String(settings.timingFunction) : 'linear',
        delay: settings.delay !== undefined ? Number(settings.delay) : 0,
      },
      transformOrigin: settings.transformOrigin ?? '50% 50% 0',
    },
  }
  const record = (type: string, args: unknown[]): Record<string, unknown> => {
    animation.currentStepAnimates.push({ type, args })
    return animation
  }
  const style = (property: string, value: unknown): Record<string, unknown> => (
    record('style', [property, value])
  )
  Object.assign(animation, {
    export(): AnimationExport {
      const actions = animation.actions
      animation.actions = []
      return { actions }
    },
    step(stepOptions: Partial<{
      duration: number
      timingFunction: string
      delay: number
      transformOrigin: string
    }> = {}): Record<string, unknown> {
      for (const animate of animation.currentStepAnimates) {
        if (animate.type === 'style') {
          animation.currentTransform[`style.${String(animate.args[0])}`] = animate
        } else {
          animation.currentTransform[animate.type] = animate
        }
      }
      const transition = animation.option.transition
      animation.actions.push({
        animates: Object.values(animation.currentTransform),
        option: {
          transformOrigin: stepOptions.transformOrigin !== undefined
            ? stepOptions.transformOrigin
            : animation.option.transformOrigin,
          transition: {
            duration: stepOptions.duration !== undefined ? stepOptions.duration : transition.duration,
            timingFunction: stepOptions.timingFunction !== undefined
              ? stepOptions.timingFunction
              : transition.timingFunction,
            delay: stepOptions.delay !== undefined ? stepOptions.delay : transition.delay,
          },
        },
      })
      animation.currentStepAnimates = []
      return animation
    },
    matrix(a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0) {
      return record('matrix', [a, b, c, d, tx, ty])
    },
    matrix3d(
      a = 1, b = 0, c = 0, d = 0,
      e = 0, f = 1, g = 0, h = 0,
      i = 0, j = 0, k = 1, l = 0,
      m = 0, n = 0, o = 0, p = 1,
    ) {
      return record('matrix3d', [a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p])
    },
    rotate(angleValue = 0) { return record('rotate', [numberOr(angleValue, 0)]) },
    rotate3d(x = 0, y = 0, z = 0, angleValue = 0) {
      return record('rotate3d', [numberOr(x, 0), numberOr(y, 0), numberOr(z, 0), numberOr(angleValue, 0)])
    },
    rotateX(angleValue = 0) { return record('rotateX', [numberOr(angleValue, 0)]) },
    rotateY(angleValue = 0) { return record('rotateY', [numberOr(angleValue, 0)]) },
    rotateZ(angleValue = 0) { return record('rotateZ', [numberOr(angleValue, 0)]) },
    scale(x = 1, y: unknown = x) { return record('scale', [numberOr(x, 1), numberOr(y, numberOr(x, 1))]) },
    scale3d(x = 1, y = 1, z = 1) {
      return record('scale3d', [numberOr(x, 1), numberOr(y, 1), numberOr(z, 1)])
    },
    scaleX(x = 1) { return record('scaleX', [numberOr(x, 1)]) },
    scaleY(y = 1) { return record('scaleY', [numberOr(y, 1)]) },
    scaleZ(z = 1) { return record('scaleZ', [numberOr(z, 1)]) },
    translate(x = 0, y = 0) { return record('translate', [numberOr(x, 0), numberOr(y, 0)]) },
    translate3d(x = 0, y = 0, z = 0) {
      return record('translate3d', [numberOr(x, 0), numberOr(y, 0), numberOr(z, 0)])
    },
    translateX(x = 0) { return record('translateX', [numberOr(x, 0)]) },
    translateY(y = 0) { return record('translateY', [numberOr(y, 0)]) },
    translateZ(z = 0) { return record('translateZ', [numberOr(z, 0)]) },
    skew(x = 0, y = 0) { return record('skew', [numberOr(x, 0), numberOr(y, 0)]) },
    skewX(x = 0) { return record('skewX', [numberOr(x, 0)]) },
    skewY(y = 0) { return record('skewY', [numberOr(y, 0)]) },
    opacity(value = 1) { return style('opacity', value) },
    backgroundColor(value = '') { return style('backgroundColor', value) },
    width(value: unknown = '') { return style('width', value) },
    height(value: unknown = '') { return style('height', value) },
    top(value: unknown = '') { return style('top', value) },
    left(value: unknown = '') { return style('left', value) },
    bottom(value: unknown = '') { return style('bottom', value) },
    right(value: unknown = '') { return style('right', value) },
  })
  return animation as unknown as Record<string, unknown>
}
