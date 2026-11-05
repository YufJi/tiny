import { describe, expect, test } from 'vitest'
import { normalizeTransportDiagnostic } from '../src/diagnostics'

describe('transport diagnostics', () => {
  test('uses the transport level when no severity is provided', () => {
    expect(normalizeTransportDiagnostic({}, 'service', undefined, 'warn').severity).toBe('warning')
    expect(normalizeTransportDiagnostic({}, 'service', undefined, 'log').severity).toBe('info')
    expect(normalizeTransportDiagnostic({}, 'service', undefined, 'error').severity).toBe('error')
  })

  test('keeps an explicit severity', () => {
    expect(normalizeTransportDiagnostic({ severity: 'state' }, 'service', undefined, 'warn').severity).toBe('state')
  })
})
