import type { ApiContext, ApiHost } from './context'
import { callHost, runApi } from './run-api'

/**
 * Legacy voice playback (`wx.playVoice`/`pauseVoice`/`stopVoice`).
 *
 * They play a local file through the host's audio element, the same way the
 * old API worked before `wx.createInnerAudioContext`. Only one voice clip plays
 * at a time.
 */
export function createVoiceApi(context: ApiContext): ApiHost {
  return {
    playVoice: (params: unknown = {}) => runApi(params, 'playVoice', () => callHost(
      context,
      'voice.play',
      { filePath: String((params as { filePath?: unknown }).filePath ?? '') },
    )),
    pauseVoice: (params: unknown = {}) => runApi(params, 'pauseVoice', () => callHost(context, 'voice.pause')),
    stopVoice: (params: unknown = {}) => runApi(params, 'stopVoice', () => callHost(context, 'voice.stop')),
    startRecord: (params: unknown = {}) => runApi(params, 'startRecord', () => callHost(
      context,
      'voice.startRecord',
      { duration: Number((params as { duration?: unknown }).duration ?? 60) },
    )),
    stopRecord: (params: unknown = {}) => runApi(params, 'stopRecord', async () => {
      const result = await callHost(context, 'voice.stopRecord') as Record<string, unknown>
      return { ...result, errMsg: 'stopRecord:ok' }
    }),
  }
}
