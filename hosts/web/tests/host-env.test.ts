import { describe, expect, test } from 'vitest'
import { createEnvHandlers } from '../src/host-env'

describe('host environment', () => {
  test('reports ext config, user agent and HEVC support', () => {
    const handlers = createEnvHandlers({
      userAgent: 'TinyTest/1.0',
      canPlayHevc: () => true,
    })
    expect(handlers['account.extConfig']({})).toEqual({})
    expect(handlers['env.userAgent']({})).toEqual({ userAgent: 'TinyTest/1.0' })
    expect(handlers['media.hevcSupport']({})).toEqual({ supportHevc: true, hevcHardware: true })
  })

  test('authorization starts as not determined', () => {
    const handlers = createEnvHandlers({ permissions: undefined })
    expect(handlers['permissions.setting']({})).toMatchObject({
      albumAuthorized: 'not determined',
      cameraAuthorized: 'not determined',
      locationAuthorized: 'not determined',
      locationReducedAccuracy: false,
    })
  })

  test('permission states feed the authorization snapshot', async () => {
    const statuses = new Map<string, { state: string; onchange: (() => void) | null }>()
    const handlers = createEnvHandlers({
      permissions: {
        query: async ({ name }) => {
          const status = { state: 'granted', onchange: null as (() => void) | null }
          statuses.set(name, status)
          return status
        },
      },
    })
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
    expect(handlers['permissions.setting']({})).toMatchObject({
      locationAuthorized: 'authorized',
      cameraAuthorized: 'authorized',
    })

    const location = statuses.get('geolocation')
    location!.state = 'denied'
    location!.onchange?.()
    expect(handlers['permissions.setting']({})).toMatchObject({ locationAuthorized: 'denied' })
  })
})
