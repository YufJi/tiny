import { describe, expect, test } from 'vitest'
import {
  PREVIEW_DEVICE,
  PREVIEW_DEVICES,
  getPreviewDevice,
  resolvePreviewDevice,
  previewContentHeight,
  previewContentInsets,
  previewKeyboardHeight,
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

  test('matches the WeChat DevTools simulated keyboard height', () => {
    expect(previewKeyboardHeight()).toBe(200)
    expect(previewKeyboardHeight(resolvePreviewDevice('iphone-14-pro-max', 'landscape'))).toBe(200)
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

  test('rotates profile geometry into landscape with horizontal safe areas', () => {
    const device = resolvePreviewDevice('iphone-x', 'landscape')
    expect(device).toMatchObject({
      id: 'iphone-x',
      orientation: 'landscape',
      screenWidth: 812,
      screenHeight: 375,
      frameWidth: 836,
      frameHeight: 399,
      statusBarHeight: 0,
      hostChromeHeight: 44,
      menuButton: {
        width: 87,
        height: 32,
        top: 4,
        right: 758,
        bottom: 36,
        left: 671,
      },
      safeArea: {
        top: 0,
        bottom: 354,
        left: 44,
        right: 768,
        width: 724,
        height: 354,
      },
    })
    expect(previewContentHeight({ customNavigation: false }, device)).toBe(331)
    expect(previewContentHeight({
      customNavigation: false,
      tabBarVisible: true,
    }, device)).toBe(281)
    expect(previewSystemInfo(331, device)).toMatchObject({
      windowWidth: 812,
      windowHeight: 331,
      screenWidth: 812,
      screenHeight: 375,
      statusBarHeight: 0,
      safeArea: device.safeArea,
    })
  })
})
