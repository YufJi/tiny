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
  })
})
