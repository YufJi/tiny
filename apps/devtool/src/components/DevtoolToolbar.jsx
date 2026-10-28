import React from 'react';
import './DevtoolToolbar.css';

// Right-side toolbar: active app state, runtime controls and navigation.
function DevtoolToolbar({
  selectedApp,
  sessionCount,
  maxLiveApps,
  maxPageStack,
  loading,
  alert,
  manifestPath,
  currentPage,
  pageStack,
  pages = [],
  status,
  running,
  ready,
  navPath,
  onOpenApps,
  onNavPathChange,
  onNavigate,
  onReload,
  onInspect,
  onBack,
  onCloseApp,
}) {
  return (
    <div className="td-toolbar td-scroll">
      <div className="td-brand">
        <img className="td-logo" src="./favicon.svg" alt="" width="40" height="40" />
        <div>
          <div className="td-brand-title">Tiny Runtime</div>
          <div className="td-brand-sub">Dual-thread debugger</div>
        </div>
        <span className={`td-status td-status--${status}`} role="status">
          <span className="td-status-dot" />
          {status}
        </span>
      </div>

      <div className="td-actions td-actions--toolbar">
        <button
          type="button"
          className="td-btn"
          disabled={!ready}
          title="Send the running app to the background and open the app list"
          onClick={onOpenApps}
        >
          App list
        </button>
        <span className="td-warm-count">{sessionCount} / {maxLiveApps} warm</span>
      </div>

      <div className="td-app-meta">
        {loading ? <span>Loading test apps…</span> : null}
        {selectedApp ? (
          <>
            <span>{selectedApp.label}</span>
            {selectedApp.title ? <span>{selectedApp.title}</span> : null}
            {selectedApp.pages ? <span>{selectedApp.pages} pages</span> : null}
          </>
        ) : (
          <span>No app open — choose one from the list</span>
        )}
        {manifestPath ? <code>{manifestPath}</code> : null}
      </div>

      <div className="td-page-card">
        <div className="td-page-head">
          <span className="td-field-label">Current page</span>
          <span className={running ? 'td-page-pulse td-page-pulse--running' : 'td-page-pulse'} />
        </div>
        <code className="td-page-current" title={currentPage || ''}>
          {currentPage || 'No page loaded'}
        </code>
        <div className="td-page-depth">
          <span>Page stack</span>
          <span>{pageStack.length} / {maxPageStack}</span>
        </div>
        <div className="td-chips">
          {pageStack.length === 0 ? (
            <span className="td-empty">No pages in the stack</span>
          ) : pageStack.map((pageId, index) => {
            const page = pages.find((candidate) => candidate.pageId === pageId);
            return (
              <span
                className={
                  page?.visible
                    ? 'td-chip td-chip--active'
                    : 'td-chip td-chip--hidden'
                }
                key={pageId}
                title={`${pageId}${page ? ` · ${page.path}` : ''}`}
              >
                <span className="td-chip-index">{index + 1}</span>
                <span className="td-chip-path">{page?.path || pageId}</span>
                {page ? <span className="td-chip-state">{page.visible ? 'active' : 'hidden'}</span> : null}
              </span>
            );
          })}
        </div>
      </div>

      {alert ? <div className="td-alert" role="alert">{alert}</div> : null}

      <div className="td-section-title">Runtime</div>
      <div className="td-actions">
        <button
          type="button"
          className="td-btn td-btn--primary"
          disabled={!ready || status === 'connecting'}
          title="Rebuild the active app's runtime threads"
          onClick={onReload}
        >
          Reload
        </button>
        <button
          type="button"
          className="td-btn"
          disabled={!running}
          title="Inspect the active page tree"
          onClick={onInspect}
        >
          Inspect
        </button>
        <button
          type="button"
          className="td-btn td-btn--danger"
          disabled={!ready}
          title="Close the active app and release its frames"
          onClick={onCloseApp}
        >
          Close app
        </button>
      </div>

      <div className="td-section-title">Navigation</div>
      <div className="td-nav">
        <input
          className="td-input"
          value={navPath}
          onChange={(event) => onNavPathChange(event.target.value)}
          placeholder="pages/..."
          aria-label="Page path"
          disabled={!ready}
        />
        <button
          type="button"
          className="td-btn"
          disabled={!running}
          onClick={onNavigate}
        >
          Navigate
        </button>
      </div>
      <div className="td-actions td-actions--back">
        <button type="button" className="td-btn" disabled={!running || pageStack.length <= 1} onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  );
}

export default DevtoolToolbar;
