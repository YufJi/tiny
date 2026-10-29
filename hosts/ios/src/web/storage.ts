import { postControl } from './native'

type StorageReply = {
  ok?: boolean
  value?: unknown
  error?: string
}

let nextRequestId = 1
const pending = new Map<number, {
  resolve: (value: unknown) => void
  reject: (error: Error) => void
}>()

const tinyWindow = window as Window & {
  __tinyStorageResult?: (requestId: number, result: StorageReply) => void
}

tinyWindow.__tinyStorageResult = (requestId, result) => {
  const entry = pending.get(Number(requestId))
  if (!entry) return
  pending.delete(Number(requestId))
  if (result?.ok) entry.resolve(result.value ?? null)
  else entry.reject(new Error(result?.error ?? 'storage request failed'))
}

function request(action: string, params: Record<string, unknown> = {}): Promise<unknown> {
  const requestId = nextRequestId
  nextRequestId += 1
  return new Promise((resolve, reject) => {
    pending.set(requestId, { resolve, reject })
    postControl({ type: 'storage', requestId, action, ...params })
    window.setTimeout(() => {
      const entry = pending.get(requestId)
      if (!entry) return
      pending.delete(requestId)
      entry.reject(new Error(`storage request timed out: ${action}`))
    }, 5000)
  })
}

function normalizeValue(value: unknown): unknown {
  return value === null ? undefined : value
}

export async function readStorageSnapshot(): Promise<Record<string, unknown>> {
  const value = await request('all')
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

export const storageApiHandlers = {
  'storage.get': async (params: Record<string, unknown>) => ({
    value: normalizeValue(await request('get', { key: String(params.key) })),
  }),
  'storage.set': async (params: Record<string, unknown>) => {
    await request('set', { key: String(params.key), value: params.value })
    return { errMsg: 'setStorageSync:ok' }
  },
  'storage.remove': async (params: Record<string, unknown>) => {
    await request('remove', { key: String(params.key) })
    return { errMsg: 'removeStorageSync:ok' }
  },
  'storage.clear': async () => {
    await request('clear')
    return { errMsg: 'clearStorageSync:ok' }
  },
  'storage.info': async () => request('info') as Promise<Record<string, unknown>>,
}
