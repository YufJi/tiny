import type { HostApiHandlers } from '@tiny/runtime'
import { BROWSER_RUNTIME_NAMES } from './naming'

const OVERLAY_ID = BROWSER_RUNTIME_NAMES.apiOverlayId
const STYLE_ID = BROWSER_RUNTIME_NAMES.apiOverlayStyleId

let loadingElement: HTMLElement | null = null
let toastElement: HTMLElement | null = null

/**
 * Browser implementations for the host-side wx APIs.
 *
 * These run in the host realm (the page that owns the iframes), so DOM,
 * fetch, clipboard and navigator access stay out of the core runtime.
 */
export function createBrowserApiHandlers(): HostApiHandlers {
  return {
    'network.request': (params) => request(params),
    'network.type': () => ({ networkType: networkType(), errMsg: 'getNetworkType:ok' }),
    'battery.get': () => batteryInfo(),
    'clipboard.set': (params) => setClipboard(String(params.data ?? '')),
    'clipboard.get': () => getClipboard(),
    'device.vibrate': (params) => vibrate(Number(params.duration ?? 15)),
    'settings.get': () => ({ authSetting: {}, errMsg: 'getSetting:ok' }),
    'settings.open': () => ({ authSetting: {}, errMsg: 'openSetting:ok' }),
    'login': () => ({ code: createLoginCode(), errMsg: 'login:ok' }),
    'toast.show': (params) => showToast(params),
    'ui.toast': (params) => showToast(params),
    'ui.hideToast': () => hideToast(),
    'profile.get': () => ({
      userInfo: {
        nickName: 'Tiny User',
        avatarUrl: '',
        gender: 0,
        country: '',
        province: '',
        city: '',
        language: 'zh_CN',
      },
      rawData: '{}',
      signature: '',
      encryptedData: '',
      iv: '',
      errMsg: 'getUserProfile:ok',
    }),
    'navigation.title': (params) => {
      if (typeof document !== 'undefined') document.title = String(params.title ?? '')
      return { errMsg: 'setNavigationBarTitle:ok' }
    },
    'ui.loading': (params) => showLoading(params),
    'ui.hideLoading': () => hideLoading(),
    'ui.modal': (params) => showModal(params),
    'ui.actionSheet': (params) => showActionSheet(params),
    'share.menu': (params) => ({ errMsg: `${String(params.action ?? 'share')}:ok` }),
  }
}

async function request(params: Record<string, unknown>): Promise<Record<string, unknown>> {
  const url = String(params.url ?? '')
  if (!url) throw new Error('request:fail url is required')
  const method = String(params.method ?? 'GET').toUpperCase()
  const headers = (params.header ?? {}) as Record<string, string>
  const timeout = Number(params.timeout ?? 60_000)
  const controller = typeof AbortController === 'undefined' ? undefined : new AbortController()
  const timer = controller ? setTimeout(() => controller.abort(), timeout) : undefined
  try {
    let requestUrl = url
    let body: BodyInit | undefined
    if (method === 'GET' && params.data && typeof params.data === 'object') {
      const query = new URLSearchParams()
      for (const [key, value] of Object.entries(params.data as Record<string, unknown>)) {
        query.set(key, String(value))
      }
      requestUrl += (requestUrl.includes('?') ? '&' : '?') + query.toString()
    } else if (params.data !== undefined) {
      body = typeof params.data === 'string' ? params.data : JSON.stringify(params.data)
      if (!headers['content-type'] && !headers['Content-Type']) headers['content-type'] = 'application/json'
    }
    const response = await fetch(requestUrl, {
      method,
      headers,
      body,
      signal: controller?.signal,
    })
    const contentType = response.headers.get('content-type') ?? ''
    const dataType = String(params.dataType ?? 'json')
    let data: unknown
    if (params.responseType === 'arraybuffer') {
      data = Array.from(new Uint8Array(await response.arrayBuffer()))
    } else if (dataType === 'json' || contentType.includes('application/json')) {
      const text = await response.text()
      try {
        data = text ? JSON.parse(text) : null
      } catch {
        data = text
      }
    } else {
      data = await response.text()
    }
    const header: Record<string, string> = {}
    response.headers.forEach((value, key) => { header[key] = value })
    return {
      statusCode: response.status,
      header,
      data,
      errMsg: 'request:ok',
    }
  } catch (error) {
    const message = error instanceof Error && error.name === 'AbortError'
      ? 'request:fail timeout'
      : `request:fail ${error instanceof Error ? error.message : String(error)}`
    throw new Error(message)
  } finally {
    if (timer) clearTimeout(timer)
  }
}

function networkType(): string {
  if (typeof navigator === 'undefined' || navigator.onLine === false) return 'none'
  const connection = (navigator as Navigator & { connection?: { type?: string; effectiveType?: string } }).connection
  const raw = connection?.type ?? connection?.effectiveType ?? 'wifi'
  if (raw === 'none' || raw === 'offline') return 'none'
  if (raw === 'wifi' || raw === 'ethernet') return 'wifi'
  if (raw.includes('4g')) return '4g'
  if (raw.includes('3g')) return '3g'
  if (raw.includes('2g')) return '2g'
  return 'wifi'
}

async function batteryInfo(): Promise<Record<string, unknown>> {
  const getBattery = (navigator as Navigator & {
    getBattery?: () => Promise<{ level: number; charging: boolean }>
  } | undefined)?.getBattery
  if (typeof getBattery === 'function') {
    const battery = await getBattery.call(navigator)
    return {
      level: Math.round(battery.level * 100),
      isCharging: battery.charging,
      errMsg: 'getBatteryInfo:ok',
    }
  }
  return { level: 100, isCharging: true, errMsg: 'getBatteryInfo:ok' }
}

async function setClipboard(data: string): Promise<Record<string, unknown>> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(data)
  } else if (typeof document !== 'undefined') {
    const textarea = document.createElement('textarea')
    textarea.value = data
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    textarea.remove()
  }
  return { errMsg: 'setClipboardData:ok' }
}

async function getClipboard(): Promise<Record<string, unknown>> {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.readText) {
    throw new Error('getClipboardData:fail clipboard unavailable')
  }
  return { data: await navigator.clipboard.readText(), errMsg: 'getClipboardData:ok' }
}

function vibrate(duration: number): Record<string, unknown> {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    navigator.vibrate(Math.max(1, duration))
  }
  return { errMsg: 'vibrateShort:ok' }
}

function createLoginCode(): string {
  return `tiny-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function ensureOverlay(): HTMLElement {
  if (typeof document === 'undefined') throw new Error('UI API requires a DOM host')
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = `
      #${OVERLAY_ID}{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;pointer-events:none;font-family:system-ui,sans-serif}
      #${OVERLAY_ID} .tiny-api-mask{position:absolute;inset:0;background:rgba(0,0,0,.45);pointer-events:auto}
      #${OVERLAY_ID} .tiny-api-panel{position:relative;pointer-events:auto;min-width:260px;max-width:82vw;border-radius:12px;background:#fff;color:#111;padding:20px;box-shadow:0 16px 48px rgba(0,0,0,.28)}
      #${OVERLAY_ID} .tiny-api-title{font-size:16px;font-weight:600;margin-bottom:8px;text-align:center}
      #${OVERLAY_ID} .tiny-api-content{font-size:14px;line-height:1.5;color:#555;text-align:center;white-space:pre-wrap}
      #${OVERLAY_ID} .tiny-api-actions{display:flex;gap:12px;margin-top:20px}
      #${OVERLAY_ID} button{flex:1;border:0;border-radius:8px;padding:10px 14px;font-size:14px;cursor:pointer;background:#f2f2f2;color:#333}
      #${OVERLAY_ID} button.primary{background:#07c160;color:#fff}
      #${OVERLAY_ID} .tiny-api-loading{position:relative;pointer-events:auto;background:rgba(0,0,0,.72);color:#fff;border-radius:10px;padding:18px 24px;font-size:14px}
      #${OVERLAY_ID} .tiny-api-toast{position:fixed;left:50%;bottom:12vh;transform:translateX(-50%);background:rgba(0,0,0,.75);color:#fff;border-radius:8px;padding:10px 16px;font-size:14px;pointer-events:none}
    `
    document.head.appendChild(style)
  }
  let root = document.getElementById(OVERLAY_ID)
  if (!root) {
    root = document.createElement('div')
    root.id = OVERLAY_ID
    document.body.appendChild(root)
  }
  return root
}

function showToast(params: Record<string, unknown>): { errMsg: string } {
  const root = ensureOverlay()
  const toast = document.createElement('div')
  toast.className = 'tiny-api-toast'
  toast.textContent = String(params.title ?? '')
  root.appendChild(toast)
  toastElement = toast
  const duration = Math.max(500, Number(params.duration ?? 1500))
  setTimeout(() => {
    toast.remove()
    if (toastElement === toast) toastElement = null
  }, duration)
  return { errMsg: 'showToast:ok' }
}

function showLoading(params: Record<string, unknown>): { errMsg: string } {
  hideLoading()
  const root = ensureOverlay()
  const mask = document.createElement('div')
  mask.className = 'tiny-api-mask'
  const panel = document.createElement('div')
  panel.className = 'tiny-api-loading'
  panel.textContent = String(params.title ?? '')
  root.appendChild(mask)
  root.appendChild(panel)
  loadingElement = root
  return { errMsg: 'showLoading:ok' }
}

function hideToast(): { errMsg: string } {
  toastElement?.remove()
  toastElement = null
  return { errMsg: 'hideToast:ok' }
}

function hideLoading(): { errMsg: string } {
  if (loadingElement) {
    loadingElement.innerHTML = ''
    loadingElement = null
  }
  return { errMsg: 'hideLoading:ok' }
}

function showModal(params: Record<string, unknown>): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    const root = ensureOverlay()
    const previous = root.innerHTML
    const mask = document.createElement('div')
    mask.className = 'tiny-api-mask'
    const panel = document.createElement('div')
    panel.className = 'tiny-api-panel'
    const title = document.createElement('div')
    title.className = 'tiny-api-title'
    title.textContent = String(params.title ?? '')
    const content = document.createElement('div')
    content.className = 'tiny-api-content'
    content.textContent = String(params.content ?? '')
    const actions = document.createElement('div')
    actions.className = 'tiny-api-actions'
    const close = (confirm: boolean) => {
      root.innerHTML = previous
      resolve({ confirm, cancel: !confirm, errMsg: 'showModal:ok' })
    }
    if (params.showCancel !== false) {
      const cancel = document.createElement('button')
      cancel.textContent = String(params.cancelText ?? '取消')
      cancel.onclick = () => close(false)
      actions.appendChild(cancel)
    }
    const confirm = document.createElement('button')
    confirm.className = 'primary'
    confirm.textContent = String(params.confirmText ?? '确定')
    confirm.onclick = () => close(true)
    actions.appendChild(confirm)
    panel.append(title, content, actions)
    root.append(mask, panel)
  })
}

function showActionSheet(params: Record<string, unknown>): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    const root = ensureOverlay()
    const previous = root.innerHTML
    const mask = document.createElement('div')
    mask.className = 'tiny-api-mask'
    const panel = document.createElement('div')
    panel.className = 'tiny-api-panel'
    const title = document.createElement('div')
    title.className = 'tiny-api-title'
    title.textContent = String(params.title ?? '')
    panel.appendChild(title)
    const actions = document.createElement('div')
    actions.className = 'tiny-api-actions'
    actions.style.flexDirection = 'column'
    const items = Array.isArray(params.itemList) ? params.itemList : []
    const close = (tapIndex: number) => {
      root.innerHTML = previous
      resolve({ tapIndex, errMsg: 'showActionSheet:ok' })
    }
    items.forEach((item, index) => {
      const button = document.createElement('button')
      button.textContent = String(item)
      button.onclick = () => close(index)
      actions.appendChild(button)
    })
    const cancel = document.createElement('button')
    cancel.textContent = String(params.cancelText ?? '取消')
    cancel.onclick = () => resolve({ tapIndex: -1, errMsg: 'showActionSheet:fail cancel' })
    actions.appendChild(cancel)
    panel.appendChild(actions)
    root.append(mask, panel)
  })
}
