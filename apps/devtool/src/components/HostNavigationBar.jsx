import React from 'react';
import HostControlsMenu from './HostControlsMenu';
import './HostNavigationBar.css';

// Simulated host chrome: iOS status bar, mini-program navigation bar and back.
function HostNavigationBar({
  navigation,
  launcher,
  enabled,
  canGoBack,
  onBack,
  onBackground,
  onReload,
}) {
  const textColor = navigation.textStyle === 'white' ? '#ffffff' : '#111827';
  const scheme = navigation.textStyle === 'white' ? 'dark' : 'light';

  return (
    <div
      className={`td-host-chrome td-host-chrome--${scheme}`}
      style={{ backgroundColor: navigation.backgroundColor, color: textColor }}
    >
      <div className="td-statusbar" aria-hidden="true">
        <span className="td-statusbar-time">9:41</span>
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
      </div>
      <div className="td-navbar">
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
        {launcher ? (
          <span className="td-nav-launcher-mark" aria-hidden="true">◎</span>
        ) : (
          <HostControlsMenu
            enabled={enabled}
            onBackground={onBackground}
            onReload={onReload}
          />
        )}
      </div>
    </div>
  );
}

export default HostNavigationBar;
