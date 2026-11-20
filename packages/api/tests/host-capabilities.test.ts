import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'
import { API_CATALOG } from '../src/catalog'

/**
 * Host capability lists drift silently: a Swift `case` without an advertised
 * key makes `canIUse` answer false on iOS, and a catalog `host` with a typo
 * reaches no host at all. These tests read the host sources directly.
 */

const root = new URL('../../../', import.meta.url)
const read = (path: string): string => readFileSync(new URL(path, root), 'utf8')

const BROWSER_SOURCES = [
  'tests/host/src/host-api.ts',
  'apps/devtool/src/host-api.ts',
  'hosts/web/src/media-files.ts',
  'hosts/web/src/network-tasks.ts',
  'hosts/web/src/file-system.ts',
  'hosts/web/src/sensors.ts',
  'hosts/web/src/workers.ts',
  'hosts/web/src/audio.ts',
  'hosts/web/src/recorder.ts',
  'hosts/web/src/socket.ts',
  'hosts/web/src/device-extras.ts',
  'hosts/web/src/host-env.ts',
  'hosts/web/src/page-introspection.ts',
  'hosts/web/src/keyboard-events.ts',
  'hosts/web/src/scan.ts',
]

function quotedHandlerKeys(source: string): Set<string> {
  return new Set(
    [...source.matchAll(/'([a-z][a-zA-Z]*(?:\.[a-zA-Z]+)?)'\s*:/g)].map((match) => match[1]!),
  )
}

function rustHandlerKeys(): Set<string> {
  const source = read('native/host-core/src/host/core.rs')
  return new Set([...source.matchAll(/"([a-z][a-zA-Z]*\.[a-zA-Z]+)"/g)].map((match) => match[1]!))
}

function swiftHandlerKeys(): Set<string> {
  const source = read('ios/TinyHost/HostCoreRuntime.swift')
  return new Set(
    [...source.matchAll(/case "([a-zA-Z][a-zA-Z0-9.]*)":/g)].map((match) => match[1]!),
  )
}

function declaredIOSCapabilities(): Set<string> {
  const source = read('hosts/ios/src/service/start.ts')
  const body = source.slice(
    source.indexOf('const IOS_HOST_API_KEYS = ['),
    source.indexOf(']', source.indexOf('const IOS_HOST_API_KEYS = [')),
  )
  return new Set([...body.matchAll(/'([^']+)'/g)].map((match) => match[1]!))
}

describe('host capability lists', () => {
  test('every browser host key in the catalog has a handler', () => {
    const handlers = new Set<string>()
    for (const path of BROWSER_SOURCES) {
      for (const key of quotedHandlerKeys(read(path))) handlers.add(key)
    }
    for (const key of rustHandlerKeys()) handlers.add(key)
    for (const [name, descriptor] of Object.entries(API_CATALOG)) {
      const host = (descriptor as { host?: string }).host
      if (!host) continue
      expect(handlers.has(host), `${name} expects ${host}, no web host implements it`).toBe(true)
    }
  })

  test('the iOS capability list matches the native handlers', () => {
    const declared = declaredIOSCapabilities()
    const native = new Set([...swiftHandlerKeys(), ...rustHandlerKeys()])
    // Every advertised key is really answered by Swift or the Rust core.
    for (const key of declared) {
      expect(native.has(key), `${key} is advertised on iOS but has no handler`).toBe(true)
    }
    // Every api-shaped Swift case is advertised, so canIUse cannot under-report.
    for (const key of swiftHandlerKeys()) {
      if (!key.includes('.') && key !== 'login') continue
      expect(declared.has(key), `${key} has a Swift handler but is missing from IOS_HOST_API_KEYS`).toBe(true)
    }
  })
})
