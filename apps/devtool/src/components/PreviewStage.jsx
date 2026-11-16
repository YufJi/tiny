import React, { useEffect, useRef, useState } from 'react';
import {
  previewContentInsets,
} from '../previewDevice';
import AppLauncher from './AppLauncher';
import HostNavigationBar, { HostStatusBar } from './HostNavigationBar';
import HostControlsMenu from './HostControlsMenu';
import HostTabBar from './HostTabBar';
import HostShareSheet from './HostShareSheet';
import './PreviewStage.css';

// iPhone X device frame, fit-to-stage scaling, host chrome and app launcher.
function PreviewStage({
  surfaceHostRef,
  launcher,
  apps,
  sessions,
  launchingAppId,
  launcherError,
  maxLiveApps,
  maxPageStack,
  onOpenApp,
  onCloseApp,
  loading,
  status,
  error,
  hostNavigation,
  navigation,
  tabBar,
  tabBarAssetBase,
  canGoBack,
  onBack,
  onTabBarTap,
  onBackground,
  onReload,
  onShare,
  shareEnabled,
  shareSheetOpen,
  shareResult,
  onShareSelect,
  onCloseShare,
  refreshing,
  device,
  onStatusBarTap,
}) {
  const stageBodyRef = useRef(null);
  const [scale, setScale] = useState(1);

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

  let overlay = null;
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
  if (error) {
    overlay = { title: 'Preview unavailable', detail: error };
  } else if (loading) {
    overlay = {
      spinner: true,
      title: 'Loading test apps…',
      detail: 'Reading the generated app registry',
    };
  } else if (!launcher && status === 'connecting') {
    overlay = {
      spinner: true,
      title: 'Booting preview…',
      detail: 'Starting the service and render threads',
    };
  } else if (!launcher && status === 'terminated') {
    overlay = {
      title: 'Runtime terminated',
      detail: 'Use Reload in the toolbar or open the app again',
    };
  } else if (!launcher && status === 'error') {
    overlay = {
      title: 'Preview failed',
      detail: 'Check the runtime error in the toolbar',
    };
  }

  return (
    <main className="td-stage">
      <div className="td-stage-hint">
        <span className={`td-live-dot td-live-dot--${launcher ? 'idle' : status}`} />
        {launcher ? 'App launcher' : 'Live preview'}
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
              className={`td-device td-device--${device.cutout}`}
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
                className="td-screen"
                style={{
                  width: device.screenWidth,
                  height: device.screenHeight,
                  borderRadius: device.screenRadius,
                  '--td-cutout-width': `${device.cutoutWidth}px`,
                  '--td-cutout-height': `${device.cutoutHeight}px`,
                  '--td-cutout-top': `${device.cutoutTop}px`,
                }}
              >
                <HostStatusBar
                  navigation={navigation}
                  overlay={!launcher && navigation.custom}
                  device={device}
                  enabled={!launcher && status === 'running'}
                  onStatusBarTap={onStatusBarTap}
                />
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
                  style={{ top: contentInsets.top, bottom: contentInsets.bottom }}
                >
                  <div className="td-screen-surface" ref={surfaceHostRef} />
                  {launcher ? (
                    <AppLauncher
                      apps={apps}
                      sessions={sessions}
                      launchingAppId={launchingAppId}
                      error={launcherError}
                      maxLiveApps={maxLiveApps}
                      maxPageStack={maxPageStack}
                      onOpen={onOpenApp}
                      onClose={onCloseApp}
                    />
                  ) : null}
                </div>
                <HostTabBar
                  tabBar={launcher ? null : tabBar}
                  assetBase={tabBarAssetBase}
                  topOffset={hostChromeTop}
                  enabled={!launcher && status === 'running'}
                  onTap={onTabBarTap}
                  device={device}
                />
                <HostShareSheet
                  open={Boolean(shareSheetOpen && !launcher && status === 'running')}
                  result={shareResult}
                  onSelect={onShareSelect}
                  onClose={onCloseShare}
                />
                <div
                  className="td-home-indicator"
                  style={{
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

export default PreviewStage;
