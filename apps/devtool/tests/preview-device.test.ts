import { describe, expect, test } from 'vitest'
import {
  PREVIEW_DEVICE,
  previewContentHeight,
  previewContentInsets,
  previewMenuButtonRect,
  previewSystemInfo,
} from '../src/previewDevice'

describe('preview device geometry', () => {
  test('reserves host chrome only for default navigation', () => {
    expect(previewContentHeight({ customNavigation: false })).toBe(724)
    expect(previewContentHeight({ customNavigation: true })).toBe(812)
  })

  test('reserves the tab bar in both navigation modes', () => {
    expect(previewContentHeight({
      customNavigation: false,
      tabBarVisible: true,
    })).toBe(674)
    expect(previewContentHeight({
      customNavigation: true,
      tabBarVisible: true,
    })).toBe(762)
    expect(previewContentInsets({
      customNavigation: false,
      tabBarVisible: true,
      tabBarPosition: 'top',
    })).toEqual({ top: 138, bottom: 0 })
  })

  test('reports one coherent iPhone X window and safe area', () => {
    expect(previewSystemInfo(812)).toMatchObject({
      windowWidth: 375,
      windowHeight: 812,
      screenWidth: 375,
      screenHeight: 812,
      pixelRatio: 2,
      statusBarHeight: 44,
      safeArea: {
        top: 44,
        bottom: 778,
        left: 0,
        right: 375,
        width: 375,
        height: 734,
      },
    })
  })

  test('exposes the same capsule rectangle that the chrome renders', () => {
    expect(previewMenuButtonRect()).toEqual({
      width: 87,
      height: 32,
      top: 48,
      right: 365,
      bottom: 80,
      left: 278,
    })
    expect(PREVIEW_DEVICE.screenWidth - PREVIEW_DEVICE.menuButton.right).toBe(10)
  })
})
