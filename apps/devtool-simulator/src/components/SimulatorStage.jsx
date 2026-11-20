import React, { useEffect, useRef, useState } from 'react';
import {
  previewContentInsets,
} from '../device';
import HostNavigationBar, { HostStatusBar } from './HostNavigationBar';
import HostControlsMenu from './HostControlsMenu';
import HostTabBar from './HostTabBar';
import './SimulatorStage.css';

/**
 * Device shell, host chrome and a runtime surface slot.
 *
 * The surface remains host-owned: Web devtool appends iframe surfaces to
 * `surfaceHostRef`, while a desktop host can position WebContentsView instances
 * from `onSurfaceLayout` without changing this component.
 */
function SimulatorStage({
  surfaceHostRef,
  launcher = false,
  launcherContent = null,
  surfaceContent = null,
  screenOverlay = null,
  status = 'idle',
  hostNavigation = true,
  navigation = {},
  tabBar = null,
  tabBarAssetBase = '',
  canGoBack,
  onBack,
  onHome,
  onTabBarTap,
  onBackground,
  onReload,
  onShare,
  shareEnabled,
  refreshing = false,
  device,
  onStatusBarTap,
  overlay = null,
  hint,
  onSurfaceLayout,
}) {
  const stageBodyRef = useRef(null);
  const screenRef = useRef(null);
  const contentRef = useRef(null);
  const layoutCallbackRef = useRef(onSurfaceLayout);
  const [scale, setScale] = useState(1);
  layoutCallbackRef.current = onSurfaceLayout;

  useEffect(() => {
    const body = stageBodyRef.current;
    if (!body) return undefined;
    const update = () => {
      const rect = body.getBoundingClientRect();
      const width = Math.max(0, rect.width - 48);
      const height = Math.max(0, rect.height - 64);
      const next = Math.min(1, width / device.frameWidth, height / device.frameHeight);
      setScale(Math.max(0.4, Number.isFinite(next) && next > 0 ? next : 1));
    };
    update();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(update);
    observer.observe(body);
    return () => observer.disconnect();
  }, [device.frameHeight, device.frameWidth]);

  const hostChromeTop = hostNavigation ? device.hostChromeHeight : 0;
  const tabBarVisible = !launcher && status === 'running' && Boolean(tabBar?.visible);
  const contentInsets = previewContentInsets(
    {
      customNavigation: !launcher && navigation.custom,
      tabBarVisible,
      tabBarPosition: tabBar?.position,
    },
    device,
  );
  const chromeScheme = navigation.textStyle === 'white' ? 'dark' : 'light';
  const chromeColor = navigation.textStyle === 'white' ? '#ffffff' : '#111827';
  useEffect(() => {
    if (!layoutCallbackRef.current) return undefined;
    const report = () => {
      const screen = screenRef.current?.getBoundingClientRect();
      const content = contentRef.current?.getBoundingClientRect();
      if (!screen || !content) return;
      layoutCallbackRef.current({
        screen: { x: screen.x, y: screen.y, width: screen.width, height: screen.height },
        content: { x: content.x, y: content.y, width: content.width, height: content.height },
        scale,
        devicePixelRatio: typeof window === 'undefined' ? 1 : window.devicePixelRatio,
      });
    };
    const frame = typeof requestAnimationFrame === 'function'
      ? requestAnimationFrame(report)
      : setTimeout(report, 0);
    let observer;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(report);
      if (screenRef.current) observer.observe(screenRef.current);
      if (contentRef.current) observer.observe(contentRef.current);
    }
    if (typeof window !== 'undefined') window.addEventListener('resize', report);
    return () => {
      if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(frame);
      else clearTimeout(frame);
      observer?.disconnect();
      if (typeof window !== 'undefined') window.removeEventListener('resize', report);
    };
  }, [
    contentInsets.top,
    contentInsets.bottom,
    device.frameHeight,
    device.frameWidth,
    device.orientation,
    scale,
  ]);

  return (
    <main className="td-stage">
      <div className="td-stage-hint">
        <span className={`td-live-dot td-live-dot--${launcher ? 'idle' : status}`} />
        {hint ?? (launcher ? 'App launcher' : 'Live preview')}
      </div>
      <div className="td-stage-body" ref={stageBodyRef}>
        <div
          className="td-device-scale"
          style={{
            width: device.frameWidth * scale,
            height: device.frameHeight * scale,
          }}
        >
          <div className="td-device-shell" style={{ transform: `scale(${scale})` }}>
            <div
              className={`td-device td-device--${device.cutout} td-device--${device.orientation}`}
              style={{
                width: device.frameWidth,
                height: device.frameHeight,
                padding: device.framePadding,
                borderRadius: device.frameRadius,
              }}
            >
              <span
                className="td-device-side td-device-side--volume-up"
                style={{ top: device.frameHeight * 0.215, height: device.frameHeight * 0.065 }}
              />
              <span
                className="td-device-side td-device-side--volume-down"
                style={{ top: device.frameHeight * 0.295, height: device.frameHeight * 0.065 }}
              />
              <span
                className="td-device-side td-device-side--power"
                style={{ top: device.frameHeight * 0.25, height: device.frameHeight * 0.11 }}
              />
              <div
                className={`td-screen${navigation.backgroundTextStyle === 'light' ? ' td-screen--bg-text-light' : ''}`}
                ref={screenRef}
                style={{
                  width: navigation.windowSize?.width ?? device.screenWidth,
                  height: navigation.windowSize?.height ?? device.screenHeight,
                  backgroundColor: navigation.pageBackground,
                  borderRadius: device.screenRadius,
                  '--td-cutout-width': `${device.cutoutWidth}px`,
                  '--td-cutout-height': `${device.cutoutHeight}px`,
                  '--td-cutout-top': `${device.cutoutTop}px`,
                  '--td-cutout-left': `${device.cutoutLeft}px`,
                }}
              >
                {device.statusBarHeight > 0 ? (
                  <HostStatusBar
                    navigation={navigation}
                    overlay={!launcher && navigation.custom}
                    onHome={onHome}
                    device={device}
                    enabled={!launcher && status === 'running'}
                    onStatusBarTap={onStatusBarTap}
                  />
                ) : null}
                {hostNavigation ? (
                  <HostNavigationBar
                    navigation={navigation}
                    launcher={launcher}
                    enabled={status === 'running'}
                    canGoBack={canGoBack}
                    onBack={onBack}
                    device={device}
                  />
                ) : null}
                {!launcher ? (
                  <div
                    className={`td-host-capsule td-host-chrome--${chromeScheme}`}
                    style={{
                      top: device.menuButton.top,
                      right: device.screenWidth - device.menuButton.right,
                      width: device.menuButton.width,
                      height: device.menuButton.height,
                      color: chromeColor,
                    }}
                  >
                    <HostControlsMenu
                      enabled={status === 'running'}
                      onBackground={onBackground}
                      onReload={onReload}
                      onShare={onShare}
                      shareEnabled={shareEnabled}
                    />
                  </div>
                ) : null}
                {refreshing && !launcher ? (
                  <div className="td-pull-refresh" role="status" aria-label="Refreshing">
                    <span className="td-pull-refresh-spinner" />
                  </div>
                ) : null}
                <div
                  className="td-screen-content"
                  ref={contentRef}
                  style={{ top: contentInsets.top, bottom: contentInsets.bottom }}
                >
                  <div className="td-screen-surface" ref={surfaceHostRef}>
                    {surfaceContent}
                  </div>
                  {launcher ? launcherContent : null}
                </div>
                <HostTabBar
                  tabBar={launcher ? null : tabBar}
                  assetBase={tabBarAssetBase}
                  topOffset={hostChromeTop}
                  enabled={!launcher && status === 'running'}
                  onTap={onTabBarTap}
                  device={device}
                />
                {screenOverlay}
                <div
                  className={
                    device.orientation === 'landscape'
                      ? 'td-home-indicator td-home-indicator--landscape'
                      : 'td-home-indicator'
                  }
                  style={device.orientation === 'landscape'
                    ? {
                        right: device.homeIndicatorBottom,
                        height: device.homeIndicatorWidth,
                      }
                    : {
                        bottom: device.homeIndicatorBottom,
                        width: device.homeIndicatorWidth,
                      }}
                />
                <div className="td-screen-glare" />
                {overlay ? (
                  <div className="td-screen-overlay">
                    {overlay.spinner ? <div className="td-spinner" /> : null}
                    <div className="td-screen-overlay-title">{overlay.title}</div>
                    <div className="td-screen-overlay-sub">{overlay.detail}</div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <div className="td-device-caption">
          <span className="td-device-name">{device.label}</span>
          <span className="td-device-size">{device.screenWidth} × {device.screenHeight}</span>
          {scale < 0.995 ? <span className="td-device-zoom">{Math.round(scale * 100)}%</span> : null}
        </div>
      </div>
    </main>
  );
}

export default SimulatorStage;
