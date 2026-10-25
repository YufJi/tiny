import React from 'react';
import './DevtoolToolbar.css';

// Right-side toolbar: app selection, page state and runtime controls.
function DevtoolToolbar({
  apps,
  appId,
  selectedApp,
  loading,
  alert,
  manifestPath,
  currentPage,
  pageStack,
  pages = [],
  status,
  lifecycle,
  running,
  ready,
  navPath,
  onAppChange,
  onNavPathChange,
  onNavigate,
  onReload,
  onInspect,
  onForeground,
  onBackground,
  onBack,
  onTerminate,
}) {
  return (
    <div className="td-toolbar td-scroll">
      <div className="td-brand">
        <div className="td-logo">T</div>
        <div>
          <div className="td-brand-title">Tiny Runtime</div>
          <div className="td-brand-sub">Dual-thread debugger</div>
        </div>
        <span className={`td-status td-status--${status}`} role="status">
          <span className="td-status-dot" />
          {status}
        </span>
      </div>

      <label className="td-field">
        <span className="td-field-label">Test app</span>
        <select
          className="td-select"
          value={appId}
          disabled={loading || apps.length === 0}
          onChange={(event) => onAppChange(event.target.value)}
        >
          {apps.map((app) => (
            <option key={app.id} value={app.id}>{app.label}</option>
          ))}
        </select>
      </label>

      <div className="td-app-meta">
        {loading ? <span>Loading test apps…</span> : null}
        {selectedApp?.title ? <span>{selectedApp.title}</span> : null}
        {selectedApp?.pages ? <span>{selectedApp.pages} pages</span> : null}
        {manifestPath ? <code>{manifestPath}</code> : null}
      </div>

      <div className="td-page-card">
        <div className="td-page-head">
          <span className="td-field-label">Current page</span>
          <span
            className={
              running
                ? `td-page-pulse td-page-pulse--${lifecycle === 'background' ? 'paused' : 'running'}`
                : 'td-page-pulse'
            }
          />
        </div>
        <code className="td-page-current" title={currentPage || ''}>
          {currentPage || 'No page loaded'}
        </code>
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
          title="Rebuild both runtime threads"
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
          disabled={!running}
          title="Stop the runtime and remove the preview frames"
          onClick={onTerminate}
        >
          Terminate
        </button>
      </div>

      <div className="td-section-title">Lifecycle</div>
      <div className="td-actions">
        <button
          type="button"
          className="td-btn"
          disabled={!running || lifecycle === 'foreground'}
          onClick={onForeground}
        >
          Foreground
        </button>
        <button
          type="button"
          className="td-btn"
          disabled={!running || lifecycle === 'background'}
          onClick={onBackground}
        >
          Background
        </button>
        <button
          type="button"
          className="td-btn"
          disabled={!running}
          onClick={onBack}
        >
          Back
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
    </div>
  );
}

export default DevtoolToolbar;
