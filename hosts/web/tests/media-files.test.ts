import { describe, expect, test } from 'vitest'
import {
  createMediaHandlers,
  createTempFileRegistry,
} from '../src/media-files'

function createRegistry() {
  let counter = 0
  return createTempFileRegistry(() => `blob:test/${++counter}`)
}

function file(name: string, type: string, content = 'abc') {
  return new File([content], name, { type })
}

describe('temp file registry', () => {
  test('hands out opaque urls and keeps the blob', () => {
    const registry = createRegistry()
    const entry = registry.add(file('cat.png', 'image/png'), 'cat.png')
    expect(entry.url).toBe('blob:test/1')
    expect(entry.size).toBe(3)
    expect(registry.get(entry.url)?.type).toBe('image/png')
    registry.remove(entry.url)
    expect(registry.get(entry.url)).toBeUndefined()
    expect(registry.list()).toHaveLength(0)
  })
})

describe('media handlers', () => {
  test('chooseImage returns temp paths from the chooser', async () => {
    const registry = createRegistry()
    const handlers = createMediaHandlers({
      registry,
      pick: async () => [file('a.png', 'image/png'), file('b.png', 'image/png')],
    })
    const result = await handlers['media.chooseImage']({ count: 9 })
    expect(result.errMsg).toBe('chooseImage:ok')
    expect(result.tempFilePaths).toEqual(['blob:test/1', 'blob:test/2'])
    expect(result.tempFiles).toEqual([
      { path: 'blob:test/1', size: 3 },
      { path: 'blob:test/2', size: 3 },
    ])
  })

  test('chooseImage fails on cancel instead of returning an empty success', async () => {
    const handlers = createMediaHandlers({ registry: createRegistry(), pick: async () => [] })
    await expect(handlers['media.chooseImage']({})).resolves.toEqual({
      errMsg: 'chooseImage:fail cancel',
    })
  })

  test('chooseMedia reports image, video and mix', async () => {
    const pickImage = createMediaHandlers({
      registry: createRegistry(),
      pick: async () => [file('a.png', 'image/png')],
    })
    await expect(pickImage['media.chooseMedia']({})).resolves.toMatchObject({ type: 'image' })

    const pickMix = createMediaHandlers({
      registry: createRegistry(),
      pick: async () => [file('a.png', 'image/png'), file('b.mp4', 'video/mp4')],
    })
    await expect(pickMix['media.chooseMedia']({})).resolves.toMatchObject({ type: 'mix' })
  })

  test('previewImage and getImageInfo fail honestly without a document', async () => {
    const handlers = createMediaHandlers({ registry: createRegistry() })
    expect(handlers['media.previewImage']({ urls: ['blob:1'] })).toEqual({
      errMsg: 'previewImage:fail no document',
    })
    await expect(handlers['media.getImageInfo']({ src: 'blob:1' })).resolves.toEqual({
      errMsg: 'getImageInfo:fail image decoding is not available in this runtime',
    })
  })

  test('chooseVideo reads metadata through the injected loader', async () => {
    const registry = createRegistry()
    const handlers = createMediaHandlers({
      registry,
      pick: async () => [file('clip.mp4', 'video/mp4', 'video-bytes')],
      loadVideo: async () => ({ duration: 12.5, width: 1280, height: 720 }),
    })
    const result = await handlers['media.chooseVideo']({ maxDuration: 60 })
    expect(result).toMatchObject({
      tempFilePath: 'blob:test/1',
      duration: 12.5,
      width: 1280,
      height: 720,
      size: 11,
      errMsg: 'chooseVideo:ok',
    })
    expect(registry.get('blob:test/1')?.type).toBe('video/mp4')
  })

  test('chooseVideo fails when metadata cannot be read', async () => {
    const handlers = createMediaHandlers({
      registry: createRegistry(),
      pick: async () => [file('clip.mp4', 'video/mp4')],
      loadVideo: async () => { throw new Error('bad container') },
    })
    await expect(handlers['media.chooseVideo']({})).resolves.toEqual({
      errMsg: 'chooseVideo:fail bad container',
    })
  })

  test('getVideoInfo reports the loader result', async () => {
    const handlers = createMediaHandlers({
      registry: createRegistry(),
      loadVideo: async () => ({ duration: 2, width: 320, height: 240 }),
    })
    await expect(handlers['media.getVideoInfo']({ src: 'blob:1' })).resolves.toMatchObject({
      width: 320,
      height: 240,
      duration: 2,
      type: 'video/mp4',
      errMsg: 'getVideoInfo:ok',
    })
  })

  test('album saves and media preview fail without a document', async () => {
    const handlers = createMediaHandlers({ registry: createRegistry() })
    expect(handlers['media.saveImageToPhotosAlbum']({ filePath: 'blob:1' })).toEqual({
      errMsg: 'saveImageToPhotosAlbum:fail no document',
    })
    expect(handlers['media.previewMedia']({ sources: [{ url: 'blob:1' }] })).toEqual({
      errMsg: 'previewMedia:fail no document',
    })
  })
})
