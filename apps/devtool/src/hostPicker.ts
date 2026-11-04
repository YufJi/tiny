export type HostPickerRequest = {
  mode: string
  range: unknown[]
  rangeKey?: string
  value: unknown
  start?: string
  end?: string
  fields?: string
  headerText?: string
  customItem?: string
  level?: string
  style?: { width: number; height: number; left: number; top: number }
}

export type HostPickerResult =
  | { status: 'ok'; value: unknown }
  | { status: 'cancel' }
  | { status: 'error'; errMsg: string }

const ITEM_HEIGHT = 48
const VISIBLE_ITEMS = 5
const INDICATOR_TOP = 92
const INDICATOR_HEIGHT = 56

const OVERLAY_STYLE = [
  'position:fixed',
  'inset:0',
  'z-index:10000',
  'display:flex',
  'flex-direction:column',
  'justify-content:flex-end',
  'background:rgba(0,0,0,.45)',
].join(';')

const PANEL_STYLE = [
  'background:#fff',
  'border-radius:12px 12px 0 0',
  'box-shadow:0 -2px 12px rgba(0,0,0,.12)',
  'color:#000',
  'display:flex',
  'flex-direction:column',
  'max-height:70%',
  'width:100%',
].join(';')

const HEADER_STYLE = [
  'align-items:center',
  'border-bottom:1px solid #eee',
  'display:flex',
  'font-size:16px',
  'height:48px',
  'justify-content:space-between',
  'padding:0 16px',
].join(';')

const WHEEL_STYLE = [
  'flex:1',
  'height:' + ITEM_HEIGHT * VISIBLE_ITEMS + 'px',
  'min-width:0',
  'overflow:hidden',
  'position:relative',
  'touch-action:none',
  'user-select:none',
].join(';')

const CONTENT_STYLE = [
  'left:0',
  'position:absolute',
  'top:0',
  'transition:transform .25s cubic-bezier(.25,.46,.45,.94)',
  'width:100%',
  'will-change:transform',
].join(';')

const MASK_STYLE = [
  'background:linear-gradient(180deg,#fff 0%,rgba(255,255,255,.6) 100%),linear-gradient(0deg,#fff 0%,rgba(255,255,255,.6) 100%)',
  'background-position:top,bottom',
  'background-repeat:no-repeat',
  'background-size:100% 92px',
  'height:100%',
  'left:0',
  'pointer-events:none',
  'position:absolute',
  'top:0',
  'width:100%',
  'z-index:2',
].join(';')

const INDICATOR_STYLE = [
  'border-bottom:1px solid #e5e5e5',
  'border-top:1px solid #e5e5e5',
  'height:' + INDICATOR_HEIGHT + 'px',
  'left:0',
  'pointer-events:none',
  'position:absolute',
  'top:' + INDICATOR_TOP + 'px',
  'width:100%',
  'z-index:3',
].join(';')

function labelsOf(range: unknown[], rangeKey?: string): string[] {
  return range.map((item) => {
    if (rangeKey && item && typeof item === 'object') {
      return String((item as Record<string, unknown>)[rangeKey] ?? '')
    }
    return String(item ?? '')
  })
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function range(from: number, to: number): number[] {
  const values: number[] = []
  for (let value = from; value <= to; value += 1) values.push(value)
  return values
}

type Wheel = {
  element: HTMLDivElement
  setIndex: (index: number, animate?: boolean) => void
  getIndex: () => number
}

function createWheel(
  doc: Document,
  labels: string[],
  initial: number,
  onChange: (index: number) => void,
): Wheel {
  const element = doc.createElement('div')
  element.className = 'tiny-picker-wheel'
  element.style.cssText = WHEEL_STYLE
  const content = doc.createElement('div')
  content.className = 'tiny-picker-wheel-content'
  content.style.cssText = CONTENT_STYLE
  const count = Math.max(1, labels.length)
  let index = clamp(Math.round(initial), 0, count - 1)
  let translate = ITEM_HEIGHT * (2 - index)
  let dragging = false
  let dragged = false
  let startY = 0
  let startTranslate = 0
  const items = labels.map((label, itemIndex) => {
    const item = doc.createElement('div')
    item.className = 'tiny-picker-wheel-item'
    item.textContent = label
    item.style.cssText = [
      'box-sizing:border-box',
      'height:' + ITEM_HEIGHT + 'px',
      'line-height:' + ITEM_HEIGHT + 'px',
      'overflow:hidden',
      'padding:0 8px',
      'text-align:center',
      'text-overflow:ellipsis',
      'white-space:nowrap',
    ].join(';')
    item.addEventListener('click', () => {
      if (dragged) {
        dragged = false
        return
      }
      setIndex(itemIndex, true)
      onChange(itemIndex)
    })
    content.appendChild(item)
    return item
  })
  const render = (animate: boolean) => {
    content.style.transition = animate ? 'transform .25s cubic-bezier(.25,.46,.45,.94)' : 'none'
    content.style.transform = `translateY(${translate}px)`
    items.forEach((item, itemIndex) => {
      item.style.color = itemIndex === index ? '#000' : '#888'
      item.style.fontWeight = itemIndex === index ? '500' : '400'
    })
  }
  const setIndex = (next: number, animate = false) => {
    index = clamp(Math.round(next), 0, count - 1)
    translate = ITEM_HEIGHT * (2 - index)
    render(animate)
  }
  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0) return
    dragging = true
    dragged = false
    startY = event.clientY
    startTranslate = translate
    content.style.transition = 'none'
  }
  const onPointerMove = (event: PointerEvent) => {
    if (!dragging) return
    const delta = event.clientY - startY
    if (Math.abs(delta) > 4) dragged = true
    const min = ITEM_HEIGHT * (2 - (count - 1))
    const max = ITEM_HEIGHT * 2
    translate = clamp(startTranslate + delta, min, max)
    render(false)
  }
  const finish = () => {
    if (!dragging) return
    dragging = false
    const next = clamp(Math.round(2 - translate / ITEM_HEIGHT), 0, count - 1)
    setIndex(next, true)
    if (next !== index) onChange(next)
    else onChange(index)
  }
  const onPointerUp = () => finish()
  const onWheel = (event: WheelEvent) => {
    if (count <= 1) return
    event.preventDefault()
    const step = event.deltaY > 0 ? 1 : -1
    const next = clamp(index + step, 0, count - 1)
    if (next === index) return
    setIndex(next, true)
    onChange(next)
  }
  element.addEventListener('pointerdown', onPointerDown)
  element.addEventListener('pointermove', onPointerMove)
  element.addEventListener('pointerup', onPointerUp)
  element.addEventListener('pointercancel', onPointerUp)
  element.addEventListener('wheel', onWheel, { passive: false })
  element.appendChild(content)
  const mask = doc.createElement('div')
  mask.className = 'tiny-picker-wheel-mask'
  mask.style.cssText = MASK_STYLE
  const indicator = doc.createElement('div')
  indicator.className = 'tiny-picker-wheel-indicator'
  indicator.style.cssText = INDICATOR_STYLE
  element.append(mask, indicator)
  setIndex(index, false)
  return { element, setIndex, getIndex: () => index }
}

function button(doc: Document, text: string, color = '#576b95'): HTMLButtonElement {
  const element = doc.createElement('button')
  element.textContent = text
  element.style.cssText = [
    'background:transparent',
    'border:0',
    'color:' + color,
    'cursor:pointer',
    'font-size:16px',
    'padding:8px',
  ].join(';')
  return element
}

function parseDate(value: unknown): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?/.exec(String(value ?? ''))
  if (!match) return null
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3] ?? 1) }
}

function parseTime(value: unknown): { hour: number; minute: number } | null {
  const match = /^(\d{1,2}):(\d{1,2})/.exec(String(value ?? ''))
  if (!match) return null
  return { hour: Number(match[1]), minute: Number(match[2]) }
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/**
 * Browser host implementation of the `<picker>` popover.
 *
 * WeChat devtools renders this outside the mini-program WebView as a WeUI
 * overlay. The web host mirrors that at the hostRequest boundary: the picker
 * component sends { mode, range, value, ... } and awaits one result, while this
 * module owns the five-row 48px wheels, masks, indicator, drag/wheel snapping,
 * date/time range clamping and the confirm/cancel callbacks.
 */
export function showHostPicker(
  request: HostPickerRequest,
  doc: Document = document,
): Promise<HostPickerResult> {
  return new Promise((resolve) => {
    const overlay = doc.createElement('div')
    overlay.className = 'tiny-picker-host-overlay'
    overlay.style.cssText = OVERLAY_STYLE
    const panel = doc.createElement('div')
    panel.className = 'tiny-picker-host-panel'
    panel.style.cssText = PANEL_STYLE
    const header = doc.createElement('div')
    header.className = 'tiny-picker-host-header'
    header.style.cssText = HEADER_STYLE
    const cancel = button(doc, '取消')
    const title = doc.createElement('div')
    title.textContent = request.headerText || '请选择'
    const confirm = button(doc, '确定', '#07c160')
    header.append(cancel, title, confirm)
    const body = doc.createElement('div')
    body.className = 'tiny-picker-host-body'
    body.style.cssText = [
      'display:flex',
      'flex:1',
      'justify-content:center',
      'min-height:0',
      'overflow:hidden',
      'padding:8px 0',
    ].join(';')
    panel.append(header, body)
    overlay.appendChild(panel)

    const previousOverflow = doc.body?.style.overflow
    if (doc.body) doc.body.style.overflow = 'hidden'
    const finish = (result: HostPickerResult) => {
      if (doc.body) doc.body.style.overflow = previousOverflow ?? ''
      overlay.remove()
      resolve(result)
    }
    const fail = (errMsg: string) => finish({ status: 'error', errMsg })

    let resultValue: unknown = request.value
    const mode = String(request.mode || 'selector')
    if (mode === 'selector') {
      const labels = labelsOf(request.range, request.rangeKey)
      if (labels.length === 0) {
        fail('showPickerView:fail range is empty')
        return
      }
      const raw = parseInt(String(request.value ?? ''), 10)
      const current = Number.isFinite(raw) && raw >= 0 && raw < labels.length ? raw : 0
      const wheel = createWheel(doc, labels, current, (index) => {
        resultValue = String(index)
      })
      resultValue = String(current)
      body.appendChild(wheel.element)
    } else if (mode === 'multiSelector') {
      const columns = Array.isArray(request.range) ? request.range : []
      if (columns.length === 0) {
        fail('showMultiPickerView:fail range is empty')
        return
      }
      const raw = Array.isArray(request.value) ? request.value : []
      const selected: number[] = columns.map((items, index) => {
        const labels = labelsOf(Array.isArray(items) ? items : [])
        const current = Number(raw[index] ?? 0)
        return Number.isFinite(current) && current >= 0 && current < labels.length ? current : 0
      })
      columns.forEach((items, index) => {
        const labels = labelsOf(Array.isArray(items) ? items : [])
        const wheel = createWheel(doc, labels, selected[index] ?? 0, (value) => {
          selected[index] = value
          resultValue = [...selected]
        })
        body.appendChild(wheel.element)
      })
      resultValue = [...selected]
    } else if (mode === 'date') {
      const fields = String(request.fields || 'day')
      const start = parseDate(request.start) ?? { year: 1970, month: 1, day: 1 }
      const end = parseDate(request.end) ?? { year: 2999, month: 12, day: 31 }
      const current = parseDate(request.value) ?? { year: new Date().getFullYear(), month: 1, day: 1 }
      const years = range(start.year, end.year)
      let year = clamp(current.year, start.year, end.year)
      let month = clamp(current.month, 1, 12)
      let day = clamp(current.day, 1, daysInMonth(year, month))
      const sync = () => {
        resultValue = fields === 'year' ? String(year) : fields === 'month'
          ? `${year}-${String(month).padStart(2, '0')}`
          : `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      }
      let monthWheel: Wheel | null = null
      let dayWheel: Wheel | null = null
      const rebuildDays = () => {
        if (!dayWheel) return
        day = clamp(day, 1, daysInMonth(year, month))
        const days = range(1, daysInMonth(year, month)).map(String)
        const next = createWheel(doc, days, day - 1, (index) => {
          day = index + 1
          sync()
        })
        dayWheel.element.replaceWith(next.element)
        dayWheel = next
        sync()
      }
      const yearWheel = createWheel(doc, years.map(String), years.indexOf(year), (index) => {
        year = years[index] ?? year
        month = clamp(month, 1, 12)
        if (monthWheel) monthWheel.setIndex(month - 1, true)
        if (dayWheel) rebuildDays()
        sync()
      })
      body.appendChild(yearWheel.element)
      if (fields === 'month' || fields === 'day') {
        const months = range(1, 12).map(String)
        monthWheel = createWheel(doc, months, month - 1, (index) => {
          month = index + 1
          if (dayWheel) rebuildDays()
          sync()
        })
        body.appendChild(monthWheel.element)
      }
      if (fields === 'day') {
        const days = range(1, daysInMonth(year, month)).map(String)
        dayWheel = createWheel(doc, days, day - 1, (index) => {
          day = index + 1
          sync()
        })
        body.appendChild(dayWheel.element)
      }
      sync()
    } else if (mode === 'time') {
      const start = parseTime(request.start) ?? { hour: 0, minute: 0 }
      const end = parseTime(request.end) ?? { hour: 23, minute: 59 }
      const current = parseTime(request.value) ?? { hour: 12, minute: 0 }
      const hours = range(start.hour, end.hour)
      let hour = clamp(current.hour, start.hour, end.hour)
      const minutes = range(0, 59)
      let minute = clamp(current.minute, 0, 59)
      const sync = () => {
        resultValue = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      }
      const hourWheel = createWheel(doc, hours.map((value) => String(value).padStart(2, '0')), hours.indexOf(hour), (index) => {
        hour = hours[index] ?? hour
        sync()
      })
      const minuteWheel = createWheel(doc, minutes.map((value) => String(value).padStart(2, '0')), minute, (index) => {
        minute = index
        sync()
      })
      body.append(hourWheel.element, minuteWheel.element)
      sync()
    } else {
      fail(`showPickerView:fail unsupported picker mode ${mode}`)
      return
    }

    cancel.addEventListener('click', () => finish({ status: 'cancel' }))
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) finish({ status: 'cancel' })
    })
    confirm.addEventListener('click', () => finish({ status: 'ok', value: resultValue }))
    doc.body?.appendChild(overlay)
  })
}
