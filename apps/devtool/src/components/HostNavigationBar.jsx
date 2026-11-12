import React from 'react';
import { PREVIEW_DEVICE } from '../previewDevice';
import './HostNavigationBar.css';

function StatusBarIcons() {
  return (
    <span className="td-statusbar-icons">
      <span className="td-signal">
        <i />
        <i />
        <i />
        <i />
      </span>
      <svg className="td-wifi" viewBox="0 0 16 12" fill="none" aria-hidden="true">
        <path d="M1.4 4.1a9.8 9.8 0 0 1 13.2 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M3.7 6.7a6.2 6.2 0 0 1 8.6 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="8" cy="9.5" r="1.15" fill="currentColor" />
      </svg>
      <span className="td-battery">
        <span className="td-battery-level" />
      </span>
    </span>
  );
}

// The iOS status bar stays above custom navigation pages. It is transparent
// there so the page can paint a full-bleed header underneath it.
export function HostStatusBar({ navigation, overlay = false }) {
  const textColor = navigation.textStyle === 'white' ? '#ffffff' : '#111827';
  const scheme = navigation.textStyle === 'white' ? 'dark' : 'light';
  return (
    <div
      className={`td-statusbar td-host-statusbar td-host-chrome--${scheme}${overlay ? ' td-host-statusbar--overlay' : ''}`}
      style={{
        height: PREVIEW_DEVICE.statusBarHeight,
        backgroundColor: overlay ? 'transparent' : navigation.backgroundColor,
        color: textColor,
      }}
      aria-hidden="true"
    >
      <span className="td-statusbar-time">9:41</span>
      <StatusBarIcons />
    </div>
  );
}

// Default mini-program chrome. Custom-navigation pages render their own bar, so
// only the status bar and fixed native capsule remain.
function HostNavigationBar({
  navigation,
  launcher,
  enabled,
  canGoBack,
  onBack,
}) {
  const textColor = navigation.textStyle === 'white' ? '#ffffff' : '#111827';
  const scheme = navigation.textStyle === 'white' ? 'dark' : 'light';

  return (
    <div
      className={`td-navbar td-host-navbar td-host-chrome--${scheme}`}
      style={{
        top: PREVIEW_DEVICE.statusBarHeight,
        height: PREVIEW_DEVICE.navigationBarHeight,
        backgroundColor: navigation.backgroundColor,
        color: textColor,
      }}
    >
      {launcher ? null : (
        <button
          type="button"
          className="td-nav-back"
          disabled={!enabled || !canGoBack}
          aria-label="Back in preview"
          title={canGoBack ? 'Back' : 'Already at the first page'}
          onClick={onBack}
        >
          <svg viewBox="0 0 24 24" width="21" height="21" fill="none" aria-hidden="true">
            <path
              d="M14.5 5.5 8 12l6.5 6.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
      <div className="td-nav-title" title={navigation.title}>{navigation.title}</div>
      {navigation.loading ? <span className="td-nav-loading" aria-label="Loading" role="status" /> : null}
      {launcher ? <span className="td-nav-launcher-mark" aria-hidden="true">◎</span> : null}
    </div>
  );
}

export default HostNavigationBar;
