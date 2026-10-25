import React from 'react';
import { TAB_BAR_HEIGHT } from '../config';
import './HostTabBar.css';

function resolveIconUrl(base, path) {
  if (!path) return '';
  if (/^(https?:|data:|blob:|\/\/)/.test(path)) return path;
  const segments = String(path).replace(/^\/+/, '').split('/').map(encodeURIComponent);
  return base ? `${base.replace(/\/+$/, '')}/${segments.join('/')}` : segments.join('/');
}

// Native mini-program tabBar rendered outside the page iframe, like host chrome.
function HostTabBar({ tabBar, assetBase, topOffset = 0, enabled, onTap }) {
  if (!tabBar || !tabBar.visible) return null;
  const borderColor = tabBar.borderStyle === 'white'
    ? 'rgba(255, 255, 255, 0.35)'
    : 'rgba(0, 0, 0, 0.28)';
  const atTop = tabBar.position === 'top';
  const style = {
    height: TAB_BAR_HEIGHT,
    backgroundColor: tabBar.backgroundColor,
    color: tabBar.color,
    ...(atTop
      ? { top: topOffset, borderBottom: `0.5px solid ${borderColor}` }
      : { bottom: 0, borderTop: `0.5px solid ${borderColor}` }),
  };

  return (
    <nav
      className={atTop ? 'td-tabbar td-tabbar--top' : 'td-tabbar'}
      style={style}
      role="tablist"
      aria-label="Mini program tab bar"
    >
      {tabBar.items.map((item) => {
        const selected = item.index === tabBar.selectedIndex;
        const iconPath = selected
          ? item.selectedIconPath || item.iconPath
          : item.iconPath;
        const iconUrl = resolveIconUrl(assetBase, iconPath);
        const hasIconArea = Boolean(iconUrl) || Boolean(item.badge) || item.redDot;
        return (
          <button
            type="button"
            role="tab"
            key={item.pagePath}
            className={selected ? 'td-tabbar-item td-tabbar-item--selected' : 'td-tabbar-item'}
            aria-selected={selected}
            aria-label={item.text || item.pagePath}
            disabled={!enabled}
            onClick={() => onTap?.(item.index)}
          >
            {hasIconArea ? (
              <span className="td-tabbar-icon">
                {iconUrl ? (
                  <img
                    src={iconUrl}
                    alt=""
                    onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }}
                  />
                ) : null}
                {item.badge ? <span className="td-tabbar-badge">{item.badge}</span> : null}
                {!item.badge && item.redDot ? <span className="td-tabbar-red-dot" /> : null}
              </span>
            ) : null}
            <span
              className="td-tabbar-label"
              style={{ color: selected ? tabBar.selectedColor : tabBar.color }}
            >
              {item.text}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export default HostTabBar;
