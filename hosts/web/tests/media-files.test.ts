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
})
