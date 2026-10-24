import React, { useEffect, useRef, useState } from 'react';
import './HostControlsMenu.css';

// WeChat-style capsule menu for host foreground/background/reload actions.
function HostControlsMenu({ enabled, lifecycle, onForeground, onBackground, onReload }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const controlsRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeMenu = (event) => {
      if (!controlsRef.current?.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener('pointerdown', closeMenu);
    return () => document.removeEventListener('pointerdown', closeMenu);
  }, [menuOpen]);

  const runMenuAction = (action) => () => {
    setMenuOpen(false);
    action();
  };

  return (
    <div className="td-host-controls" ref={controlsRef}>
      <button
        type="button"
        className="td-capsule"
        disabled={!enabled}
        aria-label="Host controls"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        title="Host controls"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span className="td-capsule-dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="td-capsule-divider" aria-hidden="true" />
        <span className="td-capsule-ring" aria-hidden="true" />
      </button>
      {menuOpen ? (
        <div className="td-nav-menu" role="menu">
          <div className="td-nav-menu-head">Host controls</div>
          <button
            type="button"
            role="menuitem"
            disabled={!enabled || lifecycle === 'foreground'}
            onClick={runMenuAction(onForeground)}
          >
            <span>Foreground</span>
            {lifecycle === 'foreground' ? <span className="td-nav-menu-state">active</span> : null}
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={!enabled || lifecycle === 'background'}
            onClick={runMenuAction(onBackground)}
          >
            <span>Background</span>
            {lifecycle === 'background' ? <span className="td-nav-menu-state">active</span> : null}
          </button>
          <div className="td-nav-menu-sep" />
          <button type="button" role="menuitem" disabled={!enabled} onClick={runMenuAction(onReload)}>
            <span>Reload runtime</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default HostControlsMenu;
