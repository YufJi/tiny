export function createAnimationStub(options: unknown = {}): Record<string, unknown> {
  const settings = (options ?? {}) as {
    duration?: number
    delay?: number
    timingFunction?: string
    transformOrigin?: string
  }
  const duration = Number(settings.duration ?? 400)
  const delay = Number(settings.delay ?? 0)
  const timing = String(settings.timingFunction ?? 'linear')
  const transforms: string[] = []
  const styles: Record<string, string> = {}
  const animation: Record<string, unknown> = {}
  const chain = () => animation
  const number = (value: unknown, fallback = 1) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  animation.scale = (x: unknown, y: unknown = x) => {
    transforms.push(`scale(${number(x)}, ${number(y, number(x))})`)
    return animation
  }
  animation.scaleX = (x: unknown) => {
    transforms.push(`scaleX(${number(x)})`)
    return animation
  }
  animation.scaleY = (y: unknown) => {
    transforms.push(`scaleY(${number(y)})`)
    return animation
  }
  animation.scaleZ = (z: unknown) => {
    transforms.push(`scaleZ(${number(z)})`)
    return animation
  }
  for (const [method, cssName] of [['rotate', 'rotate'], ['rotateX', 'rotateX'], ['rotateY', 'rotateY'], ['rotateZ', 'rotateZ'], ['skewX', 'skewX'], ['skewY', 'skewY']] as const) {
    animation[method] = (value: unknown) => {
      transforms.push(`${cssName}(${number(value)}deg)`)
      return animation
    }
  }
  animation.rotate = (value: unknown) => {
    transforms.push(`rotate(${number(value)}deg)`)
    return animation
  }
  animation.translate = (x: unknown, y: unknown = 0) => {
    transforms.push(`translate(${number(x, 0)}px, ${number(y, 0)}px)`)
    return animation
  }
  animation.translateX = (x: unknown) => {
    transforms.push(`translateX(${number(x, 0)}px)`)
    return animation
  }
  animation.translateY = (y: unknown) => {
    transforms.push(`translateY(${number(y, 0)}px)`)
    return animation
  }
  animation.translateZ = (z: unknown) => {
    transforms.push(`translateZ(${number(z, 0)}px)`)
    return animation
  }
  animation.skew = (x: unknown, y: unknown = 0) => {
    transforms.push(`skew(${number(x)}deg, ${number(y)}deg)`)
    return animation
  }
  animation.matrix = (...values: unknown[]) => {
    transforms.push(`matrix(${values.map((value) => number(value, 0)).join(',')})`)
    return animation
  }
  for (const property of ['opacity', 'width', 'height', 'top', 'left', 'bottom', 'right', 'backgroundColor']) {
    animation[property] = (value: unknown) => {
      styles[property] = property === 'opacity' ? String(number(value)) : String(value)
      return animation
    }
  }
  animation.step = chain
  animation.export = () => {
    const parts: string[] = []
    if (transforms.length > 0) parts.push(`transform: ${transforms.join(' ')}`)
    for (const [property, value] of Object.entries(styles)) parts.push(`${property}: ${value}`)
    parts.push(`transition: all ${duration}ms ${timing} ${delay}ms`)
    if (settings.transformOrigin) parts.push(`transform-origin: ${settings.transformOrigin}`)
    return `${parts.join('; ')};`
  }
  return animation
}

