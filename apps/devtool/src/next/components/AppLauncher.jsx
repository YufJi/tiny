import React from 'react';
import './AppLauncher.css';

function statusLabel(app, session, launchingAppId) {
  if (launchingAppId === app.id) return 'Starting…';
  if (!session) return 'Launch';
  if (session.status === 'error') return 'Error';
  if (session.status === 'running') return 'Background';
  return session.status;
}

function appInitial(app) {
  const source = app.title || app.label || app.id;
  return source.trim().slice(0, 1).toUpperCase();
}

// Landing page shown when no mini program is in the foreground.
function AppLauncher({
  apps,
  sessions,
  launchingAppId,
  error,
  maxLiveApps,
  maxPageStack,
  onOpen,
  onClose,
}) {
  const sessionsByApp = new Map(sessions.map((session) => [session.appId, session]));
  const aliveCount = sessions.length;
  const busy = Boolean(launchingAppId);

  return (
    <div className="td-launcher td-scroll">
      <header className="td-launcher-head">
        <div className="td-launcher-eyebrow">Tiny Runtime</div>
        <h1 className="td-launcher-title">Mini programs</h1>
        <p className="td-launcher-sub">
          {aliveCount} / {maxLiveApps} kept warm · page stack up to {maxPageStack}
        </p>
      </header>

      {error ? <div className="td-launcher-error" role="alert">{error}</div> : null}

      <div className="td-launcher-list">
        {apps.map((app) => {
          const session = sessionsByApp.get(app.id);
          const alive = Boolean(session);
          const launching = launchingAppId === app.id;
          return (
            <div
              className={alive ? 'td-launcher-row td-launcher-row--alive' : 'td-launcher-row'}
              key={app.id}
            >
              <button
                type="button"
                className="td-launcher-main"
                disabled={busy}
                onClick={() => onOpen(app.id)}
                aria-label={alive ? `Resume ${app.label}` : `Launch ${app.label}`}
              >
                <span className="td-launcher-glyph" aria-hidden="true">{appInitial(app)}</span>
                <span className="td-launcher-info">
                  <span className="td-launcher-name">{app.title}</span>
                  <span className="td-launcher-meta">
                    {app.id}
                    {app.pages ? ` · ${app.pages} pages` : ''}
                  </span>
                  {session?.currentPage ? (
                    <span className="td-launcher-page">{session.currentPage}</span>
                  ) : null}
                </span>
                <span className={launching ? 'td-launcher-state td-launcher-state--starting' : 'td-launcher-state'}>
                  {launching ? <span className="td-launcher-spinner" aria-hidden="true" /> : null}
                  {statusLabel(app, session, launchingAppId)}
                </span>
              </button>
              {alive ? (
                <button
                  type="button"
                  className="td-launcher-close"
                  aria-label={`Close ${app.label}`}
                  title="Close app"
                  disabled={busy}
                  onClick={() => onClose(app.id)}
                >
                  ×
                </button>
              ) : null}
            </div>
          );
        })}
      </div>

      <footer className="td-launcher-foot">
        Opening a fourth app closes the least recently used warm app.
        Use the capsule ring in a running app to send it to the background and
        come back here.
      </footer>
    </div>
  );
}

export default AppLauncher;
