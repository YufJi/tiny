import type { RuntimeManifest } from '@tiny/runtime'

/**
 * One compiled fixture in the shared artifact tree.
 *
 * `scripts/compile-apps.mjs` writes `<root>/apps/<id>/generated` plus a
 * `<root>/apps.json` registry. The debugger reads the same tree through its
 * `/runtime` middleware, so both hosts agree on this layout.
 */
export type TestAppEntry = {
  id: string
  label?: string
  title?: string
  pages?: number
  firstPage?: string
}

const REGISTRY_URL = '/generated/apps.json'

/** URL base of one fixture's compiled artifacts. */
export function generatedBaseFor(appId: string): string {
  return `/generated/apps/${encodeURIComponent(appId)}/generated`
}

export async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(
      `${url} responded with HTTP ${response.status}. ` +
        'Compile the fixtures first (pnpm compile:glass-easel or pnpm accept:glass-easel).',
    )
  }
  return response.json() as Promise<T>
}

/** The `?app=` the host parent passed to this thread document. */
export function currentAppId(): string {
  const appId = new URLSearchParams(window.location.search).get('app')
  if (!appId) throw new Error('missing ?app= in the thread URL; the host must select a fixture')
  return appId
}

/**
 * Import a compiled artifact at runtime.
 *
 * The path depends on `?app=`, so it cannot be a static import; `new Function`
 * keeps Vite from trying to analyze the dynamic specifier.
 */
export function importGenerated<T = { default: unknown }>(url: string): Promise<T> {
  return new Function('url', 'return import(url)')(url) as Promise<T>
}

/** Resolve the requested fixture, defaulting to the first registry entry. */
export async function resolveTestApp(requested: string | null | undefined): Promise<{
  app: TestAppEntry
  base: string
  manifest: RuntimeManifest
}> {
  const payload = await fetchJson<{ apps?: TestAppEntry[] }>(REGISTRY_URL)
  const apps = Array.isArray(payload.apps)
    ? payload.apps.filter((entry) => entry && typeof entry.id === 'string' && entry.id.length > 0)
    : []
  if (apps.length === 0) throw new Error(`${REGISTRY_URL} lists no compiled fixtures`)

  const appId = requested || apps[0].id
  const app = apps.find((entry) => entry.id === appId)
  if (!app) {
    throw new Error(
      `unknown test app "${appId}"; compiled fixtures: ${apps.map((entry) => entry.id).join(', ')}`,
    )
  }
  const base = generatedBaseFor(app.id)
  const manifest = await fetchJson<RuntimeManifest>(`${base}/manifest.json`)
  return { app, base, manifest }
}
