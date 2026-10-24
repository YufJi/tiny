import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { DevtoolRuntimeClient } from '@tiny/host-browser';

const STATUS_COLORS = {
  idle: '#94a3b8',
  connecting: '#fbbf24',
  running: '#34d399',
  terminated: '#94a3b8',
  error: '#f87171',
};

const SEVERITY_COLORS = {
  error: '#f87171',
  warning: '#fbbf24',
  info: '#93c5fd',
  state: '#a78bfa',
};

const APPS_REGISTRY_URL = '/runtime/apps.json';
const DEFAULT_APP_ID = 'demo';

function TreeNode({ node, depth = 0 }) {
  const style = { marginLeft: depth * 10, fontSize: 12 };
  if (node.type === 'text') {
    return <div style={{ ...style, color: '#94a3b8', whiteSpace: 'pre-wrap' }}>&quot;{node.text}&quot;</div>;
  }
  const meta = [node.className, node.attributes ? JSON.stringify(node.attributes) : ''].filter(Boolean).join(' ');
  return (
    <details open={depth < 2} style={style}>
      <summary style={{ cursor: 'pointer' }}>
        <code style={{ color: node.type === 'component' ? '#fbbf24' : '#7dd3fc' }}>{node.tag}</code>
        {meta ? <span style={{ color: '#64748b' }}> {meta}</span> : null}
      </summary>
      {node.children.map((child) => <TreeNode key={child.id} node={child} depth={depth + 1} />)}
    </details>
  );
}

function generatedBaseFor(appId) {
  return `/runtime/apps/${encodeURIComponent(appId)}/generated`;
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`${url} responded with HTTP ${response.status}`);
  }
  return response.json();
}

function normalizeApps(payload) {
  if (!payload || !Array.isArray(payload.apps)) {
    throw new Error(`${APPS_REGISTRY_URL} must contain an "apps" array`);
  }
  return payload.apps
    .filter((app) => app && typeof app.id === 'string' && app.id.length > 0)
    .map((app) => ({
      id: app.id,
      label: typeof app.label === 'string' && app.label ? app.label : `tests/apps/${app.id}`,
      title: typeof app.title === 'string' ? app.title : '',
      pages: Number(app.pages) || 0,
      firstPage: typeof app.firstPage === 'string' ? app.firstPage : '',
    }));
}

class RuntimePanel extends PureComponent {
  constructor(props) {
    super(props);
    this.containerRef = React.createRef();
    this.client = null;
    this.unsubscribe = null;
    this.state = {
      apps: [],
      appId: '',
      navPath: '',
      manifestPath: '',
      loading: true,
      error: '',
    };
  }

  async componentDidMount() {
    try {
      const apps = normalizeApps(await fetchJson(APPS_REGISTRY_URL));
      if (apps.length === 0) {
        throw new Error(`no test apps are registered in ${APPS_REGISTRY_URL}`);
      }

      const params = new URLSearchParams(window.location.search);
      const requestedAppId = params.get('app');
      const app = apps.find((candidate) => candidate.id === requestedAppId)
        || apps.find((candidate) => candidate.id === DEFAULT_APP_ID)
        || apps[0];
      // A `path` only belongs to the requested app; when the query points at a
      // different (or unknown) app, boot that app from its first page instead.
      const pathParam = !requestedAppId || requestedAppId === app.id ? params.get('path') : null;
      const generatedBase = generatedBaseFor(app.id);
      const manifest = await fetchJson(`${generatedBase}/manifest.json`);
      const firstPage = Array.isArray(manifest.pages) ? manifest.pages[0]?.path : null;
      if (!firstPage) {
        throw new Error(`${app.label} has no pages in its manifest`);
      }
      const initialPath = pathParam || firstPage;

      const url = new URL(window.location.href);
      if (url.searchParams.get('app') !== app.id) {
        url.searchParams.set('app', app.id);
        if (requestedAppId && requestedAppId !== app.id) url.searchParams.delete('path');
        window.history.replaceState(null, '', url);
      }

      this.setState({
        apps,
        appId: app.id,
        navPath: initialPath,
        manifestPath: firstPage,
        loading: false,
        error: '',
      });

      this.client = new DevtoolRuntimeClient({
        manifest,
        serviceUrl: `/next-service.html?app=${encodeURIComponent(app.id)}`,
        renderUrl: `/next-render.html?app=${encodeURIComponent(app.id)}`,
        initialPath,
        container: this.containerRef.current,
        systemInfo: {
          pixelRatio: window.devicePixelRatio,
          windowWidth: window.innerWidth,
          windowHeight: window.innerHeight,
        },
      });
      this.unsubscribe = this.client.subscribe((state) => {
        this.props.setRuntimeState(state);
      });
      window.__tinyDevtool = this.client;
      this.run(() => this.client.launch());
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.setState({ loading: false, error: message });
      console.error('[devtool] failed to boot the runtime', error);
    }
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    if (this.client) {
      const client = this.client;
      this.client = null;
      client.terminate().catch(() => {});
    }
  }

  run(action) {
    Promise.resolve()
      .then(action)
      .catch((error) => console.error('[devtool-runtime]', error));
  }

  changeApp(appId) {
    if (!appId || appId === this.state.appId) return;
    const url = new URL(window.location.href);
    url.searchParams.set('app', appId);
    url.searchParams.delete('path');
    window.location.assign(url);
  }

  renderStatus() {
    const { status, currentPage, error } = this.props.runtime;
    return (
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <span style={{
          width: 10, height: 10, borderRadius: 5,
          background: STATUS_COLORS[status] || '#94a3b8',
        }}
        />
        <strong>{status}</strong>
        <span style={{ color: '#64748b' }}>{currentPage || '-'}</span>
        {error ? <span style={{ color: '#f87171' }}>{error}</span> : null}
      </div>
    );
  }

  renderControls() {
    const { status } = this.props.runtime;
    const running = status === 'running';
    const ready = Boolean(this.client);
    const buttonStyle = { padding: '6px 10px', cursor: 'pointer' };
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <button type="button" style={buttonStyle} disabled={!ready || status === 'connecting'} onClick={() => this.run(() => this.client.reload())}>Reload</button>
        <button type="button" style={buttonStyle} disabled={!running} onClick={() => this.run(() => this.client.inspectTree())}>Inspect</button>
        <button type="button" style={buttonStyle} disabled={!running} onClick={() => this.run(() => this.client.foreground())}>Foreground</button>
        <button type="button" style={buttonStyle} disabled={!running} onClick={() => this.run(() => this.client.background())}>Background</button>
        <button type="button" style={buttonStyle} disabled={!running} onClick={() => this.run(() => this.client.back())}>Back</button>
        <input
          style={{ flex: 1, minWidth: 160, padding: '6px 8px' }}
          value={this.state.navPath}
          onChange={(event) => this.setState({ navPath: event.target.value })}
          placeholder="pages/..."
        />
        <button
          type="button"
          style={buttonStyle}
          disabled={!running}
          onClick={() => this.run(() => this.client.navigate(this.state.navPath))}
        >
          Navigate
        </button>
        <button type="button" style={buttonStyle} disabled={!running} onClick={() => this.run(() => this.client.terminate())}>Terminate</button>
      </div>
    );
  }

  render() {
    const { pageStack, diagnostics, tree } = this.props.runtime;
    const { apps, appId, loading, error, manifestPath } = this.state;
    const selectedApp = apps.find((app) => app.id === appId);
    const details = [
      selectedApp?.title,
      selectedApp?.pages ? `${selectedApp.pages} pages` : '',
      manifestPath,
    ].filter(Boolean);
    return (
      <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif', background: '#0f172a', color: '#e2e8f0' }}>
        <div style={{ width: 380, padding: 16, boxSizing: 'border-box', borderRight: '1px solid #1e293b', overflow: 'auto' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>Tiny Runtime</h2>
          <select
            value={appId}
            onChange={(event) => this.changeApp(event.target.value)}
            disabled={loading || apps.length === 0}
            style={{ width: '100%', padding: '6px 8px', marginBottom: 6 }}
          >
            {apps.map((app) => (
              <option key={app.id} value={app.id}>{app.label}</option>
            ))}
          </select>
          <div style={{ minHeight: 18, fontSize: 12, color: '#64748b', marginBottom: 12 }}>
            {loading ? 'loading test apps…' : details.join(' · ')}
          </div>
          {error ? (
            <div style={{ fontSize: 12, color: '#f87171', marginBottom: 12 }}>{error}</div>
          ) : null}
          {this.renderStatus()}
          {this.renderControls()}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>page stack</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {pageStack.length === 0 ? <span style={{ color: '#64748b' }}>empty</span> : pageStack.map((pageId) => (
                <code key={pageId} style={{ background: '#1e293b', padding: '2px 6px', borderRadius: 4 }}>{pageId}</code>
              ))}
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>diagnostics ({diagnostics.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {diagnostics.slice(-80).reverse().map((diagnostic, index) => (
              <div
                key={`${diagnostic.timestamp}-${index}`}
                style={{ fontSize: 12, borderLeft: `3px solid ${SEVERITY_COLORS[diagnostic.severity] || '#64748b'}`, paddingLeft: 8 }}
              >
                <div style={{ color: SEVERITY_COLORS[diagnostic.severity] || '#64748b' }}>
                  {diagnostic.severity} · {diagnostic.code}
                </div>
                <div style={{ color: '#cbd5e1' }}>{diagnostic.message}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, position: 'relative', background: '#fff', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div ref={this.containerRef} style={{ flex: 1, minHeight: 0, width: '100%' }} />
          <div style={{ height: 260, overflow: 'auto', background: '#0b1220', borderTop: '1px solid #1e293b', padding: 8 }}>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>element tree</div>
            {tree
              ? <TreeNode node={tree} />
              : <span style={{ color: '#64748b', fontSize: 12 }}>not loaded</span>}
          </div>
        </div>
      </div>
    );
  }
}

const mapState = (state) => ({ runtime: state.runtime });
const mapDispatch = (dispatch) => ({
  setRuntimeState: (payload) => dispatch.runtime.setRuntimeState(payload),
});

export default connect(mapState, mapDispatch)(RuntimePanel);
