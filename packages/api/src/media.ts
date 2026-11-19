import type { ApiHost } from './context'

/**
 * Media manager stubs.
 *
 * The official demo pages create recorder/audio managers at module scope, so a
 * missing factory aborts the whole package bundle. Tiny has no audio backend;
 * the managers keep their event/property surface as a no-op and `canIUse`
 * reports them as stubs.
 */
function eventTarget(): Record<string, unknown> {
  return {
    onStart: () => undefined,
    offStart: () => undefined,
    onStop: () => undefined,
    offStop: () => undefined,
    onPause: () => undefined,
    offPause: () => undefined,
    onResume: () => undefined,
    offResume: () => undefined,
    onError: () => undefined,
    offError: () => undefined,
    onPlay: () => undefined,
    offPlay: () => undefined,
    onEnded: () => undefined,
    offEnded: () => undefined,
    onTimeUpdate: () => undefined,
    offTimeUpdate: () => undefined,
    onWaiting: () => undefined,
    offWaiting: () => undefined,
    onCanplay: () => undefined,
    offCanplay: () => undefined,
    onSeeking: () => undefined,
    offSeeking: () => undefined,
    onSeeked: () => undefined,
    offSeeked: () => undefined,
    onFrameRecorded: () => undefined,
    offFrameRecorded: () => undefined,
  }
}

function audioManager(): Record<string, unknown> {
  return {
    ...eventTarget(),
    play: () => undefined,
    pause: () => undefined,
    stop: () => undefined,
    seek: () => undefined,
    destroy: () => undefined,
    src: '',
    title: '',
    autoplay: false,
    loop: false,
    volume: 1,
    duration: 0,
    currentTime: 0,
    paused: true,
    buffered: 0,
  }
}

export function createMediaApi(): ApiHost {
  return {
    getRecorderManager: () => ({
      ...eventTarget(),
      start: () => undefined,
      stop: () => undefined,
      pause: () => undefined,
      resume: () => undefined,
    }),
    getBackgroundAudioManager: () => audioManager(),
    createInnerAudioContext: () => audioManager(),
  }
}
