export function parsePureDataPattern(value: unknown): RegExp | undefined {
  if (value instanceof RegExp) return value
  if (typeof value === 'string' && value.length > 0) {
    try {
      return new RegExp(value)
    } catch {
      return undefined
    }
  }
  return undefined
}

export function isPureDataField(pattern: RegExp | undefined, field: string): boolean {
  if (!pattern) return false
  pattern.lastIndex = 0
  return pattern.test(field)
}
