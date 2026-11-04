export type WebPickerRequest = {
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

export type WebPickerResult =
  | { status: 'ok'; value: unknown }
  | { status: 'cancel' }
  | { status: 'error'; errMsg: string }

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

const BODY_STYLE = [
  'display:flex',
  'flex:1',
  'min-height:0',
  'overflow:hidden',
  'padding:8px 0',
].join(';')

function labelsOf(range: unknown[], rangeKey?: string): string[] {
  return range.map((item) => {
    if (rangeKey && item && typeof item === 'object') {
      return String((item as Record<string, unknown>)[rangeKey] ?? '')
    }
    return String(item ?? '')
  })
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

function createColumn(doc: Document, labels: string[], selected: (index: number) => void, current: number): {
  element: HTMLDivElement
  render: (next: number) => void
} {
  const element = doc.createElement('div')
  element.className = 'tiny-picker-host-column'
  element.style.cssText = [
    'flex:1',
    'overflow-y:auto',
    'overscroll-behavior:contain',
    'text-align:center',
  ].join(';')
  let active = current
  const items = labels.map((label, index) => {
    const item = doc.createElement('div')
    item.className = 'tiny-picker-host-option'
    item.textContent = label
    item.style.cssText = [
      'cursor:pointer',
      'font-size:16px',
      'height:44px',
      'line-height:44px',
      'overflow:hidden',
      'padding:0 8px',
      'text-overflow:ellipsis',
      'white-space:nowrap',
    ].join(';')
    item.addEventListener('click', () => {
      active = index
      render(active)
      selected(index)
    })
    element.appendChild(item)
    return item
  })
  const render = (next: number) => {
    items.forEach((item, index) => {
      item.style.color = index === next ? '#07c160' : '#000'
      item.style.fontWeight = index === next ? '600' : '400'
    })
    const target = items[next]
    if (target) {
      const top = target.offsetTop - element.clientHeight / 2 + target.offsetHeight / 2
      if (typeof element.scrollTo === 'function') element.scrollTo({ top: Math.max(0, top) })
      else element.scrollTop = Math.max(0, top)
    }
  }
  render(active)
  return { element, render }
}

/**
 * Browser implementation of the host picker popover used by `<picker>`.
 *
 * The picker component never renders its own overlay: it passes mode/value/range
 * to this host API and awaits the selected value, mirroring WeChat's
 * WeixinJSBridge showPickerView/showDatePickerView calls.
 */
export function showWebPicker(
  request: WebPickerRequest,
  doc: Document = document,
): Promise<WebPickerResult> {
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
    body.style.cssText = BODY_STYLE
    panel.append(header, body)
    overlay.appendChild(panel)

    const previousOverflow = doc.body?.style.overflow
    if (doc.body) doc.body.style.overflow = 'hidden'
    const finish = (result: WebPickerResult) => {
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
      const picker = createColumn(doc, labels, (index) => {
        resultValue = String(index)
      }, current)
      resultValue = String(current)
      body.appendChild(picker.element)
    } else if (mode === 'multiSelector') {
      const columns = Array.isArray(request.range) ? request.range : []
      if (columns.length === 0) {
        fail('showMultiPickerView:fail range is empty')
        return
      }
      const raw = Array.isArray(request.value) ? request.value : []
      const next: number[] = columns.map((column, index) => {
        const labels = labelsOf(Array.isArray(column) ? column : [])
        const current = Number(raw[index] ?? 0)
        return Number.isFinite(current) && current >= 0 && current < labels.length ? current : 0
      })
      columns.forEach((items, index) => {
        const labels = labelsOf(Array.isArray(items) ? items : [])
        const picker = createColumn(doc, labels, (selected) => {
          next[index] = selected
          resultValue = [...next]
        }, next[index] ?? 0)
        body.appendChild(picker.element)
      })
      resultValue = [...next]
    } else if (mode === 'date' || mode === 'time') {
      const input = doc.createElement('input')
      input.className = 'tiny-picker-host-input'
      input.type = mode
      input.value = String(request.value ?? '')
      if (request.start && mode === 'date') input.min = String(request.start)
      if (request.end && mode === 'date') input.max = String(request.end)
      input.style.cssText = [
        'border:0',
        'font-size:18px',
        'margin:auto',
        'outline:0',
        'padding:12px',
        'text-align:center',
        'width:100%',
      ].join(';')
      body.appendChild(input)
      resultValue = input.value
    } else {
      fail(`showPickerView:fail unsupported picker mode ${mode}`)
      return
    }

    cancel.addEventListener('click', () => finish({ status: 'cancel' }))
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) finish({ status: 'cancel' })
    })
    confirm.addEventListener('click', () => {
      if (mode === 'date' || mode === 'time') {
        resultValue = (body.querySelector('input') as HTMLInputElement | null)?.value ?? ''
        if (!resultValue) {
          fail('showDatePickerView:fail invalid value')
          return
        }
      }
      finish({ status: 'ok', value: resultValue })
    })
    doc.body?.appendChild(overlay)
  })
}
