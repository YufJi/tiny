import React, { useEffect, useRef, useState } from 'react';
import {
  DEVICE_FRAME_HEIGHT,
  DEVICE_FRAME_WIDTH,
  DEVICE_SCREEN_HEIGHT,
  DEVICE_SCREEN_WIDTH,
  HOST_CHROME_HEIGHT,
  TAB_BAR_HEIGHT,
} from '../config';
import AppLauncher from './AppLauncher';
import HostNavigationBar from './HostNavigationBar';
import HostTabBar from './HostTabBar';
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
      const next = Math.min(1, width / DEVICE_FRAME_WIDTH, height / DEVICE_FRAME_HEIGHT);
      setScale(Math.max(0.4, Number.isFinite(next) && next > 0 ? next : 1));
    };
    update();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(update);
    observer.observe(body);
    return () => observer.disconnect();
  }, []);

  let overlay = null;
  const hostChromeTop = hostNavigation ? HOST_CHROME_HEIGHT : 0;
  const tabBarVisible = !launcher && status === 'running' && Boolean(tabBar?.visible);
  const tabBarAtTop = tabBarVisible && tabBar?.position === 'top';
  const contentTop = hostChromeTop + (tabBarAtTop ? TAB_BAR_HEIGHT : 0);
  const contentBottom = tabBarVisible && !tabBarAtTop ? TAB_BAR_HEIGHT : 0;
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
            width: DEVICE_FRAME_WIDTH * scale,
            height: DEVICE_FRAME_HEIGHT * scale,
          }}
        >
          <div className="td-device-shell" style={{ transform: `scale(${scale})` }}>
            <div className="td-device">
              <span className="td-device-side td-device-side--volume-up" />
              <span className="td-device-side td-device-side--volume-down" />
              <span className="td-device-side td-device-side--power" />
              <div className="td-screen">
                {hostNavigation ? (
                  <HostNavigationBar
                    navigation={navigation}
                    launcher={launcher}
                    enabled={status === 'running'}
                    canGoBack={canGoBack}
                    onBack={onBack}
                    onBackground={onBackground}
                    onReload={onReload}
                  />
                ) : null}
                {!launcher && !hostNavigation ? (
                  <button
                    type="button"
                    className="td-float-apps"
                    aria-label="Background app"
                    title="Background app and open the app list"
                    disabled={status !== 'running'}
                    onClick={onBackground}
                  >
                    ◎
                  </button>
                ) : null}
                <div className="td-screen-content" style={{ top: contentTop, bottom: contentBottom }}>
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
          <span className="td-device-name">iPhone X</span>
          <span className="td-device-size">{DEVICE_SCREEN_WIDTH} × {DEVICE_SCREEN_HEIGHT}</span>
          {scale < 0.995 ? <span className="td-device-zoom">{Math.round(scale * 100)}%</span> : null}
        </div>
      </div>
    </main>
  );
}

export default PreviewStage;
