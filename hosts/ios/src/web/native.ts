export type InjectedSystem = {
  pixelRatio?: number
  windowWidth?: number
  windowHeight?: number
  screenWidth?: number
  screenHeight?: number
  statusBarHeight?: number
  safeArea?: {
    top: number
    left: number
    right: number
    bottom: number
  }
  platform?: string
  system?: string
  model?: string
  brand?: string
  language?: string
  version?: string
  SDKVersion?: string
  theme?: 'light' | 'dark'
}

export type InjectedConfig = {
  appId: string
  smoke?: boolean
  system?: InjectedSystem
  menuButton?: {
    width: number
    height: number
    top: number
    right: number
    bottom: number
    left: number
  }
}

type WebkitMessageHandler = {
  postMessage(message: unknown): void
}

type TinyWindow = Window & {
  __TINY_IOS__?: InjectedConfig
  __TINY_IOS_MOCK__?: {
    postControl?: (message: unknown) => void
    postFrame?: (frame: string) => void
  }
  webkit?: {
    messageHandlers?: {
      tinyControl?: WebkitMessageHandler
      tinyService?: WebkitMessageHandler
    }
  }
  __tinyServiceReady?: () => void
  __tinyHostReceive?: (frame: string) => void
  __tinyStorageResult?: (requestId: number, result: unknown) => void
  __tinyHostConsole?: (level: string, message: string) => void
  __tinyHostCommand?: (command: Record<string, unknown>) => Promise<unknown>
  __tinyCanvasCommand?: (payload: string | Record<string, unknown>) => void
}

const tinyWindow = window as TinyWindow

export function getInjectedConfig(): InjectedConfig {
  if (tinyWindow.__TINY_IOS__) return tinyWindow.__TINY_IOS__
  const params = new URLSearchParams(window.location.search)
  return {
    appId: params.get('app') ?? '',
    system: {
      pixelRatio: window.devicePixelRatio || 2,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      screenWidth: window.screen?.width ?? window.innerWidth,
      screenHeight: window.screen?.height ?? window.innerHeight,
      platform: 'web',
      system: 'WebKit',
      model: 'Browser',
      brand: 'WebKit',
      language: navigator.language?.replace('-', '_') ?? 'en',
      version: '1.0',
      SDKVersion: '3.0.0',
      theme: 'light',
    },
  }
}

export function hasNativeBridge(): boolean {
  return Boolean(tinyWindow.webkit?.messageHandlers?.tinyControl)
}

export function postControl(message: unknown): void {
  const handler = tinyWindow.webkit?.messageHandlers?.tinyControl
  if (handler) {
    handler.postMessage(message)
    return
  }
  tinyWindow.__TINY_IOS_MOCK__?.postControl?.(message)
}

export function postServiceFrame(frame: unknown): void {
  const handler = tinyWindow.webkit?.messageHandlers?.tinyService
  if (handler) {
    handler.postMessage({ type: 'frame', frame: JSON.stringify(frame) })
    return
  }
  tinyWindow.__TINY_IOS_MOCK__?.postFrame?.(JSON.stringify(frame))
}

export function postHostReady(): void {
  postControl({ type: 'hostReady' })
}

export function postHostError(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error)
  postControl({ type: 'error', message })
}

export function postHostLog(level: string, message: string): void {
  postControl({ type: 'console', level, message })
}

export { tinyWindow }
