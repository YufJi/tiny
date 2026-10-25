import React, { useEffect, useRef, useState } from 'react';
import {
  DEVICE_FRAME_HEIGHT,
  DEVICE_FRAME_WIDTH,
  DEVICE_SCREEN_HEIGHT,
  DEVICE_SCREEN_WIDTH,
  HOST_CHROME_HEIGHT,
  TAB_BAR_HEIGHT,
} from '../config';
import HostNavigationBar from './HostNavigationBar';
import HostTabBar from './HostTabBar';
import './PreviewStage.css';

// iPhone X device frame, fit-to-stage scaling, host chrome and screen overlays.
function PreviewStage({
  containerRef,
  loading,
  status,
  error,
  hostNavigation,
  navigation,
  tabBar,
  tabBarAssetBase,
  canGoBack,
  lifecycle,
  onBack,
  onTabBarTap,
  onForeground,
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
  const tabBarVisible = status === 'running' && Boolean(tabBar?.visible);
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
  } else if (status === 'connecting') {
    overlay = {
      spinner: true,
      title: 'Booting preview…',
      detail: 'Starting the service and render threads',
    };
  } else if (status === 'terminated') {
    overlay = {
      title: 'Runtime terminated',
      detail: 'Press Reload in the toolbar to start the preview again',
    };
  } else if (status === 'error') {
    overlay = {
      title: 'Preview failed',
      detail: 'Check the runtime error in the toolbar',
    };
  } else if (status === 'idle') {
    overlay = {
      title: 'Preview idle',
      detail: 'The runtime will start automatically',
    };
  }

  return (
    <main className="td-stage">
      <div className="td-stage-hint">
        <span className={`td-live-dot td-live-dot--${status}`} />
        Live preview
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
                    enabled={status === 'running'}
                    canGoBack={canGoBack}
                    lifecycle={lifecycle}
                    onBack={onBack}
                    onForeground={onForeground}
                    onBackground={onBackground}
                    onReload={onReload}
                  />
                ) : null}
                <div className="td-screen-content" style={{ top: contentTop, bottom: contentBottom }}>
                  <div className="td-screen-surface" ref={containerRef} />
                </div>
                <HostTabBar
                  tabBar={tabBar}
                  assetBase={tabBarAssetBase}
                  topOffset={hostChromeTop}
                  enabled={status === 'running' && lifecycle === 'foreground'}
                  onTap={onTabBarTap}
                />
                <div className="td-screen-glare" />
                {lifecycle === 'background' && status === 'running' ? (
                  <div className="td-screen-background" style={{ top: contentTop }}>
                    <div className="td-screen-background-label">App in background</div>
                    <div className="td-screen-background-sub">
                      The page received onHide. Return to foreground to trigger onShow again.
                    </div>
                    <button type="button" className="td-background-resume" onClick={onForeground}>
                      Return to foreground
                    </button>
                  </div>
                ) : null}
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
