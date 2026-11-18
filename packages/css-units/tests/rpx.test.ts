import { describe, expect, test } from 'vitest'
import { RPX_RATIO, convertRpx } from '../src'

describe('convertRpx', () => {
  test('uses the fixed 750 ratio', () => {
    expect(RPX_RATIO).toBe(750)
    expect(convertRpx('75rpx')).toBe('10vw')
    expect(convertRpx('width: 1rpx; height: -1rpx')).toBe('width: 0.133333vw; height: -0.133333vw')
  })

  test('leaves non-rpx units and ordinary text intact', () => {
    expect(convertRpx('10px 10vw 1rpx')).toBe('10px 10vw 0.133333vw')
    expect(convertRpx('10rpxx 10RPX')).toBe('10rpxx 10RPX')
    expect(convertRpx('content: "100rpx"; font: 12px/1.5')).toBe('content: "100rpx"; font: 12px/1.5')
  })

  test('does not touch quoted strings or url() payloads (P0-6)', () => {
    expect(convertRpx("background-image: url('/assets/icon-10rpx.png') ; width: 10rpx"))
      .toBe("background-image: url('/assets/icon-10rpx.png') ; width: 1.33333vw")
    expect(convertRpx('background: url( "/a-10rpx.png" ) 100rpx')).toBe('background: url( "/a-10rpx.png" ) 13.3333vw')
    expect(convertRpx('content: "100rpx"; content: \'20rpx\'')).toBe('content: "100rpx"; content: \'20rpx\'')
    expect(convertRpx('/* 100rpx */ width: 100rpx')).toBe('/* 100rpx */ width: 13.3333vw')
  })

  test('converts inside calc() and keeps identifiers intact', () => {
    expect(convertRpx('width: calc(100rpx + 10px)')).toBe('width: calc(13.3333vw + 10px)')
    expect(convertRpx('--icon-10rpx: 100rpx')).toBe('--icon-10rpx: 13.3333vw')
    expect(convertRpx('transition: transform 0.3s; margin: -20rpx')).toBe('transition: transform 0.3s; margin: -2.66667vw')
  })
})
