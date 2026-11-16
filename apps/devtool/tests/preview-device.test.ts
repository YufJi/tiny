import { describe, expect, test } from 'vitest'
import {
  PREVIEW_DEVICE,
  PREVIEW_DEVICES,
  getPreviewDevice,
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

  test('exposes selectable device profiles and falls back to the default', () => {
    expect(PREVIEW_DEVICES.map((device) => device.id)).toEqual([
      'iphone-x',
      'iphone-13',
      'iphone-14-pro-max',
    ])
    expect(getPreviewDevice('iphone-14-pro-max')).toMatchObject({
      label: 'iPhone 14 Pro Max',
      screenWidth: 430,
      screenHeight: 932,
      frameWidth: 454,
      frameHeight: 956,
      statusBarHeight: 59,
      hostChromeHeight: 103,
      pixelRatio: 3,
      cutout: 'island',
    })
    expect(getPreviewDevice('missing-device')).toBe(PREVIEW_DEVICE)
  })

  test('derives content and system geometry from the selected profile', () => {
    const device = getPreviewDevice('iphone-14-pro-max')
    expect(previewContentHeight({ customNavigation: false }, device)).toBe(829)
    expect(previewContentHeight({
      customNavigation: false,
      tabBarVisible: true,
    }, device)).toBe(779)
    expect(previewSystemInfo(829, device)).toMatchObject({
      model: 'iPhone 14 Pro Max',
      windowWidth: 430,
      windowHeight: 829,
      screenWidth: 430,
      screenHeight: 932,
      pixelRatio: 3,
      statusBarHeight: 59,
      safeArea: {
        top: 59,
        bottom: 898,
        left: 0,
        right: 430,
        width: 430,
        height: 839,
      },
    })
    expect(previewMenuButtonRect(device)).toEqual(device.menuButton)
    expect(device.screenWidth - device.menuButton.right).toBe(7)
  })
})
