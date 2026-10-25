import React, { useEffect, useRef, useState } from 'react';
import './HostControlsMenu.css';

// WeChat-style capsule: dots open host controls, the right ring sends the app
// to the background and returns to the app launcher.
function HostControlsMenu({ enabled, onBackground, onReload }) {
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
      <div className="td-capsule">
        <button
          type="button"
          className="td-capsule-menu"
          disabled={!enabled}
          aria-label="Host controls"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          title="Host controls"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="td-capsule-dots" aria-hidden="true"><i /><i /><i /></span>
        </button>
        <span className="td-capsule-divider" aria-hidden="true" />
        <button
          type="button"
          className="td-capsule-background"
          disabled={!enabled}
          aria-label="Background app"
          title="Background app and open the app list"
          onClick={onBackground}
        >
          <span className="td-capsule-ring" aria-hidden="true" />
        </button>
      </div>
      {menuOpen ? (
        <div className="td-nav-menu" role="menu">
          <div className="td-nav-menu-head">Host controls</div>
          <button type="button" role="menuitem" disabled={!enabled} onClick={runMenuAction(onBackground)}>
            <span>App list</span>
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
