const RANDOM_KEY = /\b[ab]:\d+:\d+(?:\.\d+)?/g

function normalizeText(value) {
  return typeof value === 'string'
    ? value.replace(RANDOM_KEY, '<KEY>')
    : null
}

export function normalizeTrace(trace) {
  return trace.map((entry) => ({
    label: entry.label,
    page: normalizeText(entry.page),
    event: normalizeText(entry.event),
    components: (entry.components ?? []).map((component) => normalizeText(
      typeof component === 'string' ? component : component.text,
    )),
  }))
}

export function compareTraces(left, right) {
  const canonicalLeft = normalizeTrace(left)
  const canonicalRight = normalizeTrace(right)
  const same = JSON.stringify(canonicalLeft) === JSON.stringify(canonicalRight)
  if (same) return { same, left: canonicalLeft, right: canonicalRight }

  const length = Math.max(canonicalLeft.length, canonicalRight.length)
  const differences = []
  for (let index = 0; index < length; index += 1) {
    const a = canonicalLeft[index]
    const b = canonicalRight[index]
    if (JSON.stringify(a) === JSON.stringify(b)) continue
    differences.push({ index: index + 1, tiny: a ?? null, wechat: b ?? null })
  }
  return { same, left: canonicalLeft, right: canonicalRight, differences }
}
